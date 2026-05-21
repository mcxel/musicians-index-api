"""
environment_piece_extractor.py
Segments video frames into layered environment pieces: skybox, background,
midground, floor, and structural elements. Outputs layer masks, piece metadata,
and an environment asset map. No UI, no routes.
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
    logger.warning("opencv-python not installed — environment segmentation disabled")


# ─── Layer Taxonomy ───────────────────────────────────────────────────────────

class EnvironmentLayer(str, Enum):
    SKYBOX          = "skybox"          # distant sky, ceiling lights, stage wash
    BACKGROUND      = "background"      # far wall, backdrop, LED screen
    MIDGROUND       = "midground"       # stage elements, speaker stacks, risers
    FLOOR           = "floor"           # stage floor, carpet, reflective surface
    STRUCTURAL      = "structural"      # walls, columns, beams
    LIGHTING        = "lighting"        # visible light sources, gobos, spotlights
    SIGNAGE         = "signage"         # banners, billboards, screens
    CROWD           = "crowd"           # audience layer
    FOREGROUND      = "foreground"      # elements in front of performers
    UNKNOWN         = "unknown"


class SurfaceType(str, Enum):
    SOLID_COLOR     = "solid_color"
    GRADIENT        = "gradient"
    TEXTURED        = "textured"
    REFLECTIVE      = "reflective"
    TRANSPARENT     = "transparent"
    LED_SCREEN      = "led_screen"
    PROJECTED       = "projected"
    UNKNOWN         = "unknown"


# ─── Data Structures ─────────────────────────────────────────────────────────

@dataclass
class DominantColorSwatch:
    r: int
    g: int
    b: int
    proportion: float

    @property
    def hex(self) -> str:
        return f"#{self.r:02X}{self.g:02X}{self.b:02X}"

    def to_dict(self) -> dict:
        return {"r": self.r, "g": self.g, "b": self.b, "proportion": round(self.proportion, 4), "hex": self.hex}


@dataclass
class ScenePiece:
    piece_id: str
    layer: EnvironmentLayer
    surface_type: SurfaceType
    x: int
    y: int
    w: int
    h: int
    mask_rle: Optional[str] = None           # run-length encoded binary mask
    color_swatches: list[DominantColorSwatch] = field(default_factory=list)
    luminance_mean: float = 0.0
    luminance_std: float = 0.0
    saturation_mean: float = 0.0
    motion_score: float = 0.0               # 0 = static, 1 = highly dynamic
    tags: list[str] = field(default_factory=list)

    @property
    def area(self) -> int:
        return self.w * self.h

    def to_dict(self) -> dict:
        d = asdict(self)
        d["layer"]        = self.layer.value
        d["surface_type"] = self.surface_type.value
        d["color_swatches"] = [s.to_dict() for s in self.color_swatches]
        return d


@dataclass
class EnvironmentMap:
    source_path: str
    frame_index: int
    frame_shape: tuple[int, int, int]
    pieces: list[ScenePiece]
    has_skybox: bool = False
    has_led_screen: bool = False
    dominant_hue: float = 0.0              # 0–360 HSV hue
    overall_brightness: float = 0.0       # 0–1
    layer_coverage: dict[str, float] = field(default_factory=dict)

    def __post_init__(self):
        if not self.layer_coverage:
            total = self.frame_shape[0] * self.frame_shape[1]
            for piece in self.pieces:
                lv = self.layer_coverage.get(piece.layer.value, 0.0)
                self.layer_coverage[piece.layer.value] = lv + (piece.area / total)

    def pieces_of_layer(self, layer: EnvironmentLayer) -> list[ScenePiece]:
        return [p for p in self.pieces if p.layer == layer]

    def to_dict(self) -> dict:
        return {
            "source_path": self.source_path,
            "frame_index": self.frame_index,
            "frame_shape": list(self.frame_shape),
            "has_skybox": self.has_skybox,
            "has_led_screen": self.has_led_screen,
            "dominant_hue": round(self.dominant_hue, 2),
            "overall_brightness": round(self.overall_brightness, 4),
            "layer_coverage": {k: round(v, 4) for k, v in self.layer_coverage.items()},
            "pieces": [p.to_dict() for p in self.pieces],
        }


# ─── RLE helpers ─────────────────────────────────────────────────────────────

def encode_mask_rle(mask: "np.ndarray") -> str:
    """Pack a binary uint8 mask to a hex-encoded RLE string."""
    flat  = mask.flatten()
    rle   = []
    val   = int(flat[0]) if len(flat) > 0 else 0
    count = 1
    for v in flat[1:]:
        if int(v) == val:
            count += 1
        else:
            rle.append(f"{val}x{count}")
            val, count = int(v), 1
    rle.append(f"{val}x{count}")
    return ",".join(rle)


def decode_mask_rle(rle_str: str, shape: tuple[int, int]) -> "np.ndarray":
    mask = []
    for token in rle_str.split(","):
        val_s, cnt_s = token.split("x")
        mask.extend([int(val_s)] * int(cnt_s))
    return np.array(mask, dtype=np.uint8).reshape(shape)


# ─── Analyzer helpers ─────────────────────────────────────────────────────────

def color_swatches_from_region(
    frame_region: "np.ndarray",
    n: int = 4,
) -> list[DominantColorSwatch]:
    if not _CV2_AVAILABLE or frame_region.size == 0:
        return [DominantColorSwatch(r=0, g=0, b=0, proportion=1.0)]

    small  = cv2.resize(frame_region, (48, 48))
    rgb    = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
    pixels = rgb.reshape(-1, 3).astype(np.float32)
    k      = min(n, len(pixels))

    _, labels, centers = cv2.kmeans(
        pixels, k, None,
        (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0),
        3, cv2.KMEANS_PP_CENTERS,
    )
    centers = centers.astype(int)
    counts  = np.bincount(labels.flatten(), minlength=k)
    total   = counts.sum()

    return [
        DominantColorSwatch(
            r=int(centers[i][0]),
            g=int(centers[i][1]),
            b=int(centers[i][2]),
            proportion=round(float(counts[i]) / total, 4),
        )
        for i in np.argsort(-counts)
    ]


def classify_surface(region: "np.ndarray") -> SurfaceType:
    if not _CV2_AVAILABLE or region.size == 0:
        return SurfaceType.UNKNOWN

    gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY) if region.ndim == 3 else region
    hsv  = cv2.cvtColor(region, cv2.COLOR_BGR2HSV) if region.ndim == 3 else None

    std  = float(gray.std())
    blur = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    if std < 8:
        return SurfaceType.SOLID_COLOR

    if hsv is not None:
        sat_mean = float(hsv[:, :, 1].mean())
        val_mean = float(hsv[:, :, 2].mean())
        if sat_mean > 140 and blur > 200:
            return SurfaceType.LED_SCREEN
        if val_mean > 200 and std < 25:
            return SurfaceType.REFLECTIVE

    if blur > 300 and std > 30:
        return SurfaceType.TEXTURED

    if std > 15:
        return SurfaceType.GRADIENT

    return SurfaceType.UNKNOWN


def measure_luminance(region: "np.ndarray") -> tuple[float, float]:
    if not _CV2_AVAILABLE or region.size == 0:
        return 0.0, 0.0
    gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY) if region.ndim == 3 else region
    return float(gray.mean()) / 255.0, float(gray.std()) / 255.0


def measure_saturation(region: "np.ndarray") -> float:
    if not _CV2_AVAILABLE or region.ndim != 3 or region.size == 0:
        return 0.0
    hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
    return float(hsv[:, :, 1].mean()) / 255.0


def detect_led_screen(region: "np.ndarray") -> bool:
    if not _CV2_AVAILABLE or region.size == 0:
        return False
    hsv     = cv2.cvtColor(region, cv2.COLOR_BGR2HSV) if region.ndim == 3 else None
    if hsv is None:
        return False
    sat     = float(hsv[:, :, 1].mean())
    val     = float(hsv[:, :, 2].mean())
    gray    = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
    blur    = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    return sat > 120 and val > 150 and blur > 150


# ─── Extractor ────────────────────────────────────────────────────────────────

class EnvironmentPieceExtractor:
    """
    Segments a frame into horizontal/semantic environment layers,
    extracts per-layer metadata, and optionally tracks motion across frames.

    Layer split is heuristic (horizon-band) by default. Upgrade path: swap
    in a semantic segmentation model (Mask2Former, SegFormer) for per-pixel
    accuracy when model weights are available.
    """

    # Vertical band boundaries as fractions of frame height
    HORIZON_BANDS: dict[EnvironmentLayer, tuple[float, float]] = {
        EnvironmentLayer.SKYBOX:     (0.00, 0.22),
        EnvironmentLayer.BACKGROUND: (0.22, 0.55),
        EnvironmentLayer.MIDGROUND:  (0.40, 0.70),
        EnvironmentLayer.FLOOR:      (0.68, 1.00),
    }

    def __init__(self, motion_history_frames: int = 20):
        self._motion_detector = self._init_motion_detector(motion_history_frames)
        self._piece_ctr = 0

    def _init_motion_detector(self, history: int):
        if not _CV2_AVAILABLE:
            return None
        return cv2.createBackgroundSubtractorMOG2(history=history, varThreshold=25, detectShadows=False)

    # ── Background isolation ──────────────────────────────────────────────────

    def segment_background(
        self,
        frame: "np.ndarray",
        person_masks: Optional[list["np.ndarray"]] = None,
    ) -> "np.ndarray":
        """
        Returns a binary mask of the background (excluding persons).
        If person_masks are supplied they are subtracted from the result.
        """
        if not _CV2_AVAILABLE:
            h, w = frame.shape[:2]
            mask = np.ones((h, w), dtype=np.uint8) * 255
            return mask

        h, w = frame.shape[:2]
        fg   = self._motion_detector.apply(frame) if self._motion_detector else np.zeros((h, w), dtype=np.uint8)
        bg   = cv2.bitwise_not(fg)

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        bg     = cv2.morphologyEx(bg, cv2.MORPH_CLOSE, kernel, iterations=2)

        if person_masks:
            for pm in person_masks:
                if pm.shape == bg.shape:
                    bg = cv2.bitwise_and(bg, cv2.bitwise_not(pm))

        return bg

    def extract_skybox(
        self,
        frame: "np.ndarray",
    ) -> Optional["np.ndarray"]:
        """Returns the sky/ceiling strip crop if detectable."""
        h, w  = frame.shape[:2]
        y_end = int(h * self.HORIZON_BANDS[EnvironmentLayer.SKYBOX][1])
        strip = frame[:y_end, :].copy()
        if strip.size == 0:
            return None
        lum_mean, _ = measure_luminance(strip)
        if lum_mean < 0.05:
            return None
        return strip

    # ── Band-based layer extraction ───────────────────────────────────────────

    def extract_scene_pieces(
        self,
        frame: "np.ndarray",
        frame_index: int = 0,
        source_path: str = "",
        motion_frame: Optional["np.ndarray"] = None,
    ) -> list[ScenePiece]:
        h, w = frame.shape[:2]
        pieces: list[ScenePiece] = []

        for layer, (y_start_frac, y_end_frac) in self.HORIZON_BANDS.items():
            y1 = int(h * y_start_frac)
            y2 = int(h * y_end_frac)
            region = frame[y1:y2, 0:w]
            if region.size == 0:
                continue

            surface      = classify_surface(region)
            swatches     = color_swatches_from_region(region)
            lum_m, lum_s = measure_luminance(region)
            sat          = measure_saturation(region)
            motion       = self._measure_motion(region, motion_frame[y1:y2, 0:w] if motion_frame is not None else None)
            is_led       = detect_led_screen(region)
            if is_led:
                surface = SurfaceType.LED_SCREEN

            mask = np.zeros((h, w), dtype=np.uint8)
            mask[y1:y2, 0:w] = 255
            rle  = encode_mask_rle(mask)

            tags: list[str] = [layer.value, surface.value]
            if is_led:
                tags.append("led_screen")
            if lum_m > 0.85:
                tags.append("bright")
            if lum_m < 0.10:
                tags.append("dark")
            if sat > 0.5:
                tags.append("saturated")

            pid = self._next_piece_id()
            pieces.append(ScenePiece(
                piece_id=pid,
                layer=layer,
                surface_type=surface,
                x=0, y=y1, w=w, h=(y2 - y1),
                mask_rle=rle,
                color_swatches=swatches,
                luminance_mean=round(lum_m, 4),
                luminance_std=round(lum_s, 4),
                saturation_mean=round(sat, 4),
                motion_score=round(motion, 4),
                tags=tags,
            ))

        pieces.extend(self._detect_signage(frame, frame_index))
        logger.debug("frame %d → %d scene piece(s)", frame_index, len(pieces))
        return pieces

    def _measure_motion(
        self,
        current: "np.ndarray",
        previous: Optional["np.ndarray"],
    ) -> float:
        if not _CV2_AVAILABLE or previous is None or current.shape != previous.shape:
            return 0.0
        diff = cv2.absdiff(current, previous)
        return float(diff.mean()) / 255.0

    def _detect_signage(
        self,
        frame: "np.ndarray",
        frame_index: int,
    ) -> list[ScenePiece]:
        """Detect high-contrast rectangular regions likely to be signs/banners."""
        if not _CV2_AVAILABLE:
            return []

        h, w = frame.shape[:2]
        gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        signs: list[ScenePiece] = []
        for cnt in contours:
            x, y, cw, ch = cv2.boundingRect(cnt)
            area   = cw * ch
            aspect = cw / (ch + 1e-8)
            if area < 8_000 or not (1.5 < aspect < 8.0):
                continue
            if y > h * 0.70:
                continue

            region   = frame[y:y+ch, x:x+cw]
            swatches = color_swatches_from_region(region, 3)
            lum_m, lum_s = measure_luminance(region)
            pid      = self._next_piece_id()

            signs.append(ScenePiece(
                piece_id=pid,
                layer=EnvironmentLayer.SIGNAGE,
                surface_type=SurfaceType.SOLID_COLOR,
                x=int(x), y=int(y), w=int(cw), h=int(ch),
                color_swatches=swatches,
                luminance_mean=round(lum_m, 4),
                luminance_std=round(lum_s, 4),
                tags=["signage", "detected"],
            ))

        return signs[:6]  # cap to avoid noise flood

    # ── Full environment map ──────────────────────────────────────────────────

    def build_environment_map(
        self,
        frame: "np.ndarray",
        frame_index: int = 0,
        source_path: str = "",
        prior_frame: Optional["np.ndarray"] = None,
    ) -> EnvironmentMap:
        h, w = frame.shape[:2]
        pieces = self.extract_scene_pieces(frame, frame_index, source_path, prior_frame)

        skybox_piece  = next((p for p in pieces if p.layer == EnvironmentLayer.SKYBOX), None)
        has_skybox    = skybox_piece is not None and skybox_piece.luminance_mean > 0.08
        has_led_screen = any("led_screen" in p.tags for p in pieces)

        # Overall frame stats
        if _CV2_AVAILABLE:
            gray      = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            hsv       = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            brightness = float(gray.mean()) / 255.0
            hue_hist   = cv2.calcHist([hsv], [0], None, [180], [0, 180])
            dominant_hue = float(np.argmax(hue_hist)) * 2.0  # scale to 0–360
        else:
            brightness   = 0.5
            dominant_hue = 0.0

        return EnvironmentMap(
            source_path=source_path,
            frame_index=frame_index,
            frame_shape=(h, w, frame.shape[2] if frame.ndim == 3 else 1),
            pieces=pieces,
            has_skybox=has_skybox,
            has_led_screen=has_led_screen,
            dominant_hue=round(dominant_hue, 2),
            overall_brightness=round(brightness, 4),
        )

    # ── Video batch extraction ────────────────────────────────────────────────

    def extract_video_environments(
        self,
        video_path: str | Path,
        sample_every_n: int = 48,
        max_frames: int = 200,
    ) -> list[EnvironmentMap]:
        video_path = Path(video_path)
        if not _CV2_AVAILABLE:
            stub_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
            return [self.build_environment_map(stub_frame, source_path=str(video_path))]

        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise FileNotFoundError(f"Cannot open video: {video_path}")

        maps: list[EnvironmentMap] = []
        prior_frame = None
        frame_idx   = 0
        collected   = 0

        while collected < max_frames:
            ok, frame = cap.read()
            if not ok:
                break
            if frame_idx % sample_every_n == 0:
                env_map = self.build_environment_map(
                    frame,
                    frame_index=frame_idx,
                    source_path=str(video_path),
                    prior_frame=prior_frame,
                )
                maps.append(env_map)
                prior_frame = frame.copy()
                collected  += 1
            frame_idx += 1

        cap.release()
        logger.info("%s — %d environment maps extracted", video_path.name, len(maps))
        return maps

    # ── Classification helpers ────────────────────────────────────────────────

    @staticmethod
    def classify_environment_layer(piece: ScenePiece) -> EnvironmentLayer:
        return piece.layer

    # ── Persistence ───────────────────────────────────────────────────────────

    @staticmethod
    def save_environment_maps(maps: list[EnvironmentMap], path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"environment_maps": [m.to_dict() for m in maps]}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Saved %d environment maps → %s", len(maps), path)

    @staticmethod
    def save_scene_pieces(pieces: list[ScenePiece], path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"scene_pieces": [p.to_dict() for p in pieces]}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Saved %d scene pieces → %s", len(pieces), path)

    def _next_piece_id(self) -> str:
        self._piece_ctr += 1
        return f"env_piece_{self._piece_ctr:06d}"
