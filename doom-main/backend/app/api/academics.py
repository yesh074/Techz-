import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.database.mongo import get_collection
from backend.app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/academics", tags=["Academics"])

class EnrollStudentRequest(BaseModel):
    name: str
    email: str
    department: str = "Computer Science"
    semester: str = "V"
    section: str = "B"
    enrolled_courses: List[str] = ["CS-301", "CS-302"]

@router.get("/students")
def list_students(department: Optional[str] = None, semester: Optional[str] = None):
    students_col = get_collection("students")
    query = {}
    if department and department != "all":
        query["department"] = department
    if semester and semester != "all":
        query["semester"] = semester
    return list(students_col.find(query))

@router.post("/students")
async def enroll_student(payload: EnrollStudentRequest):
    students_col = get_collection("students")

    student_id = f"STU-2026-{uuid.uuid4().hex[:4].upper()}"
    student_doc = {
        "student_id": student_id,
        "name": payload.name,
        "email": payload.email,
        "department": payload.department,
        "semester": payload.semester,
        "section": payload.section,
        "enrolled_courses": payload.enrolled_courses,
        "attendance_rate": 95.0,
        "status": "Active",
        "enrollment_date": datetime.now().strftime("%Y-%m-%d")
    }
    students_col.insert_one(student_doc)

    # Trigger autonomous background prediction pipeline
    pipeline_res = await orchestrator.handle_student_enrollment(student_doc)

    return {
        "status": "success",
        "student": student_doc,
        "autonomous_pipeline": pipeline_res
    }

@router.get("/teachers")
def list_teachers(department: Optional[str] = None):
    teachers_col = get_collection("teachers")
    query = {}
    if department and department != "all":
        query["department"] = department
    return list(teachers_col.find(query))

@router.get("/courses")
def list_courses(department: Optional[str] = None):
    courses_col = get_collection("courses")
    query = {}
    if department and department != "all":
        query["department"] = department
    return list(courses_col.find(query))

@router.get("/attendance")
def get_attendance():
    # Summarized institutional attendance metrics
    return {
        "overall_rate": 94.2,
        "total_marked_today": 12480,
        "present_today": 11756,
        "absent_today": 724,
        "department_breakdown": [
            {"department": "Computer Science", "rate": 95.4, "present": 3420, "total": 3585},
            {"department": "Information Technology", "rate": 94.8, "present": 2840, "total": 2995},
            {"department": "Electronics", "rate": 92.6, "present": 2110, "total": 2278},
            {"department": "Mechanical Engineering", "rate": 93.1, "present": 1890, "total": 2030},
            {"department": "Management Studies", "rate": 96.0, "present": 1496, "total": 1592}
        ]
    }

@router.get("/exams")
def list_exams():
    exams_col = get_collection("exams")
    return list(exams_col.find({}))

@router.get("/assignments")
def list_assignments():
    asg_col = get_collection("assignments")
    return list(asg_col.find({}))

@router.get("/timetable")
def get_timetable():
    tt_col = get_collection("timetables")
    return list(tt_col.find({}))
