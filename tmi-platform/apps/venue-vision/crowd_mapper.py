from __future__ import annotations

from pathlib import Path


def map_crowd(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "hangZones": ["hang-main", "hang-side"],
        "danceZones": ["dance-floor-main"],
        "reactionZones": ["reaction-rail"],
        "tipZones": ["tip-rail"],
    }
