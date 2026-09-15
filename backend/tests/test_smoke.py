"""Smoke tests that do not require a live database."""
from app.core.grading import grade_for, summarize_marks
from app.core.config import get_settings


def test_grade_bands():
    assert grade_for(85) == ("A+", 5.00)
    assert grade_for(78)[0] == "A"
    assert grade_for(65)[0] == "A-"
    assert grade_for(55)[0] == "B"
    assert grade_for(45)[0] == "C"
    assert grade_for(35)[0] == "D"
    assert grade_for(20)[0] == "F"


def test_summary_matches_spec_example():
    s = summarize_marks([85, 78, 91, 88])
    assert s["total"] == 342
    assert s["result"] == "PASS"


def test_settings_loads_without_secrets_file():
    s = get_settings()
    assert s.API_V1_PREFIX == "/api/v1"
