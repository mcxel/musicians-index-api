"use client";

/**
 * Mount a held prop GLB onto the avatar's real hand bone (socket_primary_hand → Hand_R)
 * and drive it from the shared room prop event: raise arm → prop in hand → ignite →
 * flicker → lower → put away. Runs inside the existing AvatarRig; no second renderer.
 *
 * Frame order matters: the pose overlay must run AFTER the animation mixer, so the
 * parent (CertifiedAvatarGlbMesh) calls the registered step right after mixer.update.
 *
 * PLACEHOLDER assets render only when placeholderPropsEnabled() (off in production builds).
 * Diagnostics go on the nearest `[data-seat-avatar-rig]` / `[data-avatar-viewer]` DOM node,
 * never on R3F hosts.
 */

import { useEffect, useRef, type MutableRefObject } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { loadFoundryGlbBundle } from "@/components/3d/AvatarLobbyCanvas";
import { resolveSocketBoneCandidates } from "@/lib/avatars/AvatarSocketSystem";
import { heldPropPolicy, placeholderPropsEnabled } from "@/lib/live/props/RoomPropEventModel";
import {
  applyRaisedArmPose,
  flameFlicker,
  orientHeldPropUpright,
  stepPoseWeight,
} from "@/lib/avatars/props/PropHoldPose";

/** What the avatar is holding right now (already folded from the shared event log). */
export type HeldPropRenderState = {
  propId: string;
  eventId: string;
  seed: number;
  /** Local clock (ms) when the activation ends — server time already offset by the caller. */
  endsAtLocalMs: number;
};

export type PostMixerStep = (deltaSeconds: number) => void;

const GRIP_OFFSET = new THREE.Vector3(0, 0.06, 0.02); // palm centre along the Hand_R bone

function findHandBone(root: THREE.Object3D): THREE.Object3D | null {
  for (const name of resolveSocketBoneCandidates("biped", "socket_primary_hand")) {
    const b = root.getObjectByName(name);
    if (b) return b;
  }
  return null;
}

function diagHost(gl: THREE.WebGLRenderer): Element | null {
  const el = gl.domElement as HTMLElement | undefined;
  return el?.closest?.("[data-seat-avatar-rig]") ?? el?.closest?.("[data-avatar-viewer]") ?? null;
}

export function HeldPropMount({
  hostRoot,
  heldProp,
  postMixerRef,
}: {
  hostRoot: THREE.Object3D;
  heldProp: HeldPropRenderState | null;
  postMixerRef: MutableRefObject<PostMixerStep | null>;
}) {
  const { gl } = useThree();
  const propId = heldProp?.propId ?? null;
  const policy = propId ? heldPropPolicy(propId) : null;
  const renderable = Boolean(policy && (!policy.placeholder || placeholderPropsEnabled()));

  const groupRef = useRef<THREE.Group | null>(null);
  const flameRef = useRef<THREE.Object3D | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
  const weightRef = useRef(0);
  const stateRef = useRef(heldProp);
  stateRef.current = heldProp;
  const tRef = useRef(0);

  // Load + attach the GLB to the hand bone. Re-attaches only when the prop asset changes.
  useEffect(() => {
    if (!renderable || !policy) return;
    const hand = findHandBone(hostRoot);
    const host = diagHost(gl);
    if (!hand) {
      host?.setAttribute("data-held-prop-error", "HAND_BONE_NOT_FOUND");
      return;
    }
    let cancelled = false;
    const group = new THREE.Group();
    group.name = `TMI_HeldProp_${policy.assetId}`;
    group.position.copy(GRIP_OFFSET);
    group.visible = false;
    hand.add(group);
    groupRef.current = group;

    loadFoundryGlbBundle(policy.glbUrl)
      .then((bundle) => {
        if (cancelled) return;
        const model = cloneSkinned(bundle.scene) as THREE.Object3D;
        model.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.frustumCulled = false;
            m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
          }
        });
        for (const n of policy.templateNodes ?? []) {
          const t = model.getObjectByName(n);
          if (t) t.visible = false;
        }
        group.add(model);
        const flame = policy.effectNode ? model.getObjectByName(policy.effectNode) ?? null : null;
        flameRef.current = flame;
        if (flame) {
          flame.visible = false;
          const light = new THREE.PointLight(policy.lightColor, 0, 1.4, 2);
          light.position.copy(flame.position);
          flame.parent?.add(light);
          lightRef.current = light;
        }
        host?.setAttribute("data-held-prop-asset", policy.assetId);
        host?.setAttribute("data-held-prop-bone", hand.name);
        host?.setAttribute("data-held-prop-placeholder", policy.placeholder ? "1" : "0");
        host?.removeAttribute("data-held-prop-error");
      })
      .catch((err: unknown) => {
        host?.setAttribute("data-held-prop-error", String(err instanceof Error ? err.message : err).slice(0, 120));
      });

    return () => {
      cancelled = true;
      hand.remove(group);
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose());
      });
      groupRef.current = null;
      flameRef.current = null;
      lightRef.current = null;
      const h = diagHost(gl);
      ["data-held-prop-asset", "data-held-prop-bone", "data-held-prop-lit", "data-held-prop-event", "data-held-prop-raised"].forEach((a) =>
        h?.removeAttribute(a),
      );
    };
  }, [hostRoot, gl, renderable, policy]);

  // Per-frame step, called by the parent right after mixer.update.
  useEffect(() => {
    if (!renderable) {
      postMixerRef.current = null;
      return;
    }
    const head = hostRoot.getObjectByName("Head");
    const hand = findHandBone(hostRoot);
    const v = new THREE.Vector3();
    let lastDiag = "";
    postMixerRef.current = (dt) => {
      tRef.current += dt;
      const s = stateRef.current;
      const active = Boolean(s && Date.now() < s.endsAtLocalMs);
      weightRef.current = stepPoseWeight(weightRef.current, active ? 1 : 0, dt);
      const w = weightRef.current < 0.002 ? 0 : weightRef.current;
      if (w > 0) applyRaisedArmPose(hostRoot, w, "R");
      const group = groupRef.current;
      if (group) {
        group.visible = w > 0.05;
        orientHeldPropUpright(group, hostRoot, 1);
      }
      const lit = active && w > 0.85;
      const flame = flameRef.current;
      if (flame) {
        flame.visible = lit;
        const f = lit ? flameFlicker(s!.seed, tRef.current) : 0;
        if (policy?.effectKind === "glow") {
          // Glow sticks pulse; they do not flicker like a flame.
          flame.scale.setScalar(1);
        } else {
          flame.scale.set(0.9 + f * 0.15, 0.75 + f * 0.4, 0.9 + f * 0.15);
        }
        if (lightRef.current) lightRef.current.intensity = lit ? 2.2 * f : 0;
      }
      // Throttled DOM diagnostics (only when something changed).
      let raised = "0";
      if (hand && head && w > 0.5) raised = hand.getWorldPosition(v).y > head.getWorldPosition(new THREE.Vector3()).y ? "1" : "0";
      const diag = `${lit ? 1 : 0}|${s?.eventId ?? ""}|${raised}`;
      if (diag !== lastDiag) {
        lastDiag = diag;
        const h = diagHost(gl);
        h?.setAttribute("data-held-prop-lit", lit ? "1" : "0");
        h?.setAttribute("data-held-prop-raised", raised);
        if (s?.eventId) h?.setAttribute("data-held-prop-event", s.eventId);
      }
    };
    return () => {
      postMixerRef.current = null;
    };
  }, [hostRoot, gl, renderable, policy, postMixerRef]);

  return null;
}
