"""Grading utilities — single source of truth per spec.

80-100 -> A+ | 70-79 -> A | 60-69 -> A- | 50-59 -> B
40-49 -> C | 33-39 -> D | 0-32 -> F
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class GradeBand:
    min_marks: float
    grade: str
    gpa: float


GRADE_TABLE: tuple[GradeBand, ...] = (
    GradeBand(80, "A+", 5.00),
    GradeBand(70, "A", 4.00),
    GradeBand(60, "A-", 3.50),
    GradeBand(50, "B", 3.00),
    GradeBand(40, "C", 2.00),
    GradeBand(33, "D", 1.00),
    GradeBand(0, "F", 0.00),
)

PASS_MARKS = 33.0


def grade_for(marks: float) -> tuple[str, float]:
    for band in GRADE_TABLE:
        if marks >= band.min_marks:
            return band.grade, band.gpa
    return "F", 0.00


def is_pass(marks: float) -> bool:
    return marks >= PASS_MARKS


def summarize_marks(marks: list[float]) -> dict:
    """Total / average / GPA / result for a report card."""
    if not marks:
        return {"total": 0, "average": 0.0, "gpa": 0.0, "result": "N/A"}
    total = sum(marks)
    average = total / len(marks)
    gpas = [grade_for(m)[1] for m in marks]
    gpa = round(sum(gpas) / len(gpas), 2)
    result = "PASS" if all(is_pass(m) for m in marks) else "FAIL"
    return {"total": total, "average": round(average, 2), "gpa": gpa, "result": result}
