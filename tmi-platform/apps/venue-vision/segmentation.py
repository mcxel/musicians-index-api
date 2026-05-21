from __future__ import annotations

from pathlib import Path


def segment_venue(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "asset": asset_path.name,
        "venueClass": venue_class,
        "layers": [
            "hero-surface",
            "traffic-lanes",
            "social-zones",
            "commerce-zones",
            "safety-overlays",
        ],
        "zoneCount": 10,
    }
