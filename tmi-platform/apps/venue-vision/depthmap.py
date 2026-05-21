from __future__ import annotations

from pathlib import Path


def parse_depth(asset_path: Path, venue_class: str) -> dict[str, object]:
    factor = 1.0 if venue_class in {"LOBBY", "CLUB", "VIP_ROOM"} else 1.4
    return {
        "asset": asset_path.name,
        "ceilingHeight": round(6.0 * factor, 2),
        "roomDepth": round(24.0 * factor, 2),
        "stageDepth": round(8.0 * factor, 2),
        "levels": ["floor", "mid", "upper"],
    }
