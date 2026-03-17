"""
storage.py — JSON file persistence
Supports full CRUD: create, read, update, delete concerns
Demo data seeds automatically on first run.
"""

import json
import os
from datetime import date

STORAGE_FILE = os.path.join(os.path.dirname(__file__), "..", "visits.json")

# ── Demo seed data: 7 days of escalating ankle pain ──────────────────────────
DEMO_CONCERNS = [
    {
        "id": "demo-1",
        "body_area": "Left lower leg / ankle",
        "symptom": "Mild aching after long walks.",
        "notes": "After soccer practice.",
        "urgency_level": "low",
        "severity": 3,
        "date_logged": "2026-03-09",
        "language": "en",
    },
    {
        "id": "demo-2",
        "body_area": "Left lower leg / ankle",
        "symptom": "Soreness after standing 30+ minutes.",
        "notes": "Rested, felt better by evening.",
        "urgency_level": "low",
        "severity": 4,
        "date_logged": "2026-03-10",
        "language": "en",
    },
    {
        "id": "demo-3",
        "body_area": "Left lower leg / ankle",
        "symptom": "Pain when walking up stairs.",
        "notes": "",
        "urgency_level": "medium",
        "severity": 4,
        "date_logged": "2026-03-11",
        "language": "en",
    },
    {
        "id": "demo-4",
        "body_area": "Left lower leg / ankle",
        "symptom": "Sharp pain first thing in the morning.",
        "notes": "Worst right after waking up.",
        "urgency_level": "medium",
        "severity": 5,
        "date_logged": "2026-03-12",
        "language": "en",
    },
    {
        "id": "demo-5",
        "body_area": "Left lower leg / ankle",
        "symptom": "Pain throughout the day.",
        "notes": "",
        "urgency_level": "medium",
        "severity": 5,
        "date_logged": "2026-03-13",
        "language": "en",
    },
    {
        "id": "demo-6",
        "body_area": "Left lower leg / ankle",
        "symptom": "Limping after two blocks.",
        "notes": "Getting harder to ignore.",
        "urgency_level": "medium",
        "severity": 6,
        "date_logged": "2026-03-14",
        "language": "en",
    },
    {
        "id": "demo-7",
        "body_area": "Left lower leg / ankle",
        "symptom": "Dull ache plus sharp pain on arch of foot.",
        "notes": "Arch very tender to touch.",
        "urgency_level": "high",
        "severity": 7,
        "date_logged": "2026-03-15",
        "language": "en",
    },
]


# ── Internal helpers ──────────────────────────────────────────────────────────

def _load() -> dict:
    if not os.path.exists(STORAGE_FILE):
        data = {"concerns": DEMO_CONCERNS, "timeline": []}
        _save(data)
        return data
    with open(STORAGE_FILE, "r") as f:
        return json.load(f)


def _save(data: dict) -> None:
    with open(STORAGE_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _make_id() -> str:
    import time
    return f"c-{int(time.time() * 1000)}"


# ── Concerns CRUD ─────────────────────────────────────────────────────────────

def get_concerns() -> list:
    return _load()["concerns"]


def add_concern(concern: dict) -> int:
    data = _load()
    concern.setdefault("id", _make_id())
    concern.setdefault("date_logged", str(date.today()))
    concern.setdefault("language", "en")
    concern.setdefault("notes", "")
    data["concerns"].append(concern)
    _save(data)
    return len(data["concerns"])


def update_concern(concern_id: str, updates: dict) -> dict | None:
    """Update any fields on a concern by id. Returns updated concern or None."""
    data = _load()
    for i, c in enumerate(data["concerns"]):
        if c.get("id") == concern_id:
            # Never allow overwriting the id
            updates.pop("id", None)
            data["concerns"][i] = {**c, **updates}
            _save(data)
            return data["concerns"][i]
    return None


def delete_concern(concern_id: str) -> bool:
    """Delete a concern by id. Returns True if found and deleted."""
    data = _load()
    original_len = len(data["concerns"])
    data["concerns"] = [c for c in data["concerns"] if c.get("id") != concern_id]
    if len(data["concerns"]) < original_len:
        _save(data)
        return True
    return False


def reset_to_demo() -> int:
    """Reset concerns back to the 7-day demo seed. Used before live demo."""
    data = _load()
    data["concerns"] = DEMO_CONCERNS
    _save(data)
    return len(data["concerns"])


# ── Timeline ──────────────────────────────────────────────────────────────────

def get_timeline() -> list:
    return _load()["timeline"]


def add_timeline_entry(entry: dict) -> int:
    data = _load()
    data["timeline"].append(entry)
    _save(data)
    return len(data["timeline"])
