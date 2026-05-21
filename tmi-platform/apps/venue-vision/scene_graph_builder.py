from __future__ import annotations

from pathlib import Path


def build_scene_graph(
    *,
    asset_path: Path,
    source_root: Path,
    venue_class: str,
    segmentation: dict[str, object],
    depth: dict[str, object],
    objects: dict[str, object],
    seats: dict[str, object],
    portals: dict[str, object],
    crowd: dict[str, object],
    cameras: dict[str, object],
    lighting: dict[str, object],
    audio: dict[str, object],
    paths: dict[str, object],
    heat: dict[str, object],
    sponsors: dict[str, object],
    billboards: dict[str, object],
    stage: dict[str, object],
    safety: dict[str, object],
) -> dict[str, object]:
    relative_source = asset_path.relative_to(source_root).as_posix()
    venue_id = asset_path.stem.lower().replace(" ", "-")

    return {
        "approved": True,
        "status": "Approved",
        "engine": "Venue Intelligence Engine V1",
        "venueId": venue_id,
        "venueClass": venue_class,
        "sourceAssetPath": relative_source,
        "sourceAssetType": asset_path.suffix.lower(),
        "scanner": {
            "version": "v1",
            "pipeline": [
                "scan",
                "segment",
                "classify",
                "extract",
                "metadata",
                "reconstruct",
                "store",
            ],
        },
        "segmentation": segmentation,
        "depth": depth,
        "structural": {
            "walls": objects["objects"][:1],
            "floors": ["main-floor"],
            "doors": ["entry-door", "service-door"],
            "stairs": ["upper-stair"],
            "platforms": ["stage-platform"],
        },
        "seating": seats,
        "movement": paths,
        "social": crowd,
        "performance": stage,
        "audio": audio,
        "cameras": cameras,
        "ads": {
            "billboards": billboards["billboards"],
            "sponsorSlots": sponsors["sponsorSlots"],
        },
        "commerce": {
            "shops": ["shop-lane-a"],
            "merchTables": ["merch-table-main"],
            "ticketBooths": ["ticket-booth-main"],
        },
        "security": safety,
        "portals": portals,
        "heat": heat,
        "lighting": lighting,
        "objects": objects,
    }
