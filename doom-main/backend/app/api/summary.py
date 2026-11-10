from fastapi import APIRouter, HTTPException
from backend.app.agents.book_summary_agent import book_summary_agent
from backend.app.database.mongo import get_collection

router = APIRouter(prefix="/books/{book_id}/summary", tags=["Book Summary"])

@router.get("")
def get_book_summary(book_id: str):
    try:
        summary_payload = book_summary_agent.generate_book_summary(book_id)
        return summary_payload
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/exam-notes")
def get_exam_notes(book_id: str):
    try:
        summary_payload = book_summary_agent.generate_book_summary(book_id)
        return {
            "book_id": book_id,
            "book_title": summary_payload["book_title"],
            "exam_notes": summary_payload["exam_notes"]
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/flashcards")
def get_flashcards(book_id: str):
    try:
        summary_payload = book_summary_agent.generate_book_summary(book_id)
        return {
            "book_id": book_id,
            "book_title": summary_payload["book_title"],
            "flashcards": summary_payload["flashcards"]
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/mcqs")
def get_mcqs(book_id: str):
    try:
        summary_payload = book_summary_agent.generate_book_summary(book_id)
        return {
            "book_id": book_id,
            "book_title": summary_payload["book_title"],
            "mcqs": summary_payload["mcqs"]
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
