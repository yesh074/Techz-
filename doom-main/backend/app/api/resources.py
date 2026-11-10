from fastapi import APIRouter
from typing import Optional
from backend.app.database.mongo import get_collection

router = APIRouter(prefix="/resources", tags=["Campus Resources"])

@router.get("")
def list_resources(category: Optional[str] = None):
    res_col = get_collection("resources")
    query = {}
    if category and category != "all":
        query["category"] = category
    return list(res_col.find(query))
