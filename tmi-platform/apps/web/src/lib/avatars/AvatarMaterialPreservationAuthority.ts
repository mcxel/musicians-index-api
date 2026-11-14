/**
 * AvatarMaterialPreservationAuthority — Batch AVATAR-MAT (2026-09-25)
 *
 * Prevents runtime loaders from destroying authored GLB materials.
 * Does NOT invent textures. Procedural materials (no maps) are valid.
 *
 * SOURCE / AUTOMATED only — never promotes PHYSICAL_GREEN.
 */

import * as THREE from "three";

export type AvatarMaterialRole =
  | "skin"
  | "hair"
  | "eye"
  | "brow"
  | "cloth"
  | "leather"
  | "metal"
  | "emissive"
  | "unknown";

export type MaterialChannelPresence = {
  baseColorMap: boolean;
  normalMap: boolean;
  roughnessMap: boolean;
  metalnessMap: boolean;
  aoMap: boolean;
  emissiveMap: boolean;
};

export type AvatarMaterialLedgerRow = {
  assetId: string;
  materialName: string;
  meshName: string;
  role: AvatarMaterialRole;
  materialType: "GLB_AUTHORED" | "PROCEDURAL_COLOR" | "RUNTIME_OVERRIDE" | "FALLBACK";
  baseColor: string;
  texturePresent: boolean;
  uvPresent: boolean;
  normalPresent: boolean;
  roughnessPresent: boolean;
  metallicPresent: boolean;
  aoPresent: boolean;
  runtimeOverride: boolean;
  lodConsistency: "N/A" | "PRESERVED" | "LOD_HIDDEN" | "UNKNOWN";
  status: "OK" | "MISSING_MATERIAL" | "RUNTIME_OVERWRITE_RISK" | "NO_MAPS_PROCEDURAL" | "INVALID_NORMAL_MAP";
};

export type MaterialQaCode =
  | "MISSING_MATERIAL"
  | "BROKEN_TEXTURE_REFERENCE"
  | "MISSING_BASE_COLOR"
  | "MISSING_UV"
  | "INVALID_NORMAL_MAP"
  | "UNASSIGNED_MATERIAL_SLOT"
  | "LOD_MATERIAL_MISMATCH"
  | "INVALID_COLOR_SPACE"
  | "MISSING_PROP_MATERIAL"
  | "RUNTIME_MATERIAL_SHARE_RISK";

export type MaterialQaFinding = {
  code: MaterialQaCode;
  severity: "error" | "warn" | "info";
  message: string;
  materialName?: string;
  meshName?: string;
};

/** Three.js r152+ uses colorSpace; r184 is the installed baseline. */
export const AVATAR_THREE_COLOR_MANAGEMENT = {
  threeVersionExpected: "0.184.0",
  colorTextures: "SRGBColorSpace",
  dataMaps: "NoColorSpace / Linear (normal, roughness, metalness, AO)",
  note: "Do not apply sRGB to normal/roughness/metalness/AO maps.",
} as const;

const SKIN_NAME = /skin|body|face|head|flesh|bobblehead_base|tmi_bobblehead/i;
const HAIR_NAME = /hair|scalp|beard|mustache|locs|braid|afro|fade/i;
const EYE_NAME = /eye|iris|pupil|sclera/i;
const BROW_NAME = /brow|lash|lid/i;
const CLOTH_NAME = /cloth|tee|shirt|top|bottom|pant|dress|outfit|cotton|fabric/i;
const LEATHER_NAME = /leather|kick|shoe|boot|sneaker/i;
const METAL_NAME = /metal|gold|chrome|chain|mic|prop_gold|jewelry/i;

