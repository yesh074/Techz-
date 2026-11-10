from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Base Entity Schema
class MongoBase(BaseModel):
    id: Optional[str] = Field(None, alias="_id")

    class Config:
        populate_by_name = True

# Academics Schemas
class Student(MongoBase):
    student_id: str
    name: str
    email: str
    department: str
    semester: str
    section: str
    enrolled_courses: List[str] = []
    attendance_rate: float = 94.2
    status: str = "Active"
    enrollment_date: str = "2026-08-01"

class Teacher(MongoBase):
    teacher_id: str
    name: str
    email: str
    department: str
    designation: str
    subjects: List[str] = []
    classes_assigned: List[str] = []
    status: str = "Active"

class Course(MongoBase):
    course_code: str
    course_name: str
    department: str
    semester: str
    credits: int
    enrolled_students: int
    primary_textbook_id: Optional[str] = None
    syllabus_topics: List[str] = []

class ClassEntity(MongoBase):
    class_id: str
    name: str
    department: str
    semester: str
    room: str
    student_count: int

class AttendanceRecord(MongoBase):
    date: str
    course_code: str
    class_id: str
    present_count: int
    total_count: int
    rate: float

class Examination(MongoBase):
    exam_id: str
    name: str
    exam_type: str  # Mid-Term, End-Semester, Quiz
    semester: str
    start_date: str
    end_date: str
    status: str  # Upcoming, Ongoing, Completed

class Assignment(MongoBase):
    assignment_id: str
    title: str
    course_code: str
    due_date: str
    total_submissions: int
    total_students: int
    status: str

class TimetableSlot(MongoBase):
    day: str
    time_slot: str
    course_code: str
    course_name: str
    room: str
    teacher_name: str

# Book Schemas
class BookConcept(BaseModel):
    name: str
    definition: str
    page: int
    importance: str = "High"  # High, Medium, Low

class BookAlgorithm(BaseModel):
    name: str
    pseudocode: str
    complexity: str
    page: int
    explanation: str

class BookFormula(BaseModel):
    name: str
    equation: str
    variables: Dict[str, str] = {}
    page: int

class BookSection(BaseModel):
    section_number: str
    title: str
    start_page: int
    end_page: int
    topics: List[str] = []
    concepts: List[BookConcept] = []

class BookChapter(BaseModel):
    chapter_number: int
    title: str
    start_page: int
    end_page: int
    sections: List[BookSection] = []
    summary: str = ""
    algorithms: List[BookAlgorithm] = []
    formulas: List[BookFormula] = []
    review_questions: List[str] = []

class Book(MongoBase):
    book_id: str
    title: str
    author: str
    edition: str
    publisher: str
    subject: str
    department: str
    semester: str
    isbn: str
    cover_image: Optional[str] = None
    total_pages: int
    chapters_count: int
    sections_count: int
    topics_count: int
    concepts_count: int
    current_stock: int
    reserved_copies: int
    available_stock: int
    predicted_demand: int
    demand_risk: str  # HIGH, MEDIUM, HEALTHY, SURPLUS
    recommended_order: int
    is_processed: bool = True
    hierarchy: List[BookChapter] = []
    sample_pages: List[Dict[str, Any]] = []

# Demand & Ordering Schemas
class DemandForecast(MongoBase):
    book_id: str
    book_title: str
    department: str
    semester: str
    current_stock: int
    reserved: int
    available: int
    enrolled_students: int
    historical_demand: int
    predicted_demand: int
    expected_shortage: int
    recommended_order: int
    risk_level: str  # HIGH, MEDIUM, LOW, HEALTHY
    confidence_score: float = 0.94
    reorder_deadline: str
    factors: Dict[str, Any] = {}
    timeline: List[Dict[str, Any]] = []

class OrderItem(BaseModel):
    book_id: str
    title: str
    quantity: int
    unit_price: float
    total_price: float

class Order(MongoBase):
    order_id: str
    order_number: str  # e.g. TZ-10482
    created_at: str
    items: List[OrderItem]
    total_amount: float
    supplier_name: str
    status: str  # AI Recommended, Pending, Approved, Processing, Dispatched, Delivered
    estimated_delivery: str
    initiated_by: str  # "TECHZ AI" or "Admin"
    justification: str
    timeline: List[Dict[str, Any]] = []

# AI Activity & Alerts
class AIActivityEvent(MongoBase):
    event_id: str
    timestamp: str
    agent_name: str  # Demand Prediction, Book Intelligence, Book Ordering, Book Summary
    action: str
    status: str  # Completed, Processing, Alert
    title: str
    description: str
    data_considered: Dict[str, Any] = {}
    recommendation: Optional[str] = None
    result: Optional[str] = None

class NotificationItem(MongoBase):
    notification_id: str
    type: str  # shortage, recommendation, processed, request
    severity: str  # error, warning, success, info
    title: str
    message: str
    timestamp: str
    read: bool = False
    action_url: Optional[str] = None

class CampusResource(MongoBase):
    resource_id: str
    name: str
    category: str  # Hardware, Digital, Laboratory, Audiovisual
    total_quantity: int
    available_quantity: int
    reserved_quantity: int
    location: str
    utilization_rate: float
    status: str  # Optimal, In Use, Maintenance
