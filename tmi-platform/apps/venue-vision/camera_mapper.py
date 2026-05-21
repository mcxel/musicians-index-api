from __future__ import annotations

from pathlib import Path


def map_cameras(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "cameraNodes": ["cam-front", "cam-side", "cam-wide"],
        "cinematicNodes": ["cine-dolly", "cine-overhead"],
    }
