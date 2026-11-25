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
  | "lip"
  | "teeth"
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

const SKIN_NAME = /skin|flesh|bobblehead_base|tmi_bobblehead|living_skin/i;
const HAIR_NAME = /hair|scalp|beard|mustache|locs|braid|afro|fade/i;
const EYE_NAME = /eye|iris|pupil|sclera/i;
const BROW_NAME = /brow|lash|lid/i;
const LIP_NAME = /lip|mouth_mat|mat_lips/i;
const TEETH_NAME = /teeth|tooth|enamel|gum/i;
const CLOTH_NAME = /cloth|tee|shirt|top|bottom|pant|dress|outfit|cotton|fabric|denim|studio_tee|studio_denim/i;
const LEATHER_NAME = /leather|kick|shoe|boot|sneaker|sole/i;
// Word-ish tokens only — do not match skin tone "GOLDEN_TAN" via bare "gold".
const METAL_NAME = /metal|\bgold\b|chrome|chain|\bmic\b|prop_gold|jewelry/i;

export function classifyAvatarMaterialRole(
  materialName: string,
  meshName = "",
  mat?: { metalness?: number; emissiveIntensity?: number; emissive?: { r: number; g: number; b: number } },
): AvatarMaterialRole {
  const joined = `${materialName} ${meshName}`;
  // Feature materials first — never treat lips/teeth/eyes/cloth as skin because the
  // Foundry v3 mesh node is named "Sphere". Material name owns the role.
  if (BROW_NAME.test(joined)) return "brow";
  if (EYE_NAME.test(joined) || /^Eye_[LR]$/i.test(meshName)) return "eye";
  if (LIP_NAME.test(materialName) || LIP_NAME.test(joined)) return "lip";
  if (TEETH_NAME.test(materialName) || TEETH_NAME.test(joined)) return "teeth";
  if (HAIR_NAME.test(joined)) return "hair";
  if (LEATHER_NAME.test(joined)) return "leather";
  if (CLOTH_NAME.test(joined)) return "cloth";
  // Skin before metal — "GOLDEN_TAN" must not match METAL_NAME's "gold" substring.
  if (SKIN_NAME.test(materialName) || /TMI_Bobblehead/i.test(materialName)) return "skin";
  if (SKIN_NAME.test(joined) && !/^Sphere(\.\d+)?$/i.test(meshName.trim())) return "skin";
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
  // Do NOT classify bare mesh name "Sphere" as skin — Foundry v3 uses one Sphere
  // mesh with multi-material islands (skin, lips, teeth, cloth).
  return "unknown";
}

