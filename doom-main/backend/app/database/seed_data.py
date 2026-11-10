import uuid
from datetime import datetime, timedelta
from backend.app.database.mongo import get_collection

def seed_database(force: bool = False):
    books_col = get_collection("books")
    students_col = get_collection("students")
    teachers_col = get_collection("teachers")
    courses_col = get_collection("courses")
    orders_col = get_collection("orders")
    resources_col = get_collection("resources")
    activity_col = get_collection("activity_logs")
    notifications_col = get_collection("notifications")
    exams_col = get_collection("exams")
    assignments_col = get_collection("assignments")
    timetables_col = get_collection("timetables")
    forecasts_col = get_collection("forecasts")

    # If already seeded and not force, return
    if books_col.count_documents({}) > 0 and not force:
        return

    print("[*] Seeding TECHZ database with realistic academic institutional data...")

    # 1. Clear existing collections if force
    if force:
        for col in [books_col, students_col, teachers_col, courses_col, orders_col,
                    resources_col, activity_col, notifications_col, exams_col,
                    assignments_col, timetables_col, forecasts_col]:
            col.delete_many({})

    # 2. Seed Academic Books
    books_data = [
        {
            "book_id": "BOOK-101",
            "title": "Data Structures & Algorithm Analysis",
            "author": "Mark Allen Weiss",
            "edition": "4th Edition",
            "publisher": "Pearson Higher Education",
            "subject": "Data Structures",
            "department": "Computer Science",
            "semester": "V",
            "isbn": "978-0132576277",
            "cover_image": "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&q=80",
            "total_pages": 614,
            "chapters_count": 12,
            "sections_count": 84,
            "topics_count": 342,
            "concepts_count": 1250,
            "current_stock": 42,
            "reserved_copies": 12,
            "available_stock": 30,
            "predicted_demand": 108,
            "demand_risk": "HIGH",
            "recommended_order": 70,
            "historical_demand": 95,
            "borrowing_rate": 0.82,
            "is_processed": True,
            "hierarchy": [
                {
                    "chapter_number": 1,
                    "title": "Introduction to Algorithm Analysis & Big-Oh",
                    "start_page": 1,
                    "end_page": 48,
                    "summary": "Covers asymptotic notation (Big-Oh, Big-Omega, Big-Theta), growth rates of functions, recursion models, and mathematical induction.",
                    "sections": [
                        {
                            "section_number": "1.1",
                            "title": "Asymptotic Notation and Upper Bounds",
                            "start_page": 1,
                            "end_page": 18,
                            "topics": ["Definition of O(g(n))", "Formal Limits", "Strict Bound Θ"],
                            "concepts": [
                                {"name": "Big-O Notation", "definition": "Upper bound representing the maximum time or space an algorithm requires in the worst case.", "page": 4, "importance": "Critical"},
                                {"name": "Tight Bound (Theta)", "definition": "Bounding from above and below by constants for sufficiently large n.", "page": 11, "importance": "High"}
                            ]
                        },
                        {
                            "section_number": "1.2",
                            "title": "Recurrence Relations & Master Theorem",
                            "start_page": 19,
                            "end_page": 48,
                            "topics": ["Divide and Conquer Recurrences", "Master Theorem Cases", "Substitution Method"],
                            "concepts": [
                                {"name": "Master Theorem", "definition": "A formulaic tool for determining the asymptotic running time of divide-and-conquer recurrences.", "page": 24, "importance": "Critical"}
                            ]
                        }
                    ],
                    "algorithms": [
                        {
                            "name": "Binary Search",
                            "complexity": "O(log n)",
                            "explanation": "Finds a key in a sorted array by repeatedly halving the search interval.",
                            "pseudocode": "def binary_search(arr, key):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == key:\n            return mid\n        elif arr[mid] < key:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
                            "page": 16
                        }
                    ],
                    "formulas": [
                        {
                            "name": "Master Theorem Equation",
                            "equation": "T(n) = aT(n/b) + f(n)",
                            "variables": {"a": "Number of subproblems (a >= 1)", "b": "Factor by which input shrinks (b > 1)", "f(n)": "Cost of dividing and recombining"},
                            "page": 25
                        }
                    ],
                    "review_questions": [
                        "State the formal definition of f(n) = O(g(n)).",
                        "Solve T(n) = 2T(n/2) + n using the Master Theorem.",
                        "Why is Binary Search O(log n) rather than O(n)?"
                    ]
                },
                {
                    "chapter_number": 2,
                    "title": "Linear Structures: Stacks, Queues, and Lists",
                    "start_page": 49,
                    "end_page": 112,
                    "summary": "Detailed exploration of singly linked lists, doubly linked lists, circular buffers, stack applications (infix-to-postfix), and deque design.",
                    "sections": [
                        {
                            "section_number": "2.1",
                            "title": "Abstract Data Types and Dynamic Lists",
                            "start_page": 49,
                            "end_page": 75,
                            "topics": ["Node Pointer Architecture", "Insertion Invariants", "Singly vs Doubly Linked Lists"],
                            "concepts": [
                                {"name": "Doubly Linked List", "definition": "Sequential structure where every node maintains both a next and previous pointer.", "page": 58, "importance": "High"}
                            ]
                        },
                        {
                            "section_number": "2.2",
                            "title": "Stack Evaluation of Infix Expressions",
                            "start_page": 76,
                            "end_page": 112,
                            "topics": ["LIFO Semantics", "Operator Precedence", "Shunting Yard Algorithm"],
                            "concepts": [
                                {"name": "LIFO Protocol", "definition": "Last In First Out storage policy governing call stacks and parsing routines.", "page": 82, "importance": "High"}
                            ]
                        }
                    ],
                    "algorithms": [
                        {
                            "name": "Infix to Postfix Conversion",
                            "complexity": "O(N)",
                            "explanation": "Uses an operator stack to translate algebraic infix notation to Reverse Polish Notation.",
                            "pseudocode": "stack = []\nfor token in expression:\n    if operand(token): emit(token)\n    elif token == '(': stack.push(token)\n    elif token == ')': pop_until_open_paren()\n    else: resolve_precedence(token)",
                            "page": 91
                        }
                    ],
                    "formulas": [],
                    "review_questions": [
                        "Explain how an expression tree can be evaluated using a post-order traversal.",
                        "What is the space complexity of reversing a singly linked list iteratively versus recursively?"
                    ]
                },
                {
                    "chapter_number": 3,
                    "title": "Trees, AVL Balancing, and B-Trees",
                    "start_page": 113,
                    "end_page": 188,
                    "summary": "Binary Search Trees, AVL rotations (LL, RR, LR, RL), Red-Black tree invariants, and multi-way external B-Tree structures.",
                    "sections": [
                        {
                            "section_number": "3.1",
                            "title": "AVL Self-Balancing Trees",
                            "start_page": 113,
                            "end_page": 150,
                            "topics": ["Balance Factor Calculation", "Single Rotations", "Double Rotations"],
                            "concepts": [
                                {"name": "AVL Balance Criterion", "definition": "Height difference between left and right subtrees must not exceed 1.", "page": 128, "importance": "Critical"}
                            ]
                        }
                    ],
                    "algorithms": [
                        {
                            "name": "AVL Left-Right Double Rotation",
                            "complexity": "O(1)",
                            "explanation": "Restores balance when an insertion occurs in the right subtree of the left child.",
                            "pseudocode": "def double_rotate_lr(k3):\n    k3.left = single_rotate_rr(k3.left)\n    return single_rotate_ll(k3)",
                            "page": 134
                        }
                    ],
                    "formulas": [
                        {
                            "name": "AVL Minimum Node Formula",
                            "equation": "N(h) = N(h-1) + N(h-2) + 1",
                            "variables": {"h": "Height of the AVL tree", "N(h)": "Minimum number of nodes"},
                            "page": 131
                        }
                    ],
                    "review_questions": [
                        "Prove that the height of an AVL tree with n nodes is bounded by 1.44 log2(n).",
                        "Show step-by-step AVL insertion for the sequence: [10, 20, 30, 40, 50, 25]."
                    ]
                },
                {
                    "chapter_number": 4,
                    "title": "Graph Algorithms: Traversal, Shortest Paths, & Spanning Trees",
                    "start_page": 189,
                    "end_page": 285,
                    "summary": "Graph representations (Adjacency Matrix, Adjacency List), BFS, DFS, Dijkstra's algorithm, Bellman-Ford, Prim's and Kruskal's MST.",
                    "sections": [
                        {
                            "section_number": "4.1",
                            "title": "Single-Source Shortest Paths: Dijkstra's Algorithm",
                            "start_page": 189,
                            "end_page": 235,
                            "topics": ["Priority Queue Relaxation", "Greedy Shortest Path", "Non-Negative Edge Weight Constraints"],
                            "concepts": [
                                {"name": "Edge Relaxation", "definition": "Checking if dist[u] + weight(u, v) < dist[v] and updating dist[v].", "page": 212, "importance": "Critical"}
                            ]
                        }
                    ],
                    "algorithms": [
                        {
                            "name": "Dijkstra's Algorithm",
                            "complexity": "O((V + E) log V)",
                            "explanation": "Finds shortest paths from a single source in an edge-weighted graph with non-negative weights using a min-priority queue.",
                            "pseudocode": "dist = {v: inf for v in V}; dist[source] = 0\npq = MinPriorityQueue(); pq.insert((0, source))\nwhile not pq.empty():\n    d, u = pq.extract_min()\n    if d > dist[u]: continue\n    for v, weight in adj[u]:\n        if dist[u] + weight < dist[v]:\n            dist[v] = dist[u] + weight\n            pq.insert((dist[v], v))",
                            "page": 214
                        }
                    ],
                    "formulas": [],
                    "review_questions": [
                        "Where is Dijkstra's algorithm discussed and why does it fail on negative edge cycles?",
                        "Compare Prim's vs Kruskal's algorithm for computing Minimum Spanning Trees."
                    ]
                }
            ],
            "sample_pages": [
                {
                    "page_number": 1,
                    "chapter": 1,
                    "chapter_title": "Introduction to Algorithm Analysis & Big-Oh",
                    "section": "1.1 Asymptotic Notation",
                    "text": "Chapter 1: Algorithm Analysis. In computer science, an algorithm is a well-defined computational procedure that takes some value as input and produces some value as output. We characterize efficiency using Big-Oh asymptotic limits."
                },
                {
                    "page_number": 16,
                    "chapter": 1,
                    "chapter_title": "Introduction to Algorithm Analysis & Big-Oh",
                    "section": "1.1 Binary Search",
                    "text": "Binary Search Algorithm: Given a sorted array A of size N, binary search eliminates half of the remaining elements in each comparison. The recurrence is T(N) = T(N/2) + c, which yields O(log N) running time."
                },
                {
                    "page_number": 214,
                    "chapter": 4,
                    "chapter_title": "Graph Algorithms: Traversal, Shortest Paths, & Spanning Trees",
                    "section": "4.1 Dijkstra's Algorithm",
                    "text": "Dijkstra's Algorithm solves the single-source shortest path problem for a directed graph with non-negative edge weights. Using a min-heap priority queue, it iteratively relaxes edge distances in O((V + E) log V) time."
                }
            ]
        },
        {
            "book_id": "BOOK-102",
            "title": "Database System Concepts",
            "author": "Abraham Silberschatz, Henry Korth, S. Sudarshan",
            "edition": "7th Edition",
            "publisher": "McGraw-Hill Education",
            "subject": "Database Management Systems",
            "department": "Computer Science",
            "semester": "V",
            "isbn": "978-0078022159",
            "cover_image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
            "total_pages": 1376,
            "chapters_count": 22,
            "sections_count": 110,
            "topics_count": 480,
            "concepts_count": 1800,
            "current_stock": 78,
            "reserved_copies": 18,
            "available_stock": 60,
            "predicted_demand": 85,
            "demand_risk": "MEDIUM",
            "recommended_order": 30,
            "historical_demand": 80,
            "borrowing_rate": 0.70,
            "is_processed": True,
            "hierarchy": [
                {
                    "chapter_number": 1,
                    "title": "Relational Data Model & Formal Query Languages",
                    "start_page": 1,
                    "end_page": 80,
                    "summary": "Foundations of relational algebra, relational calculus, tuple structures, and relational integrity constraints.",
                    "sections": [
                        {
                            "section_number": "1.1",
                            "title": "Relational Algebra Operators",
                            "start_page": 1,
                            "end_page": 40,
                            "topics": ["Select σ", "Project Π", "Natural Join ⋈", "Cartesian Product ×"],
                            "concepts": [
                                {"name": "Relational Completeness", "definition": "A query language is relationally complete if it can express any query expressible in basic relational algebra.", "page": 24, "importance": "High"}
                            ]
                        }
                    ],
                    "algorithms": [],
                    "formulas": [],
                    "review_questions": ["Explain how the ⋈ operator is derived from select, project, and cartesian product."]
                }
            ],
            "sample_pages": []
        },
        {
            "book_id": "BOOK-103",
            "title": "Artificial Intelligence: A Modern Approach",
            "author": "Stuart Russell & Peter Norvig",
            "edition": "4th Global Edition",
            "publisher": "Pearson Education",
            "subject": "Artificial Intelligence",
            "department": "Computer Science",
            "semester": "VII",
            "isbn": "978-0134610993",
            "cover_image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
            "total_pages": 1152,
            "chapters_count": 28,
            "sections_count": 140,
            "topics_count": 620,
            "concepts_count": 2400,
            "current_stock": 25,
            "reserved_copies": 5,
            "available_stock": 20,
            "predicted_demand": 68,
            "demand_risk": "HIGH",
            "recommended_order": 50,
            "historical_demand": 55,
            "borrowing_rate": 0.85,
            "is_processed": True,
            "hierarchy": [],
            "sample_pages": []
        },
        {
            "book_id": "BOOK-104",
            "title": "Operating System Concepts",
            "author": "Abraham Silberschatz, Peter Galvin, Greg Gagne",
            "edition": "10th Edition",
            "publisher": "John Wiley & Sons",
            "subject": "Operating Systems",
            "department": "Information Technology",
            "semester": "IV",
            "isbn": "978-1119456339",
            "cover_image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
            "total_pages": 976,
            "chapters_count": 18,
            "sections_count": 92,
            "topics_count": 390,
            "concepts_count": 1450,
            "current_stock": 90,
            "reserved_copies": 10,
            "available_stock": 80,
            "predicted_demand": 75,
            "demand_risk": "HEALTHY",
            "recommended_order": 0,
            "historical_demand": 70,
            "borrowing_rate": 0.65,
            "is_processed": True,
            "hierarchy": [],
            "sample_pages": []
        },
        {
            "book_id": "BOOK-105",
            "title": "Computer Networks: A Systems Approach",
            "author": "Larry Peterson & Bruce Davie",
            "edition": "6th Edition",
            "publisher": "Morgan Kaufmann",
            "subject": "Computer Networks",
            "department": "Information Technology",
            "semester": "VI",
            "isbn": "978-0128182000",
            "cover_image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
            "total_pages": 840,
            "chapters_count": 14,
            "sections_count": 78,
            "topics_count": 310,
            "concepts_count": 1180,
            "current_stock": 55,
            "reserved_copies": 8,
            "available_stock": 47,
            "predicted_demand": 62,
            "demand_risk": "MEDIUM",
            "recommended_order": 20,
            "historical_demand": 58,
            "borrowing_rate": 0.72,
            "is_processed": True,
            "hierarchy": [],
            "sample_pages": []
        }
    ]

    for b in books_data:
        books_col.insert_one(b)

    # 3. Seed Students (Institutional directory sample)
    departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical Engineering", "Management Studies"]
    students = [
        {"student_id": "STU-2024-001", "name": "Aarav Sharma", "email": "aarav.s@techz.edu", "department": "Computer Science", "semester": "V", "section": "A", "enrolled_courses": ["CS-301", "CS-302", "CS-305"], "attendance_rate": 96.4, "status": "Active"},
        {"student_id": "STU-2024-002", "name": "Priya Patel", "email": "priya.p@techz.edu", "department": "Computer Science", "semester": "V", "section": "A", "enrolled_courses": ["CS-301", "CS-302", "CS-305"], "attendance_rate": 92.8, "status": "Active"},
        {"student_id": "STU-2024-003", "name": "Rohan Verma", "email": "rohan.v@techz.edu", "department": "Computer Science", "semester": "V", "section": "B", "enrolled_courses": ["CS-301", "CS-302"], "attendance_rate": 95.1, "status": "Active"},
        {"student_id": "STU-2024-004", "name": "Ananya Iyer", "email": "ananya.i@techz.edu", "department": "Information Technology", "semester": "IV", "section": "A", "enrolled_courses": ["IT-201", "IT-204"], "attendance_rate": 98.0, "status": "Active"},
        {"student_id": "STU-2024-005", "name": "Vikram Malhotra", "email": "vikram.m@techz.edu", "department": "Computer Science", "semester": "VII", "section": "A", "enrolled_courses": ["CS-401", "CS-408"], "attendance_rate": 91.5, "status": "Active"},
        {"student_id": "STU-2024-006", "name": "Sneha Reddy", "email": "sneha.r@techz.edu", "department": "Computer Science", "semester": "V", "section": "B", "enrolled_courses": ["CS-301", "CS-302", "CS-305"], "attendance_rate": 94.0, "status": "Active"},
        {"student_id": "STU-2024-007", "name": "Karthik Nair", "email": "karthik.n@techz.edu", "department": "Electronics", "semester": "VI", "section": "A", "enrolled_courses": ["EC-301"], "attendance_rate": 89.2, "status": "Active"},
        {"student_id": "STU-2024-008", "name": "Zoya Khan", "email": "zoya.k@techz.edu", "department": "Information Technology", "semester": "VI", "section": "B", "enrolled_courses": ["IT-301"], "attendance_rate": 97.3, "status": "Active"}
    ]
    for s in students:
        students_col.insert_one(s)

    # 4. Seed Teachers
    teachers = [
        {"teacher_id": "FAC-101", "name": "Dr. Ramesh Chandra", "email": "r.chandra@techz.edu", "department": "Computer Science", "designation": "Professor & HOD", "subjects": ["Data Structures", "Algorithm Design"], "classes_assigned": ["CS-V-A", "CS-V-B"], "status": "Active"},
        {"teacher_id": "FAC-102", "name": "Prof. Sunita Rao", "email": "s.rao@techz.edu", "department": "Computer Science", "designation": "Associate Professor", "subjects": ["Database Management Systems"], "classes_assigned": ["CS-V-A"], "status": "Active"},
        {"teacher_id": "FAC-103", "name": "Dr. Alan Mercer", "email": "a.mercer@techz.edu", "department": "Computer Science", "designation": "Professor", "subjects": ["Artificial Intelligence", "Machine Learning"], "classes_assigned": ["CS-VII-A"], "status": "Active"},
        {"teacher_id": "FAC-104", "name": "Prof. Meera Kulkarni", "email": "m.kulkarni@techz.edu", "department": "Information Technology", "designation": "Assistant Professor", "subjects": ["Operating Systems"], "classes_assigned": ["IT-IV-A"], "status": "Active"},
        {"teacher_id": "FAC-105", "name": "Dr. David Thorne", "email": "d.thorne@techz.edu", "department": "Information Technology", "designation": "Associate Professor", "subjects": ["Computer Networks"], "classes_assigned": ["IT-VI-A"], "status": "Active"}
    ]
    for t in teachers:
        teachers_col.insert_one(t)

    # 5. Seed Courses
    courses = [
        {"course_code": "CS-301", "course_name": "Data Structures & Algorithms", "department": "Computer Science", "semester": "V", "credits": 4, "enrolled_students": 120, "primary_textbook_id": "BOOK-101"},
        {"course_code": "CS-302", "course_name": "Database Management Systems", "department": "Computer Science", "semester": "V", "credits": 4, "enrolled_students": 120, "primary_textbook_id": "BOOK-102"},
        {"course_code": "CS-401", "course_name": "Artificial Intelligence", "department": "Computer Science", "semester": "VII", "credits": 3, "enrolled_students": 75, "primary_textbook_id": "BOOK-103"},
        {"course_code": "IT-201", "course_name": "Operating Systems", "department": "Information Technology", "semester": "IV", "credits": 4, "enrolled_students": 95, "primary_textbook_id": "BOOK-104"},
        {"course_code": "IT-301", "course_name": "Computer Networks", "department": "Information Technology", "semester": "VI", "credits": 4, "enrolled_students": 85, "primary_textbook_id": "BOOK-105"}
    ]
    for c in courses:
        courses_col.insert_one(c)

    # 6. Seed Orders
    orders_data = [
        {
            "order_id": "ORD-10482",
            "order_number": "TZ-10482",
            "created_at": "2026-09-08 10:42",
            "items": [{"book_id": "BOOK-101", "title": "Data Structures & Algorithm Analysis", "quantity": 70, "unit_price": 42.50, "total_price": 2975.00}],
            "total_amount": 2975.00,
            "supplier_name": "Apex Academic Press",
            "status": "AI Recommended",
            "estimated_delivery": "2026-09-18",
            "initiated_by": "TECHZ AI",
            "justification": "120 students enrolled in CS-301 (Semester V). Historical demand indicates an upcoming shortage of 66 copies before Mid-Term Examinations.",
            "timeline": [
                {"status": "AI Recommendation", "date": "Sep 08, 10:42", "done": True, "description": "Shortage threshold triggered order generation."},
                {"status": "Order Created", "date": None, "done": False, "description": "Awaiting administrator sign-off"},
                {"status": "Supplier Confirmed", "date": None, "done": False, "description": "Supplier dispatch readiness"},
                {"status": "Processing", "date": None, "done": False, "description": "Fulfillment center packing"},
                {"status": "Dispatched", "date": None, "done": False, "description": "In logistics transit"},
                {"status": "Delivered", "date": None, "done": False, "description": "Shelved in institutional repository"}
            ]
        },
        {
            "order_id": "ORD-10319",
            "order_number": "TZ-10319",
            "created_at": "2026-09-02 14:15",
            "items": [{"book_id": "BOOK-102", "title": "Database System Concepts", "quantity": 40, "unit_price": 48.00, "total_price": 1920.00}],
            "total_amount": 1920.00,
            "supplier_name": "Global Scholar Logistics",
            "status": "Processing",
            "estimated_delivery": "2026-09-14",
            "initiated_by": "Admin",
            "justification": "Reorder buffer for Semester V DBMS lab workstations.",
            "timeline": [
                {"status": "AI Recommendation", "date": "Sep 02, 14:00", "done": True, "description": "System generated demand notice."},
                {"status": "Order Created", "date": "Sep 02, 14:15", "done": True, "description": "Admin approved requisition"},
                {"status": "Supplier Confirmed", "date": "Sep 03, 09:30", "done": True, "description": "Global Scholar confirmed stock availability"},
                {"status": "Processing", "date": "Sep 05, 11:00", "done": True, "description": "Batch allocation and pallet labeling"},
                {"status": "Dispatched", "date": None, "done": False, "description": "Courier handoff pending"},
                {"status": "Delivered", "date": None, "done": False, "description": "Arrival at main gate"}
            ]
        },
        {
            "order_id": "ORD-09874",
            "order_number": "TZ-09874",
            "created_at": "2026-08-20 09:10",
            "items": [{"book_id": "BOOK-103", "title": "Artificial Intelligence: A Modern Approach", "quantity": 30, "unit_price": 55.00, "total_price": 1650.00}],
            "total_amount": 1650.00,
            "supplier_name": "Meridian University Book Distributors",
            "status": "Delivered",
            "estimated_delivery": "2026-08-28",
            "initiated_by": "TECHZ AI",
            "justification": "Pre-semester surge replenishment for AI core elective.",
            "timeline": [
                {"status": "AI Recommendation", "date": "Aug 19, 16:30", "done": True, "description": "Elective enrollment spike detected."},
                {"status": "Order Created", "date": "Aug 20, 09:10", "done": True, "description": "Institutional PO dispatched"},
                {"status": "Supplier Confirmed", "date": "Aug 21, 10:00", "done": True, "description": "Stock locked"},
                {"status": "Processing", "date": "Aug 23, 14:00", "done": True, "description": "Dispatched via air courier"},
                {"status": "Dispatched", "date": "Aug 25, 08:30", "done": True, "description": "Out for institutional delivery"},
                {"status": "Delivered", "date": "Aug 28, 15:45", "done": True, "description": "Inspected and barcoded into collection"}
            ]
        }
    ]
    for o in orders_data:
        orders_col.insert_one(o)

    # 7. Seed Campus Resources
    resources = [
        {"resource_id": "RES-001", "name": "Dell OptiPlex 7090 Workstations (CS Lab 3)", "category": "Hardware", "total_quantity": 60, "available_quantity": 56, "reserved_quantity": 4, "location": "Academic Block B - Lab 302", "utilization_rate": 88.5, "status": "Optimal"},
        {"resource_id": "RES-002", "name": "Apple iPad Air (Faculty Digital Tablet Pool)", "category": "Digital", "total_quantity": 45, "available_quantity": 12, "reserved_quantity": 33, "location": "Library Digital Wing", "utilization_rate": 92.0, "status": "In Use"},
        {"resource_id": "RES-003", "name": "Epson EB-2250U 4K Laser Projectors", "category": "Audiovisual", "total_quantity": 28, "available_quantity": 26, "reserved_quantity": 2, "location": "Lecture Theatres 1-12", "utilization_rate": 78.4, "status": "Optimal"},
        {"resource_id": "RES-004", "name": "Raspberry Pi 5 IoT Embedded Lab Kits", "category": "Laboratory", "total_quantity": 120, "available_quantity": 34, "reserved_quantity": 86, "location": "Embedded Systems Lab", "utilization_rate": 95.2, "status": "In Use"},
        {"resource_id": "RES-005", "name": "NVIDIA RTX 4090 GPU Deep Learning Servers", "category": "Hardware", "total_quantity": 8, "available_quantity": 2, "reserved_quantity": 6, "location": "AI Research Centre", "utilization_rate": 98.7, "status": "Optimal"}
    ]
    for r in resources:
        resources_col.insert_one(r)

    # 8. Seed Activity Logs
    activities = [
        {
            "event_id": "act-01",
            "timestamp": "10:42",
            "iso_time": datetime.now().isoformat(),
            "agent_name": "Book Ordering Agent",
            "action": "Generated Reorder Recommendation",
            "title": "Data Structures & Algorithms Shortage",
            "description": "Recommended ordering 70 copies of Data Structures & Algorithms from Apex Academic Press.",
            "status": "Completed",
            "data_considered": {"current_stock": 42, "predicted_demand": 108, "enrolled_students": 120},
            "recommendation": "Reorder 70 copies (Lead time 4 days)",
            "result": "Created Order Requisition #TZ-10482"
        },
        {
            "event_id": "act-02",
            "timestamp": "10:18",
            "iso_time": datetime.now().isoformat(),
            "agent_name": "Academic Registrar",
            "action": "Student Section Enrollment",
            "title": "Added 28 Students to CS-301 Section B",
            "description": "Department of Computer Science updated class roster for Fall Semester.",
            "status": "Completed",
            "data_considered": {"department": "Computer Science", "new_enrollments": 28},
            "result": "Total enrollment reached 120 students"
        },
        {
            "event_id": "act-03",
            "timestamp": "09:54",
            "iso_time": datetime.now().isoformat(),
            "agent_name": "Demand Prediction Agent",
            "action": "Autonomous Demand Recalculation",
            "title": "Predicted Book Shortage for Semester V",
            "description": "Evaluated syllabus pacing and examination timeline. Data Structures deficit expected to breach 60% within 18 days.",
            "status": "Completed",
            "data_considered": {"borrowing_rate": 0.82, "exam_date": "2026-10-12"},
            "result": "Shortage: 66 copies, Risk: HIGH"
        },
        {
            "event_id": "act-04",
            "timestamp": "09:42",
            "iso_time": datetime.now().isoformat(),
            "agent_name": "Book Intelligence Agent",
            "action": "Processed Academic Textbook",
            "title": "Ingested 'Data Structures & Algorithms (4th Ed)'",
            "description": "Extracted 12 chapters, 84 sections, 342 topics, and 1,250 key concepts with page mapping and embeddings.",
            "status": "Completed",
            "data_considered": {"file_type": "PDF", "total_pages": 614, "ocr_verified": True},
            "result": "RAG Knowledge Index Built"
        }
    ]
    for a in activities:
        activity_col.insert_one(a)

    # 9. Seed Notifications
    notifications = [
        {
            "notification_id": "notif-01",
            "type": "shortage",
            "severity": "error",
            "title": "Shortage predicted",
            "message": "Data Structures & Algorithm Analysis may run out in 18 days.",
            "timestamp": "10:45 AM",
            "read": False,
            "action_url": "/orders"
        },
        {
            "notification_id": "notif-02",
            "type": "recommendation",
            "severity": "warning",
            "title": "Order recommendation",
            "message": "TECHZ recommends ordering 70 copies of Data Structures & Algorithms.",
            "timestamp": "10:42 AM",
            "read": False,
            "action_url": "/orders"
        },
        {
            "notification_id": "notif-03",
            "type": "processed",
            "severity": "success",
            "title": "Book processing complete",
            "message": "Data Structures & Algorithm Analysis is ready to explore in Visit Book.",
            "timestamp": "09:44 AM",
            "read": True,
            "action_url": "/books"
        },
        {
            "notification_id": "notif-04",
            "type": "request",
            "severity": "info",
            "title": "New book request",
            "message": "Faculty Dr. Alan Mercer submitted textbook request for Machine Learning Lab.",
            "timestamp": "09:15 AM",
            "read": True,
            "action_url": "/orders"
        }
    ]
    for n in notifications:
        notifications_col.insert_one(n)

    # 10. Seed Examinations & Assignments
    exams = [
        {"exam_id": "EX-01", "name": "Mid-Term Examinations Fall 2026", "exam_type": "Mid-Term", "semester": "Semester V", "start_date": "2026-10-12", "end_date": "2026-10-22", "status": "Upcoming"},
        {"exam_id": "EX-02", "name": "Practical Lab Demonstrations", "exam_type": "Lab Assessment", "semester": "Semester V", "start_date": "2026-10-05", "end_date": "2026-10-09", "status": "Upcoming"},
        {"exam_id": "EX-03", "name": "Semester VII Project Defense", "exam_type": "Defense", "semester": "Semester VII", "start_date": "2026-11-02", "end_date": "2026-11-06", "status": "Upcoming"}
    ]
    for ex in exams:
        exams_col.insert_one(ex)

    assignments = [
        {"assignment_id": "ASG-101", "title": "Problem Set 3: Balanced AVL Rotations & B-Trees", "course_code": "CS-301", "due_date": "2026-09-24", "total_submissions": 98, "total_students": 120, "status": "Active"},
        {"assignment_id": "ASG-102", "title": "SQL Query Optimization & 3NF Normalization", "course_code": "CS-302", "due_date": "2026-09-28", "total_submissions": 84, "total_students": 120, "status": "Active"},
        {"assignment_id": "ASG-103", "title": "Heuristic Search with A* in Grid Graphs", "course_code": "CS-401", "due_date": "2026-10-02", "total_submissions": 52, "total_students": 75, "status": "Active"}
    ]
    for asg in assignments:
        assignments_col.insert_one(asg)

    # 11. Seed Weekly Timetable
    timetables = [
        {"day": "Monday", "time_slot": "09:00 - 10:30", "course_code": "CS-301", "course_name": "Data Structures", "room": "Block B-LT2", "teacher_name": "Dr. Ramesh Chandra"},
        {"day": "Monday", "time_slot": "11:00 - 12:30", "course_code": "CS-302", "course_name": "Database Systems", "room": "Block B-LT1", "teacher_name": "Prof. Sunita Rao"},
        {"day": "Tuesday", "time_slot": "09:00 - 10:30", "course_code": "IT-201", "course_name": "Operating Systems", "room": "Block A-LT4", "teacher_name": "Prof. Meera Kulkarni"},
        {"day": "Wednesday", "time_slot": "14:00 - 16:30", "course_code": "CS-301", "course_name": "Data Structures Lab", "room": "Lab 302", "teacher_name": "Dr. Ramesh Chandra"},
        {"day": "Thursday", "time_slot": "10:00 - 11:30", "course_code": "CS-401", "course_name": "Artificial Intelligence", "room": "Block C-LT3", "teacher_name": "Dr. Alan Mercer"},
        {"day": "Friday", "time_slot": "09:00 - 10:30", "course_code": "IT-301", "course_name": "Computer Networks", "room": "Block A-LT2", "teacher_name": "Dr. David Thorne"}
    ]
    for tt in timetables:
        timetables_col.insert_one(tt)

    # Initial Demand Forecast Calculation
    from backend.app.agents.demand_prediction_agent import demand_prediction_agent
    demand_prediction_agent.predict_all()

    print("[OK] Seed complete! Database ready with institutional data and book intelligence.")
