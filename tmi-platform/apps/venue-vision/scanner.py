from __future__ import annotations

import re
from pathlib import Path

from audio_mapper import map_audio
from billboard_mapper import map_billboards
from camera_mapper import map_cameras
from crowd_mapper import map_crowd
from depthmap import parse_depth
from heat_mapper import map_heat
from lighting_mapper import map_lighting
from metadata_exporter import export_metadata
from object_mapper import map_objects
from path_mapper import map_paths
from portal_mapper import map_portals
from safety_mapper import map_safety
from scene_graph_builder import build_scene_graph
from seat_mapper import map_seats
from segmentation import segment_venue
from sponsor_mapper import map_sponsors
from stage_mapper import map_stage

SUPPORTED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".pdf",
    ".gif",
}

VENUE_CLASS_KEYWORDS = {
    "LOBBY": ["lobby", "entrance", "foyer"],
    "CLUB": ["club", "night"],
    "ARENA": ["arena", "stadium"],
    "THEATER": ["theater", "theatre", "stage"],
    "AMPHITHEATER": ["amphitheater", "amphi"],
    "STUDIO": ["studio"],
    "PODCAST_ROOM": ["podcast"],
    "BATTLE_ROOM": ["battle"],
    "CYPHER_ROOM": ["cypher"],
    "VIP_ROOM": ["vip"],
    "BACKSTAGE": ["backstage", "green-room", "greenroom"],
    "SHOW_ROOM": ["show", "hall"],
    "GAME_ROOM": ["game", "casino"],
    "MERCH_ROOM": ["merch", "store", "shop"],
}


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def classify_venue_class(asset_path: Path) -> str:
    value = asset_path.stem.lower()
    for venue_class, keywords in VENUE_CLASS_KEYWORDS.items():
        if any(keyword in value for keyword in keywords):
            return venue_class
    return "LOBBY"


def discover_assets(input_root: Path) -> list[Path]:
    paths: list[Path] = []
    for path in input_root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        as_posix = path.as_posix().lower()
        if "/node_modules/" in as_posix or "/.git/" in as_posix or "/__pycache__/" in as_posix:
            continue
        if any(token in as_posix for token in ["venue", "lobb", "seating", "stage", "battle", "cypher", "host"]):
            paths.append(path)
    return sorted(paths)


def process_asset(asset_path: Path, output_root: Path, source_root: Path) -> Path:
    venue_class = classify_venue_class(asset_path)
    segmentation = segment_venue(asset_path, venue_class)
    depth = parse_depth(asset_path, venue_class)
    objects = map_objects(asset_path, venue_class)
    seats = map_seats(asset_path, venue_class)
    portals = map_portals(asset_path, venue_class)
    crowd = map_crowd(asset_path, venue_class)
    cameras = map_cameras(asset_path, venue_class)
    lighting = map_lighting(asset_path, venue_class)
    audio = map_audio(asset_path, venue_class)
    paths = map_paths(asset_path, venue_class)
    heat = map_heat(asset_path, venue_class)
    sponsors = map_sponsors(asset_path, venue_class)
    billboards = map_billboards(asset_path, venue_class)
    stage = map_stage(asset_path, venue_class)
    safety = map_safety(asset_path, venue_class)

    metadata = build_scene_graph(
        asset_path=asset_path,
        source_root=source_root,
        venue_class=venue_class,
        segmentation=segmentation,
        depth=depth,
        objects=objects,
        seats=seats,
        portals=portals,
        crowd=crowd,
        cameras=cameras,
        lighting=lighting,
        audio=audio,
        paths=paths,
        heat=heat,
        sponsors=sponsors,
        billboards=billboards,
        stage=stage,
        safety=safety,
    )
    return export_metadata(output_root, metadata)