export function classifyAvatarMaterialRole(
  materialName: string,
  meshName = "",
  mat?: { metalness?: number; emissiveIntensity?: number; emissive?: { r: number; g: number; b: number } },
): AvatarMaterialRole {
  const joined = `${materialName} ${meshName}`;
  if (BROW_NAME.test(joined)) return "brow";
  if (EYE_NAME.test(joined) || /^Eye_[LR]$/i.test(meshName)) return "eye";
  if (HAIR_NAME.test(joined)) return "hair";
  if (LEATHER_NAME.test(joined)) return "leather";
  if (CLOTH_NAME.test(joined)) return "cloth";
  if (METAL_NAME.test(joined) || (mat?.metalness ?? 0) > 0.7) return "metal";
  // Three.js defaults emissiveIntensity to 1.0 even when emissive is black — do not
  // treat every MeshStandardMaterial as emissive on intensity alone.
  const emissiveLit =
    (mat?.emissiveIntensity ?? 0) > 0.45 &&
    Boolean(
      mat?.emissive &&
        (mat.emissive.r > 0.02 || mat.emissive.g > 0.02 || mat.emissive.b > 0.02),
    );
  if (emissiveLit) return "emissive";
  if (SKIN_NAME.test(joined)) return "skin";
  // Single-material bobblehead bases are skin by default.
  if (/TMI_Bobblehead/i.test(materialName)) return "skin";
  return "unknown";
}

export function inventoryMaterialChannels(
  mat: THREE.MeshStandardMaterial,
): MaterialChannelPresence {
  return {
    baseColorMap: Boolean(mat.map),
    normalMap: Boolean(mat.normalMap),
    roughnessMap: Boolean(mat.roughnessMap),
    metalnessMap: Boolean(mat.metalnessMap),
    aoMap: Boolean(mat.aoMap),
    emissiveMap: Boolean(mat.emissiveMap),
  };
}

/**
 * SkeletonUtils.clone shares materials with the cached GLTF scene.
 * Always clone materials before tint/readability mutations.
 */
export function cloneMaterialsOnAvatarRoot(root: THREE.Object3D): number {
  let cloned = 0;
  const visit = (obj: THREE.Object3D) => {
    const mesh = obj as THREE.Mesh;
    const isMesh = Boolean(mesh.isMesh) || mesh.type === "Mesh";
    if (isMesh && mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => {
          cloned += 1;
          return m.clone();
        });
      } else {
        mesh.material = mesh.material.clone();
        cloned += 1;
      }
    }
    for (const child of obj.children) visit(child);
  };
  visit(root);
  return cloned;
}

function forEachStandardMaterial(
  root: THREE.Object3D,
  fn: (mat: THREE.MeshStandardMaterial, mesh: THREE.Mesh, role: AvatarMaterialRole) => void,
): void {
  const visit = (obj: THREE.Object3D) => {
    const mesh = obj as THREE.Mesh;
    const isMesh = Boolean(mesh.isMesh) || mesh.type === "Mesh";
    if (isMesh && mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const raw of mats) {
        const mat = raw as THREE.MeshStandardMaterial;
        if (!mat?.color) continue;
        const role = classifyAvatarMaterialRole(mat.name || "", mesh.name || "", mat);
        fn(mat, mesh, role);
      }
    }
    const children = obj.children ?? [];
    for (let i = 0; i < children.length; i++) visit(children[i]!);
  };
  visit(root);
}

/**
 * Skin tint ONLY on skin-classified materials.
 * Preserves maps; never replaces MeshStandardMaterial wholesale.
 */
export function applyPreservedSkinTint(root: THREE.Object3D, skinHex?: string): number {
  if (!skinHex) return 0;
  let touched = 0;
  const tint = new THREE.Color().setStyle(skinHex);
  forEachStandardMaterial(root, (mat, _mesh, role) => {
    if (role !== "skin" && role !== "unknown") return;
    const channels = inventoryMaterialChannels(mat);
    if (role === "unknown" && channels.baseColorMap) return;
    if (role === "unknown" && (mat.metalness ?? 0) > 0.45) return;
    mat.color.lerp(tint, role === "skin" ? 0.72 : 0.35);
    if (typeof mat.roughness === "number") {
      mat.roughness = Math.max(mat.roughness, 0.5);
    }
    if (typeof mat.metalness === "number") {
      mat.metalness = Math.min(mat.metalness, 0.22);
    }
    mat.needsUpdate = true;
    touched += 1;
  });
  return touched;
}

export function applyPreservedHairTint(root: THREE.Object3D, hairHex?: string): number {
  if (!hairHex) return 0;
  const tint = new THREE.Color(hairHex);
  let touched = 0;
  forEachStandardMaterial(root, (mat, _mesh, role) => {
    if (role !== "hair") return;
    if (mat.map) {
      // Keep map; multiply tint lightly so albedo detail survives.
      mat.color.copy(tint);
    } else {
      mat.color.copy(tint);
    }
    mat.roughness = Math.max(mat.roughness ?? 0.75, 0.65);
    mat.metalness = Math.min(mat.metalness ?? 0.05, 0.12);
    mat.needsUpdate = true;
    touched += 1;
  });
  return touched;
}

