"""
prop_extractor.py
Detects, classifies, and tracks props across video frames.
Outputs prop instance metadata, crops, and a deduped prop catalog.
No UI, no ticketing, no routes.
"""

from __future__ import annotations

import hashlib
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
    logger.warning("opencv-python not installed — prop detection disabled")


# ─── Classification ───────────────────────────────────────────────────────────

class PropCategory(str, Enum):
    MICROPHONE      = "microphone"
    MIC_STAND       = "mic_stand"
    HEADPHONES      = "headphones"
    SPEAKER         = "speaker"
    SUBWOOFER       = "subwoofer"
    TURNTABLE       = "turntable"
    MIXER           = "mixer"
    INSTRUMENT      = "instrument"
    AMPLIFIER       = "amplifier"
    LAPTOP          = "laptop"
    CONTROLLER      = "controller"
    TROPHY          = "trophy"
    CHAIN           = "chain"
    BOTTLE          = "bottle"
    CUP             = "cup"
    BOOK            = "book"
    CHAIR           = "chair"
    TABLE           = "table"
    BANNER          = "banner"
    SIGN            = "sign"
    LIGHT_RIG       = "light_rig"
    CAMERA          = "camera"
    PHONE           = "phone"
    TABLET          = "tablet"
    UNKNOWN         = "unknown"


PROP_MOBILITY: dict[PropCategory, bool] = {
    PropCategory.MICROPHONE:   True,
    PropCategory.MIC_STAND:    False,
    PropCategory.HEADPHONES:   True,
    PropCategory.SPEAKER:      False,
    PropCategory.SUBWOOFER:    False,
    PropCategory.TURNTABLE:    False,
    PropCategory.MIXER:        False,
    PropCategory.INSTRUMENT:   True,
    PropCategory.AMPLIFIER:    False,
    PropCategory.LAPTOP:       True,
    PropCategory.CONTROLLER:   True,
    PropCategory.TROPHY:       False,
    PropCategory.CHAIN:        True,
    PropCategory.BOTTLE:       True,
    PropCategory.CUP:          True,
    PropCategory.BOOK:         True,
    PropCategory.CHAIR:        False,
    PropCategory.TABLE:        False,
    PropCategory.BANNER:       False,
    PropCategory.SIGN:         False,
    PropCategory.LIGHT_RIG:    False,
    PropCategory.CAMERA:       True,
    PropCategory.PHONE:        True,
    PropCategory.TABLET:       True,
    PropCategory.UNKNOWN:      False,
}


# ─── Data Structures ─────────────────────────────────────────────────────────

@dataclass
class PropBBox:
    x: int
    y: int
    w: int
    h: int
    confidence: float = 1.0

    @property
    def x2(self) -> int: return self.x + self.w
    @property
    def y2(self) -> int: return self.y + self.h
    @property
    def area(self) -> int: return self.w * self.h
    @property
    def center(self) -> tuple[int, int]: return (self.x + self.w // 2, self.y + self.h // 2)

    def iou(self, other: "PropBBox") -> float:
        ix1 = max(self.x, other.x)
        iy1 = max(self.y, other.y)
        ix2 = min(self.x2, other.x2)
        iy2 = min(self.y2, other.y2)
        inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
        union = self.area + other.area - inter
        return inter / (union + 1e-8)


@dataclass
class PropInstance:
    prop_id: str
    category: PropCategory
    bbox: PropBBox
    frame_index: int
    source_path: str
    is_mobile: bool = False
    dominant_color: Optional[tuple[int, int, int]] = None
    visual_hash: str = ""       # perceptual hash of the crop

    def __post_init__(self):
        self.is_mobile = PROP_MOBILITY.get(self.category, False)

    def to_dict(self) -> dict:
        return {
            "prop_id": self.prop_id,
            "category": self.category.value,
            "bbox": asdict(self.bbox),
            "frame_index": self.frame_index,
            "source_path": self.source_path,
            "is_mobile": self.is_mobile,
            "dominant_color": list(self.dominant_color) if self.dominant_color else None,
            "visual_hash": self.visual_hash,
        }


@dataclass
class PropTrack:
    """Tracks a single prop across multiple frames."""
    track_id: str
    category: PropCategory
    instances: list[PropInstance] = field(default_factory=list)

    @property
    def frame_span(self) -> tuple[int, int]:
        if not self.instances:
            return (0, 0)
        idxs = [i.frame_index for i in self.instances]
        return (min(idxs), max(idxs))

    @property
    def mean_position(self) -> tuple[float, float]:
        if not self.instances:
            return (0.0, 0.0)
        cx = np.mean([i.bbox.center[0] for i in self.instances])
        cy = np.mean([i.bbox.center[1] for i in self.instances])
        return (float(cx), float(cy))


@dataclass
class PropCatalogEntry:
    catalog_id: str
    category: PropCategory
    display_name: str
    dominant_color: Optional[tuple[int, int, int]]
    source_frames: list[str]
    occurrence_count: int
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "catalog_id": self.catalog_id,
            "category": self.category.value,
            "display_name": self.display_name,
            "dominant_color": list(self.dominant_color) if self.dominant_color else None,
            "source_frames": self.source_frames,
            "occurrence_count": self.occurrence_count,
            "tags": self.tags,
        }


