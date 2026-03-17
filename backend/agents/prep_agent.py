"""
prep_agent.py — Pattern Detection + Visit Prep agents
Agent 2: detect_patterns — reads all check-ins, finds escalation
Agent 3: generate_visit_prep — builds doctor visit summary + questions
"""

import json
from backend.agents.granite import granite_generate


def detect_patterns(concerns: list) -> dict:
    """Agent 2 — IBM Granite reads check-in history, identifies patterns."""
    if not concerns:
        return {
            "escalation_level": "monitor",
            "pattern_summary": "No concerns logged yet.",
            "recurring_areas": [],
            "severity_trend": "stable",
        }

    # Build a readable summary of check-ins for Granite
    checkin_text = "\n".join(
        f"Day {i+1} ({c.get('date_logged','?')}): {c.get('body_area','?')} — "
        f"{c.get('symptom','?')} | severity {c.get('severity',0)}/10 | "
        f"urgency: {c.get('urgency_level','?')}"
        for i, c in enumerate(concerns)
    )

    prompt = f"""You are a clinical health pattern detection assistant.
Analyze these symptom check-ins and identify escalation patterns.
Respond ONLY with valid JSON. No explanation. No markdown. No code fences.

Rules for escalation_level:
- Use "urgent" if peak severity >= 8 OR there are 2 or more entries with urgency "high"
- Use "see_doctor" if peak severity >= 5 OR there is 1 entry with urgency "high"
- Use "monitor" otherwise

Rules for severity_trend:
- Compare severity values across check-ins chronologically
- Use "increasing" if severity is trending upward across multiple days
- Use "decreasing" if trending downward
- Use "stable" if little or no change

Also flag if the same body area appears in multiple check-ins (recurring).

Check-ins:
{checkin_text}

Respond with exactly this JSON structure:
{{
  "escalation_level": "monitor" or "see_doctor" or "urgent",
  "pattern_summary": "2-3 sentence summary of symptom pattern and trend, referencing the specific body area and severity trajectory",
  "recurring_areas": ["list", "of", "body", "areas", "that appear in multiple check-ins"],
  "severity_trend": "stable" or "increasing" or "decreasing"
}}"""

    raw = granite_generate(prompt)

    try:
        # Strip any accidental markdown fences
        clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception:
        # Smart fallback: compute from data
        max_sev = max((c.get("severity", 0) for c in concerns), default=0)
        high_count = sum(1 for c in concerns if c.get("urgency_level") == "high")
        areas = list(dict.fromkeys(c.get("body_area", "") for c in concerns))  # ordered unique

        if max_sev >= 8 or high_count >= 2:
            level = "urgent"
        elif max_sev >= 5 or high_count >= 1:
            level = "see_doctor"
        else:
            level = "monitor"

        # Check if severity is climbing
        severities = [c.get("severity", 0) for c in concerns]
        trend = "stable"
        if len(severities) >= 3:
            if severities[-1] > severities[0]:
                trend = "increasing"
            elif severities[-1] < severities[0]:
                trend = "decreasing"

        return {
            "escalation_level": level,
            "pattern_summary": (
                f"Patient logged {len(concerns)} check-ins across {len(areas)} body area(s). "
                f"Peak severity reached {max_sev}/10. "
                f"Symptoms appear to be {trend}."
            ),
            "recurring_areas": areas,
            "severity_trend": trend,
        }


def generate_visit_prep(concerns: list, pattern: dict) -> dict:
    """Agent 3 — Generates visit prep report: escalation decision + doctor questions."""
    if not concerns:
        return {
            "concern_summary": "No concerns have been logged yet.",
            "escalation_decision": "monitor",
            "escalation_reason": "No data to evaluate.",
            "suggested_questions": [],
            "concerns_to_mention": [],
        }

    checkin_text = "\n".join(
        f"- {c.get('date_logged','?')}: {c.get('body_area','?')}, "
        f"severity {c.get('severity',0)}/10 — {c.get('symptom','?')}"
        for c in concerns
    )

    prompt = f"""You are a health visit preparation assistant helping a patient prepare for a doctor appointment.
Based on the symptom history and pattern analysis below, generate a concise visit prep report.
Respond ONLY with valid JSON. No explanation. No markdown. No code fences.

Symptom history:
{checkin_text}

Pattern analysis:
{json.dumps(pattern)}

For the "suggested_questions" field, generate exactly 5 clinically specific questions the patient should bring to their doctor.
Each question MUST reference the actual body area and symptom pattern from the data above — do NOT write generic questions.
Example of a good question: "Given that my left ankle pain has increased from severity 3 to 8 over 8 days, could this indicate a structural injury like a stress fracture or tendon damage?"
Questions should address: possible diagnosis, diagnostic tests needed, home management, warning signs requiring urgent care, and long-term prognosis.

Respond with exactly this JSON structure:
{{
  "concern_summary": "2-3 sentences summarizing the patient's health concerns for the doctor, referencing the specific body area and severity trend",
  "escalation_decision": "monitor" or "see_doctor" or "urgent",
  "escalation_reason": "one sentence explaining why this escalation level was chosen, citing specific severity numbers or urgency flags",
  "suggested_questions": [
    "clinically specific question 1 referencing actual body area and symptom data",
    "clinically specific question 2 referencing actual body area and symptom data",
    "clinically specific question 3 referencing actual body area and symptom data",
    "clinically specific question 4 referencing actual body area and symptom data",
    "clinically specific question 5 referencing actual body area and symptom data"
  ],
  "concerns_to_mention": ["concern 1", "concern 2", "concern 3"]
}}"""

    raw = granite_generate(prompt)

    try:
        clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception:
        max_sev = max((c.get("severity", 0) for c in concerns), default=0)
        areas = list(dict.fromkeys(c.get("body_area", "") for c in concerns))

        return {
            "concern_summary": (
                f"Patient has logged {len(concerns)} symptom check-ins. "
                f"Primary area of concern: {', '.join(areas[:2])}. "
                f"Peak severity reported: {max_sev}/10."
            ),
            "escalation_decision": pattern.get("escalation_level", "see_doctor"),
            "escalation_reason": pattern.get("pattern_summary", "Symptoms warrant medical review."),
            "suggested_questions": [
                f"What could be causing my {areas[0] if areas else 'recurring'} symptoms?",
                "Is the severity trend you see concerning?",
                "Do I need any imaging or diagnostic tests?",
                "What can I do at home to manage this before the next visit?",
                "When should I come back or seek urgent care?",
            ],
            "concerns_to_mention": [c.get("symptom", "") for c in concerns[-3:]],
        }
