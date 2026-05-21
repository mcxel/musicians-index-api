from __future__ import annotations

from pathlib import Path


def map_stage(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "stageZones": ["stage-main"],
        "micZones": ["mic-center", "mic-left"],
        "djZones": ["dj-booth-main"],
        "battleZones": ["battle-ring"],
    }
