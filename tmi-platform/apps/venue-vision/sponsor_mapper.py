from __future__ import annotations

from pathlib import Path


def map_sponsors(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "sponsorSlots": [
            {"id": "sponsor-slot-a", "kind": "banner"},
            {"id": "sponsor-slot-b", "kind": "booth"},
        ]
    }