/** True when Living Skin PBR maps were successfully bound — legacy fallbacks must not overwrite. */
export function isLivingSkinPbrBound(mat: { userData?: Record<string, unknown> } | null | undefined): boolean {
  return Boolean(mat?.userData?.tmiLivingSkinPbrBound);
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
 * Canonical avatar standard: 75–80% realism, 20–25% stylization.
 * `realism` is the material finish this runtime can apply today.
 * `realismPreferred` is the premium likeness target. It stays unmet until a
 * manufactured avatar is physically verified against the checklist below.
 */
export const TMI_AVATAR_SKIN_STANDARD = {
  realism: 0.75,
  realismPreferred: 0.8,
  stylization: 0.25,
  stylizationMin: 0.2,
  roughness: 0.62,
  metalness: 0,
  sheen: 0.24,
  sheenRoughness: 0.7,
  normalScale: 0.38,
  detail: "PROCEDURAL_MICRO_NORMAL",
  identity: "NOT_PHOTO_RECONSTRUCTION",
} as const;

/** Objective checks. A pass requires a real screenshot or recording, not a source read. */
export const TMI_AVATAR_VISUAL_VERIFICATION = [
  { id: "SKIN_ALBEDO", pass: "Skin shows an authored color map with pores or fine variation at face distance." },
  { id: "SKIN_RESPONSE", pass: "Roughness stays matte. There is no plastic highlight and no flat grey or teal proxy." },
  { id: "TONE_ISOLATION", pass: "Light, medium, and deep skin tones change only skin. Lips, eyes, hair, and clothing keep their maps." },
  { id: "EYES", pass: "Sclera, iris, and catchlight read as eyes at a one-meter camera, not flat discs." },
  { id: "HAIR", pass: "Hair is a separate mesh or cards with color variation, not a tint on the head sphere." },
  { id: "FACE_MOTION", pass: "A brow, blink, and mouth-open pose each move the face by a visible amount." },
  { id: "LIKENESS", pass: "An authorized reference photo produces a face a reviewer can match to that person." },
  { id: "BODY_CLOTH", pass: "Clothing has its own material. Seams and shoes are not the same flat factor as skin." },
  { id: "TIER_ISOLATION", pass: "Membership color appears on the stage or pedestal only, never on skin or clothing." },
  { id: "RIG", pass: "The same AvatarRig/1.0 skeleton walks, sits, and dances with the manufactured face attached." },
  { id: "PERSIST", pass: "The verified look reloads in Creation Center, showroom, and one 3D venue." },
  { id: "STYLIZATION", pass: "The head stays slightly bobblehead. Proportions are not photoreal and not a toy squash." },
] as const;

let sharedSkinMicroNormal: THREE.Texture | null = null;

function skinMicroNormal(): THREE.Texture | null {
  if (sharedSkinMicroNormal) return sharedSkinMicroNormal;
  if (typeof document === "undefined") return null;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  for (let i = 0; i < height.length; i++) {
    height[i] = Math.random();
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const left = height[y * size + ((x + size - 1) % size)]!;
      const right = height[y * size + ((x + 1) % size)]!;
      const up = height[((y + size - 1) % size) * size + x]!;
      const down = height[((y + 1) % size) * size + x]!;
      const nx = (left - right) * 0.85;
      const ny = (up - down) * 0.85;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      const o = i * 4;
      image.data[o] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      image.data[o + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      image.data[o + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      image.data[o + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 7);
  tex.needsUpdate = true;
  sharedSkinMicroNormal = tex;
  return tex;
}

function upgradeSkinToPhysical(mat: THREE.MeshStandardMaterial, mesh: THREE.Mesh): THREE.MeshPhysicalMaterial {
  const physical = mat as THREE.MeshPhysicalMaterial;
  if (physical.isMeshPhysicalMaterial) return physical;
  const next = new THREE.MeshPhysicalMaterial({
    name: mat.name,
    color: mat.color.clone(),
    map: mat.map,
    normalMap: mat.normalMap,
    roughnessMap: mat.roughnessMap,
    metalnessMap: mat.metalnessMap,
    aoMap: mat.aoMap,
    roughness: mat.roughness,
    metalness: mat.metalness,
    envMapIntensity: mat.envMapIntensity,
  });
  next.userData = { ...mat.userData };
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((slot) => (slot === mat ? next : slot));
  } else if (mesh.material === mat) {
    mesh.material = next;
  }
  mat.dispose();
  return next;
}

/**
 * Skin-only finish. Clothing, eyes, hair, lips, and accessories are untouched.
 * Membership colors are not an input.
 */
export function applyStylizedRealSkinFinish(root: THREE.Object3D): number {
  let touched = 0;
  const detail = skinMicroNormal();
  forEachStandardMaterial(root, (mat, mesh, role) => {
    if (role !== "skin") return;
    const skin = upgradeSkinToPhysical(mat, mesh);
    const channels = inventoryMaterialChannels(skin);
    const livingBound = isLivingSkinPbrBound(skin);
    // Living Skin package owns normals/roughness — do not inject procedural micro-normal over it.
    if (!livingBound && !channels.normalMap && detail) {
      skin.normalMap = detail;
      skin.normalScale = new THREE.Vector2(
        TMI_AVATAR_SKIN_STANDARD.normalScale,
        TMI_AVATAR_SKIN_STANDARD.normalScale,
      );
    }
    skin.metalness = livingBound ? 0 : TMI_AVATAR_SKIN_STANDARD.metalness;
    skin.roughness = channels.roughnessMap || livingBound
      ? skin.roughness
      : TMI_AVATAR_SKIN_STANDARD.roughness;
    skin.clearcoat = 0;
    skin.transmission = 0;
    if (!livingBound) {
      skin.sheen = TMI_AVATAR_SKIN_STANDARD.sheen;
      skin.sheenRoughness = TMI_AVATAR_SKIN_STANDARD.sheenRoughness;
      skin.sheenColor = new THREE.Color().copy(skin.color).lerp(new THREE.Color("#fff1e4"), 0.22);
    }
    if (skin.emissive && !livingBound) {
      skin.emissive.setRGB(skin.color.r * 0.03, skin.color.g * 0.015, skin.color.b * 0.01);
      skin.emissiveIntensity = 0.12;
    }
    skin.envMapIntensity = Math.min(skin.envMapIntensity ?? 0.5, livingBound ? 0.85 : 0.55);
    skin.userData.tmiSkinFinish = livingBound ? "LIVING_SKIN_PBR" : "STYLIZED_REAL_75";
    skin.needsUpdate = true;
    touched += 1;
  });
  return touched;
}

/**
 * Skin tint ONLY on skin-classified materials.
 * Albedo maps stay. Untextured skin takes the selected tone directly.
 * Lips, shades, cloth, hair, and eyes are not inputs.
 */
export function applyPreservedSkinTint(root: THREE.Object3D, skinHex?: string): number {
  if (!skinHex) return 0;
  let touched = 0;
  const tint = new THREE.Color().setStyle(skinHex);
  forEachStandardMaterial(root, (mat, _mesh, role) => {
    if (role !== "skin") return;
    const channels = inventoryMaterialChannels(mat);
    const livingBound = isLivingSkinPbrBound(mat);
    // Living Skin albedo is authoritative — keep multiply color near white so maps read correctly.
    if (livingBound && channels.baseColorMap) {
      mat.color.set("#ffffff").lerp(tint, 0.12);
      mat.metalness = 0;
      mat.needsUpdate = true;
      touched += 1;
      return;
    }
    if (!mat.userData.tmiAuthoredSkinHex) {
      mat.userData.tmiAuthoredSkinHex = `#${mat.color.getHexString()}`;
    }
    if (channels.baseColorMap) {
      const authored = new THREE.Color(String(mat.userData.tmiAuthoredSkinHex));
      mat.color.copy(authored).lerp(tint, 0.35);
    } else {
      mat.color.copy(tint);
    }
    mat.metalness = 0;
    if (!channels.roughnessMap && typeof mat.roughness === "number") {
      mat.roughness = TMI_AVATAR_SKIN_STANDARD.roughness;
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
    if (isLivingSkinPbrBound(mat)) {
      // Living Skin package owns metal/rough/env — do not reclamp after bind.
      return;
    }
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

/**
 * §20995-X — Foundry bobblehead_v0 ships ONE untextured grey material
 * (`TMI_Bobblehead_Base`, factor ~0.8). Convert that flat grey into a readable
 * skin-like PBR surface so palette tints are visible (not wireframe, not photo maps).
 * Does NOT invent albedo textures — remanufacture is required for photoreal skin.
 */
export function enhanceProceduralBobbleheadSurface(
  root: THREE.Object3D,
  skinHex?: string,
): { materialsTuned: number; diagnostic: string } {
  let materialsTuned = 0;
  const fallbackSkin = new THREE.Color(skinHex && skinHex.startsWith("#") ? skinHex : "#C68642");
  forEachStandardMaterial(root, (mat, _mesh, role) => {
    // Never flatten Living Skin PBR-bound mats, lip/teeth/eye/cloth, or mapped materials.
    if (isLivingSkinPbrBound(mat)) return;
    if (role !== "skin") return;
    const channels = inventoryMaterialChannels(mat);
    if (channels.baseColorMap || channels.normalMap || channels.roughnessMap) return;

    const c = mat.color;
    const isFlatGrey =
      Math.abs(c.r - c.g) < 0.04 &&
      Math.abs(c.g - c.b) < 0.04 &&
      c.r > 0.55 &&
      c.r < 0.95;

    // Legacy untextured bobblehead_v0 only — not Foundry multi-material Sphere islands.
    const greyProxy = /TMI_Bobblehead/i.test(mat.name || "") || isFlatGrey;
    if (!greyProxy) return;
    mat.color.copy(fallbackSkin);
    mat.roughness = TMI_AVATAR_SKIN_STANDARD.roughness;
    mat.metalness = 0;
    mat.envMapIntensity = 0.45;
    mat.userData.tmiLegacySkinFallback = "#C68642";
    mat.needsUpdate = true;
    materialsTuned += 1;
  });

  applyStylizedRealSkinFinish(root);

  return {
    materialsTuned,
    diagnostic:
      "STYLIZED_REAL_75 + LIVING_SKIN_RUNTIME — material floor 75%; living sheen/sweat is activity-driven. Micro-normal is procedural, not a scanned pore map. Authored PBR + sweat masks require Anti-Gravity package tmi_living_skin_v1. Legacy #C68642 fallback is skipped when tmiLivingSkinPbrBound or maps exist.",
  };
}

/**
 * Attach small procedural eye spheres to empty Eye_L / Eye_R bones when the
 * certified GLB only has sockets (bobblehead_v0). Honest fill — not photoreal irises.
 */
export function attachProceduralEyeMarkers(root: THREE.Object3D): number {
  let authoredEyes = false;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const materialName = mat && "name" in mat ? String(mat.name || "") : "";
    if (classifyAvatarMaterialRole(materialName, mesh.name) === "eye" || /sclera|iris/i.test(materialName)) {
      authoredEyes = true;
    }
  });
  if (authoredEyes) return 0;
  let attached = 0;
  const ensureEye = (boneName: string) => {
    const bone = root.getObjectByName(boneName);
    if (!bone) return;
    if (bone.children.some((c) => c.name === "TMI_ProceduralEye")) return;
    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 12, 12),
      new THREE.MeshStandardMaterial({
        color: "#F5F5F0",
        roughness: 0.35,
        metalness: 0.05,
        name: "TMI_ProceduralEye_Sclera",
      }),
    );
    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(0.009, 10, 10),
      new THREE.MeshStandardMaterial({
        color: "#3D2314",
        roughness: 0.25,
        metalness: 0.1,
        name: "TMI_ProceduralEye_Iris",
        emissive: new THREE.Color("#1a1008"),
        emissiveIntensity: 0.15,
      }),
    );
    iris.position.z = 0.012;
    const group = new THREE.Group();
    group.name = "TMI_ProceduralEye";
    group.add(sclera);
    group.add(iris);
    bone.add(group);
    attached += 1;
  };
  ensureEye("Eye_L");
  ensureEye("Eye_R");
  return attached;
}

const EMBEDDED_FACE_FEATURE = /lip|eye|iris|sclera|brow|beard/i;

function positionAttribute(mesh: THREE.Mesh): THREE.BufferAttribute | null {
  const pos = mesh.geometry?.attributes?.position as THREE.BufferAttribute | undefined;
  if (!pos || pos.count < 3) return null;
  return pos;
}

/**
 * Urban Cap keeps the eyes, irises, lips, brows, and beard inside the skin
 * shell. Those meshes are skinned, so moving the object position does not
 * move the posed vertices. Offset the cloned bind-pose vertices along the
 * file's +Z face axis until each feature clears the skin at its own height.
 * The on-disk GLB is not modified. Skin tone is not modified.
 * Sunglasses are pulled back only when they would sit in front of the eyes.
 */
export function bringEmbeddedFaceFeaturesForward(root: THREE.Object3D): number {
  if (root.userData.tmiFaceOffsetOnce === 1) {
    return Number(root.userData.tmiFaceFeaturesForward ?? 0);
  }
  const skin: THREE.Mesh[] = [];
  const features: THREE.Mesh[] = [];
  const shades: THREE.Mesh[] = [];
  const caps: THREE.Mesh[] = [];
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if (/^cap$/i.test(mesh.name)) caps.push(mesh);
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const materialName = mat && "name" in mat ? String(mat.name || "") : "";
    const joined = `${materialName} ${mesh.name}`;
    const role = classifyAvatarMaterialRole(materialName, mesh.name);
    if (role === "skin") skin.push(mesh);
    if (role === "eye" || role === "brow" || EMBEDDED_FACE_FEATURE.test(joined)) features.push(mesh);
    if (/shade|sunglass/i.test(joined)) shades.push(mesh);
  });
  const skinPos = skin.map(positionAttribute).find(Boolean);
  if (!skinPos || features.length === 0) return 0;
  let globalFront = -Infinity;
  const bandFront = new Map<number, number>();
  for (let i = 0; i < skinPos.count; i += 2) {
    const y = skinPos.getY(i);
    const z = skinPos.getZ(i);
    if (!Number.isFinite(y) || !Number.isFinite(z) || Math.abs(z) > 8) continue;
    globalFront = Math.max(globalFront, z);
    const band = Math.round(y * 50);
    bandFront.set(band, Math.max(bandFront.get(band) ?? -Infinity, z));
  }
  if (!Number.isFinite(globalFront)) return 0;
  let moved = 0;
  let eyeFront = -Infinity;
  for (const mesh of features) {
    const pos = positionAttribute(mesh);
    if (!pos) continue;
    mesh.geometry = mesh.geometry.clone();
    const cloned = mesh.geometry.attributes.position as THREE.BufferAttribute;
    let maxZ = -Infinity;
    let midY = 0;
    let counted = 0;
    for (let i = 0; i < cloned.count; i++) {
      const z = cloned.getZ(i);
      if (!Number.isFinite(z) || Math.abs(z) > 8) continue;
      maxZ = Math.max(maxZ, z);
      midY += cloned.getY(i);
      counted += 1;
    }
    if (!counted || !Number.isFinite(maxZ)) continue;
    midY /= counted;
    const front = bandFront.get(Math.round(midY * 50)) ?? globalFront;
    const extra = /iris/i.test(mesh.name) ? 0.02 : /lip/i.test(mesh.name) ? 0.014 : 0.01;
    const delta = front - maxZ + extra;
    if (delta > 0.004) {
      for (let i = 0; i < cloned.count; i++) cloned.setZ(i, cloned.getZ(i) + delta);
      moved += 1;
      maxZ += delta;
    }
    cloned.needsUpdate = true;
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
    mesh.frustumCulled = false;
    mesh.renderOrder = /iris/i.test(mesh.name) ? 5 : 4;
    if (/eye|iris|sclera/i.test(mesh.name)) eyeFront = Math.max(eyeFront, maxZ);
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!mat || !("opacity" in mat)) continue;
      mat.opacity = 1;
      mat.transparent = false;
      mat.depthWrite = true;
      mat.side = THREE.FrontSide;
      mat.needsUpdate = true;
    }
  }
  if (Number.isFinite(eyeFront)) {
    for (const mesh of shades) {
      const pos = positionAttribute(mesh);
      if (!pos) continue;
      let maxZ = -Infinity;
      for (let i = 0; i < pos.count; i += 2) maxZ = Math.max(maxZ, pos.getZ(i));
      const pull = maxZ - (eyeFront - 0.012);
      if (pull > 0.004) {
        mesh.geometry = mesh.geometry.clone();
        const cloned = mesh.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < cloned.count; i++) cloned.setZ(i, cloned.getZ(i) - pull);
        cloned.needsUpdate = true;
        mesh.geometry.computeBoundingBox();
        mesh.geometry.computeBoundingSphere();
      }
    }
  }
  let irisTop = -Infinity;
  for (const mesh of features) {
    if (!/iris/i.test(mesh.name)) continue;
    const pos = positionAttribute(mesh);
    if (!pos) continue;
    for (let i = 0; i < pos.count; i += 1) irisTop = Math.max(irisTop, pos.getY(i));
  }
  for (const mesh of features) {
    if (!/brow/i.test(mesh.name)) continue;
    const pos = positionAttribute(mesh);
    if (!pos) continue;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < pos.count; i += 1) {
      const y = pos.getY(i);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const midY = (minY + maxY) / 2;
    const height = Math.max(maxY - minY, 1e-4);
    const targetH = Math.max(height, 0.036);
    const targetMid = Number.isFinite(irisTop) ? irisTop + 0.028 : midY;
    const scale = targetH / height;
    let maxZ = -Infinity;
    for (let i = 0; i < pos.count; i += 1) {
      pos.setY(i, targetMid + (pos.getY(i) - midY) * scale);
      maxZ = Math.max(maxZ, pos.getZ(i));
    }
    const skinFront = bandFront.get(Math.round(targetMid * 50)) ?? globalFront;
    if (Number.isFinite(skinFront) && maxZ < skinFront + 0.034) {
      const dz = skinFront + 0.034 - maxZ;
      for (let i = 0; i < pos.count; i += 1) pos.setZ(i, pos.getZ(i) + dz);
      maxZ += dz;
    }
    let capFront = -Infinity;
    for (const cap of caps) {
      const capPos = positionAttribute(cap);
      if (!capPos) continue;
      for (let i = 0; i < capPos.count; i += 2) {
        if (Math.abs(capPos.getY(i) - targetMid) > 0.035) continue;
        capFront = Math.max(capFront, capPos.getZ(i));
      }
    }
    if (capFront > -Infinity && maxZ < capFront + 0.012) {
      const dz = capFront + 0.012 - maxZ;
      for (let i = 0; i < pos.count; i += 1) pos.setZ(i, pos.getZ(i) + dz);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
    mesh.renderOrder = 6;
  }
  root.userData.tmiBrowsPlaced = 1;
  const eyeBones: THREE.Object3D[] = [];
  root.traverse((obj) => {
    if ((obj as THREE.Bone).isBone && (obj.name === "Eye_L" || obj.name === "Eye_R")) eyeBones.push(obj);
  });
  if (eyeBones.length > 0) {
    root.updateMatrixWorld(true);
    const face = new THREE.Vector3();
    for (const bone of eyeBones) face.add(bone.getWorldPosition(new THREE.Vector3()));
    face.multiplyScalar(1 / eyeBones.length);
    root.worldToLocal(face);
    root.userData.tmiFaceLocal = { x: face.x, y: face.y, z: face.z };
  }
  root.userData.tmiFaceOffsetOnce = 1;
  root.userData.tmiFaceFeaturesForward = moved;
  return moved;
}

