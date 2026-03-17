"""
extractor_agent.py — Doctor note extraction (Agent fallback)
Used when USE_ORCHESTRATE=false.
"""

import json
from backend.agents.granite import granite_generate


def extract_doctor_note(raw_text: str) -> dict:
    prompt = f"""You are a medical note extraction assistant.
Extract structured information from the doctor note below.
Respond ONLY with valid JSON. No explanation. No markdown. No code fences.

Doctor note:
{raw_text}

Respond with exactly this JSON structure:
{{
  "diagnosis": "primary diagnosis name",
  "body_area": "affected body area",
  "follow_up_date": "exact date or timeframe mentioned (e.g. 'in 3 weeks', 'April 15', '30 days'), or null if not stated",
  "next_appointment": "when the patient should schedule their next visit, or null if not stated",
  "prescription": "medication name and dosage, or null if none",
  "key_instructions": ["thing the patient must do 1", "thing the patient must do 2"],
  "visit_reason": "brief reason for the visit"
}}"""

    raw = granite_generate(prompt)

    try:
        clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception:
        return {
            "diagnosis": "See doctor note for details",
            "body_area": "Unknown",
            "follow_up_date": None,
            "next_appointment": None,
            "prescription": None,
            "key_instructions": ["Follow doctor instructions", "Rest as needed"],
            "visit_reason": "Medical visit",
        }
