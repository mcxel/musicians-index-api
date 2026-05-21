from __future__ import annotations

from pathlib import Path


def extract_objects(asset_path: Path, segments: dict[str, object]) -> dict[str, object]:
    stem = asset_path.stem.lower()
    if "host" in stem:
        parts = ["head", "eyes", "mouth", "nose", "hair", "hat", "glasses", "suit", "hands", "microphone"]
    elif "avatar" in stem:
        parts = ["head", "torso", "arms", "legs", "outfit", "accessory"]
    else:
        parts = ["core", "trim", "surface"]
    return {"parts": parts}
