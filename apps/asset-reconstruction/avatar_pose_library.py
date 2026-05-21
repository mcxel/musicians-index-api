"""
avatar_pose_library.py
Defines, stores, and matches skeletal pose configurations for avatars.
Poses are keypoint trees — no rendering, no animation playback.
"""

from __future__ import annotations

import json
import logging
import math
from dataclasses import dataclass, field, asdict
from enum import Enum
from pathlib import Path
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)


# ─── Joint Topology ──────────────────────────────────────────────────────────

class Joint(str, Enum):
    # Head
    NOSE        = "nose"
    LEFT_EYE    = "left_eye"
    RIGHT_EYE   = "right_eye"
    LEFT_EAR    = "left_ear"
    RIGHT_EAR   = "right_ear"
    # Torso
    NECK        = "neck"
    LEFT_SHOULDER  = "left_shoulder"
    RIGHT_SHOULDER = "right_shoulder"
    LEFT_HIP    = "left_hip"
    RIGHT_HIP   = "right_hip"
    SPINE_MID   = "spine_mid"
    # Arms
    LEFT_ELBOW  = "left_elbow"
    RIGHT_ELBOW = "right_elbow"
    LEFT_WRIST  = "left_wrist"
    RIGHT_WRIST = "right_wrist"
    # Hands
    LEFT_PINKY  = "left_pinky"
    RIGHT_PINKY = "right_pinky"
    LEFT_INDEX  = "left_index"
    RIGHT_INDEX = "right_index"
    LEFT_THUMB  = "left_thumb"
    RIGHT_THUMB = "right_thumb"
    # Legs
    LEFT_KNEE   = "left_knee"
    RIGHT_KNEE  = "right_knee"
    LEFT_ANKLE  = "left_ankle"
    RIGHT_ANKLE = "right_ankle"
    # Feet
    LEFT_HEEL   = "left_heel"
    RIGHT_HEEL  = "right_heel"
    LEFT_FOOT_INDEX  = "left_foot_index"
    RIGHT_FOOT_INDEX = "right_foot_index"


BONE_PAIRS: list[tuple[Joint, Joint]] = [
    (Joint.NOSE, Joint.NECK),
    (Joint.NECK, Joint.LEFT_SHOULDER),
    (Joint.NECK, Joint.RIGHT_SHOULDER),
    (Joint.LEFT_SHOULDER, Joint.LEFT_ELBOW),
    (Joint.LEFT_ELBOW, Joint.LEFT_WRIST),
    (Joint.RIGHT_SHOULDER, Joint.RIGHT_ELBOW),
    (Joint.RIGHT_ELBOW, Joint.RIGHT_WRIST),
    (Joint.LEFT_SHOULDER, Joint.LEFT_HIP),
    (Joint.RIGHT_SHOULDER, Joint.RIGHT_HIP),
    (Joint.LEFT_HIP, Joint.RIGHT_HIP),
    (Joint.LEFT_HIP, Joint.LEFT_KNEE),
    (Joint.LEFT_KNEE, Joint.LEFT_ANKLE),
    (Joint.RIGHT_HIP, Joint.RIGHT_KNEE),
    (Joint.RIGHT_KNEE, Joint.RIGHT_ANKLE),
]


class PoseCategory(str, Enum):
    IDLE        = "idle"
    STANDING    = "standing"
    SITTING     = "sitting"
    WALKING     = "walking"
    DANCING     = "dancing"
    PERFORMING  = "performing"
    GESTURING   = "gesturing"
    CROWD_HYPE  = "crowd_hype"
    BATTLE_STANCE = "battle_stance"
    VICTORY     = "victory"
    DEFEAT      = "defeat"
    CUSTOM      = "custom"


# ─── Data Structures ─────────────────────────────────────────────────────────

@dataclass
class Keypoint:
    joint: str                  # Joint enum value
    x: float                    # normalized 0–1
    y: float                    # normalized 0–1
    z: float = 0.0              # depth, normalized
    visibility: float = 1.0    # 0–1

    @property
    def vec3(self) -> np.ndarray:
        return np.array([self.x, self.y, self.z], dtype=np.float32)


@dataclass
class AvatarPose:
    pose_id: str
    name: str
    category: PoseCategory
    keypoints: list[Keypoint]
    description: str = ""
    tags: list[str] = field(default_factory=list)
    source_frame: Optional[str] = None  # origin video/image reference

    def get_keypoint(self, joint: Joint) -> Optional[Keypoint]:
        for kp in self.keypoints:
            if kp.joint == joint.value:
                return kp
        return None

    def to_vector(self) -> np.ndarray:
        vec = []
        for kp in self.keypoints:
            vec.extend([kp.x, kp.y, kp.z, kp.visibility])
        return np.array(vec, dtype=np.float32)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["category"] = self.category.value
        return d

    @classmethod
    def from_dict(cls, data: dict) -> "AvatarPose":
        data = dict(data)
        data["category"] = PoseCategory(data["category"])
        data["keypoints"] = [Keypoint(**kp) for kp in data["keypoints"]]
        return cls(**data)


