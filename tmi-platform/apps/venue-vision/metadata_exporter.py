from __future__ import annotations

import json
from pathlib import Path


def export_metadata(output_dir: Path, metadata: dict[str, object]) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    file_path = output_dir / f"{metadata['venueId']}.venue.metadata.json"
    file_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return file_path
