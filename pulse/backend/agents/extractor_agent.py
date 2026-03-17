import json
from backend.agents.granite import granite_generate

def extract_doctor_note(raw_text: str) -> dict:
    prompt = f"""You are a medical note extraction assistant.
Extract structured information from the doctor note below.
Respond ONLY with valid JSON. No explanation. No markdown.

Doctor note:
{raw_text}

Respond with:
{{
  "diagnosis": "diagnosis name",
  "body_area": "affected body area",
  "prescription": "medication and dosage or null",
  "key_advice": ["advice point 1", "advice point 2"],
  "follow_up": "follow up timeline or date",
  "visit_reason": "brief reason for visit"
}}"""

    result = granite_generate(prompt)

    try:
        return json.loads(result)
    except Exception:
        return {
            "diagnosis": "See doctor note for details",
            "body_area": "Unknown",
            "prescription": None,
            "key_advice": ["Follow doctor instructions", "Rest as needed"],
            "follow_up": "As directed by doctor",
            "visit_reason": "Medical visit",
        }