import asyncio
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.database.mongo import get_collection
from backend.app.services.event_bus import event_bus
from backend.app.agents.book_intelligence_agent import book_intelligence_agent
from backend.app.agents.book_summary_agent import book_summary_agent
from backend.app.agents.demand_prediction_agent import demand_prediction_agent
from backend.app.agents.book_ordering_agent import book_ordering_agent

logger = logging.getLogger("techz.orchestrator")

class BookOrchestrator:
    def __init__(self):
        self.orchestrator_name = "TECHZ Book Orchestrator"
        self.status = "ONLINE"
        self.agents_status = {
            "book_intelligence": "Active",
            "book_summary": "Active",
            "demand_prediction": "Active",
            "book_ordering": "Active"
        }

    async def log_activity(self, agent_name: str, action: str, title: str, description: str,
                           data_considered: Dict[str, Any] = None, recommendation: str = None,
                           result: str = None, status: str = "Completed"):
        logs_col = get_collection("activity_logs")
        event = {
            "event_id": f"act_{uuid.uuid4().hex[:10]}",
            "timestamp": datetime.now().strftime("%H:%M"),
            "iso_time": datetime.now().isoformat(),
            "agent_name": agent_name,
            "action": action,
            "title": title,
            "description": description,
            "status": status,
            "data_considered": data_considered or {},
            "recommendation": recommendation,
            "result": result
        }
        logs_col.insert_one(event)
        await event_bus.publish("AI_ACTIVITY", event)
        return event

    async def create_notification(self, notif_type: str, severity: str, title: str, message: str, action_url: str = None):
        notif_col = get_collection("notifications")
        notif = {
            "notification_id": f"notif_{uuid.uuid4().hex[:8]}",
            "type": notif_type,
            "severity": severity,
            "title": title,
            "message": message,
            "timestamp": datetime.now().strftime("%I:%M %p"),
            "read": False,
            "action_url": action_url
        }
        notif_col.insert_one(notif)
        await event_bus.publish("NOTIFICATION", notif)
        return notif

    async def handle_student_enrollment(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        AUTONOMOUS PIPELINE:
        New Student Enrollment -> Background Event -> Demand Agent -> Shortage Detection -> Book Ordering Agent -> Order Recommendation
        """
        department = student_data.get("department", "Computer Science")
        semester = student_data.get("semester", "V")
        books_col = get_collection("books")

        await self.log_activity(
            agent_name="TECHZ Book Orchestrator",
            action="Student Enrollment Event",
            title="New Student Enrollment Detected",
            description=f"Enrolled {student_data.get('name')} in {department} (Semester {semester}). Triggering demand re-evaluation.",
            data_considered={"student": student_data, "department": department, "semester": semester}
        )

        # Find books corresponding to this department and semester
        matching_books = list(books_col.find({"department": department, "semester": semester}))
        if not matching_books:
            matching_books = list(books_col.find({}).limit(2))

        pipeline_results = []
        for b in matching_books:
            book_id = b["book_id"]

            # Step 1: Demand Prediction Agent
            demand_result = demand_prediction_agent.predict_for_book(book_id)

            await self.log_activity(
                agent_name="Demand Prediction Agent",
                action="Demand Re-calculation",
                title=f"Updated Forecast: {b.get('title')}",
                description=f"Predicted demand adjusted to {demand_result['predicted_demand']} units (Expected shortage: {demand_result['expected_shortage']}).",
                data_considered={
                    "current_stock": demand_result["current_stock"],
                    "enrolled_students": demand_result["enrolled_students"],
                    "historical_demand": demand_result["historical_demand"]
                },
                result=f"Risk Level: {demand_result['risk_level']}"
            )

            # Step 2: Book Ordering Agent
            order_recommendation = book_ordering_agent.evaluate_order_recommendation(demand_result)

            if order_recommendation["decision"] == "ORDER":
                await self.log_activity(
                    agent_name="Book Ordering Agent",
                    action="Generated Recommendation",
                    title=f"Order Recommended: {order_recommendation['recommended_order']}x {b.get('title')}",
                    description=order_recommendation["reason"],
                    data_considered={
                        "shortage": order_recommendation["expected_shortage"],
                        "moq": 10,
                        "supplier": order_recommendation["supplier"]
                    },
                    recommendation=f"Order {order_recommendation['recommended_order']} copies from {order_recommendation['supplier']}",
                    result="Pending Admin Review"
                )

                await self.create_notification(
                    notif_type="shortage",
                    severity="error" if demand_result["risk_level"] == "HIGH" else "warning",
                    title=f"🔴 Shortage Predicted: {b.get('title')}",
                    message=f"Projected demand of {demand_result['predicted_demand']} exceeds current stock of {demand_result['available']}. Shortage: {demand_result['expected_shortage']} copies.",
                    action_url="/orders"
                )

                await self.create_notification(
                    notif_type="recommendation",
                    severity="warning",
                    title=f"🟡 AI Order Recommendation",
                    message=f"TECHZ recommends ordering {order_recommendation['recommended_order']} copies of {b.get('title')}.",
                    action_url="/orders"
                )

            pipeline_results.append({
                "demand": demand_result,
                "order_recommendation": order_recommendation
            })

            # Broadcast update via SSE
            await event_bus.publish("DEMAND_UPDATED", demand_result)
            await event_bus.publish("ORDER_RECOMMENDATION", order_recommendation)

        return {
            "status": "success",
            "message": f"Autonomous pipeline executed for {len(matching_books)} textbooks.",
            "results": pipeline_results
        }

    async def approve_order(self, order_id: str) -> Dict[str, Any]:
        """
        Approves an AI recommendation, advances order to Processing,
        updates inventory, and runs the next prediction cycle autonomously!
        """
        orders_col = get_collection("orders")
        books_col = get_collection("books")

        order = orders_col.find_one({"order_id": order_id})
        if not order:
            raise ValueError(f"Order '{order_id}' not found.")

        # Update order status to Approved / Processing
        now_str = datetime.now().strftime("%b %d, %H:%M")
        timeline = order.get("timeline", [])
        for step in timeline:
            if step.get("status") == "Order Created":
                step["done"] = True
                step["date"] = now_str
            elif step.get("status") == "Supplier Confirmed":
                step["done"] = True
                step["date"] = now_str
            elif step.get("status") == "Processing":
                step["done"] = True
                step["date"] = now_str

        orders_col.update_one(
            {"order_id": order_id},
            {
                "$set": {
                    "status": "Processing",
                    "approved_at": datetime.now().isoformat(),
                    "timeline": timeline
                }
            }
        )

        updated_books = []
        for item in order.get("items", []):
            b_id = item.get("book_id")
            qty = item.get("quantity", 0)

            # Update book inventory
            books_col.update_one(
                {"book_id": b_id},
                {"$inc": {"current_stock": qty, "available_stock": qty}}
            )

            # Trigger immediate autonomous recalculation of demand
            new_prediction = demand_prediction_agent.predict_for_book(b_id)
            updated_books.append(new_prediction)

            await self.log_activity(
                agent_name="Book Ordering Agent",
                action="Order Approved & Inventory Updated",
                title=f"Order #{order.get('order_number')} Approved",
                description=f"Stock for {item.get('title')} increased by {qty}. Next prediction cycle recalibrated demand risk to '{new_prediction['risk_level']}'.",
                data_considered={"order_id": order_id, "quantity": qty, "new_stock": new_prediction["current_stock"]},
                result="Inventory Updated & Forecast Recalculated"
            )

            await event_bus.publish("INVENTORY_UPDATED", {
                "book_id": b_id,
                "current_stock": new_prediction["current_stock"],
                "prediction": new_prediction
            })

        await self.create_notification(
            notif_type="order_approved",
            severity="success",
            title=f"🟢 Order #{order.get('order_number')} Processing",
            message=f"Order for {order.get('items', [{}])[0].get('title', 'Textbook')} confirmed. Inventory updated.",
            action_url="/track-orders"
        )

        return {
            "status": "success",
            "order_id": order_id,
            "new_status": "Processing",
            "recalculated_predictions": updated_books
        }

    def get_system_status(self) -> Dict[str, Any]:
        return {
            "orchestrator": self.orchestrator_name,
            "status": self.status,
            "autonomous_loop": "Active",
            "agents": {
                "Book Intelligence": self.agents_status["book_intelligence"],
                "Book Summary": self.agents_status["book_summary"],
                "Demand Prediction": self.agents_status["demand_prediction"],
                "Book Ordering": self.agents_status["book_ordering"]
            },
            "last_cycle": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

orchestrator = BookOrchestrator()
