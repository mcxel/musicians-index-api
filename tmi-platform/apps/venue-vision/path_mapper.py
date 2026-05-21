from __future__ import annotations

from pathlib import Path


def map_paths(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "walkPaths": ["walk-main-loop", "walk-vip-loop"],
        "queuePaths": ["queue-entry-line"],
        "entryPaths": ["entry-front", "entry-side"],
        "exitPaths": ["exit-front", "exit-emergency"],
    }
