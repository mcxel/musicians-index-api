from __future__ import annotations

from pathlib import Path


def map_safety(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "securityRoutes": ["security-loop-main", "security-loop-vip"],
        "emergencyRoutes": ["emergency-north", "emergency-south"],
    }
