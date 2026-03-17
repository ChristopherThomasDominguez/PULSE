"""
routes.py — All API endpoints for PULSE
Mobile app connects to these. All prefixed with /api via app.py.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.storage import (
    get_concerns, add_concern, update_concern, delete_concern,
    reset_to_demo, get_timeline, add_timeline_entry,
)
from backend.agents.prep_agent import detect_patterns, generate_visit_prep
from backend.agents.extractor_agent import extract_doctor_note
from backend.agents.granite import MOCK as GRANITE_MOCK

router = APIRouter()


# ── Pydantic models ───────────────────────────────────────────────────────────

class Concern(BaseModel):
    body_area: str
    symptom: str
    urgency_level: str          # "low" | "medium" | "high"
    severity: int               # 1–10
    notes: Optional[str] = ""
    date_logged: Optional[str] = None
    language: Optional[str] = "en"


class ConcernUpdate(BaseModel):
    body_area: Optional[str] = None
    symptom: Optional[str] = None
    urgency_level: Optional[str] = None
    severity: Optional[int] = None
    notes: Optional[str] = None
    date_logged: Optional[str] = None


class ExtractRequest(BaseModel):
    raw_text: str


class TimelineEntry(BaseModel):
    visit_date: str
    visit_reason: str
    diagnosis: str
    advice: str
    follow_up: str
    body_area: str


# ── Health check ──────────────────────────────────────────────────────────────

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "granite_ready": not GRANITE_MOCK,
        "mode": "live" if not GRANITE_MOCK else "mock",
    }


# ── Concerns CRUD ─────────────────────────────────────────────────────────────

@router.get("/concerns")
def get_all_concerns():
    return {"concerns": get_concerns()}


@router.post("/log-concern")
def log_concern(concern: Concern):
    total = add_concern(concern.model_dump())
    return {"status": "ok", "total_concerns": total}


@router.put("/concerns/{concern_id}")
def edit_concern(concern_id: str, updates: ConcernUpdate):
    """Edit any fields of an existing concern by id."""
    updated = update_concern(concern_id, updates.model_dump(exclude_none=True))
    if updated is None:
        raise HTTPException(status_code=404, detail=f"Concern {concern_id} not found")
    return {"status": "ok", "concern": updated}


@router.delete("/concerns/{concern_id}")
def remove_concern(concern_id: str):
    """Delete a concern by id."""
    success = delete_concern(concern_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Concern {concern_id} not found")
    return {"status": "ok", "deleted": concern_id}


@router.post("/reset-demo")
def reset_demo_data():
    """
    ⚠️ DEMO USE ONLY — resets concerns back to the 7-day ankle seed.
    Call this right before going on stage.
    """
    total = reset_to_demo()
    return {"status": "ok", "reset": True, "total_concerns": total}


# ── Agent chain (live demo endpoint) ─────────────────────────────────────────

@router.post("/run-agent-chain")
def run_agent_chain(concern: Concern):
    """
    THE DEMO ENDPOINT.
    Fires all 3 agents in sequence from a single POST.
    Step 1: Log the new concern
    Step 2: Pattern detection across all history
    Step 3: Generate visit prep report
    """
    # Agent 1 — log it
    add_concern(concern.model_dump())
    all_concerns = get_concerns()

    # Agent 2 — detect patterns
    pattern = detect_patterns(all_concerns)

    # Agent 3 — generate visit prep
    visit_prep = generate_visit_prep(all_concerns, pattern)

    return {
        "chain_complete": True,
        "step1_logged": concern.model_dump(),
        "step2_pattern": pattern,
        "step3_visit_prep": visit_prep,
    }


# ── Visit prep standalone ─────────────────────────────────────────────────────

@router.post("/prep")
def generate_prep():
    concerns = get_concerns()
    pattern = detect_patterns(concerns)
    return generate_visit_prep(concerns, pattern)


# ── Doctor note extraction ────────────────────────────────────────────────────

@router.post("/extract")
def extract_notes(req: ExtractRequest):
    return extract_doctor_note(req.raw_text)


# ── Timeline ──────────────────────────────────────────────────────────────────

@router.get("/timeline")
def get_all_timeline():
    return {"timeline": get_timeline()}


@router.post("/save-visit")
def save_visit(entry: TimelineEntry):
    total = add_timeline_entry(entry.model_dump())
    return {"status": "ok", "total_entries": total}
