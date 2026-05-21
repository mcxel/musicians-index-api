from __future__ import annotations

from pathlib import Path


def map_billboards(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "billboards": [
            {"id": "board-main", "surface": "led"},
            {"id": "board-secondary", "surface": "projection"},
        ]
    }
