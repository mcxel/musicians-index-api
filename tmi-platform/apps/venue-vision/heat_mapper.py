from __future__ import annotations

from pathlib import Path


def map_heat(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "hottestBattleSpots": ["stage-front"],
        "strongestSocialZones": ["social-ring"],
        "bestMerchZones": ["merch-corner"],
        "bestAdZones": ["billboard-lane"],
    }
