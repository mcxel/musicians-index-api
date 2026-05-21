"""
object_asset_splitter.py
Detects and classifies objects in video frames, then splits them into
individual asset crops with masks. Outputs are numpy arrays + metadata.
No UI, no routes.
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
    logger.warning("opencv-python not installed — live object detection disabled")


# ─── Asset Classification ─────────────────────────────────────────────────────

class AssetType(str, Enum):
    PERSON         = "person"
    FACE           = "face"
    HAND           = "hand"
    MICROPHONE     = "microphone"
    HEADPHONES     = "headphones"
    INSTRUMENT     = "instrument"
    TURNTABLE      = "turntable"
    SPEAKER        = "speaker"
    CAMERA         = "camera"
    LAPTOP         = "laptop"
    PHONE          = "phone"
    CLOTHING       = "clothing"
    CHAIR          = "chair"
    TABLE          = "table"
    SIGN           = "sign"
    TROPHY         = "trophy"
    BACKGROUND     = "background"
    PROP           = "prop"
    UNKNOWN        = "unknown"


COCO_TO_ASSET: dict[str, AssetType] = {
    "person":        AssetType.PERSON,
    "microphone":    AssetType.MICROPHONE,
    "laptop":        AssetType.LAPTOP,
    "cell phone":    AssetType.PHONE,
    "chair":         AssetType.CHAIR,
    "dining table":  AssetType.TABLE,
}


# ─── Data Structures ─────────────────────────────────────────────────────────

@dataclass
class BoundingBox:
    x: int
    y: int
    w: int
    h: int
    confidence: float = 1.0

    @property
    def x2(self) -> int:
        return self.x + self.w

    @property
    def y2(self) -> int:
        return self.y + self.h

    @property
    def area(self) -> int:
        return self.w * self.h

    @property
    def center(self) -> tuple[int, int]:
        return (self.x + self.w // 2, self.y + self.h // 2)

    def iou(self, other: "BoundingBox") -> float:
        ix1 = max(self.x, other.x)
        iy1 = max(self.y, other.y)
        ix2 = min(self.x2, other.x2)
        iy2 = min(self.y2, other.y2)
        inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
        union = self.area + other.area - inter
        return inter / (union + 1e-8)

    def to_slice(self) -> tuple[slice, slice]:
        return (slice(self.y, self.y + self.h), slice(self.x, self.x + self.w))


@dataclass
class ObjectBound:
    asset_type: AssetType
    bbox: BoundingBox
    instance_id: str
    frame_index: int = 0
    mask: Optional[list[list[int]]] = None   # binary mask (H×W), stored as nested list
    label_confidence: float = 1.0

    @property
    def object_id(self) -> str:
        raw = f"{self.asset_type.value}:{self.bbox.x}:{self.bbox.y}:{self.frame_index}"
        return hashlib.sha1(raw.encode()).hexdigest()[:10]


@dataclass
class SplitResult:
    source_path: str
    frame_index: int
    frame_shape: tuple[int, int, int]
    objects: list[ObjectBound]
    asset_type_counts: dict[str, int] = field(default_factory=dict)

    def __post_init__(self):
        if not self.asset_type_counts:
            for obj in self.objects:
                self.asset_type_counts[obj.asset_type.value] = (
                    self.asset_type_counts.get(obj.asset_type.value, 0) + 1
                )

    def objects_of_type(self, asset_type: AssetType) -> list[ObjectBound]:
        return [o for o in self.objects if o.asset_type == asset_type]

    def to_dict(self) -> dict:
        d = {
            "source_path": self.source_path,
            "frame_index": self.frame_index,
            "frame_shape": list(self.frame_shape),
            "asset_type_counts": self.asset_type_counts,
            "objects": [
                {
                    "asset_type": o.asset_type.value,
                    "instance_id": o.instance_id,
                    "frame_index": o.frame_index,
                    "label_confidence": o.label_confidence,
                    "bbox": asdict(o.bbox),
                }
                for o in self.objects
            ],
        }
        return d


@dataclass
class AssetCrop:
    object_bound: ObjectBound
    crop: "np.ndarray"
    mask: Optional["np.ndarray"] = None    # binary mask aligned with crop
    padding_applied: int = 0


# ─── Splitter ─────────────────────────────────────────────────────────────────

class ObjectAssetSplitter:
    """
    Detects objects in video frames using background subtraction + contour
    analysis (no external model weights required). Classifies and extracts
    per-object crops + alpha masks.

    Drop-in upgrade path: replace _detect_contour_objects() with a YOLOv8
    or Detectron2 call when model weights are available.
    """

    MIN_AREA         = 2_000
    NMS_IOU_THRESH   = 0.45
    CROP_PADDING     = 12
    MASK_DILATE_ITER = 2

    def __init__(
        self,
        min_area: int = MIN_AREA,
        nms_iou_thresh: float = NMS_IOU_THRESH,
        crop_padding: int = CROP_PADDING,
    ):
        self.min_area       = min_area
        self.nms_iou_thresh = nms_iou_thresh
        self.crop_padding   = crop_padding
        self._bg_subtractor = self._init_bg_subtractor()
        self._face_cascade  = self._init_face_cascade()
        self._instance_counter: dict[str, int] = {}

    def _init_bg_subtractor(self):
        if not _CV2_AVAILABLE:
            return None
        return cv2.createBackgroundSubtractorMOG2(history=200, varThreshold=50, detectShadows=False)

    def _init_face_cascade(self):
        if not _CV2_AVAILABLE:
            return None
        path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        c = cv2.CascadeClassifier(path)
        return c if not c.empty() else None

    # ── Frame-level detection ─────────────────────────────────────────────────

    def detect_objects(
        self,
        frame: "np.ndarray",
        frame_index: int = 0,
    ) -> list[ObjectBound]:
        objects: list[ObjectBound] = []

        if not _CV2_AVAILABLE:
            objects.extend(self._stub_objects(frame_index))
            return objects

        objects.extend(self._detect_faces(frame, frame_index))
        objects.extend(self._detect_contour_objects(frame, frame_index))
        objects = self._nms(objects)
        logger.debug("frame %d → %d object(s)", frame_index, len(objects))
        return objects

    def _detect_faces(
        self,
        frame: "np.ndarray",
        frame_index: int,
    ) -> list[ObjectBound]:
        if self._face_cascade is None:
            return []
        gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self._face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48))
        result = []
        for (x, y, w, h) in (faces if len(faces) else []):
            iid = self._next_instance_id("face")
            result.append(ObjectBound(
                asset_type=AssetType.FACE,
                bbox=BoundingBox(int(x), int(y), int(w), int(h), confidence=0.88),
                instance_id=iid,
                frame_index=frame_index,
            ))
        return result

    def _detect_contour_objects(
        self,
        frame: "np.ndarray",
        frame_index: int,
    ) -> list[ObjectBound]:
        if self._bg_subtractor is None:
            return []
        fg_mask  = self._bg_subtractor.apply(frame)
        kernel   = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        cleaned  = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        result = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < self.min_area:
                continue
            x, y, w, h = cv2.boundingRect(cnt)
            asset_type  = self._classify_by_shape(w, h, area)
            iid = self._next_instance_id(asset_type.value)
            result.append(ObjectBound(
                asset_type=asset_type,
                bbox=BoundingBox(int(x), int(y), int(w), int(h), confidence=0.65),
                instance_id=iid,
                frame_index=frame_index,
                label_confidence=0.65,
            ))
        return result

    def _classify_by_shape(self, w: int, h: int, area: float) -> AssetType:
        aspect = w / (h + 1e-8)
        if 0.6 < aspect < 1.6 and h > 80:
            return AssetType.PERSON
        if area > 80_000:
            return AssetType.BACKGROUND
        if aspect < 0.4:
            return AssetType.MICROPHONE
        return AssetType.PROP

    def _nms(self, objects: list[ObjectBound]) -> list[ObjectBound]:
        if len(objects) <= 1:
            return objects
        keep: list[ObjectBound] = []
        for obj in sorted(objects, key=lambda o: o.bbox.confidence, reverse=True):
            suppressed = False
            for kept in keep:
                if obj.asset_type == kept.asset_type and obj.bbox.iou(kept.bbox) > self.nms_iou_thresh:
                    suppressed = True
                    break
            if not suppressed:
                keep.append(obj)
        return keep

    def _next_instance_id(self, key: str) -> str:
        n = self._instance_counter.get(key, 0)
        self._instance_counter[key] = n + 1
        return f"{key}_{n:04d}"

    def _stub_objects(self, frame_index: int) -> list[ObjectBound]:
        return [
            ObjectBound(
                asset_type=AssetType.PERSON,
                bbox=BoundingBox(100, 50, 200, 400, confidence=0.92),
                instance_id="person_0000",
                frame_index=frame_index,
            ),
            ObjectBound(
                asset_type=AssetType.MICROPHONE,
                bbox=BoundingBox(180, 200, 40, 90, confidence=0.75),
                instance_id="microphone_0000",
                frame_index=frame_index,
            ),
        ]

    # ── Crop extraction ───────────────────────────────────────────────────────

    def extract_crop(
        self,
        frame: "np.ndarray",
        obj: ObjectBound,
        with_mask: bool = True,
    ) -> AssetCrop:
        h_max, w_max = frame.shape[:2]
        pad = self.crop_padding
        x1  = max(0, obj.bbox.x - pad)
        y1  = max(0, obj.bbox.y - pad)
        x2  = min(w_max, obj.bbox.x2 + pad)
        y2  = min(h_max, obj.bbox.y2 + pad)
        crop = frame[y1:y2, x1:x2].copy()

        mask = None
        if with_mask and _CV2_AVAILABLE:
            mask = self._build_mask(frame, obj, (x1, y1, x2, y2))

        return AssetCrop(object_bound=obj, crop=crop, mask=mask, padding_applied=pad)

    def _build_mask(
        self,
        frame: "np.ndarray",
        obj: ObjectBound,
        crop_rect: tuple[int, int, int, int],
    ) -> "np.ndarray":
        x1, y1, x2, y2 = crop_rect
        crop_h, crop_w  = y2 - y1, x2 - x1
        mask = np.zeros((crop_h, crop_w), dtype=np.uint8)
        # Object bounding rect relative to crop
        bx1 = max(0, obj.bbox.x - x1)
        by1 = max(0, obj.bbox.y - y1)
        bx2 = min(crop_w, obj.bbox.x2 - x1)
        by2 = min(crop_h, obj.bbox.y2 - y1)
        mask[by1:by2, bx1:bx2] = 255

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask   = cv2.dilate(mask, kernel, iterations=self.MASK_DILATE_ITER)
        return mask

    # ── Full frame split ──────────────────────────────────────────────────────

    def split_frame(
        self,
        frame: "np.ndarray",
        frame_index: int = 0,
        source_path: str = "",
    ) -> SplitResult:
        objects = self.detect_objects(frame, frame_index)
        return SplitResult(
            source_path=source_path,
            frame_index=frame_index,
            frame_shape=tuple(frame.shape),  # type: ignore[arg-type]
            objects=objects,
        )

    # ── Video batch split ─────────────────────────────────────────────────────

    def split_video(
        self,
        video_path: str | Path,
        sample_every_n: int = 24,
        max_frames: int = 500,
    ) -> list[SplitResult]:
        video_path = Path(video_path)
        if not _CV2_AVAILABLE:
            logger.warning("cv2 unavailable — returning stub split for %s", video_path)
            stub_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
            return [self.split_frame(stub_frame, source_path=str(video_path))]

        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise FileNotFoundError(f"Cannot open video: {video_path}")

        results: list[SplitResult] = []
        frame_idx = 0
        collected = 0

        while collected < max_frames:
            ok, frame = cap.read()
            if not ok:
                break
            if frame_idx % sample_every_n == 0:
                results.append(self.split_frame(frame, frame_index=frame_idx, source_path=str(video_path)))
                collected += 1
            frame_idx += 1

        cap.release()
        logger.info("%s — %d frames sampled, %d results", video_path.name, frame_idx, len(results))
        return results

    # ── Persistence ───────────────────────────────────────────────────────────

    @staticmethod
    def save_results(results: list[SplitResult], path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"results": [r.to_dict() for r in results]}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Saved %d split results → %s", len(results), path)

    @staticmethod
    def save_crops(crops: list[AssetCrop], output_dir: str | Path) -> list[Path]:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        saved: list[Path] = []
        if not _CV2_AVAILABLE:
            logger.warning("cv2 unavailable — crops not saved to disk")
            return saved
        for i, ac in enumerate(crops):
            fname = output_dir / f"{ac.object_bound.instance_id}_{ac.object_bound.frame_index:06d}.png"
            cv2.imwrite(str(fname), ac.crop)
            saved.append(fname)
            if ac.mask is not None:
                mfname = output_dir / f"{ac.object_bound.instance_id}_{ac.object_bound.frame_index:06d}_mask.png"
                cv2.imwrite(str(mfname), ac.mask)
        return saved
