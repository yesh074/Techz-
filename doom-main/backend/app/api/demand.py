from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.app.database.mongo import get_collection
from backend.app.agents.demand_prediction_agent import demand_prediction_agent
from backend.app.agents.book_ordering_agent import book_ordering_agent
from backend.app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/demand", tags=["Demand Prediction"])

class SimulateEnrollmentRequest(BaseModel):
    department: str = "Computer Science"
    semester: str = "V"
    added_students: int = 25
    course_code: str = "CS-301"

@router.get("/forecasts")
def get_all_forecasts():
    forecasts_col = get_collection("forecasts")
    forecasts = list(forecasts_col.find({}))
    if not forecasts:
        # Generate initial forecasts
        forecasts = demand_prediction_agent.predict_all()
    return forecasts

@router.get("/forecasts/{book_id}")
def get_book_forecast(book_id: str):
    forecasts_col = get_collection("forecasts")
    forecast = forecasts_col.find_one({"book_id": book_id})
    if not forecast:
        try:
            forecast = demand_prediction_agent.predict_for_book(book_id)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
    return forecast

@router.post("/simulate-enrollment")
async def simulate_student_enrollment(payload: SimulateEnrollmentRequest):
    """
    Triggers the 12-Step Autonomous Loop:
    1. Increases course enrollment
    2. Background agent detects change
    3. Demand Prediction Agent predicts new requirement
    4. Shortage detected
    5. Book Ordering Agent computes order
    6. Recommendation and real-time events emitted!
    """
    courses_col = get_collection("courses")
    books_col = get_collection("books")

    # Update course enrollment count
    courses_col.update_one(
        {"course_code": payload.course_code},
        {"$inc": {"enrolled_students": payload.added_students}}
    )

    # Trigger orchestrator autonomous pipeline
    dummy_student = {
        "name": f"Batch Cohort (+{payload.added_students} students)",
        "department": payload.department,
        "semester": payload.semester,
        "course": payload.course_code
    }

    result = await orchestrator.handle_student_enrollment(dummy_student)
    return {
        "status": "success",
        "message": f"Simulated enrollment of {payload.added_students} students in {payload.course_code}. Autonomous loop executed.",
        "pipeline_result": result
    }
