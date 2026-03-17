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
  "prescription": "medication name and dosage, or null if none",
  "key_advice": ["advice point 1", "advice point 2", "advice point 3"],
  "follow_up": "follow up timeline or specific date",
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
            "prescription": None,
            "key_advice": ["Follow doctor instructions", "Rest as needed"],
            "follow_up": "As directed by doctor",
            "visit_reason": "Medical visit",
        }
