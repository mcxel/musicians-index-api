from __future__ import annotations

from pathlib import Path


def map_portals(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "entryPortals": ["entry-main", "entry-side"],
        "transitionPortals": ["portal-lobby-to-stage"],
        "exitPortals": ["exit-main", "exit-emergency"],
    }
