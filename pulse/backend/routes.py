from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.storage import get_concerns, add_concern, get_timeline, add_timeline_entry
from backend.agents.prep_agent import detect_patterns, generate_visit_prep
from backend.config import cfg

# Route imports switch based on USE_ORCHESTRATE flag
if cfg.USE_ORCHESTRATE:
    from backend.agents.orchestrate import extract_doctor_note, analyze_lab_report
else:
    from backend.agents.extractor_agent import extract_doctor_note
    from backend.agents.orchestrate import analyze_lab_report  # always use Orchestrate for labs

router = APIRouter()

class Concern(BaseModel):
    body_area: str
    symptom: str
    urgency_level: str
    severity: int
    notes: Optional[str] = ""
    date_logged: Optional[str] = None
    language: Optional[str] = "en"

class ExtractRequest(BaseModel):
    raw_text: str

class TimelineEntry(BaseModel):
    visit_date: str
    visit_reason: str
    diagnosis: str
    advice: str
    follow_up: str
    body_area: str

@router.post("/log-concern")
def log_concern(concern: Concern):
    total = add_concern(concern.dict())
    return {"status": "ok", "total_concerns": total}

@router.get("/concerns")
def get_all_concerns():
    return {"concerns": get_concerns()}

@router.post("/prep")
def generate_prep():
    concerns = get_concerns()
    pattern = detect_patterns(concerns)
    visit_prep = generate_visit_prep(concerns, pattern)
    return visit_prep

@router.post("/extract")
def extract_notes(req: ExtractRequest):
    return extract_doctor_note(req.raw_text)

@router.post("/analyze-labs")
def analyze_labs(req: ExtractRequest):
    return analyze_lab_report(req.raw_text)

@router.post("/save-visit")
def save_visit(entry: TimelineEntry):
    total = add_timeline_entry(entry.dict())
    return {"status": "ok", "total_entries": total}

@router.get("/timeline")
def get_all_timeline():
    return {"timeline": get_timeline()}

@router.post("/run-agent-chain")
def run_agent_chain(concern: Concern):
    # LIVE DEMO ENDPOINT — all 3 Granite steps fire here
    add_concern(concern.dict())
    all_concerns = get_concerns()
    pattern = detect_patterns(all_concerns)
    visit_prep = generate_visit_prep(all_concerns, pattern)
    return {
        "chain_complete": True,
        "step1_logged": concern.dict(),
        "step2_pattern": pattern,
        "step3_visit_prep": visit_prep,
    }

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "granite_ready": cfg.is_granite_configured(),
        "orchestrate_ready": cfg.is_orchestrate_configured(),
        "use_orchestrate": cfg.USE_ORCHESTRATE,
    }