from __future__ import annotations

from pathlib import Path


def build_rig(asset_path: Path, objects: dict[str, object]) -> dict[str, object]:
    return {
        "rigVersion": "v1",
        "bones": ["root", "spine", "head", "left-arm", "right-arm", "left-leg", "right-leg"],
        "partsBound": objects.get("parts", []),
    }
