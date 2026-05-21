from __future__ import annotations

from pathlib import Path


def map_seats(asset_path: Path, venue_class: str) -> dict[str, object]:
    base = 24 if venue_class in {"LOBBY", "VIP_ROOM", "PODCAST_ROOM"} else 80
    return {
        "seats": [f"seat-{index}" for index in range(1, base + 1)],
        "vipSeats": [f"vip-seat-{index}" for index in range(1, max(3, base // 8) + 1)],
        "hostSeats": ["host-seat-main"],
        "crowdSeats": [f"crowd-seat-{index}" for index in range(1, max(10, base // 2) + 1)],
    }
