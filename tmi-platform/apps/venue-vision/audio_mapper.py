from __future__ import annotations

from pathlib import Path


def map_audio(asset_path: Path, venue_class: str) -> dict[str, object]:
    return {
        "speakerZones": ["speaker-front-left", "speaker-front-right"],
        "echoZones": ["rear-reflection-zone"],
        "musicZones": ["music-main-zone"],
    }