# ─── Visual hashing ───────────────────────────────────────────────────────────

def perceptual_hash(crop: "np.ndarray", size: int = 16) -> str:
    if not _CV2_AVAILABLE or crop.size == 0:
        return "0" * (size * size // 4)
    gray   = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY) if crop.ndim == 3 else crop
    small  = cv2.resize(gray, (size, size), interpolation=cv2.INTER_AREA)
    mean   = small.mean()
    bits   = (small > mean).flatten()
    chunks = [bits[i:i+4] for i in range(0, len(bits), 4)]
    return "".join(hex(int("".join(str(b) for b in chunk), 2))[2:] for chunk in chunks if len(chunk) == 4)


def dominant_color_bgr(crop: "np.ndarray") -> Optional[tuple[int, int, int]]:
    if not _CV2_AVAILABLE or crop.size == 0:
        return None
    small   = cv2.resize(crop, (32, 32))
    pixels  = small.reshape(-1, 3).astype(np.float32)
    _, _, centers = cv2.kmeans(
        pixels, 3, None,
        (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0),
        3, cv2.KMEANS_PP_CENTERS,
    )
    dominant = centers[0].astype(int)
    return (int(dominant[2]), int(dominant[1]), int(dominant[0]))  # BGR → RGB


# ─── Extractor ────────────────────────────────────────────────────────────────

