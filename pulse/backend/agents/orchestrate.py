# backend/agents/orchestrate.py
# Owner: Han Htoo Zin
#
# IBM watsonx Orchestrate manager agent
# Coordinates two sub-agents:
#   - Lab report analysis sub-agent
#   - Doctor notes extraction sub-agent
#
# See HANDOFF_HAN.md for exactly what needs to be filled in.

import requests
from backend.config import cfg

MOCK = not cfg.is_orchestrate_configured()


def _get_orchestrate_token() -> str:
    """Exchange IBM API key for bearer token."""
    # Han fills this in — may reuse same IAM endpoint as Granite
    # or Orchestrate may use a different auth flow
    res = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        data={
            "apikey": cfg.ORCHESTRATE_API_KEY,
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        },
    )
    return res.json()["access_token"]


def _call_manager_agent(input_text: str, task: str) -> dict:
    """
    Call the Orchestrate manager agent.
    task: "lab_report" | "doctor_notes"

    Han fills in:
    - The correct endpoint URL structure
    - The correct request body shape
    - The correct response parsing
    """
    if MOCK:
        return _mock_response(task)

    token = _get_orchestrate_token()

    # TODO — Han replaces this with real Orchestrate API call
    # res = requests.post(
    #     f"{cfg.ORCHESTRATE_URL}/...",
    #     headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    #     json={"input": input_text, "task": task},
    #     timeout=30,
    # )
    # return res.json()

    return _mock_response(task)


def analyze_lab_report(raw_text: str) -> dict:
    """Called by routes.py for POST /api/analyze-labs"""
    return _call_manager_agent(raw_text, task="lab_report")


def extract_doctor_note(raw_text: str) -> dict:
    """Called by routes.py for POST /api/extract"""
    return _call_manager_agent(raw_text, task="doctor_notes")


def _mock_response(task: str) -> dict:
    """Fallback mock so the app runs before Orchestrate is wired."""
    if task == "lab_report":
        return {
            "flagged": [{"name": "Ferritin", "value": "9 ng/mL", "reference": "12-300", "status": "low"}],
            "borderline": [{"name": "Vitamin D", "value": "21 ng/mL", "reference": "20-50", "status": "borderline"}],
            "normal_count": 14,
            "ai_insight": "Low ferritin may explain reported fatigue. Discuss iron supplementation with your doctor.",
            "suggested_question": "Should I start iron supplementation given my ferritin levels?",
        }
    return {
        "diagnosis": "Mock diagnosis — Orchestrate not yet connected",
        "body_area": "Unknown",
        "prescription": None,
        "key_advice": ["Follow doctor instructions", "Rest as needed"],
        "follow_up": "As directed by doctor",
        "visit_reason": "Medical visit",
    }