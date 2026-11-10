import shutil
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.app.database.mongo import get_collection
from backend.app.config import settings
from backend.app.utils.pdf_extractor import pdf_extractor
from backend.app.agents.book_intelligence_agent import book_intelligence_agent
from backend.app.agents.book_summary_agent import book_summary_agent
from backend.app.agents.demand_prediction_agent import demand_prediction_agent
from backend.app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("")
def list_books(
    search: Optional[str] = None,
    department: Optional[str] = None,
    semester: Optional[str] = None,
    risk: Optional[str] = None
):
    books_col = get_collection("books")
    query = {}
    if department and department != "all":
        query["department"] = department
    if semester and semester != "all":
        query["semester"] = semester
    if risk and risk != "all":
        query["demand_risk"] = risk

    books = list(books_col.find(query))

    if search:
        s = search.lower()
        books = [
            b for b in books
            if s in b.get("title", "").lower()
            or s in b.get("author", "").lower()
            or s in b.get("subject", "").lower()
        ]

    # Clean return
    results = []
    for b in books:
        results.append({
            "book_id": b.get("book_id"),
            "title": b.get("title"),
            "author": b.get("author"),
            "edition": b.get("edition"),
            "publisher": b.get("publisher"),
            "subject": b.get("subject"),
            "department": b.get("department"),
            "semester": b.get("semester"),
            "isbn": b.get("isbn"),
            "cover_image": b.get("cover_image"),
            "total_pages": b.get("total_pages"),
            "chapters_count": b.get("chapters_count", len(b.get("hierarchy", []))),
            "sections_count": b.get("sections_count", 0),
            "topics_count": b.get("topics_count", 0),
            "concepts_count": b.get("concepts_count", 0),
            "current_stock": b.get("current_stock", 0),
            "available_stock": b.get("available_stock", 0),
            "predicted_demand": b.get("predicted_demand", 0),
            "demand_risk": b.get("demand_risk", "HEALTHY"),
            "recommended_order": b.get("recommended_order", 0),
            "is_processed": b.get("is_processed", True)
        })
    return results

@router.get("/{book_id}")
def get_book_detail(book_id: str):
    books_col = get_collection("books")
    book = books_col.find_one({"book_id": book_id})
    if not book:
        raise HTTPException(status_code=404, detail=f"Book '{book_id}' not found.")
    return book

@router.post("/upload")
async def upload_book(
    file: UploadFile = File(...),
    department: str = Form("Computer Science"),
    semester: str = Form("V"),
    subject: str = Form("Core Academic Curriculum")
):
    upload_path = settings.UPLOAD_DIR / f"{uuid.uuid4().hex}_{file.filename}"
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 1. Extract structural data via PDF Extractor
    extracted_data = pdf_extractor.extract_pdf_data(upload_path, file.filename)
    extracted_data["department"] = department
    extracted_data["semester"] = semester
    extracted_data["subject"] = subject
    extracted_data["current_stock"] = 35
    extracted_data["reserved_copies"] = 5

    # 2. Book Intelligence Agent processes and persists 5-layer hierarchy
    book_record = book_intelligence_agent.process_textbook_data(extracted_data)

    # 3. Demand Prediction Agent calculates immediate forecast
    demand_res = demand_prediction_agent.predict_for_book(book_record["book_id"])

    # 4. Orchestrator records activity and emits notification
    await orchestrator.log_activity(
        agent_name="Book Intelligence Agent",
        action="Textbook Ingestion & Processing",
        title=f"Processed Textbook: '{book_record['title']}'",
        description=f"Extracted {book_record['chapters_count']} chapters, {book_record['sections_count']} sections, and mapped concept hierarchy.",
        data_considered={"filename": file.filename, "pages": book_record["total_pages"]},
        result="Knowledge Index & Embeddings Generated"
    )

    await orchestrator.create_notification(
        notif_type="processed",
        severity="success",
        title="🟢 Book processing complete",
        message=f"'{book_record['title']}' has been ingested and is ready for exploration in Visit Book.",
        action_url=f"/books/{book_record['book_id']}"
    )

    return {
        "status": "success",
        "book_id": book_record["book_id"],
        "title": book_record["title"],
        "total_pages": book_record["total_pages"],
        "chapters_count": book_record["chapters_count"],
        "predicted_demand": demand_res["predicted_demand"],
        "demand_risk": demand_res["risk_level"]
    }
