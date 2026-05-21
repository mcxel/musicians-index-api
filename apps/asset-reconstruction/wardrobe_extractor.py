"""
wardrobe_extractor.py
Extracts garment regions from frames, classifies clothing types,
and builds a reusable wardrobe asset library with color palettes.
No UI, no rendering pipeline.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field, asdict
from enum import Enum
from pathlib import Path
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

try:
    import cv2
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False
    logger.warning("opencv-python not installed — wardrobe detection disabled")


# ─── Classification ───────────────────────────────────────────────────────────

class GarmentType(str, Enum):
    HAT          = "hat"
    HOODIE       = "hoodie"
    JACKET       = "jacket"
    VEST         = "vest"
    SHIRT        = "shirt"
    TEE          = "tee"
    JERSEY       = "jersey"
    TANK_TOP     = "tank_top"
    SUIT_JACKET  = "suit_jacket"
    SWEATER      = "sweater"
    PANTS        = "pants"
    SHORTS       = "shorts"
    JOGGERS      = "joggers"
    JEANS        = "jeans"
    DRESS        = "dress"
    SKIRT        = "skirt"
    SHOES        = "shoes"
    SNEAKERS     = "sneakers"
    BOOTS        = "boots"
    ACCESSORY    = "accessory"
    CHAIN        = "chain"
    GLASSES      = "glasses"
    UNKNOWN      = "unknown"


class GarmentZone(str, Enum):
    HEAD        = "head"
    UPPER_BODY  = "upper_body"
    LOWER_BODY  = "lower_body"
    FULL_BODY   = "full_body"
    FEET        = "feet"
    ACCESSORY   = "accessory"


GARMENT_ZONE_MAP: dict[GarmentType, GarmentZone] = {
    GarmentType.HAT:         GarmentZone.HEAD,
    GarmentType.GLASSES:     GarmentZone.HEAD,
    GarmentType.CHAIN:       GarmentZone.ACCESSORY,
    GarmentType.ACCESSORY:   GarmentZone.ACCESSORY,
    GarmentType.HOODIE:      GarmentZone.UPPER_BODY,
    GarmentType.JACKET:      GarmentZone.UPPER_BODY,
    GarmentType.VEST:        GarmentZone.UPPER_BODY,
    GarmentType.SHIRT:       GarmentZone.UPPER_BODY,
    GarmentType.TEE:         GarmentZone.UPPER_BODY,
    GarmentType.JERSEY:      GarmentZone.UPPER_BODY,
    GarmentType.TANK_TOP:    GarmentZone.UPPER_BODY,
    GarmentType.SUIT_JACKET: GarmentZone.UPPER_BODY,
    GarmentType.SWEATER:     GarmentZone.UPPER_BODY,
    GarmentType.PANTS:       GarmentZone.LOWER_BODY,
    GarmentType.SHORTS:      GarmentZone.LOWER_BODY,
    GarmentType.JOGGERS:     GarmentZone.LOWER_BODY,
    GarmentType.JEANS:       GarmentZone.LOWER_BODY,
    GarmentType.DRESS:       GarmentZone.FULL_BODY,
    GarmentType.SKIRT:       GarmentZone.LOWER_BODY,
    GarmentType.SHOES:       GarmentZone.FEET,
    GarmentType.SNEAKERS:    GarmentZone.FEET,
    GarmentType.BOOTS:       GarmentZone.FEET,
}


# ─── Data Structures ─────────────────────────────────────────────────────────

@dataclass
class RGBColor:
    r: int
    g: int
    b: int
    proportion: float = 0.0      # fraction of garment this color covers

    @property
    def hex(self) -> str:
        return f"#{self.r:02X}{self.g:02X}{self.b:02X}"

    @property
    def as_tuple(self) -> tuple[int, int, int]:
        return (self.r, self.g, self.b)

    def to_dict(self) -> dict:
        return {"r": self.r, "g": self.g, "b": self.b, "proportion": round(self.proportion, 4), "hex": self.hex}


@dataclass
class GarmentRegion:
    garment_type: GarmentType
    zone: GarmentZone
    x: int
    y: int
    w: int
    h: int
    confidence: float
    frame_index: int = 0
    color_palette: list[RGBColor] = field(default_factory=list)
    pattern_tags: list[str] = field(default_factory=list)  # e.g. ["striped", "logo", "solid"]

    @property
    def area(self) -> int:
        return self.w * self.h

    def to_dict(self) -> dict:
        return {
            "garment_type": self.garment_type.value,
            "zone": self.zone.value,
            "x": self.x, "y": self.y, "w": self.w, "h": self.h,
            "confidence": round(self.confidence, 4),
            "frame_index": self.frame_index,
            "color_palette": [c.to_dict() for c in self.color_palette],
            "pattern_tags": self.pattern_tags,
        }


@dataclass
class WardrobeSnapshot:
    source_path: str
    frame_index: int
    garments: list[GarmentRegion]
    person_bbox: Optional[tuple[int, int, int, int]] = None  # (x,y,w,h) of the person

    @property
    def upper_garments(self) -> list[GarmentRegion]:
        return [g for g in self.garments if g.zone == GarmentZone.UPPER_BODY]

    @property
    def lower_garments(self) -> list[GarmentRegion]:
        return [g for g in self.garments if g.zone == GarmentZone.LOWER_BODY]

    @property
    def accessories(self) -> list[GarmentRegion]:
        return [g for g in self.garments if g.zone == GarmentZone.ACCESSORY]

    def to_dict(self) -> dict:
        return {
            "source_path": self.source_path,
            "frame_index": self.frame_index,
            "person_bbox": list(self.person_bbox) if self.person_bbox else None,
            "garments": [g.to_dict() for g in self.garments],
        }


@dataclass
class WardrobeAsset:
    asset_id: str
    garment_type: GarmentType
    zone: GarmentZone
    color_palette: list[RGBColor]
    pattern_tags: list[str]
    source_frames: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "asset_id": self.asset_id,
            "garment_type": self.garment_type.value,
            "zone": self.zone.value,
            "color_palette": [c.to_dict() for c in self.color_palette],
            "pattern_tags": self.pattern_tags,
            "source_frames": self.source_frames,
            "tags": self.tags,
        }


# ─── Color Palette Extraction ─────────────────────────────────────────────────

def extract_color_palette(
    crop: "np.ndarray",
    n_colors: int = 5,
) -> list[RGBColor]:
    if not _CV2_AVAILABLE or crop.size == 0:
        return [RGBColor(128, 128, 128, 1.0)]

    small = cv2.resize(crop, (64, 64))
    rgb   = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
    pixels = rgb.reshape(-1, 3).astype(np.float32)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    k = min(n_colors, len(pixels))
    _, labels, centers = cv2.kmeans(
        pixels, k, None, criteria, 3, cv2.KMEANS_PP_CENTERS
    )
    centers = centers.astype(int)
    counts  = np.bincount(labels.flatten(), minlength=k)
    total   = counts.sum()

    palette: list[RGBColor] = []
    for i in np.argsort(-counts):
        r, g, b = int(centers[i][0]), int(centers[i][1]), int(centers[i][2])
        prop    = float(counts[i]) / total
        palette.append(RGBColor(r=r, g=g, b=b, proportion=round(prop, 4)))

    return palette


def detect_pattern_tags(crop: "np.ndarray") -> list[str]:
    if not _CV2_AVAILABLE or crop.size == 0:
        return []
    tags: list[str] = []
    gray    = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY) if crop.ndim == 3 else crop
    blur    = cv2.Laplacian(gray, cv2.CV_64F).var()
    std_dev = float(gray.std())

    if std_dev < 15:
        tags.append("solid")
    if blur > 200 and std_dev > 30:
        tags.append("textured")
    if blur > 500:
        tags.append("detailed")

    edges     = cv2.Canny(gray, 50, 150)
    edge_frac = float(edges.sum()) / (edges.size * 255 + 1e-8)
    if edge_frac > 0.08:
        tags.append("logo_or_graphic")
    if not tags:
        tags.append("unknown_pattern")

    return tags


# ─── Extractor ────────────────────────────────────────────────────────────────

class WardrobeExtractor:
    """
    Extracts garment regions from video frames.
    Uses body-proportion heuristics to localize garment zones from
    a person bounding box, then extracts color palette + pattern tags.

    Upgrade path: replace zone_to_garment_crop() with a garment segmentation
    model (e.g., SCHP, ClothSeg) when weights are available.
    """

    ZONE_PROPORTIONS: dict[GarmentZone, tuple[float, float]] = {
        # (y_start_ratio, y_end_ratio) within person bbox
        GarmentZone.HEAD:       (0.00, 0.18),
        GarmentZone.UPPER_BODY: (0.18, 0.55),
        GarmentZone.LOWER_BODY: (0.55, 0.88),
        GarmentZone.FEET:       (0.88, 1.00),
    }

    def __init__(self, n_palette_colors: int = 5):
        self.n_palette_colors = n_palette_colors

    # ── Zone extraction ───────────────────────────────────────────────────────

    def zone_to_garment_crop(
        self,
        frame: "np.ndarray",
        person_bbox: tuple[int, int, int, int],
        zone: GarmentZone,
    ) -> Optional["np.ndarray"]:
        px, py, pw, ph = person_bbox
        y_start, y_end = self.ZONE_PROPORTIONS.get(zone, (0.0, 1.0))
        y1 = py + int(ph * y_start)
        y2 = py + int(ph * y_end)
        x1, x2 = px, px + pw
        h_max, w_max = frame.shape[:2]
        y1, y2 = max(0, y1), min(h_max, y2)
        x1, x2 = max(0, x1), min(w_max, x2)
        if y2 <= y1 or x2 <= x1:
            return None
        return frame[y1:y2, x1:x2].copy()

    # ── Garment classification ────────────────────────────────────────────────

    def classify_garment_from_crop(
        self,
        crop: "np.ndarray",
        zone: GarmentZone,
    ) -> tuple[GarmentType, float]:
        """
        Heuristic classifier based on crop dimensions, color, and edge density.
        Replace with a dedicated garment model for production accuracy.
        """
        if crop is None or crop.size == 0:
            return GarmentType.UNKNOWN, 0.0

        h, w = crop.shape[:2]
        aspect = w / (h + 1e-8)

        if zone == GarmentZone.HEAD:
            return (GarmentType.HAT, 0.55) if aspect > 1.5 else (GarmentType.HAT, 0.40)

        if zone == GarmentZone.UPPER_BODY:
            if _CV2_AVAILABLE:
                gray   = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                edges  = cv2.Canny(gray, 50, 150)
                e_frac = float(edges.sum()) / (edges.size * 255 + 1e-8)
                std    = float(gray.std())
                if e_frac > 0.12:
                    return GarmentType.JACKET, 0.60
                if std < 20:
                    return GarmentType.TEE, 0.65
                return GarmentType.HOODIE, 0.55
            return GarmentType.SHIRT, 0.50

        if zone == GarmentZone.LOWER_BODY:
            if h < w:
                return GarmentType.SHORTS, 0.60
            return GarmentType.PANTS, 0.60

        if zone == GarmentZone.FEET:
            return GarmentType.SNEAKERS, 0.55

        return GarmentType.UNKNOWN, 0.30

    # ── Full garment detection from person bbox ───────────────────────────────

    def detect_garments(
        self,
        frame: "np.ndarray",
        person_bbox: tuple[int, int, int, int],
        frame_index: int = 0,
        zones: Optional[list[GarmentZone]] = None,
    ) -> list[GarmentRegion]:
        px, py, pw, ph = person_bbox
        target_zones = zones or [
            GarmentZone.HEAD,
            GarmentZone.UPPER_BODY,
            GarmentZone.LOWER_BODY,
            GarmentZone.FEET,
        ]

        garments: list[GarmentRegion] = []
        for zone in target_zones:
            crop = self.zone_to_garment_crop(frame, person_bbox, zone)
            if crop is None:
                continue

            y_start, y_end = self.ZONE_PROPORTIONS.get(zone, (0.0, 1.0))
            ry = py + int(ph * y_start)
            rh = int(ph * (y_end - y_start))

            garment_type, conf = self.classify_garment_from_crop(crop, zone)
            palette   = extract_color_palette(crop, self.n_palette_colors)
            patterns  = detect_pattern_tags(crop)

            garments.append(GarmentRegion(
                garment_type=garment_type,
                zone=zone,
                x=px, y=ry, w=pw, h=rh,
                confidence=conf,
                frame_index=frame_index,
                color_palette=palette,
                pattern_tags=patterns,
            ))

        logger.debug("frame %d, person %s → %d garment(s)", frame_index, person_bbox, len(garments))
        return garments

    # ── Wardrobe snapshot ─────────────────────────────────────────────────────

    def build_snapshot(
        self,
        frame: "np.ndarray",
        person_bbox: tuple[int, int, int, int],
        source_path: str = "",
        frame_index: int = 0,
    ) -> WardrobeSnapshot:
        garments = self.detect_garments(frame, person_bbox, frame_index)
        return WardrobeSnapshot(
            source_path=source_path,
            frame_index=frame_index,
            garments=garments,
            person_bbox=person_bbox,
        )

    # ── Library building ──────────────────────────────────────────────────────

    def build_wardrobe_asset_library(
        self,
        snapshots: list[WardrobeSnapshot],
    ) -> list[WardrobeAsset]:
        """
        Groups garments from multiple snapshots into deduplicated WardrobeAssets
        by (garment_type, dominant_color_hex) key.
        """
        buckets: dict[str, list[GarmentRegion]] = {}
        for snap in snapshots:
            for g in snap.garments:
                dominant = g.color_palette[0].hex if g.color_palette else "#000000"
                key = f"{g.garment_type.value}:{dominant}"
                buckets.setdefault(key, []).append(g)

        assets: list[WardrobeAsset] = []
        for i, (key, group) in enumerate(buckets.items()):
            representative = max(group, key=lambda g: g.confidence)
            all_tags = list({t for g in group for t in g.pattern_tags})
            assets.append(WardrobeAsset(
                asset_id=f"wardrobe_{i:04d}_{representative.garment_type.value}",
                garment_type=representative.garment_type,
                zone=representative.zone,
                color_palette=representative.color_palette,
                pattern_tags=all_tags,
                source_frames=[f"frame_{g.frame_index}" for g in group],
                tags=[representative.garment_type.value, representative.zone.value],
            ))

        logger.info("Built %d wardrobe assets from %d snapshot(s)", len(assets), len(snapshots))
        return assets

    # ── Persistence ───────────────────────────────────────────────────────────

    @staticmethod
    def save_snapshots(snapshots: list[WardrobeSnapshot], path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"snapshots": [s.to_dict() for s in snapshots]}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Saved %d snapshots → %s", len(snapshots), path)

    @staticmethod
    def save_asset_library(assets: list[WardrobeAsset], path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"wardrobe_assets": [a.to_dict() for a in assets]}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Saved %d wardrobe assets → %s", len(assets), path)

    @staticmethod
    def load_asset_library(path: str | Path) -> list[WardrobeAsset]:
        data = json.loads(Path(path).read_text())
        return [
            WardrobeAsset(
                asset_id=a["asset_id"],
                garment_type=GarmentType(a["garment_type"]),
                zone=GarmentZone(a["zone"]),
                color_palette=[RGBColor(**c) for c in a["color_palette"]],
                pattern_tags=a["pattern_tags"],
                source_frames=a.get("source_frames", []),
                tags=a.get("tags", []),
            )
            for a in data.get("wardrobe_assets", [])
        ]
