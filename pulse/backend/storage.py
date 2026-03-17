import json
import os
from datetime import date

STORAGE_FILE = "visits.json"

DEMO_CONCERNS = [
    {"body_area": "Left lower leg / ankle", "symptom": "Mild aching after long walks.", "notes": "After soccer practice.", "urgency_level": "low", "severity": 3, "date_logged": "2026-03-09", "language": "en"},
    {"body_area": "Left lower leg / ankle", "symptom": "Soreness after standing 30+ minutes.", "notes": "Rested, felt better by evening.", "urgency_level": "low", "severity": 4, "date_logged": "2026-03-10", "language": "en"},
    {"body_area": "Left lower leg / ankle", "symptom": "Pain when walking up stairs.", "notes": "", "urgency_level": "medium", "severity": 4, "date_logged": "2026-03-11", "language": "en"},
    {"body_area": "Left lower leg / ankle", "symptom": "Sharp pain first thing in the morning.", "notes": "Worst right after waking up.", "urgency_level": "medium", "severity": 5, "date_logged": "2026-03-12", "language": "en"},
    {"body_area": "Left lower leg / ankle", "symptom": "Pain throughout the day.", "notes": "", "urgency_level": "medium", "severity": 5, "date_logged": "2026-03-13", "language": "en"},
    {"body_area": "Left lower leg / ankle", "symptom": "Limping after two blocks.", "notes": "Getting harder to ignore.", "urgency_level": "medium", "severity": 6, "date_logged": "2026-03-14", "language": "en"},
    {"body_area": "Left lower leg / ankle", "symptom": "Dull ache plus sharp pain on arch.", "notes": "Arch of foot very tender.", "urgency_level": "high", "severity": 7, "date_logged": "2026-03-15", "language": "en"},
]

def _load():
    if not os.path.exists(STORAGE_FILE):
        data = {"concerns": DEMO_CONCERNS, "timeline": []}
        _save(data)
        return data
    with open(STORAGE_FILE, "r") as f:
        return json.load(f)

def _save(data):
    with open(STORAGE_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_concerns():
    return _load()["concerns"]

def add_concern(concern: dict):
    data = _load()
    if "date_logged" not in concern:
        concern["date_logged"] = str(date.today())
    data["concerns"].append(concern)
    _save(data)
    return len(data["concerns"])

def get_timeline():
    return _load()["timeline"]

def add_timeline_entry(entry: dict):
    data = _load()
    data["timeline"].append(entry)
    _save(data)
    return len(data["timeline"])