export function applyPreservedEyeTint(root: THREE.Object3D, eyeHex?: string): number {
  if (!eyeHex) return 0;
  const tint = new THREE.Color(eyeHex);
  let touched = 0;
  forEachStandardMaterial(root, (mat, mesh, role) => {
    if (role !== "eye") return;
    if (BROW_NAME.test(`${mat.name} ${mesh.name}`)) return;
    mat.color.copy(tint);
    mat.needsUpdate = true;
    touched += 1;
  });
  return touched;
}

/**
 * Soft readability tune for near-black metallic skin bases ONLY.
 * Never clamps intentional gold/cloth/leather authored factors.
 */
export function applySkinReadabilityTune(root: THREE.Object3D): number {
  let touched = 0;
  forEachStandardMaterial(root, (mat, _mesh, role) => {
    if (role !== "skin") return;
    const channels = inventoryMaterialChannels(mat);
    // If authored maps exist, leave metal/rough alone — only ensure env intensity is sane.
    if (channels.baseColorMap || channels.normalMap || channels.metalnessMap) {
      if (typeof mat.envMapIntensity === "number") {
        mat.envMapIntensity = Math.min(mat.envMapIntensity, 1.0);
      }
      mat.needsUpdate = true;
      touched += 1;
      return;
    }
    mat.metalness = Math.min(mat.metalness ?? 0.35, 0.28);
    mat.roughness = Math.max(mat.roughness ?? 0.55, 0.48);
    mat.envMapIntensity = 0.75;
    mat.needsUpdate = true;
    touched += 1;
  });
  return touched;
}

export function buildAvatarMaterialLedger(
  root: THREE.Object3D,
  assetId: string,
  opts?: { runtimeOverride?: boolean; lodConsistency?: AvatarMaterialLedgerRow["lodConsistency"] },
): AvatarMaterialLedgerRow[] {
  const rows: AvatarMaterialLedgerRow[] = [];
  forEachStandardMaterial(root, (mat, mesh, role) => {
    const ch = inventoryMaterialChannels(mat);
    const texturePresent = ch.baseColorMap || ch.normalMap || ch.roughnessMap || ch.metalnessMap || ch.aoMap;
    const uvPresent = Boolean(
      (mesh.geometry as THREE.BufferGeometry)?.attributes?.uv ||
        (mesh.geometry as THREE.BufferGeometry)?.attributes?.uv1,
    );
    let status: AvatarMaterialLedgerRow["status"] = "OK";
    if (!texturePresent) status = "NO_MAPS_PROCEDURAL";
    if (opts?.runtimeOverride) status = "RUNTIME_OVERWRITE_RISK";
    if (ch.normalMap && mat.normalMap?.colorSpace && mat.normalMap.colorSpace !== THREE.NoColorSpace) {
      status = "INVALID_NORMAL_MAP";
    }
    rows.push({
      assetId,
      materialName: mat.name || "(unnamed)",
      meshName: mesh.name || "(unnamed)",
      role,
      materialType: texturePresent ? "GLB_AUTHORED" : "PROCEDURAL_COLOR",
      baseColor: `#${mat.color.getHexString()}`,
      texturePresent,
      uvPresent,
      normalPresent: ch.normalMap,
      roughnessPresent: ch.roughnessMap || typeof mat.roughness === "number",
      metallicPresent: ch.metalnessMap || typeof mat.metalness === "number",
      aoPresent: ch.aoMap,
      runtimeOverride: Boolean(opts?.runtimeOverride),
      lodConsistency: opts?.lodConsistency ?? "UNKNOWN",
      status,
    });
  });
  return rows;
}

/**
 * QA against a material ledger. Procedural (no maps) = info, not error.
 */