@dataclass
class PoseMatchResult:
    pose: AvatarPose
    similarity: float       # 0–1 cosine similarity
    joint_errors: dict[str, float] = field(default_factory=dict)


# ─── Pose normalization ──────────────────────────────────────────────────────

def normalize_pose_to_hip_center(pose: AvatarPose) -> AvatarPose:
    """Translate all keypoints so the hip midpoint is at the origin."""
    left_hip  = pose.get_keypoint(Joint.LEFT_HIP)
    right_hip = pose.get_keypoint(Joint.RIGHT_HIP)
    if not left_hip or not right_hip:
        return pose

    cx = (left_hip.x + right_hip.x) / 2.0
    cy = (left_hip.y + right_hip.y) / 2.0

    new_kps = [
        Keypoint(joint=kp.joint, x=kp.x - cx, y=kp.y - cy, z=kp.z, visibility=kp.visibility)
        for kp in pose.keypoints
    ]
    return AvatarPose(
        pose_id=pose.pose_id,
        name=pose.name,
        category=pose.category,
        keypoints=new_kps,
        description=pose.description,
        tags=pose.tags,
        source_frame=pose.source_frame,
    )


def scale_pose_by_torso_height(pose: AvatarPose) -> AvatarPose:
    """Scale keypoints so torso height (neck→hip midpoint) = 1.0."""
    neck     = pose.get_keypoint(Joint.NECK)
    left_hip = pose.get_keypoint(Joint.LEFT_HIP)
    right_hip = pose.get_keypoint(Joint.RIGHT_HIP)
    if not neck or not left_hip or not right_hip:
        return pose

    hip_cy  = (left_hip.y + right_hip.y) / 2.0
    torso_h = abs(neck.y - hip_cy)
    if torso_h < 1e-6:
        return pose

    new_kps = [
        Keypoint(joint=kp.joint, x=kp.x / torso_h, y=kp.y / torso_h, z=kp.z / torso_h, visibility=kp.visibility)
        for kp in pose.keypoints
    ]
    return AvatarPose(
        pose_id=pose.pose_id,
        name=pose.name,
        category=pose.category,
        keypoints=new_kps,
        description=pose.description,
        tags=pose.tags,
        source_frame=pose.source_frame,
    )


# ─── Library ─────────────────────────────────────────────────────────────────

