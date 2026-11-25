"use client";

/**
 * Mount Foundry part GLBs (hair / facial hair / wardrobe) onto a live AvatarRig/1.0 host.
 * Extracts hair-named skinned meshes from the part package and rebinds them to the host skeleton
 * so they follow Head / jaw animation. Does not invent a second avatar renderer.
 *
 * Diagnostics use DOM attrs on `[data-avatar-viewer]` only — never hyphenated `data-*`
 * props on R3F hosts (dash → nested Three path → TypeError on undefined `group.data`).
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { loadFoundryGlbBundle } from "@/components/3d/AvatarLobbyCanvas";
import type { AvatarSocketId } from "@/lib/avatars/AvatarSocketSystem";
import { getSocketBoneName } from "@/lib/avatars/AvatarSocketSystem";

export type FoundryPartMountSpec = {
  id: string;
  glbUrl: string;
  socketId?: AvatarSocketId;
  tintHex?: string | null;
};

function isLodBodyNode(name: string): boolean {
  return /Avatar_LOD|body_skin|studio_tee|studio_denim|sneaker|Armature/i.test(name);
}

function isHairLikeMesh(mesh: THREE.Mesh): boolean {
  const n = `${mesh.name} ${mesh.parent?.name ?? ""}`;
  if (isLodBodyNode(n)) return false;
  if (/hair|afro|braid|fade|pomp|locs|bun|ponytail|beard|mustache|goatee|flattop|curl|coil|cornrow|puff/i.test(n)) {
    return true;
  }
  const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  const matName = mat && "name" in mat ? String(mat.name || "") : "";
  return /hair|beard|mustache|coily|curl|braid|fade|afro/i.test(matName);
}

function findHostSkeleton(hostRoot: THREE.Object3D): THREE.Skeleton | null {
  let found: THREE.Skeleton | null = null;
  hostRoot.traverse((obj) => {
    if (found) return;
    const mesh = obj as THREE.SkinnedMesh;
    if (mesh.isSkinnedMesh && mesh.skeleton?.bones?.length) found = mesh.skeleton;
  });
  return found;
}

function resolveHeadBone(hostRoot: THREE.Object3D, socketId?: AvatarSocketId): THREE.Object3D | null {
  const boneName = getSocketBoneName("biped", socketId ?? "socket_head") || "Head";
  return (
    hostRoot.getObjectByName(boneName) ||
    hostRoot.getObjectByName("Head") ||
    hostRoot.getObjectByName("head") ||
    null
  );
}

function remappableBones(host: THREE.Skeleton, donor: THREE.Skeleton): THREE.Bone[] {
  const byName = new Map(host.bones.map((b) => [b.name, b] as const));
  return donor.bones.map((b) => byName.get(b.name) ?? b);
}

function cloneMeshForMount(donor: THREE.Mesh, partId: string): THREE.Mesh {
  const mesh = donor.clone(false) as THREE.Mesh;
  if (donor.geometry) mesh.geometry = donor.geometry.clone();
  if (Array.isArray(donor.material)) {
    mesh.material = donor.material.map((m) => m.clone());
  } else if (donor.material) {
    mesh.material = donor.material.clone();
  }
  mesh.name = `TMI_Part_${partId}_${donor.name || "hair"}`;
  mesh.frustumCulled = false;
  return mesh;
}

function applyTint(root: THREE.Object3D, tintHex?: string | null) {
  if (!tintHex || !tintHex.startsWith("#") || tintHex === "transparent") return;
  const color = new THREE.Color(tintHex);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (!String(mesh.name || "").startsWith("TMI_Part_")) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!mat || !("color" in mat)) continue;
      (mat as THREE.MeshStandardMaterial).color.copy(color);
    }
  });
}

function setHairDomDiagnostics(payload: {
  partId: string | null;
  meshCount: number;
  headBone: string | null;
  bindMode: string | null;
  error?: string | null;
}) {
  if (typeof document === "undefined") return;
  const host = document.querySelector("[data-avatar-viewer]");
  if (!host) return;
  if (payload.partId) host.setAttribute("data-hair-part-id", payload.partId);
  else host.removeAttribute("data-hair-part-id");
  host.setAttribute("data-hair-mesh-count", String(payload.meshCount));
  if (payload.headBone) host.setAttribute("data-hair-head-bone", payload.headBone);
  if (payload.bindMode) host.setAttribute("data-hair-bind-mode", payload.bindMode);
  if (payload.error) host.setAttribute("data-hair-mount-error", payload.error.slice(0, 160));
  else host.removeAttribute("data-hair-mount-error");
}

/**
 * Load a Foundry part GLB and bind hair-like skinned meshes onto the host AvatarRig skeleton.
 */
