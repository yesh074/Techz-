import os
import json
import re
import copy
import logging
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from backend.app.config import settings

logger = logging.getLogger("techz.database")

class MockCursor:
    def __init__(self, data: List[Dict[str, Any]]):
        self._data = data
        self._index = 0

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            for k, d in reversed(key_or_list):
                self._data.sort(key=lambda x: x.get(k, 0) or 0, reverse=(d == -1))
        elif isinstance(key_or_list, str):
            self._data.sort(key=lambda x: x.get(key_or_list, 0) or 0, reverse=(direction == -1))
        return self

    def limit(self, n: int):
        self._data = self._data[:n]
        return self

    def skip(self, n: int):
        self._data = self._data[n:]
        return self

    def __iter__(self):
        return iter(self._data)

    def to_list(self, length: Optional[int] = None):
        if length is not None:
            return self._data[:length]
        return list(self._data)


class MockCollection:
    def __init__(self, name: str, parent_db: "MockDatabase"):
        self.name = name
        self.parent_db = parent_db
        if name not in self.parent_db.data:
            self.parent_db.data[name] = []

    @property
    def docs(self) -> List[Dict[str, Any]]:
        return self.parent_db.data[self.name]

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True

        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(doc, sub_q) for sub_q in v):
                    return False
                continue

            doc_val = doc.get(k)

            if isinstance(v, dict):
                for op, op_val in v.items():
                    if op == "$eq" and doc_val != op_val:
                        return False
                    elif op == "$ne" and doc_val == op_val:
                        return False
                    elif op == "$gt" and not (doc_val is not None and doc_val > op_val):
                        return False
                    elif op == "$gte" and not (doc_val is not None and doc_val >= op_val):
                        return False
                    elif op == "$lt" and not (doc_val is not None and doc_val < op_val):
                        return False
                    elif op == "$lte" and not (doc_val is not None and doc_val <= op_val):
                        return False
                    elif op == "$in":
                        if doc_val not in op_val:
                            return False
                    elif op == "$nin":
                        if doc_val in op_val:
                            return False
                    elif op == "$regex":
                        pattern = op_val
                        flags = re.IGNORECASE if v.get("$options") == "i" else 0
                        if not doc_val or not re.search(str(pattern), str(doc_val), flags):
                            return False
            else:
                if doc_val != v:
                    return False

        return True

    def find(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> MockCursor:
        query = query or {}
        matches = [copy.deepcopy(d) for d in self.docs if self._matches(d, query)]
        if projection:
            include = [k for k, v in projection.items() if v]
            if include:
                matches = [{k: d.get(k) for k in include if k in d} for d in matches]
        return MockCursor(matches)

    def find_one(self, query: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        query = query or {}
        for d in self.docs:
            if self._matches(d, query):
                return copy.deepcopy(d)
        return None

    def insert_one(self, doc: Dict[str, Any]):
        new_doc = copy.deepcopy(doc)
        if "_id" not in new_doc:
            import uuid
            new_doc["_id"] = f"{self.name}_{uuid.uuid4().hex[:12]}"
        self.docs.append(new_doc)
        self.parent_db.save()
        return type("InsertResult", (), {"inserted_id": new_doc["_id"]})()

    def insert_many(self, docs: List[Dict[str, Any]]):
        import uuid
        inserted_ids = []
        for d in docs:
            new_doc = copy.deepcopy(d)
            if "_id" not in new_doc:
                new_doc["_id"] = f"{self.name}_{uuid.uuid4().hex[:12]}"
            self.docs.append(new_doc)
            inserted_ids.append(new_doc["_id"])
        self.parent_db.save()
        return type("InsertManyResult", (), {"inserted_ids": inserted_ids})()

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        matched = False
        for d in self.docs:
            if self._matches(d, query):
                matched = True
                if "$set" in update:
                    for k, v in update["$set"].items():
                        d[k] = copy.deepcopy(v)
                if "$inc" in update:
                    for k, v in update["$inc"].items():
                        d[k] = d.get(k, 0) + v
                if "$push" in update:
                    for k, v in update["$push"].items():
                        if k not in d or not isinstance(d[k], list):
                            d[k] = []
                        d[k].append(copy.deepcopy(v))
                self.parent_db.save()
                return type("UpdateResult", (), {"matched_count": 1, "modified_count": 1})()

        if not matched and upsert:
            new_doc = copy.deepcopy(query)
            if "$set" in update:
                new_doc.update(copy.deepcopy(update["$set"]))
            self.insert_one(new_doc)
            return type("UpdateResult", (), {"matched_count": 0, "modified_count": 1, "upserted_id": new_doc.get("_id")})()

        return type("UpdateResult", (), {"matched_count": 0, "modified_count": 0})()

    def update_many(self, query: Dict[str, Any], update: Dict[str, Any]):
        count = 0
        for d in self.docs:
            if self._matches(d, query):
                count += 1
                if "$set" in update:
                    for k, v in update["$set"].items():
                        d[k] = copy.deepcopy(v)
                if "$inc" in update:
                    for k, v in update["$inc"].items():
                        d[k] = d.get(k, 0) + v
        if count > 0:
            self.parent_db.save()
        return type("UpdateResult", (), {"matched_count": count, "modified_count": count})()

    def delete_one(self, query: Dict[str, Any]):
        for i, d in enumerate(self.docs):
            if self._matches(d, query):
                del self.docs[i]
                self.parent_db.save()
                return type("DeleteResult", (), {"deleted_count": 1})()
        return type("DeleteResult", (), {"deleted_count": 0})()

    def delete_many(self, query: Dict[str, Any]):
        original_len = len(self.docs)
        self.parent_db.data[self.name] = [d for d in self.docs if not self._matches(d, query)]
        deleted = original_len - len(self.docs)
        if deleted > 0:
            self.parent_db.save()
        return type("DeleteResult", (), {"deleted_count": deleted})()

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        query = query or {}
        return sum(1 for d in self.docs if self._matches(d, query))

    def distinct(self, key: str, query: Optional[Dict[str, Any]] = None) -> List[Any]:
        query = query or {}
        values = set()
        for d in self.docs:
            if self._matches(d, query) and key in d:
                val = d[key]
                if isinstance(val, (str, int, float, bool)):
                    values.add(val)
        return list(values)

    def aggregate(self, pipeline: List[Dict[str, Any]]):
        results = [copy.deepcopy(d) for d in self.docs]
        for stage in pipeline:
            if "$match" in stage:
                results = [d for d in results if self._matches(d, stage["$match"])]
            elif "$sort" in stage:
                sort_spec = stage["$sort"]
                for k, direction in reversed(list(sort_spec.items())):
                    results.sort(key=lambda x: x.get(k, 0) or 0, reverse=(direction == -1))
            elif "$limit" in stage:
                results = results[:stage["$limit"]]
        return results


class MockDatabase:
    def __init__(self, filepath: Path):
        self.filepath = filepath
        self.data: Dict[str, List[Dict[str, Any]]] = {}
        self.lock = threading.Lock()
        self.load()

    def load(self):
        with self.lock:
            if self.filepath.exists():
                try:
                    with open(self.filepath, "r", encoding="utf-8") as f:
                        self.data = json.load(f)
                except Exception as e:
                    logger.error(f"Error loading mock database file: {e}")
                    self.data = {}

    def save(self):
        with self.lock:
            try:
                with open(self.filepath, "w", encoding="utf-8") as f:
                    json.dump(self.data, f, indent=2, default=str)
            except Exception as e:
                logger.error(f"Error persisting mock database file: {e}")

    def __getitem__(self, collection_name: str) -> MockCollection:
        return MockCollection(collection_name, self)

    def list_collection_names(self) -> List[str]:
        return list(self.data.keys())

    def drop_collection(self, collection_name: str):
        if collection_name in self.data:
            del self.data[collection_name]
            self.save()


class DatabaseManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance._init_db()
        return cls._instance

    def _init_db(self):
        self.is_connected = False
        self.is_mock = False
        self.client = None
        self.db = None

        # Check real MongoDB connection with 1-second timeout
        try:
            logger.info(f"Attempting to connect to MongoDB at {settings.MONGODB_URI}...")
            client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1000)
            client.admin.command("ping")
            self.client = client
            self.db = client[settings.DATABASE_NAME]
            self.is_connected = True
            logger.info(f"Successfully connected to live MongoDB: {settings.DATABASE_NAME}")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            logger.warning(f"MongoDB not reachable ({e}). Activating persistent embedded storage adapter.")
            self.is_connected = True
            self.is_mock = True
            db_file = settings.STORAGE_DIR / "techz_erp.json"
            self.db = MockDatabase(db_file)
            logger.info(f"Initialized persistent storage engine at {db_file}")

    def get_collection(self, name: str):
        return self.db[name]


db_manager = DatabaseManager()

def get_db():
    return db_manager.db

def get_collection(name: str):
    return db_manager.get_collection(name)
