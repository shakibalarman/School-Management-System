"""API v1 router aggregation."""
from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.modules import (
    academic_router,
    attendance_router,
    exams_router,
    fees_router,
    guardians_router,
    notices_router,
    reports_router,
    results_router,
)
from app.api.v1.student_portal import router as student_portal_router
from app.api.v1.students import router as students_router
from app.api.v1.teachers import router as teachers_router
from app.api.v1.users import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(users_router)
api_router.include_router(students_router)
api_router.include_router(teachers_router)
api_router.include_router(guardians_router)
api_router.include_router(academic_router)
api_router.include_router(attendance_router)
api_router.include_router(exams_router)
api_router.include_router(results_router)
api_router.include_router(fees_router)
api_router.include_router(reports_router)
api_router.include_router(notices_router)
api_router.include_router(student_portal_router)
