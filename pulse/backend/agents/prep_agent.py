import json
from backend.agents.granite import granite_generate

def detect_patterns(concerns: list) -> dict:
    if not concerns:
        return {"escalation_level": "monitor", "pattern_summary": "No concerns logged yet."}

    prompt = f"""You are a health pattern detection assistant.
Analyze these symptom check-ins and identify patterns.
Respond ONLY with valid JSON. No explanation. No markdown.

Check-ins:
{json.dumps(concerns, indent=2)}

Respond with:
{{
  "escalation_level": "monitor" | "see_doctor" | "urgent",
  "pattern_summary": "brief summary of patterns found",
  "recurring_areas": ["list of body areas"],
  "severity_trend": "stable" | "increasing" | "decreasing"
}}"""

    result = granite_generate(prompt)

    try:
        return json.loads(result)
    except Exception:
        max_severity = max((c.get("severity", 0) for c in concerns), default=0)
        high_count = sum(1 for c in concerns if c.get("urgency_level") == "high")
        if max_severity >= 8 or high_count >= 2:
            level = "urgent"
        elif max_severity >= 5:
            level = "see_doctor"
        else:
            level = "monitor"
        return {
            "escalation_level": level,
            "pattern_summary": f"Analyzed {len(concerns)} check-ins. Severity reached {max_severity}/10.",
            "recurring_areas": list(set(c.get("body_area", "") for c in concerns)),
            "severity_trend": "increasing" if max_severity > 5 else "stable",
        }


def generate_visit_prep(concerns: list, pattern: dict) -> dict:
    prompt = f"""You are a health visit preparation assistant.
Based on the symptom history and pattern analysis below, generate a visit prep report.
Respond ONLY with valid JSON. No explanation. No markdown.

Symptom history:
{json.dumps(concerns, indent=2)}

Pattern analysis:
{json.dumps(pattern, indent=2)}

Respond with:
{{
  "concern_summary": "2-3 sentence summary of the patient concerns",
  "escalation_decision": "monitor" | "see_doctor" | "urgent",
  "escalation_reason": "one sentence explaining the decision",
  "suggested_questions": ["question 1", "question 2", "question 3", "question 4", "question 5"],
  "concerns_to_mention": ["concern 1", "concern 2", "concern 3"]
}}"""

    result = granite_generate(prompt)

    try:
        return json.loads(result)
    except Exception:
        return {
            "concern_summary": f"Patient has logged {len(concerns)} check-ins with a peak severity of {max((c.get('severity',0) for c in concerns), default=0)}/10.",
            "escalation_decision": pattern.get("escalation_level", "see_doctor"),
            "escalation_reason": pattern.get("pattern_summary", ""),
            "suggested_questions": [
                "What is causing my recurring symptoms?",
                "Should I be concerned about the severity trend?",
                "What imaging or tests would help diagnose this?",
                "What can I do at home to manage this?",
                "When should I come back if it does not improve?",
            ],
            "concerns_to_mention": [c.get("body_area", "") for c in concerns[-3:]],
        }