class PropExtractor:
    """
    Detects props in frames by excluding person regions and applying
    contour-based object detection with shape/size heuristics.

    Upgrade path: inject a YOLO/OWL-ViT detector for accurate per-class
    predictions when model weights are available.
    """

    MIN_AREA        = 1_200
    MAX_PERSON_FRAC = 0.60      # ignore objects taller than 60% of frame height (likely persons)
    NMS_IOU_THRESH  = 0.50
    TRACK_IOU_THRESH = 0.35

    def __init__(
        self,
        min_area: int = MIN_AREA,
        exclude_persons: bool = True,
    ):
        self.min_area        = min_area
        self.exclude_persons = exclude_persons
        self._bg_sub         = self._init_bg_sub()
        self._instance_ctr   = 0

    def _init_bg_sub(self):
        if not _CV2_AVAILABLE:
            return None
        return cv2.createBackgroundSubtractorMOG2(history=300, varThreshold=40, detectShadows=False)

    # ── Detection ─────────────────────────────────────────────────────────────

    def detect_props(
        self,
        frame: "np.ndarray",
        frame_index: int = 0,
        source_path: str = "",
        person_bboxes: Optional[list[tuple[int, int, int, int]]] = None,
    ) -> list[PropInstance]:
        if not _CV2_AVAILABLE:
            return self._stub_props(frame_index, source_path)

        frame_h, frame_w = frame.shape[:2]
        fg_mask  = self._bg_sub.apply(frame)
        kernel   = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        cleaned  = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel, iterations=2)

        contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        props: list[PropInstance] = []

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < self.min_area:
                continue
            x, y, w, h = cv2.boundingRect(cnt)

            # Exclude regions that are too tall (likely persons)
            if self.exclude_persons and h > frame_h * self.MAX_PERSON_FRAC:
                continue

            # Exclude if inside a known person bbox
            if person_bboxes and self._overlaps_any_person(x, y, w, h, person_bboxes):
                continue

            crop  = frame[y:y+h, x:x+w].copy()
            cat   = self._classify_prop(w, h, area, crop)
            color = dominant_color_bgr(crop)
            vhash = perceptual_hash(crop)
            pid   = self._next_id()

            props.append(PropInstance(
                prop_id=pid,
                category=cat,
                bbox=PropBBox(int(x), int(y), int(w), int(h), confidence=0.62),
                frame_index=frame_index,
                source_path=source_path,
                dominant_color=color,
                visual_hash=vhash,
            ))

        props = self._nms(props)
        logger.debug("frame %d → %d prop(s)", frame_index, len(props))
        return props

    def _overlaps_any_person(
        self,
        x: int, y: int, w: int, h: int,
        persons: list[tuple[int, int, int, int]],
        overlap_thresh: float = 0.60,
    ) -> bool:
        pb = PropBBox(x, y, w, h)
        for (px, py, pw, ph) in persons:
            person_bb = PropBBox(px, py, pw, ph)
            if pb.iou(person_bb) > overlap_thresh:
                return True
        return False

    def _classify_prop(
        self,
        w: int, h: int, area: float,
        crop: "np.ndarray",
    ) -> PropCategory:
        aspect = w / (h + 1e-8)

        if aspect < 0.25 and h > 80:
            return PropCategory.MIC_STAND
        if 0.25 < aspect < 0.55 and h > 60:
            return PropCategory.MICROPHONE
        if area > 50_000 and aspect > 1.5:
            return PropCategory.TABLE
        if area > 20_000 and 0.7 < aspect < 1.4:
            return PropCategory.SPEAKER
        if 0.9 < aspect < 2.5 and 5_000 < area < 30_000:
            return PropCategory.LAPTOP
        if area < 4_000 and aspect > 0.4:
            return PropCategory.PHONE
        if 0.6 < aspect < 2.0 and area > 8_000:
            return PropCategory.TURNTABLE

        return PropCategory.UNKNOWN

    def _nms(self, props: list[PropInstance]) -> list[PropInstance]:
        if len(props) <= 1:
            return props
        keep: list[PropInstance] = []
        for prop in sorted(props, key=lambda p: p.bbox.area, reverse=True):
            suppressed = any(
                prop.category == k.category and prop.bbox.iou(k.bbox) > self.NMS_IOU_THRESH
                for k in keep
            )
            if not suppressed:
                keep.append(prop)
        return keep

    def _next_id(self) -> str:
        self._instance_ctr += 1
        return f"prop_{self._instance_ctr:06d}"

    def _stub_props(self, frame_index: int, source_path: str) -> list[PropInstance]:
        return [
            PropInstance(
                prop_id="prop_000001",
                category=PropCategory.MICROPHONE,
                bbox=PropBBox(220, 180, 48, 110, confidence=0.80),
                frame_index=frame_index,
                source_path=source_path,
                dominant_color=(40, 40, 40),
                visual_hash="a3f1c9b2",
            )
        ]

    # ── Prop crop extraction ──────────────────────────────────────────────────

    def extract_crop(
        self,
        frame: "np.ndarray",
        prop: PropInstance,
        padding: int = 8,
    ) -> "np.ndarray":
        h_max, w_max = frame.shape[:2]
        x1 = max(0, prop.bbox.x - padding)
        y1 = max(0, prop.bbox.y - padding)
        x2 = min(w_max, prop.bbox.x2 + padding)
        y2 = min(h_max, prop.bbox.y2 + padding)
        return frame[y1:y2, x1:x2].copy()

    # ── Multi-frame tracking ──────────────────────────────────────────────────

    def track_across_frames(
        self,
        video_path: str | Path,
        target_category: Optional[PropCategory] = None,
        sample_every_n: int = 12,
        max_frames: int = 600,
    ) -> list[PropTrack]:
        video_path = Path(video_path)
        if not _CV2_AVAILABLE:
            stub = self._stub_props(0, str(video_path))
            track = PropTrack(track_id="track_000001", category=stub[0].category, instances=stub)
            return [track]

        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise FileNotFoundError(f"Cannot open video: {video_path}")

        all_instances: list[PropInstance] = []
        frame_idx = 0
        collected = 0

        while collected < max_frames:
            ok, frame = cap.read()
            if not ok:
                break
            if frame_idx % sample_every_n == 0:
                instances = self.detect_props(frame, frame_index=frame_idx, source_path=str(video_path))
                if target_category:
                    instances = [p for p in instances if p.category == target_category]
                all_instances.extend(instances)
                collected += 1
            frame_idx += 1

        cap.release()
        tracks = self._associate_instances(all_instances)
        logger.info("%s — %d track(s) built", video_path.name, len(tracks))
        return tracks

    def _associate_instances(self, instances: list[PropInstance]) -> list[PropTrack]:
        tracks: dict[str, PropTrack] = {}
        track_ctr = 0

        for inst in sorted(instances, key=lambda p: p.frame_index):
            matched_track: Optional[str] = None
            best_iou = 0.0

            for tid, track in tracks.items():
                if track.category != inst.category:
                    continue
                last = track.instances[-1]
                iou  = inst.bbox.iou(last.bbox)
                if iou > self.TRACK_IOU_THRESH and iou > best_iou:
                    best_iou     = iou
                    matched_track = tid

            if matched_track:
                tracks[matched_track].instances.append(inst)
            else:
                tid = f"track_{track_ctr:06d}"
                track_ctr += 1
                tracks[tid] = PropTrack(track_id=tid, category=inst.category, instances=[inst])

        return list(tracks.values())

    # ── Catalog building ──────────────────────────────────────────────────────

    def build_catalog(
        self,
        instances: list[PropInstance],
    ) -> list[PropCatalogEntry]:
        buckets: dict[str, list[PropInstance]] = {}
        for inst in instances:
            key = f"{inst.category.value}:{inst.visual_hash[:6]}"
            buckets.setdefault(key, []).append(inst)

        catalog: list[PropCatalogEntry] = []
        for i, (key, group) in enumerate(buckets.items()):
            rep = max(group, key=lambda p: p.bbox.area)
            catalog.append(PropCatalogEntry(
                catalog_id=f"prop_catalog_{i:04d}",
                category=rep.category,
                display_name=rep.category.value.replace("_", " ").title(),
                dominant_color=rep.dominant_color,
                source_frames=[f"{p.source_path}:frame_{p.frame_index}" for p in group],
                occurrence_count=len(group),
                tags=[rep.category.value, "mobile" if rep.is_mobile else "static"],
            ))

        logger.info("Built prop catalog with %d entries", len(catalog))
        return catalog

    # ── Persistence ───────────────────────────────────────────────────────────

    @staticmethod
    def save_instances(instances: list[PropInstance], path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"prop_instances": [p.to_dict() for p in instances]}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Saved %d prop instances → %s", len(instances), path)

    @staticmethod
    def save_catalog(catalog: list[PropCatalogEntry], path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"prop_catalog": [e.to_dict() for e in catalog]}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Saved %d catalog entries → %s", len(catalog), path)

    @staticmethod
    def load_catalog(path: str | Path) -> list[PropCatalogEntry]:
        data = json.loads(Path(path).read_text())
        return [
            PropCatalogEntry(
                catalog_id=e["catalog_id"],
                category=PropCategory(e["category"]),
                display_name=e["display_name"],
                dominant_color=tuple(e["dominant_color"]) if e.get("dominant_color") else None,
                source_frames=e.get("source_frames", []),
                occurrence_count=e.get("occurrence_count", 1),
                tags=e.get("tags", []),
            )
            for e in data.get("prop_catalog", [])
        ]
