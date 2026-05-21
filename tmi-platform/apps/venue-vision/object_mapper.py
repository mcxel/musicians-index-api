from __future__ import annotations

from pathlib import Path


def map_objects(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "asset": asset_path.name,
        "venueClass": venue_class,
        "objects": [
            "stage",
            "screen",
            "seat-cluster",
            "entry-gate",
            "portal",
            "billboard",
            "sponsor-booth",
            "ticket-booth",
        ],
    }
