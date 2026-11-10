from fastapi import APIRouter, Query
from backend.app.database.mongo import get_collection

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("")
def global_search(q: str = Query(..., min_length=1)):
    query = q.lower().strip()

    books_col = get_collection("books")
    students_col = get_collection("students")
    teachers_col = get_collection("teachers")
    courses_col = get_collection("courses")
    orders_col = get_collection("orders")
    resources_col = get_collection("resources")

    results = {
        "books": [],
        "students": [],
        "teachers": [],
        "courses": [],
        "orders": [],
        "resources": []
    }

    # Books search
    for b in books_col.find({}):
        if query in b.get("title", "").lower() or query in b.get("author", "").lower() or query in b.get("subject", "").lower():
            results["books"].append({
                "id": b.get("book_id"),
                "title": b.get("title"),
                "subtitle": f"{b.get('author')} • Sem {b.get('semester')}",
                "url": f"/books/{b.get('book_id')}"
            })

    # Students search
    for s in students_col.find({}):
        if query in s.get("name", "").lower() or query in s.get("student_id", "").lower() or query in s.get("department", "").lower():
            results["students"].append({
                "id": s.get("student_id"),
                "title": s.get("name"),
                "subtitle": f"{s.get('student_id')} • {s.get('department')}",
                "url": "/students"
            })

    # Teachers search
    for t in teachers_col.find({}):
        if query in t.get("name", "").lower() or query in t.get("department", "").lower() or any(query in sub.lower() for sub in t.get("subjects", [])):
            results["teachers"].append({
                "id": t.get("teacher_id"),
                "title": t.get("name"),
                "subtitle": f"{t.get('designation')} • {t.get('department')}",
                "url": "/teachers"
            })

    # Courses search
    for c in courses_col.find({}):
        if query in c.get("course_name", "").lower() or query in c.get("course_code", "").lower():
            results["courses"].append({
                "id": c.get("course_code"),
                "title": f"{c.get('course_code')}: {c.get('course_name')}",
                "subtitle": f"{c.get('department')} • {c.get('enrolled_students')} Students",
                "url": "/courses"
            })

    # Orders search
    for o in orders_col.find({}):
        if query in o.get("order_number", "").lower() or any(query in item.get("title", "").lower() for item in o.get("items", [])):
            results["orders"].append({
                "id": o.get("order_id"),
                "title": f"Order #{o.get('order_number')}",
                "subtitle": f"{o.get('status')} • ${o.get('total_amount')}",
                "url": "/orders"
            })

    # Resources search
    for r in resources_col.find({}):
        if query in r.get("name", "").lower() or query in r.get("category", "").lower():
            results["resources"].append({
                "id": r.get("resource_id"),
                "title": r.get("name"),
                "subtitle": f"{r.get('category')} • Avail: {r.get('available_quantity')}/{r.get('total_quantity')}",
                "url": "/resources"
            })

    total_matches = sum(len(v) for v in results.values())
    return {
        "query": q,
        "total_results": total_matches,
        "categories": results
    }