class AvatarPoseLibrary:
    """
    Registry for named avatar poses.
    Supports CRUD, cosine-similarity matching, and JSON persistence.
    """

    def __init__(self, auto_normalize: bool = True):
        self._poses: dict[str, AvatarPose] = {}
        self.auto_normalize = auto_normalize
        self._seed_canonical_poses()

    # ── Registration ─────────────────────────────────────────────────────────

    def register(self, pose: AvatarPose) -> None:
        if self.auto_normalize:
            pose = normalize_pose_to_hip_center(pose)
            pose = scale_pose_by_torso_height(pose)
        self._poses[pose.pose_id] = pose
        logger.debug("Registered pose '%s' [%s]", pose.name, pose.category.value)

    def unregister(self, pose_id: str) -> None:
        self._poses.pop(pose_id, None)

    def get(self, pose_id: str) -> Optional[AvatarPose]:
        return self._poses.get(pose_id)

    def by_category(self, category: PoseCategory) -> list[AvatarPose]:
        return [p for p in self._poses.values() if p.category == category]

    def all_poses(self) -> list[AvatarPose]:
        return list(self._poses.values())

    # ── Matching ─────────────────────────────────────────────────────────────

    def match(
        self,
        keypoints: list[Keypoint],
        category_filter: Optional[PoseCategory] = None,
        top_k: int = 3,
    ) -> list[PoseMatchResult]:
        query_pose = AvatarPose(
            pose_id="_query",
            name="query",
            category=PoseCategory.CUSTOM,
            keypoints=keypoints,
        )
        if self.auto_normalize:
            query_pose = normalize_pose_to_hip_center(query_pose)
            query_pose = scale_pose_by_torso_height(query_pose)

        query_vec = query_pose.to_vector()
        q_norm    = np.linalg.norm(query_vec)
        if q_norm < 1e-8:
            return []

        candidates = self._poses.values()
        if category_filter:
            candidates = [p for p in candidates if p.category == category_filter]  # type: ignore[assignment]

        results: list[PoseMatchResult] = []
        for pose in candidates:
            lib_vec  = pose.to_vector()
            min_len  = min(len(query_vec), len(lib_vec))
            sim      = float(np.dot(query_vec[:min_len], lib_vec[:min_len]) / (q_norm * np.linalg.norm(lib_vec[:min_len]) + 1e-8))
            j_errors = self._per_joint_error(query_pose, pose)
            results.append(PoseMatchResult(pose=pose, similarity=sim, joint_errors=j_errors))

        results.sort(key=lambda r: r.similarity, reverse=True)
        return results[:top_k]

    def _per_joint_error(
        self, query: AvatarPose, candidate: AvatarPose
    ) -> dict[str, float]:
        errors: dict[str, float] = {}
        for kp in query.keypoints:
            lib_kp = candidate.get_keypoint(Joint(kp.joint)) if kp.joint in Joint._value2member_map_ else None
            if lib_kp:
                dist = math.sqrt((kp.x - lib_kp.x) ** 2 + (kp.y - lib_kp.y) ** 2 + (kp.z - lib_kp.z) ** 2)
                errors[kp.joint] = round(dist, 5)
        return errors

    # ── Interpolation ─────────────────────────────────────────────────────────

    @staticmethod
    def interpolate(pose_a: AvatarPose, pose_b: AvatarPose, t: float) -> AvatarPose:
        """Linear interpolation between two poses at parameter t ∈ [0, 1]."""
        t = float(np.clip(t, 0.0, 1.0))
        joint_map_a = {kp.joint: kp for kp in pose_a.keypoints}
        joint_map_b = {kp.joint: kp for kp in pose_b.keypoints}
        shared = set(joint_map_a) & set(joint_map_b)

        new_kps: list[Keypoint] = []
        for joint in shared:
            a, b = joint_map_a[joint], joint_map_b[joint]
            new_kps.append(Keypoint(
                joint=joint,
                x=a.x + t * (b.x - a.x),
                y=a.y + t * (b.y - a.y),
                z=a.z + t * (b.z - a.z),
                visibility=a.visibility + t * (b.visibility - a.visibility),
            ))

        return AvatarPose(
            pose_id=f"{pose_a.pose_id}_{pose_b.pose_id}_t{t:.2f}",
            name=f"{pose_a.name} → {pose_b.name} ({t:.0%})",
            category=pose_a.category,
            keypoints=new_kps,
        )

    # ── Persistence ───────────────────────────────────────────────────────────

    def export(self, path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"poses": [p.to_dict() for p in self._poses.values()]}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Exported %d poses → %s", len(self._poses), path)

    def import_from(self, path: str | Path) -> int:
        data   = json.loads(Path(path).read_text())
        loaded = 0
        for raw in data.get("poses", []):
            pose = AvatarPose.from_dict(raw)
            self._poses[pose.pose_id] = pose
            loaded += 1
        logger.info("Imported %d poses from %s", loaded, path)
        return loaded

    # ── Canonical seed poses ──────────────────────────────────────────────────

    def _seed_canonical_poses(self) -> None:
        t_pose_kps = [
            Keypoint(Joint.NECK.value,           0.50, 0.25),
            Keypoint(Joint.LEFT_SHOULDER.value,  0.30, 0.30),
            Keypoint(Joint.RIGHT_SHOULDER.value, 0.70, 0.30),
            Keypoint(Joint.LEFT_ELBOW.value,     0.10, 0.30),
            Keypoint(Joint.RIGHT_ELBOW.value,    0.90, 0.30),
            Keypoint(Joint.LEFT_WRIST.value,     0.00, 0.30),
            Keypoint(Joint.RIGHT_WRIST.value,    1.00, 0.30),
            Keypoint(Joint.LEFT_HIP.value,       0.45, 0.55),
            Keypoint(Joint.RIGHT_HIP.value,      0.55, 0.55),
            Keypoint(Joint.LEFT_KNEE.value,      0.45, 0.75),
            Keypoint(Joint.RIGHT_KNEE.value,     0.55, 0.75),
            Keypoint(Joint.LEFT_ANKLE.value,     0.45, 0.95),
            Keypoint(Joint.RIGHT_ANKLE.value,    0.55, 0.95),
        ]
        self.register(AvatarPose(
            pose_id="canonical_t_pose",
            name="T-Pose",
            category=PoseCategory.IDLE,
            keypoints=t_pose_kps,
            description="Standard T-pose reference",
            tags=["canonical", "reference"],
        ))

        idle_kps = [
            Keypoint(Joint.NECK.value,           0.50, 0.22),
            Keypoint(Joint.LEFT_SHOULDER.value,  0.36, 0.30),
            Keypoint(Joint.RIGHT_SHOULDER.value, 0.64, 0.30),
            Keypoint(Joint.LEFT_ELBOW.value,     0.30, 0.45),
            Keypoint(Joint.RIGHT_ELBOW.value,    0.70, 0.45),
            Keypoint(Joint.LEFT_WRIST.value,     0.32, 0.60),
            Keypoint(Joint.RIGHT_WRIST.value,    0.68, 0.60),
            Keypoint(Joint.LEFT_HIP.value,       0.44, 0.58),
            Keypoint(Joint.RIGHT_HIP.value,      0.56, 0.58),
            Keypoint(Joint.LEFT_KNEE.value,      0.43, 0.76),
            Keypoint(Joint.RIGHT_KNEE.value,     0.57, 0.76),
            Keypoint(Joint.LEFT_ANKLE.value,     0.44, 0.94),
            Keypoint(Joint.RIGHT_ANKLE.value,    0.56, 0.94),
        ]
        self.register(AvatarPose(
            pose_id="canonical_idle_stand",
            name="Idle Stand",
            category=PoseCategory.IDLE,
            keypoints=idle_kps,
            description="Relaxed standing idle",
            tags=["canonical", "idle", "standing"],
        ))
