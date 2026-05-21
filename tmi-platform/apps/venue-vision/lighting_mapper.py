from __future__ import annotations

from pathlib import Path


def map_lighting(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "keyLights": ["key-main"],
        "fillLights": ["fill-left", "fill-right"],
        "effectLights": ["fx-beam-1", "fx-beam-2"],
    }
