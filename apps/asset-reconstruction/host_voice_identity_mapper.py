"""
host_voice_identity_mapper.py
Extracts voice segments, builds speaker embeddings, and maps audio identity
to known TMI hosts. Outputs segment metadata and embedding vectors.
No audio playback, no UI.
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
    import librosa
    _LIBROSA_AVAILABLE = True
except ImportError:
    _LIBROSA_AVAILABLE = False
    logger.warning("librosa not installed — voice feature extraction disabled")

try:
    import soundfile as sf
    _SF_AVAILABLE = True
except ImportError:
    _SF_AVAILABLE = False


# ─── Constants ────────────────────────────────────────────────────────────────

EMBEDDING_DIM     = 192
SAMPLE_RATE       = 16_000
FRAME_LENGTH      = 2048
HOP_LENGTH        = 512
N_MFCC            = 40
N_MELS            = 80
MIN_SEGMENT_S     = 0.5
SILENCE_THRESH_DB = -40.0


# ─── Data Structures ─────────────────────────────────────────────────────────

class VoiceGender(str, Enum):
    MALE   = "male"
    FEMALE = "female"
    UNKNOWN = "unknown"


class SpeechStyle(str, Enum):
    CONVERSATIONAL = "conversational"
    ANNOUNCING     = "announcing"
    RAPPING        = "rapping"
    SINGING        = "singing"
    CROWD_HYPE     = "crowd_hype"
    INTERVIEW      = "interview"
    UNKNOWN        = "unknown"


@dataclass
class VoiceFeatures:
    mfcc_mean: list[float]            # shape: (N_MFCC,)
    mfcc_std: list[float]             # shape: (N_MFCC,)
    pitch_mean: float
    pitch_std: float
    energy_mean: float
    speaking_rate: float              # syllables/sec estimate
    spectral_centroid_mean: float
    zcr_mean: float                   # zero-crossing rate


@dataclass
class VoiceSegment:
    source_path: str
    start_s: float
    end_s: float
    speaker_id: Optional[str] = None
    confidence: float = 0.0
    speech_style: SpeechStyle = SpeechStyle.UNKNOWN
    features: Optional[VoiceFeatures] = None
    embedding: Optional[list[float]] = None

    @property
    def duration_s(self) -> float:
        return max(0.0, self.end_s - self.start_s)

    @property
    def segment_id(self) -> str:
        raw = f"{self.source_path}:{self.start_s:.3f}:{self.end_s:.3f}"
        return hashlib.sha1(raw.encode()).hexdigest()[:10]

    def to_dict(self) -> dict:
        d = asdict(self)
        d["speech_style"] = self.speech_style.value
        return d


@dataclass
class VoiceProfile:
    host_id: str
    display_name: str
    gender: VoiceGender = VoiceGender.UNKNOWN
    embedding: list[float] = field(default_factory=list)
    sample_count: int = 0
    pitch_range_hz: tuple[float, float] = (80.0, 300.0)
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["gender"] = self.gender.value
        return d

    @classmethod
    def from_dict(cls, data: dict) -> "VoiceProfile":
        data = dict(data)
        data["gender"] = VoiceGender(data.get("gender", "unknown"))
        data["pitch_range_hz"] = tuple(data.get("pitch_range_hz", [80.0, 300.0]))
        return cls(**data)


@dataclass
class DiarizationResult:
    source_path: str
    total_duration_s: float
    segments: list[VoiceSegment]
    num_speakers: int

    @property
    def speakers(self) -> list[str]:
        return list({s.speaker_id for s in self.segments if s.speaker_id})


# ─── Feature Extraction ───────────────────────────────────────────────────────

def extract_voice_features(
    audio: "np.ndarray",
    sr: int = SAMPLE_RATE,
) -> VoiceFeatures:
    if not _LIBROSA_AVAILABLE:
        return _stub_features()

    mfcc        = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=N_MFCC, hop_length=HOP_LENGTH)
    centroid    = librosa.feature.spectral_centroid(y=audio, sr=sr, hop_length=HOP_LENGTH)
    zcr         = librosa.feature.zero_crossing_rate(y=audio, hop_length=HOP_LENGTH)
    rms         = librosa.feature.rms(y=audio, hop_length=HOP_LENGTH)

    try:
        f0, voiced_flag, _ = librosa.pyin(
            audio, fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"), sr=sr,
        )
        voiced_f0 = f0[voiced_flag] if f0 is not None else np.array([0.0])
        pitch_mean = float(np.nanmean(voiced_f0)) if len(voiced_f0) > 0 else 0.0
        pitch_std  = float(np.nanstd(voiced_f0))  if len(voiced_f0) > 0 else 0.0
    except Exception:
        pitch_mean, pitch_std = 0.0, 0.0

    voiced_frames   = int(np.sum(zcr[0] < 0.05))
    speaking_rate   = float(voiced_frames * HOP_LENGTH / sr) if sr > 0 else 0.0

    return VoiceFeatures(
        mfcc_mean=mfcc.mean(axis=1).tolist(),
        mfcc_std=mfcc.std(axis=1).tolist(),
        pitch_mean=round(pitch_mean, 3),
        pitch_std=round(pitch_std, 3),
        energy_mean=round(float(rms.mean()), 6),
        speaking_rate=round(speaking_rate, 3),
        spectral_centroid_mean=round(float(centroid.mean()), 3),
        zcr_mean=round(float(zcr.mean()), 6),
    )


def _stub_features() -> VoiceFeatures:
    return VoiceFeatures(
        mfcc_mean=[0.0] * N_MFCC,
        mfcc_std=[1.0] * N_MFCC,
        pitch_mean=145.0,
        pitch_std=22.0,
        energy_mean=0.05,
        speaking_rate=0.42,
        spectral_centroid_mean=1800.0,
        zcr_mean=0.08,
    )


def features_to_embedding(features: VoiceFeatures) -> np.ndarray:
    """
    Concatenates normalized voice features into a fixed-length embedding.
    Replace with a speaker encoder (e.g., SpeakerNet, ECAPA-TDNN) when
    model weights are available.
    """
    raw = np.array(
        features.mfcc_mean + features.mfcc_std + [
            features.pitch_mean / 500.0,
            features.pitch_std / 200.0,
            features.energy_mean * 100.0,
            features.speaking_rate,
            features.spectral_centroid_mean / 4000.0,
            features.zcr_mean * 10.0,
        ],
        dtype=np.float32,
    )
    # Pad or truncate to EMBEDDING_DIM
    if len(raw) < EMBEDDING_DIM:
        raw = np.pad(raw, (0, EMBEDDING_DIM - len(raw)))
    else:
        raw = raw[:EMBEDDING_DIM]
    norm = np.linalg.norm(raw)
    return raw / (norm + 1e-8)


# ─── Mapper ───────────────────────────────────────────────────────────────────

class HostVoiceIdentityMapper:
    """
    Loads audio, extracts voice segments via energy-based VAD,
    builds speaker embeddings, and matches against registered host profiles.
    """

    def __init__(
        self,
        sample_rate: int = SAMPLE_RATE,
        min_segment_s: float = MIN_SEGMENT_S,
        silence_thresh_db: float = SILENCE_THRESH_DB,
        match_threshold: float = 0.78,
    ):
        self.sample_rate       = sample_rate
        self.min_segment_s     = min_segment_s
        self.silence_thresh_db = silence_thresh_db
        self.match_threshold   = match_threshold
        self._profiles: dict[str, VoiceProfile] = {}

    # ── Audio loading ────────────────────────────────────────────────────────

    def load_audio(self, path: str | Path) -> tuple["np.ndarray", int]:
        path = Path(path)
        if not _LIBROSA_AVAILABLE:
            logger.warning("librosa unavailable — returning stub audio for %s", path)
            return np.zeros(SAMPLE_RATE * 5, dtype=np.float32), SAMPLE_RATE

        audio, sr = librosa.load(str(path), sr=self.sample_rate, mono=True)
        logger.info("Loaded %s (%.2fs @ %d Hz)", path.name, len(audio) / sr, sr)
        return audio, sr

    # ── VAD-based segmentation ────────────────────────────────────────────────

    def detect_speech_segments(
        self,
        audio: "np.ndarray",
        sr: int,
        source_path: str = "",
    ) -> list[VoiceSegment]:
        if not _LIBROSA_AVAILABLE:
            return [VoiceSegment(source_path=source_path, start_s=0.0, end_s=5.0)]

        rms     = librosa.feature.rms(y=audio, hop_length=HOP_LENGTH)[0]
        rms_db  = librosa.amplitude_to_db(rms, ref=np.max)
        is_voice = rms_db > self.silence_thresh_db

        segments: list[VoiceSegment] = []
        in_segment = False
        seg_start  = 0

        for i, voiced in enumerate(is_voice):
            t = i * HOP_LENGTH / sr
            if voiced and not in_segment:
                seg_start  = i
                in_segment = True
            elif not voiced and in_segment:
                start_s  = seg_start * HOP_LENGTH / sr
                end_s    = t
                if (end_s - start_s) >= self.min_segment_s:
                    segments.append(VoiceSegment(
                        source_path=source_path,
                        start_s=round(start_s, 4),
                        end_s=round(end_s, 4),
                    ))
                in_segment = False

        if in_segment:
            start_s = seg_start * HOP_LENGTH / sr
            end_s   = len(audio) / sr
            if (end_s - start_s) >= self.min_segment_s:
                segments.append(VoiceSegment(
                    source_path=source_path,
                    start_s=round(start_s, 4),
                    end_s=round(end_s, 4),
                ))

        logger.debug("%s — %d speech segments detected", source_path, len(segments))
        return segments

    # ── Segment embedding ─────────────────────────────────────────────────────

    def embed_segment(
        self,
        audio: "np.ndarray",
        sr: int,
        segment: VoiceSegment,
    ) -> np.ndarray:
        start_sample = int(segment.start_s * sr)
        end_sample   = int(segment.end_s * sr)
        clip         = audio[start_sample:end_sample]

        if len(clip) < sr * self.min_segment_s:
            return np.zeros(EMBEDDING_DIM, dtype=np.float32)

        features = extract_voice_features(clip, sr)
        segment.features = features
        return features_to_embedding(features)

    # ── Full file diarization ─────────────────────────────────────────────────

    def diarize(
        self,
        audio_path: str | Path,
    ) -> DiarizationResult:
        audio_path = Path(audio_path)
        audio, sr  = self.load_audio(audio_path)
        duration_s = len(audio) / sr

        segments = self.detect_speech_segments(audio, sr, str(audio_path))
        for seg in segments:
            emb         = self.embed_segment(audio, sr, seg)
            seg.embedding = emb.tolist()
            matched     = self.match_speaker(emb)
            if matched:
                seg.speaker_id  = matched[0]
                seg.confidence  = matched[1]

        unique_speakers = list({s.speaker_id for s in segments if s.speaker_id})
        result = DiarizationResult(
            source_path=str(audio_path),
            total_duration_s=round(duration_s, 3),
            segments=segments,
            num_speakers=len(unique_speakers),
        )
        logger.info(
            "%s — %.1fs, %d segments, %d speaker(s)",
            audio_path.name, duration_s, len(segments), len(unique_speakers),
        )
        return result

    # ── Host profile management ───────────────────────────────────────────────

    def register_host(
        self,
        host_id: str,
        display_name: str,
        embedding: "np.ndarray",
        gender: VoiceGender = VoiceGender.UNKNOWN,
        tags: Optional[list[str]] = None,
    ) -> VoiceProfile:
        if host_id in self._profiles:
            existing = self._profiles[host_id]
            old_emb  = np.array(existing.embedding, dtype=np.float32)
            n        = existing.sample_count
            merged   = ((old_emb * n) + embedding) / (n + 1)
            norm     = np.linalg.norm(merged)
            existing.embedding    = (merged / (norm + 1e-8)).tolist()
            existing.sample_count = n + 1
            if tags:
                existing.tags = list(set(existing.tags + tags))
            logger.info("Updated voice profile '%s' (samples: %d)", display_name, existing.sample_count)
            return existing

        profile = VoiceProfile(
            host_id=host_id,
            display_name=display_name,
            gender=gender,
            embedding=embedding.tolist(),
            sample_count=1,
            tags=tags or [],
        )
        self._profiles[host_id] = profile
        logger.info("Registered voice profile '%s'", display_name)
        return profile

    def register_host_from_file(
        self,
        host_id: str,
        display_name: str,
        audio_path: str | Path,
        gender: VoiceGender = VoiceGender.UNKNOWN,
    ) -> VoiceProfile:
        audio, sr = self.load_audio(audio_path)
        segments  = self.detect_speech_segments(audio, sr, str(audio_path))
        embeddings = [self.embed_segment(audio, sr, s) for s in segments if s.duration_s >= self.min_segment_s]
        if not embeddings:
            raise ValueError(f"No usable speech found in {audio_path}")
        mean_emb = np.mean(embeddings, axis=0).astype(np.float32)
        norm     = np.linalg.norm(mean_emb)
        mean_emb /= (norm + 1e-8)
        return self.register_host(host_id, display_name, mean_emb, gender)

    def match_speaker(
        self,
        embedding: "np.ndarray",
    ) -> Optional[tuple[str, float]]:
        if not self._profiles:
            return None
        best_id  = None
        best_sim = -1.0
        emb      = embedding / (np.linalg.norm(embedding) + 1e-8)
        for host_id, profile in self._profiles.items():
            lib_emb = np.array(profile.embedding, dtype=np.float32)
            sim     = float(np.dot(emb, lib_emb))
            if sim > best_sim:
                best_sim = sim
                best_id  = host_id
        if best_sim >= self.match_threshold:
            return (best_id, round(best_sim, 4))
        return None

    # ── Speech style classification ───────────────────────────────────────────

    @staticmethod
    def classify_speech_style(features: VoiceFeatures) -> SpeechStyle:
        if features.pitch_std > 60 and features.speaking_rate > 0.6:
            return SpeechStyle.RAPPING
        if features.pitch_std > 80 and features.energy_mean > 0.1:
            return SpeechStyle.SINGING
        if features.spectral_centroid_mean > 3000 and features.energy_mean > 0.12:
            return SpeechStyle.CROWD_HYPE
        if features.energy_mean > 0.08 and features.speaking_rate < 0.4:
            return SpeechStyle.ANNOUNCING
        if features.speaking_rate > 0.35:
            return SpeechStyle.CONVERSATIONAL
        return SpeechStyle.UNKNOWN

    # ── Persistence ───────────────────────────────────────────────────────────

    def save_profiles(self, path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {k: v.to_dict() for k, v in self._profiles.items()}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Saved %d voice profiles → %s", len(data), path)

    def load_profiles(self, path: str | Path) -> None:
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Voice profile library not found: {path}")
        data = json.loads(path.read_text())
        self._profiles = {k: VoiceProfile.from_dict(v) for k, v in data.items()}
        logger.info("Loaded %d voice profiles from %s", len(self._profiles), path)

    def save_diarization(self, result: DiarizationResult, path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "source_path": result.source_path,
            "total_duration_s": result.total_duration_s,
            "num_speakers": result.num_speakers,
            "segments": [s.to_dict() for s in result.segments],
        }
        path.write_text(json.dumps(data, indent=2))
