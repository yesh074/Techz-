import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from backend.app.database.mongo import get_collection

logger = logging.getLogger("techz.agent.ordering")

SUPPLIERS = [
    {"name": "Apex Academic Press", "rating": 4.9, "lead_days": 4, "moq": 10, "discount_threshold": 50},
    {"name": "Global Scholar Logistics", "rating": 4.7, "lead_days": 6, "moq": 15, "discount_threshold": 40},
    {"name": "Meridian University Book Distributors", "rating": 4.8, "lead_days": 3, "moq": 5, "discount_threshold": 60}
]

class BookOrderingAgent:
    def __init__(self):
        self.agent_name = "Book Ordering Agent"

    def evaluate_order_recommendation(self, demand_payload: Dict[str, Any]) -> Dict[str, Any]:
        orders_col = get_collection("orders")
        books_col = get_collection("books")

        book_id = demand_payload.get("book_id")
        book_title = demand_payload.get("book_title", "Textbook")
        current_stock = demand_payload.get("current_stock", 0)
        reserved = demand_payload.get("reserved", 0)
        available = demand_payload.get("available", 0)
        predicted_demand = demand_payload.get("predicted_demand", 0)
        expected_shortage = demand_payload.get("expected_shortage", 0)
        recommended_order = demand_payload.get("recommended_order", 0)
        risk_level = demand_payload.get("risk_level", "HEALTHY")
        enrolled_students = demand_payload.get("enrolled_students", 120)

        # Check existing pending or processing orders
        existing_orders = list(orders_col.find({
            "items.book_id": book_id,
            "status": {"$in": ["Pending", "Approved", "Processing", "Dispatched"]}
        }))

        incoming_copies = sum(
            item.get("quantity", 0)
            for ord in existing_orders
            for item in ord.get("items", [])
            if item.get("book_id") == book_id
        )

        net_shortage = max(0, expected_shortage - incoming_copies)

        # Decision Matrix: ORDER / WAIT / RESERVE / NO ACTION
        if net_shortage > 0:
            decision = "ORDER"
            action_qty = max(10, int((net_shortage + 4) // 5 * 5))
            status_tag = "AI Recommended"
            reason = (
                f"{enrolled_students} students are actively enrolled in this course for Semester {demand_payload.get('semester', 'V')}. "
                f"Historical demand and upcoming exam cycles project a requirement of {predicted_demand} copies against {available} available. "
                f"Proactive ordering of {action_qty} copies is required to avoid instructional stockout."
            )
        elif incoming_copies > 0 and incoming_copies >= expected_shortage:
            decision = "WAIT"
            action_qty = 0
            status_tag = "Monitoring"
            reason = f"An active order containing {incoming_copies} copies is already dispatched. Stock will replenish within 4 business days."
        elif expected_shortage > 0 and current_stock > 10:
            decision = "RESERVE"
            action_qty = 0
            status_tag = "Reserve Alert"
            reason = f"Shortage imminent. Recommend reserving {available} copies exclusively for active course students."
        else:
            decision = "NO ACTION"
            action_qty = 0
            status_tag = "Healthy"
            reason = "Current institutional inventory safely satisfies all predicted student and faculty requirements."

        # Assign Supplier & Unit Price
        supplier = SUPPLIERS[0]
        unit_price = 42.50
        total_price = round(action_qty * unit_price, 2)

        est_delivery = (datetime.now() + timedelta(days=supplier["lead_days"])).strftime("%Y-%m-%d")

        recommendation = {
            "decision": decision,
            "book_id": book_id,
            "book_title": book_title,
            "current_stock": current_stock,
            "reserved": reserved,
            "available": available,
            "predicted_demand": predicted_demand,
            "expected_shortage": expected_shortage,
            "incoming_copies": incoming_copies,
            "recommended_order": action_qty,
            "risk_level": risk_level,
            "supplier": supplier["name"],
            "unit_price": unit_price,
            "total_price": total_price,
            "estimated_delivery": est_delivery,
            "reason": reason,
            "evaluated_at": datetime.now().isoformat()
        }

        # If decision is ORDER, upsert or create the AI Recommended Order
        if decision == "ORDER" and action_qty > 0:
            existing_rec = orders_col.find_one({
                "items.book_id": book_id,
                "status": "AI Recommended"
            })

            order_num = f"TZ-{10000 + abs(hash(book_id)) % 9000}"

            order_doc = {
                "order_id": existing_rec.get("order_id") if existing_rec else f"order_{uuid.uuid4().hex[:8]}",
                "order_number": order_num,
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "items": [
                    {
                        "book_id": book_id,
                        "title": book_title,
                        "quantity": action_qty,
                        "unit_price": unit_price,
                        "total_price": total_price
                    }
                ],
                "total_amount": total_price,
                "supplier_name": supplier["name"],
                "status": "AI Recommended",
                "estimated_delivery": est_delivery,
                "initiated_by": "TECHZ AI",
                "justification": reason,
                "timeline": [
                    {"status": "AI Recommendation", "date": datetime.now().strftime("%b %d, %H:%M"), "done": True, "description": "Demand Agent detected shortage and calculated optimal order size."},
                    {"status": "Order Created", "date": None, "done": False, "description": "Pending administrator approval"},
                    {"status": "Supplier Confirmed", "date": None, "done": False, "description": "Supplier acknowledgement"},
                    {"status": "Processing", "date": None, "done": False, "description": "Packaging and shipment preparation"},
                    {"status": "Dispatched", "date": None, "done": False, "description": "In transit to institution"},
                    {"status": "Delivered", "date": None, "done": False, "description": "Received and stocked in library"}
                ]
            }

            orders_col.update_one(
                {"items.book_id": book_id, "status": "AI Recommended"},
                {"$set": order_doc},
                upsert=True
            )
            recommendation["order_number"] = order_num
            recommendation["order_id"] = order_doc["order_id"]

        return recommendation

book_ordering_agent = BookOrderingAgent()