export function FoundrySkinnedPartMount({
  hostRoot,
  part,
}: {
  hostRoot: THREE.Object3D;
  part: FoundryPartMountSpec;
}) {
  const mountedRef = useRef<THREE.Object3D[]>([]);

  useEffect(() => {
    let cancelled = false;
    const mounted: THREE.Object3D[] = [];
    mountedRef.current = mounted;

    const hostSkeleton = findHostSkeleton(hostRoot);
    const headBone = resolveHeadBone(hostRoot, part.socketId);

    if (!hostSkeleton && !headBone) {
      setHairDomDiagnostics({
        partId: part.id,
        meshCount: 0,
        headBone: null,
        bindMode: null,
        error: "HEAD_BONE_UNRESOLVED",
      });
      return;
    }

    void loadFoundryGlbBundle(part.glbUrl)
      .then((bundle) => {
        if (cancelled) return;
        const cloned = cloneSkinned(bundle.scene) as THREE.Object3D;

        const hairNamed: THREE.Mesh[] = [];
        const skinnedFallback: THREE.SkinnedMesh[] = [];
        const staticFallback: THREE.Mesh[] = [];

        cloned.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          const n = `${mesh.name} ${mesh.parent?.name ?? ""}`;
          if (isLodBodyNode(n)) return;
          if (isHairLikeMesh(mesh)) {
            hairNamed.push(mesh);
            return;
          }
          const skinned = mesh as THREE.SkinnedMesh;
          if (skinned.isSkinnedMesh) {
            skinnedFallback.push(skinned);
            return;
          }
          // Static Sphere.* / hair shell meshes parented under Head when no skinned hair found.
          if (/Sphere|Hair|Cap|Top|Curl|Braid|Fade|Afro|Bun|Pony/i.test(mesh.name)) {
            staticFallback.push(mesh);
          }
        });

        const targets: THREE.Mesh[] =
          hairNamed.length > 0
            ? hairNamed
            : skinnedFallback.length > 0
              ? skinnedFallback
              : staticFallback;

        let bindMode: "skeleton" | "head_bone" | "host_root" | "none" = "none";

        for (const donor of targets) {
          const skinnedDonor = donor as THREE.SkinnedMesh;
          if (skinnedDonor.isSkinnedMesh && hostSkeleton && skinnedDonor.skeleton) {
            const mesh = cloneMeshForMount(donor, part.id) as THREE.SkinnedMesh;
            const bones = remappableBones(hostSkeleton, skinnedDonor.skeleton);
            mesh.bind(
              new THREE.Skeleton(bones, hostSkeleton.boneInverses),
              skinnedDonor.bindMatrix,
            );
            hostRoot.add(mesh);
            mounted.push(mesh);
            bindMode = "skeleton";
            continue;
          }

          const mesh = cloneMeshForMount(donor, part.id);
          if (headBone) {
            headBone.add(mesh);
            bindMode = bindMode === "skeleton" ? "skeleton" : "head_bone";
          } else {
            hostRoot.add(mesh);
            bindMode = bindMode === "skeleton" ? "skeleton" : "host_root";
          }
          mounted.push(mesh);
        }

        applyTint(hostRoot, part.tintHex);
        hostRoot.userData.tmiFoundryPartIds = [
          ...((hostRoot.userData.tmiFoundryPartIds as string[]) || []).filter((id) => id !== part.id),
          part.id,
        ];

        setHairDomDiagnostics({
          partId: part.id,
          meshCount: mounted.length,
          headBone: headBone?.name ?? null,
          bindMode,
          error: mounted.length === 0 ? "HAIR_MESH_NOT_FOUND_IN_GLB" : null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setHairDomDiagnostics({
          partId: part.id,
          meshCount: 0,
          headBone: headBone?.name ?? null,
          bindMode: null,
          error: String(err?.message || err || "HAIR_GLB_LOAD_FAILED").slice(0, 160),
        });
      });

    return () => {
      cancelled = true;
      for (const obj of mounted) {
        obj.removeFromParent();
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const mat of mats) mat?.dispose?.();
      }
      mounted.length = 0;
      const ids = (hostRoot.userData.tmiFoundryPartIds as string[] | undefined)?.filter(
        (id) => id !== part.id,
      );
      hostRoot.userData.tmiFoundryPartIds = ids;
      // Clear diagnostics only if no other parts remain on this host.
      if (!ids?.length) {
        setHairDomDiagnostics({
          partId: null,
          meshCount: 0,
          headBone: null,
          bindMode: null,
          error: null,
        });
      }
    };
  }, [hostRoot, part.id, part.glbUrl, part.socketId, part.tintHex]);

  return null;
}

export function socketIdForFoundryPartCategory(slot: string | undefined): AvatarSocketId {
  if (slot === "hair") return "socket_head";
  if (slot === "face") return "socket_face";
  if (slot === "feet") return "socket_foot_r";
  return "socket_chest";
}