/**
 * Facial fidelity readability pass — eyes / lips / teeth only.
 * Never mutates Living Skin–bound skin materials or the canonical skeleton.
 * Keeps metalness off facial soft tissue, lifts sclera/teeth value slightly,
 * and adds a soft iris catchlight so FACE framing reads identity.
 */
export function enhanceAuthoredFaceFeatureReadability(root: THREE.Object3D): {
  eyes: number;
  lips: number;
  teeth: number;
} {
  let eyes = 0;
  let lips = 0;
  let teeth = 0;
  forEachStandardMaterial(root, (mat, mesh, role) => {
    if (isLivingSkinPbrBound(mat)) return;
    const joined = `${mat.name || ""} ${mesh.name || ""}`;
    if (role === "eye" || /sclera|iris|pupil/i.test(joined)) {
      if (BROW_NAME.test(joined)) return;
      mat.metalness = Math.min(mat.metalness ?? 0, 0.08);
      if (/sclera/i.test(joined)) {
        mat.roughness = Math.min(Math.max(mat.roughness ?? 0.45, 0.32), 0.55);
        // Soft lift so whites aren't muddy under neon stage light
        mat.color.offsetHSL(0, -0.02, 0.04);
      } else if (/iris|pupil/i.test(joined)) {
        mat.roughness = Math.min(mat.roughness ?? 0.35, 0.28);
        if (mat.emissive) {
          mat.emissive.copy(mat.color).multiplyScalar(0.08);
          mat.emissiveIntensity = Math.max(mat.emissiveIntensity ?? 0, 0.12);
        }
      }
      mat.envMapIntensity = Math.min(Math.max(mat.envMapIntensity ?? 0.6, 0.55), 0.9);
      mat.userData.tmiFaceFeatureTune = "eye";
      mat.needsUpdate = true;
      eyes += 1;
      return;
    }
    if (role === "lip" || LIP_NAME.test(joined)) {
      mat.metalness = 0;
      mat.roughness = Math.min(Math.max(mat.roughness ?? 0.55, 0.42), 0.62);
      mat.envMapIntensity = Math.min(mat.envMapIntensity ?? 0.5, 0.65);
      mat.userData.tmiFaceFeatureTune = "lip";
      mat.needsUpdate = true;
      lips += 1;
      return;
    }
    if (role === "teeth" || TEETH_NAME.test(joined)) {
      mat.metalness = 0;
      mat.roughness = Math.min(Math.max(mat.roughness ?? 0.4, 0.28), 0.5);
      mat.color.offsetHSL(0.02, -0.05, 0.06);
      mat.userData.tmiFaceFeatureTune = "teeth";
      mat.needsUpdate = true;
      teeth += 1;
    }
  });
  root.userData.tmiFaceFeatureTune = { eyes, lips, teeth };
  return { eyes, lips, teeth };
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
