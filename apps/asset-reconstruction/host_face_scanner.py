"""
host_face_scanner.py
Scans source media for host faces, builds identity embeddings, and matches
known identities across frames. Outputs are raw face crops and embedding
vectors — no rendering, no UI.
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
    logger.warning("opencv-python not installed — live frame scanning disabled")


# ─── Data Structures ────────────────────────────────────────────────────────

class FaceQuality(str, Enum):
    HIGH    = "high"      # frontal, well-lit, ≥128px
    MEDIUM  = "medium"    # slight angle or lighting variation
    LOW     = "low"       # profile, motion-blurred, or small
    REJECT  = "reject"    # too degraded to use


@dataclass
class FaceLandmarks:
    left_eye:   tuple[float, float]
    right_eye:  tuple[float, float]
    nose_tip:   tuple[float, float]
    mouth_left: tuple[float, float]
    mouth_right: tuple[float, float]


@dataclass
class FaceRegion:
    x: int
    y: int
    w: int
    h: int
    confidence: float           # 0.0–1.0
    landmarks: Optional[FaceLandmarks] = None
    quality: FaceQuality = FaceQuality.MEDIUM
    frame_index: int = 0

    @property
    def area(self) -> int:
        return self.w * self.h

    @property
    def center(self) -> tuple[int, int]:
        return (self.x + self.w // 2, self.y + self.h // 2)

    def to_slice(self) -> tuple[slice, slice]:
        return (slice(self.y, self.y + self.h), slice(self.x, self.x + self.w))


@dataclass
class HostFaceScan:
    source_path: str
    frame_count: int
    sampled_frames: int
    faces: list[FaceRegion]
    host_id: Optional[str] = None
    embedding: Optional[list[float]] = None  # flattened np.ndarray
    scan_hash: str = ""

    def __post_init__(self):
        if not self.scan_hash:
            raw = f"{self.source_path}:{self.frame_count}:{len(self.faces)}"
            self.scan_hash = hashlib.sha1(raw.encode()).hexdigest()[:12]

    @property
    def best_face(self) -> Optional[FaceRegion]:
        high = [f for f in self.faces if f.quality == FaceQuality.HIGH]
        pool = high or self.faces
        return max(pool, key=lambda f: f.area * f.confidence) if pool else None

    def to_dict(self) -> dict:
        d = asdict(self)
        d["faces"] = [asdict(f) for f in self.faces]
        return d


@dataclass
class FaceIdentityRecord:
    host_id: str
    display_name: str
    embedding: list[float]
    sample_count: int = 1
    tags: list[str] = field(default_factory=list)


# ─── Scanner ────────────────────────────────────────────────────────────────

class HostFaceScanner:
    """
    Extracts face regions from video frames or still images.
    Builds and matches 128-d identity embeddings against a registered library.
    """

    MIN_FACE_PX        = 64       # reject faces smaller than this
    CONFIDENCE_THRESH  = 0.72
    SAMPLE_INTERVAL_S  = 1.0      # sample one frame per second
    EMBEDDING_DIM      = 128

    def __init__(
        self,
        min_face_px: int = MIN_FACE_PX,
        confidence_thresh: float = CONFIDENCE_THRESH,
        sample_interval_s: float = SAMPLE_INTERVAL_S,
    ):
        self.min_face_px        = min_face_px
        self.confidence_thresh  = confidence_thresh
        self.sample_interval_s  = sample_interval_s
        self._identity_library: dict[str, FaceIdentityRecord] = {}
        self._detector = self._init_detector()

    # ── Detector bootstrap ──────────────────────────────────────────────────

    def _init_detector(self):
        if not _CV2_AVAILABLE:
            return None
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        detector = cv2.CascadeClassifier(cascade_path)
        if detector.empty():
            logger.error("Failed to load Haar cascade — check opencv-python data files")
            return None
        return detector

    # ── Single-frame scanning ────────────────────────────────────────────────

    def scan_frame(
        self,
        frame: "np.ndarray",
        frame_index: int = 0,
    ) -> list[FaceRegion]:
        if not _CV2_AVAILABLE or self._detector is None:
            return self._stub_scan(frame_index)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if frame.ndim == 3 else frame
        raw = self._detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(self.min_face_px, self.min_face_px),
        )

        regions: list[FaceRegion] = []
        for (x, y, w, h) in (raw if len(raw) else []):
            conf = self._estimate_confidence(gray[y:y+h, x:x+w])
            if conf < self.confidence_thresh:
                continue
            quality = self._assess_quality(w, h, conf)
            regions.append(FaceRegion(
                x=int(x), y=int(y), w=int(w), h=int(h),
                confidence=round(conf, 4),
                quality=quality,
                frame_index=frame_index,
            ))

        logger.debug("frame %d → %d face(s)", frame_index, len(regions))
        return regions

    def _estimate_confidence(self, face_gray: "np.ndarray") -> float:
        if face_gray.size == 0:
            return 0.0
        blur = cv2.Laplacian(face_gray, cv2.CV_64F).var()
        contrast = float(face_gray.std()) / 128.0
        sharpness = min(1.0, blur / 500.0)
        return float(np.clip(0.5 * sharpness + 0.5 * contrast, 0.0, 1.0))

    def _assess_quality(self, w: int, h: int, conf: float) -> FaceQuality:
        size = min(w, h)
        if size >= 128 and conf >= 0.85:
            return FaceQuality.HIGH
        if size >= 64 and conf >= 0.72:
            return FaceQuality.MEDIUM
        if size >= 32:
            return FaceQuality.LOW
        return FaceQuality.REJECT

    def _stub_scan(self, frame_index: int) -> list[FaceRegion]:
        return [FaceRegion(
            x=100, y=80, w=160, h=160,
            confidence=0.90,
            quality=FaceQuality.HIGH,
            frame_index=frame_index,
        )]

    # ── Video scanning ───────────────────────────────────────────────────────

    def scan_video(
        self,
        video_path: str | Path,
        max_frames: int = 300,
    ) -> HostFaceScan:
        video_path = Path(video_path)
        if not _CV2_AVAILABLE:
            logger.warning("cv2 not available — returning stub scan for %s", video_path)
            return HostFaceScan(
                source_path=str(video_path),
                frame_count=0,
                sampled_frames=0,
                faces=self._stub_scan(0),
            )

        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise FileNotFoundError(f"Cannot open video: {video_path}")

        fps          = cap.get(cv2.CAP_PROP_FPS) or 24.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        step         = max(1, int(fps * self.sample_interval_s))
        all_faces: list[FaceRegion] = []
        sampled = 0

        for frame_idx in range(0, min(total_frames, max_frames * step), step):
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ok, frame = cap.read()
            if not ok:
                break
            faces = self.scan_frame(frame, frame_index=frame_idx)
            all_faces.extend(faces)
            sampled += 1

        cap.release()
        logger.info("%s — %d frames sampled, %d faces found", video_path.name, sampled, len(all_faces))

        return HostFaceScan(
            source_path=str(video_path),
            frame_count=total_frames,
            sampled_frames=sampled,
            faces=all_faces,
        )

    def scan_image(self, image_path: str | Path) -> HostFaceScan:
        image_path = Path(image_path)
        if not _CV2_AVAILABLE:
            return HostFaceScan(
                source_path=str(image_path),
                frame_count=1,
                sampled_frames=1,
                faces=self._stub_scan(0),
            )
        frame = cv2.imread(str(image_path))
        if frame is None:
            raise FileNotFoundError(f"Cannot read image: {image_path}")
        faces = self.scan_frame(frame, frame_index=0)
        return HostFaceScan(
            source_path=str(image_path),
            frame_count=1,
            sampled_frames=1,
            faces=faces,
        )

    # ── Face crop extraction ─────────────────────────────────────────────────

    def extract_face_crops(
        self,
        frame: "np.ndarray",
        regions: list[FaceRegion],
        padding: float = 0.20,
    ) -> list["np.ndarray"]:
        crops = []
        h_max, w_max = frame.shape[:2]
        for r in regions:
            pad_x = int(r.w * padding)
            pad_y = int(r.h * padding)
            x1 = max(0, r.x - pad_x)
            y1 = max(0, r.y - pad_y)
            x2 = min(w_max, r.x + r.w + pad_x)
            y2 = min(h_max, r.y + r.h + pad_y)
            crops.append(frame[y1:y2, x1:x2].copy())
        return crops

    # ── Identity embedding ────────────────────────────────────────────────────

    def build_identity_embedding(
        self,
        face_crops: list["np.ndarray"],
        target_size: tuple[int, int] = (64, 64),
    ) -> "np.ndarray":
        """
        Builds a simple mean-pooled pixel embedding from face crops.
        Replace this with a proper face-recognition model (FaceNet, ArcFace)
        when model weights are available.
        """
        if not face_crops:
            return np.zeros(self.EMBEDDING_DIM, dtype=np.float32)

        vectors = []
        for crop in face_crops:
            if not _CV2_AVAILABLE:
                vectors.append(np.random.rand(self.EMBEDDING_DIM).astype(np.float32))
                continue
            resized = cv2.resize(crop, target_size)
            gray    = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY) if resized.ndim == 3 else resized
            flat    = gray.flatten().astype(np.float32) / 255.0
            # Project to EMBEDDING_DIM via stride sampling
            stride  = max(1, len(flat) // self.EMBEDDING_DIM)
            sampled = flat[::stride][:self.EMBEDDING_DIM]
            if len(sampled) < self.EMBEDDING_DIM:
                sampled = np.pad(sampled, (0, self.EMBEDDING_DIM - len(sampled)))
            norm = np.linalg.norm(sampled)
            vectors.append(sampled / (norm + 1e-8))

        embedding = np.mean(vectors, axis=0).astype(np.float32)
        norm = np.linalg.norm(embedding)
        return embedding / (norm + 1e-8)

    # ── Identity library ──────────────────────────────────────────────────────

    def register_host(
        self,
        host_id: str,
        display_name: str,
        embedding: "np.ndarray",
        tags: Optional[list[str]] = None,
    ) -> FaceIdentityRecord:
        record = FaceIdentityRecord(
            host_id=host_id,
            display_name=display_name,
            embedding=embedding.tolist(),
            tags=tags or [],
        )
        if host_id in self._identity_library:
            existing = self._identity_library[host_id]
            old_emb  = np.array(existing.embedding, dtype=np.float32)
            n        = existing.sample_count
            merged   = ((old_emb * n) + embedding) / (n + 1)
            norm     = np.linalg.norm(merged)
            record.embedding     = (merged / (norm + 1e-8)).tolist()
            record.sample_count  = n + 1
            record.tags          = list(set(existing.tags + (tags or [])))

        self._identity_library[host_id] = record
        logger.info("Registered host '%s' (samples: %d)", display_name, record.sample_count)
        return record

    def match_identity(
        self,
        embedding: "np.ndarray",
        threshold: float = 0.82,
    ) -> Optional[str]:
        if not self._identity_library:
            return None
        best_host: Optional[str] = None
        best_sim = -1.0
        emb = embedding / (np.linalg.norm(embedding) + 1e-8)
        for host_id, record in self._identity_library.items():
            lib_emb = np.array(record.embedding, dtype=np.float32)
            sim     = float(np.dot(emb, lib_emb))
            if sim > best_sim:
                best_sim  = sim
                best_host = host_id
        if best_sim >= threshold:
            logger.debug("Matched host '%s' (cosine: %.4f)", best_host, best_sim)
            return best_host
        logger.debug("No match above threshold %.2f (best: %.4f)", threshold, best_sim)
        return None

    # ── Persistence ───────────────────────────────────────────────────────────

    def save_library(self, path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {k: asdict(v) for k, v in self._identity_library.items()}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Saved %d host identities → %s", len(data), path)

    def load_library(self, path: str | Path) -> None:
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Identity library not found: {path}")
        data = json.loads(path.read_text())
        self._identity_library = {k: FaceIdentityRecord(**v) for k, v in data.items()}
        logger.info("Loaded %d host identities from %s", len(self._identity_library), path)

    # ── Scan result serialization ─────────────────────────────────────────────

    @staticmethod
    def save_scan(scan: HostFaceScan, path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(scan.to_dict(), indent=2))

    @staticmethod
    def load_scan(path: str | Path) -> HostFaceScan:
        data = json.loads(Path(path).read_text())
        faces = [FaceRegion(**f) for f in data.pop("faces", [])]
        return HostFaceScan(**data, faces=faces)
