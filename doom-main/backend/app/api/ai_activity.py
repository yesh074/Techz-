from fastapi import APIRouter
from backend.app.database.mongo import get_collection
from backend.app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/ai", tags=["AI Activity & Status"])

@router.get("/activity")
def get_ai_activity(limit: int = 25):
    activity_col = get_collection("activity_logs")
    return list(activity_col.find({}).sort("iso_time", -1).limit(limit))

@router.get("/status")
def get_ai_status():
    return orchestrator.get_system_status()

@router.get("/notifications")
def get_notifications():
    notif_col = get_collection("notifications")
    return list(notif_col.find({}).sort("timestamp", -1))

@router.post("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str):
    notif_col = get_collection("notifications")
    notif_col.update_one({"notification_id": notif_id}, {"$set": {"read": True}})
    return {"status": "success"}