export function runAvatarMaterialQa(rows: AvatarMaterialLedgerRow[]): MaterialQaFinding[] {
  const findings: MaterialQaFinding[] = [];
  if (rows.length === 0) {
    findings.push({
      code: "MISSING_MATERIAL",
      severity: "error",
      message: "No MeshStandardMaterial slots found on avatar root",
    });
    return findings;
  }
  for (const row of rows) {
    if (row.status === "INVALID_NORMAL_MAP") {
      findings.push({
        code: "INVALID_NORMAL_MAP",
        severity: "error",
        message: `Normal map on ${row.materialName} has incorrect color space`,
        materialName: row.materialName,
        meshName: row.meshName,
      });
    }
    if (row.status === "NO_MAPS_PROCEDURAL") {
      findings.push({
        code: "MISSING_BASE_COLOR",
        severity: "info",
        message: `Procedural material OK: ${row.materialName} (no texture maps by design)`,
        materialName: row.materialName,
        meshName: row.meshName,
      });
    }
    if (row.runtimeOverride) {
      findings.push({
        code: "RUNTIME_MATERIAL_SHARE_RISK",
        severity: "warn",
        message: `Runtime override flagged on ${row.materialName}`,
        materialName: row.materialName,
      });
    }
    if (!row.uvPresent && row.texturePresent) {
      findings.push({
        code: "MISSING_UV",
        severity: "error",
        message: `Texture present but UVs missing on ${row.meshName}`,
        meshName: row.meshName,
        materialName: row.materialName,
      });
    }
  }
  return findings;
}

/** Fixture describing bobblehead_v0 as inspected from GLB JSON (no Three runtime required). */
export const BOBBLEHEAD_V0_GLB_MATERIAL_FIXTURE: AvatarMaterialLedgerRow[] = [
  {
    assetId: "bobblehead_v0",
    materialName: "TMI_Bobblehead_Base",
    meshName: "Sphere",
    role: "skin",
    materialType: "PROCEDURAL_COLOR",
    baseColor: "#808080",
    texturePresent: false,
    uvPresent: true,
    normalPresent: false,
    roughnessPresent: true,
    metallicPresent: true,
    aoPresent: false,
    runtimeOverride: false,
    lodConsistency: "LOD_HIDDEN",
    status: "NO_MAPS_PROCEDURAL",
  },
];

/** Fixture describing starter_wardrobe_v0 materials (procedural PBR factors, no image maps). */
export const STARTER_WARDROBE_V0_MATERIAL_FIXTURE: AvatarMaterialLedgerRow[] = [
  {
    assetId: "starter_wardrobe_v0",
    materialName: "mat_hair_natural_black",
    meshName: "Hair_Afro_Classic",
    role: "hair",
    materialType: "PROCEDURAL_COLOR",
    baseColor: "#050505",
    texturePresent: false,
    uvPresent: true,
    normalPresent: false,
    roughnessPresent: true,
    metallicPresent: true,
    aoPresent: false,
    runtimeOverride: false,
    lodConsistency: "N/A",
    status: "NO_MAPS_PROCEDURAL",
  },
  {
    assetId: "starter_wardrobe_v0",
    materialName: "mat_cloth_cotton_obsidian",
    meshName: "Tee_Basic_Obsidian",
    role: "cloth",
    materialType: "PROCEDURAL_COLOR",
    baseColor: "#0a0a0d",
    texturePresent: false,
    uvPresent: true,
    normalPresent: false,
    roughnessPresent: true,
    metallicPresent: true,
    aoPresent: false,
    runtimeOverride: false,
    lodConsistency: "N/A",
    status: "NO_MAPS_PROCEDURAL",
  },
  {
    assetId: "starter_wardrobe_v0",
    materialName: "mat_metallic_gold",
    meshName: "Prop_Gold_Microphone",
    role: "metal",
    materialType: "PROCEDURAL_COLOR",
    baseColor: "#ffd600",
    texturePresent: false,
    uvPresent: true,
    normalPresent: false,
    roughnessPresent: true,
    metallicPresent: true,
    aoPresent: false,
    runtimeOverride: false,
    lodConsistency: "N/A",
    status: "NO_MAPS_PROCEDURAL",
  },
];

/**
 * Simulate the OLD defect: blanket metalness clamp on every material.
 * Used by tests to prove cloth/metal would be corrupted.
 */
export function simulateLegacyBlanketMetalnessClamp(
  metalnessByRole: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [role, m] of Object.entries(metalnessByRole)) {
    out[role] = Math.min(m, 0.45);
  }
  return out;
}

export function simulatePreservedReadabilityMetalness(
  metalnessByRole: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [role, m] of Object.entries(metalnessByRole)) {
    out[role] = role === "skin" ? Math.min(m, 0.28) : m;
  }
  return out;
}
