"""
TMI Asset Intelligence — apps/asset-reconstruction
Reconstruction pipeline for hosts, avatars, performers, props,
clothing, and environment objects.
"""

from .host_face_scanner import (
    HostFaceScanner,
    HostFaceScan,
    FaceRegion,
    FaceIdentityRecord,
    FaceQuality,
)
from .avatar_pose_library import (
    AvatarPoseLibrary,
    AvatarPose,
    Keypoint,
    PoseCategory,
    Joint,
    normalize_pose_to_hip_center,
    scale_pose_by_torso_height,
)
from .avatar_expression_library import (
    AvatarExpressionLibrary,
    AvatarExpression,
    AUWeight,
    ExpressionType,
    ActionUnit,
    blend_expressions,
    additive_blend,
)
from .host_voice_identity_mapper import (
    HostVoiceIdentityMapper,
    VoiceProfile,
    VoiceSegment,
    DiarizationResult,
    VoiceGender,
    SpeechStyle,
    extract_voice_features,
    features_to_embedding,
)
from .object_asset_splitter import (
    ObjectAssetSplitter,
    ObjectBound,
    SplitResult,
    AssetCrop,
    AssetType,
    BoundingBox,
)
from .wardrobe_extractor import (
    WardrobeExtractor,
    GarmentRegion,
    WardrobeSnapshot,
    WardrobeAsset,
    GarmentType,
    GarmentZone,
    RGBColor,
    extract_color_palette,
)
from .prop_extractor import (
    PropExtractor,
    PropInstance,
    PropTrack,
    PropCatalogEntry,
    PropCategory,
    PropBBox,
    perceptual_hash,
)
from .environment_piece_extractor import (
    EnvironmentPieceExtractor,
    ScenePiece,
    EnvironmentMap,
    EnvironmentLayer,
    SurfaceType,
    DominantColorSwatch,
    encode_mask_rle,
    decode_mask_rle,
)

__all__ = [
    # Face / host identity
    "HostFaceScanner", "HostFaceScan", "FaceRegion", "FaceIdentityRecord", "FaceQuality",
    # Pose
    "AvatarPoseLibrary", "AvatarPose", "Keypoint", "PoseCategory", "Joint",
    "normalize_pose_to_hip_center", "scale_pose_by_torso_height",
    # Expression
    "AvatarExpressionLibrary", "AvatarExpression", "AUWeight", "ExpressionType",
    "ActionUnit", "blend_expressions", "additive_blend",
    # Voice identity
    "HostVoiceIdentityMapper", "VoiceProfile", "VoiceSegment", "DiarizationResult",
    "VoiceGender", "SpeechStyle", "extract_voice_features", "features_to_embedding",
    # Object splitting
    "ObjectAssetSplitter", "ObjectBound", "SplitResult", "AssetCrop", "AssetType", "BoundingBox",
    # Wardrobe
    "WardrobeExtractor", "GarmentRegion", "WardrobeSnapshot", "WardrobeAsset",
    "GarmentType", "GarmentZone", "RGBColor", "extract_color_palette",
    # Props
    "PropExtractor", "PropInstance", "PropTrack", "PropCatalogEntry",
    "PropCategory", "PropBBox", "perceptual_hash",
    # Environment
    "EnvironmentPieceExtractor", "ScenePiece", "EnvironmentMap", "EnvironmentLayer",
    "SurfaceType", "DominantColorSwatch", "encode_mask_rle", "decode_mask_rle",
]
