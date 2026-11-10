from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.database.mongo import get_collection
from backend.app.services.rag_engine import rag_engine

router = APIRouter(prefix="/books/{book_id}/ask", tags=["Ask Book"])

class AskBookQuery(BaseModel):
    question: str

@router.post("")
async def ask_book_endpoint(book_id: str, payload: AskBookQuery):
    books_col = get_collection("books")
    book = books_col.find_one({"book_id": book_id})
    if not book:
        raise HTTPException(status_code=404, detail=f"Book '{book_id}' not found.")

    response = await rag_engine.answer_question(book, payload.question)
    return response
