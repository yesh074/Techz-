from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from backend.app.database.mongo import get_collection
from backend.app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/orders", tags=["Orders"])

class CreateManualOrderRequest(BaseModel):
    book_id: str
    quantity: int
    supplier_name: str = "Apex Academic Press"
    unit_price: float = 42.50
    justification: str = "Manual institutional requisition."

@router.get("")
def list_orders(status: Optional[str] = None):
    orders_col = get_collection("orders")
    query = {}
    if status and status != "All":
        query["status"] = status

    orders = list(orders_col.find(query).sort("created_at", -1))
    return orders

@router.get("/{order_id}")
def get_order_detail(order_id: str):
    orders_col = get_collection("orders")
    order = orders_col.find_one({"order_id": order_id})
    if not order:
        order = orders_col.find_one({"order_number": order_id})
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found.")
    return order

@router.post("")
def create_order(payload: CreateManualOrderRequest):
    orders_col = get_collection("orders")
    books_col = get_collection("books")

    book = books_col.find_one({"book_id": payload.book_id})
    if not book:
        raise HTTPException(status_code=404, detail=f"Book '{payload.book_id}' not found.")

    total_amt = round(payload.quantity * payload.unit_price, 2)
    order_doc = {
        "order_id": f"ord_{uuid.uuid4().hex[:8]}",
        "order_number": f"TZ-{10000 + abs(hash(payload.book_id)) % 9000}",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "items": [{
            "book_id": payload.book_id,
            "title": book.get("title", "Textbook"),
            "quantity": payload.quantity,
            "unit_price": payload.unit_price,
            "total_price": total_amt
        }],
        "total_amount": total_amt,
        "supplier_name": payload.supplier_name,
        "status": "Pending",
        "estimated_delivery": (datetime.now()).strftime("%Y-%m-%d"),
        "initiated_by": "Admin",
        "justification": payload.justification,
        "timeline": [
            {"status": "AI Recommendation", "date": None, "done": False, "description": "Manual Order Initiated"},
            {"status": "Order Created", "date": datetime.now().strftime("%b %d, %H:%M"), "done": True, "description": "Order created by administrator"},
            {"status": "Supplier Confirmed", "date": None, "done": False, "description": "Awaiting supplier acknowledgement"},
            {"status": "Processing", "date": None, "done": False, "description": "Packaging"},
            {"status": "Dispatched", "date": None, "done": False, "description": "In transit"},
            {"status": "Delivered", "date": None, "done": False, "description": "Received"}
        ]
    }
    orders_col.insert_one(order_doc)
    return order_doc

@router.post("/{order_id}/approve")
async def approve_order_endpoint(order_id: str):
    """
    Approves AI Recommendation -> Transitions Order to Processing ->
    Updates inventory -> Automatically runs next prediction cycle!
    """
    try:
        res = await orchestrator.approve_order(order_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
