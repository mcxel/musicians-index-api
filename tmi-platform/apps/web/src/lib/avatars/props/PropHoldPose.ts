/**
 * Procedural "raise the held prop" pose for AvatarRig/1.0.
 *
 * Why procedural: every body clip shipped in the room avatar GLBs (SitDown, SeatedIdle,
 * HoldProp_Idle, SeatedReact_Wave, ...) is motionless — 0.0° of arm rotation, measured
 * 2026-11-19. Until Anti-Gravity delivers a real RaiseProp clip, this overlay rotates the
 * existing UpperArm/LowerArm bones AFTER the mixer each frame. It never edits the skeleton,
 * bind pose, or the GLB; weight 0 leaves the animated pose untouched.
 */

import * as THREE from "three";

const _s = new THREE.Vector3();
const _e = new THREE.Vector3();
const _h = new THREE.Vector3();
const _c = new THREE.Vector3();
const _up = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _out = new THREE.Vector3();
const _cur = new THREE.Vector3();
const _tgt = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _qw = new THREE.Quaternion();
const _qp = new THREE.Quaternion();
const _qi = new THREE.Quaternion();
const _qr = new THREE.Quaternion();

function rotateBoneToward(bone: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3, weight: number) {
  _q.setFromUnitVectors(from, to);
  _qi.identity().slerp(_q, weight);
  bone.getWorldQuaternion(_qw);
  _qw.premultiply(_qi);
  if (bone.parent) {
    bone.parent.getWorldQuaternion(_qp);
    _qw.premultiply(_qp.invert());
  }
  bone.quaternion.copy(_qw);
  bone.updateMatrixWorld(true);
}

export type ArmSide = "R" | "L";

/**
 * Raise the arm so the hand ends up above and slightly in front of the head.
 * Returns false (and changes nothing) when the rig lacks the AvatarRig/1.0 arm bones.
 */
export function applyRaisedArmPose(root: THREE.Object3D, weight: number, side: ArmSide = "R"): boolean {
  const w = Math.max(0, Math.min(1, weight));
  const upper = root.getObjectByName(`UpperArm_${side}`);
  const lower = root.getObjectByName(`LowerArm_${side}`);
  const hand = root.getObjectByName(`Hand_${side}`);
  const chest = root.getObjectByName("Chest") ?? root.getObjectByName("Spine_02");
  if (!upper || !lower || !hand || !chest) return false;
  if (w === 0) return true;

  root.updateMatrixWorld(true);
  root.getWorldQuaternion(_qr);
  _up.set(0, 1, 0).applyQuaternion(_qr);
  _fwd.set(0, 0, 1).applyQuaternion(_qr);
  upper.getWorldPosition(_s);
  chest.getWorldPosition(_c);
  // Outward = shoulder away from the chest, flattened to the avatar's horizontal plane.
  _out.subVectors(_s, _c);
  _out.addScaledVector(_up, -_out.dot(_up));
  if (_out.lengthSq() < 1e-8) _out.set(side === "R" ? -1 : 1, 0, 0).applyQuaternion(_qr);
  _out.normalize();

  // Upper arm: mostly up, a little out and forward.
  lower.getWorldPosition(_e);
  _cur.subVectors(_e, _s).normalize();
  _tgt.copy(_up).multiplyScalar(0.9).addScaledVector(_out, 0.32).addScaledVector(_fwd, 0.28).normalize();
  rotateBoneToward(upper, _cur, _tgt, w);

  // Forearm: nearly straight, tipped slightly forward toward the stage.
  lower.getWorldPosition(_e);
  hand.getWorldPosition(_h);
  _cur.subVectors(_h, _e).normalize();
  _tgt.copy(_up).multiplyScalar(0.92).addScaledVector(_out, 0.12).addScaledVector(_fwd, 0.38).normalize();
  rotateBoneToward(lower, _cur, _tgt, w);
  return true;
}

/**
 * Keep a hand-held prop pointing "up" in the avatar's frame (a flame must burn upward),
 * blending from the hand's own orientation (weight 0) to fully upright (weight 1).
 * `prop` must be a child of the hand bone.
 */
export function orientHeldPropUpright(prop: THREE.Object3D, avatarRoot: THREE.Object3D, weight: number): void {
  const hand = prop.parent;
  if (!hand) return;
  const w = Math.max(0, Math.min(1, weight));
  avatarRoot.getWorldQuaternion(_qr);
  hand.getWorldQuaternion(_qw);
  // local = handWorld^-1 * avatarWorld  → prop axes match the avatar's axes.
  _q.copy(_qw).invert().multiply(_qr);
  _qi.identity().slerp(_q, w);
  prop.quaternion.copy(_qi);
  prop.updateMatrixWorld(true);
}

/** Smoothly ease a 0..1 weight toward its target (frame-rate independent). */
export function stepPoseWeight(current: number, target: number, deltaSeconds: number, rate = 6): number {
  const k = 1 - Math.exp(-rate * Math.max(0, deltaSeconds));
  return current + (target - current) * k;
}

/** Deterministic flame flicker from the shared event seed (same on every viewer). */
export function flameFlicker(seed: number, tSeconds: number): number {
  const p = (seed % 997) / 997;
  return 0.78 + 0.14 * Math.sin(tSeconds * 17.3 + p * 6.283) + 0.08 * Math.sin(tSeconds * 31.7 + p * 12.9);
}
