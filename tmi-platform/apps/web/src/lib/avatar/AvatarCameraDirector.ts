/**
 * AvatarCameraDirector.ts — Canonical Tri-Mode & VR Avatar Camera & Input Controller
 *
 * Supported Perspectives:
 * 1. FIRST_PERSON (1P / POV): Eye-level view from avatar head; head/hair meshes hidden via mask.
 * 2. SECOND_PERSON_FRONT (2P / Front View): Facing the avatar from the front for dramatic reactions.
 * 3. THIRD_PERSON_FOLLOW (3P / Follow View): Spring-arm follow camera behind/above avatar with wall collision avoidance.
 * 4. VR: 6-DOF spatial headset tracking with controller gestures, snap-turn, and shared canonical physics.
 *
 * Laws:
 * - Live switching across modes without reloading, respawning, losing seat position, or breaking state.
 * - Camera never clips through geometry: Spring-arm smoothly pulls inward when backed against obstacles.
 * - Works seamlessly across Free-Roam and Seated Audience states.
 * - Unified input controller: Keyboard/Mouse, Touch, Gamepad (DualSense/Xbox), and VR controllers.
 */

import {
  AvatarSpatialCollisionEngine,
  type CollisionAABB,
  type Vector3,
} from "./AvatarSpatialCollisionEngine";
import { type FacialAnchors } from "./AvatarFaceIdentityContract";

export type AvatarCameraMode =
  | "FIRST_PERSON"
  | "SECOND_PERSON_FRONT"
  | "THIRD_PERSON_FOLLOW"
  | "VR";

export interface CameraTransform {
  position: Vector3;
  target: Vector3;
  fovDegrees: number;
  headMeshVisible: boolean;
  bodyMeshVisible: boolean;
  activeMode: AvatarCameraMode;
  armDistance: number;
}

export interface GamepadInputState {
  moveX: number; // Left stick [-1.0, 1.0]
  moveZ: number; // Left stick [-1.0, 1.0]
  lookYaw: number; // Right stick horizontal
  lookPitch: number; // Right stick vertical
  cycleCameraButtonPressed: boolean; // Triangle / Y / Key 'C'
  interactButtonPressed: boolean; // Cross / A / Key 'E'
  emoteButtonPressed: boolean; // Circle / B / Key 'R'
  recenterButtonPressed: boolean; // R3 / Thumb click / Space
}

export interface VrTrackingFrame {
  headPosition: Vector3;
  headRotationEuler: Vector3;
  leftHandPosition?: Vector3;
  rightHandPosition?: Vector3;
  isSeatedOrigin: boolean;
  snapTurnAngleDegrees: number;
}

export class AvatarCameraDirector {
  private currentMode: AvatarCameraMode = "THIRD_PERSON_FOLLOW";
  private yawDegrees = 0;
  private pitchDegrees = 10;
  private minArmDistance = 0.5;
  private defaultThirdPersonArm = 3.2;
  private defaultSecondPersonArm = 2.4;
  private currentArmDistance = 3.2;

  // VR Tracking state
  private vrOrigin: Vector3 = { x: 0, y: 0, z: 0 };
  private vrYawOffsetDegrees = 0;

  // Jumbotron Focus & Look-Up state (zero avatar/session/media reset)
  private isJumbotronFocused = false;
  private savedStagePitch = 10;
  private savedStageYaw = 0;
  private lastUpInputTimestampMs = 0;
  private lastTapTimestampMs = 0;

  public static readonly CAMERA_CYCLE_ORDER: AvatarCameraMode[] = [
    "FIRST_PERSON",
    "SECOND_PERSON_FRONT",
    "THIRD_PERSON_FOLLOW",
    "VR",
  ];

  constructor(
    public readonly collisionEngine?: AvatarSpatialCollisionEngine,
  ) {}

  /**
   * Sets the active camera mode directly.
   */
  public setMode(mode: AvatarCameraMode): void {
    this.currentMode = mode;
  }

  public getMode(): AvatarCameraMode {
    return this.currentMode;
  }

  public getPitch(): number {
    return this.pitchDegrees;
  }

  public getYaw(): number {
    return this.yawDegrees;
  }

  /**
   * Cycles to the next camera perspective live without restarting scene or losing state.
   */
  public cycleCameraMode(): AvatarCameraMode {
    const idx = AvatarCameraDirector.CAMERA_CYCLE_ORDER.indexOf(this.currentMode);
    const nextIdx = (idx + 1) % AvatarCameraDirector.CAMERA_CYCLE_ORDER.length;
    this.currentMode = AvatarCameraDirector.CAMERA_CYCLE_ORDER[nextIdx];
    return this.currentMode;
  }

  /**
   * Adjusts orbit look orientation from mouse, touch, or gamepad right-stick.
   */
  public adjustLook(deltaYaw: number, deltaPitch: number): void {
    this.yawDegrees = (this.yawDegrees + deltaYaw) % 360;
    // Allow looking upward up to 75 degrees to observe the Jumbotron naturally
    this.pitchDegrees = Math.max(-30, Math.min(75, this.pitchDegrees + deltaPitch));
    if (this.isJumbotronFocused && Math.abs(deltaPitch) > 5) {
      // User manual look breaks focus smoothly back to free look
      this.isJumbotronFocused = false;
    }
  }

  /**
   * Look Up: increments pitch upward to view high-mounted venue elements (Jumbotron/Disco Orb/Ceiling).
   */
  public lookUp(amountDegrees = 15): void {
    this.adjustLook(0, amountDegrees);
  }

  /**
   * Jumbotron Focus: directly frames the Jumbotron using actual 3D world coordinates.
   * Aims the existing camera at the best visible Jumbotron face from the user's current seat or avatar position.
   * Preserves previous stage orientation so returnToStageView() cleanly restores it.
   * Zero teleport, zero avatar reset, zero session reset, zero media player reload.
   */
  public focusJumbotron(
    targetElevation = 45,
    userWorldPosition?: [number, number, number],
    jumbotronWorldCenter?: [number, number, number]
  ): void {
    if (!this.isJumbotronFocused) {
      this.savedStagePitch = this.pitchDegrees;
      this.savedStageYaw = this.yawDegrees;
      this.isJumbotronFocused = true;
    }

    if (userWorldPosition && jumbotronWorldCenter) {
      const dx = jumbotronWorldCenter[0] - userWorldPosition[0];
      const dy = jumbotronWorldCenter[1] - (userWorldPosition[1] + 1.65);
      const dz = jumbotronWorldCenter[2] - userWorldPosition[2];
      const horizontalDist = Math.sqrt(dx * dx + dz * dz);

      // Aim yaw directly at center-hung jumbotron
      const targetYaw = (Math.atan2(dx, dz) * 180) / Math.PI;
      const targetPitch = (Math.atan2(dy, Math.max(0.5, horizontalDist)) * 180) / Math.PI;

      this.yawDegrees = (targetYaw + 360) % 360;
      this.pitchDegrees = Math.max(15, Math.min(75, targetPitch));
    } else {
      this.pitchDegrees = Math.max(35, Math.min(75, targetElevation));
    }
  }

  /**
   * Return to Stage View: seamlessly restores the original stage perspective.
   */
  public returnToStageView(): void {
    if (this.isJumbotronFocused) {
      this.pitchDegrees = this.savedStagePitch;
      this.yawDegrees = this.savedStageYaw;
      this.isJumbotronFocused = false;
    }
  }

  public toggleJumbotronFocus(): boolean {
    if (this.isJumbotronFocused) {
      this.returnToStageView();
    } else {
      this.focusJumbotron();
    }
    return this.isJumbotronFocused;
  }

  public isFocusedOnJumbotron(): boolean {
    return this.isJumbotronFocused;
  }

  /**
   * Handles TV/D-Pad navigation:
   * UP: single UP tilts upward; DOUBLE-UP within 400ms triggers JUMBOTRON FOCUS.
   * DOWN: if focused on Jumbotron, returns to stage view.
   */
  public handleTvDpadInput(direction: "UP" | "DOWN" | "LEFT" | "RIGHT", nowMs = Date.now()): {
    actionTaken: "TILT_UP" | "FOCUS_JUMBOTRON" | "RETURN_STAGE" | "PAN" | "NONE";
  } {
    if (direction === "UP") {
      const delta = nowMs - this.lastUpInputTimestampMs;
      this.lastUpInputTimestampMs = nowMs;
      if (delta > 50 && delta < 400) {
        this.focusJumbotron();
        return { actionTaken: "FOCUS_JUMBOTRON" };
      }
      this.lookUp(15);
      return { actionTaken: "TILT_UP" };
    }

    if (direction === "DOWN") {
      if (this.isJumbotronFocused) {
        this.returnToStageView();
        return { actionTaken: "RETURN_STAGE" };
      }
      this.adjustLook(0, -15);
      return { actionTaken: "PAN" };
    }

    if (direction === "LEFT") {
      this.adjustLook(-20, 0);
      return { actionTaken: "PAN" };
    }

    if (direction === "RIGHT") {
      this.adjustLook(20, 0);
      return { actionTaken: "PAN" };
    }

    return { actionTaken: "NONE" };
  }

  /**
   * Handles touch/mouse gestures:
   * - SWIPE_UP: tilts upward
   * - DOUBLE_TAP / DOUBLE_CLICK: toggles Jumbotron focus
   */
  public handleGestureInput(gesture: "SWIPE_UP" | "DOUBLE_TAP" | "DOUBLE_CLICK" | "STICK_LOOK_UP"): {
    jumbotronFocused: boolean;
  } {
    switch (gesture) {
      case "SWIPE_UP":
      case "STICK_LOOK_UP":
        this.lookUp(20);
        break;
      case "DOUBLE_TAP":
      case "DOUBLE_CLICK":
        this.toggleJumbotronFocus();
        break;
    }
    return { jumbotronFocused: this.isJumbotronFocused };
  }

  /**
   * Computes the final camera transform given avatar position, seated state, and obstacles.
   */
  public computeCamera(
    avatarPosition: Vector3,
    isSeated: boolean,
    obstacles: CollisionAABB[] = [],
    vrTracking?: VrTrackingFrame,
    facialAnchors?: FacialAnchors,
  ): CameraTransform {
    const baseEyeHeight = facialAnchors ? facialAnchors.eyeCenter[1] : 1.62;
    const eyeHeight = isSeated ? baseEyeHeight - 0.57 : baseEyeHeight;
    const eyeZ = facialAnchors ? facialAnchors.eyeCenter[2] : 0;

    const anchor: Vector3 = {
      x: avatarPosition.x,
      y: avatarPosition.y + eyeHeight,
      z: avatarPosition.z + eyeZ,
    };

    switch (this.currentMode) {
      case "FIRST_PERSON": {
        // 1P: Camera placed exactly at avatar head / eyeline
        const rad = (this.yawDegrees * Math.PI) / 180;
        const target: Vector3 = {
          x: anchor.x + Math.sin(rad) * 10,
          y: anchor.y - Math.sin((this.pitchDegrees * Math.PI) / 180) * 10,
          z: anchor.z + Math.cos(rad) * 10,
        };

        return {
          position: { ...anchor },
          target,
          fovDegrees: 75,
          headMeshVisible: false, // Prevents own head/hair from obstructing view
          bodyMeshVisible: true,
          activeMode: "FIRST_PERSON",
          armDistance: 0,
        };
      }

      case "SECOND_PERSON_FRONT": {
        // 2P: Front-facing camera looking directly at the avatar's face/body
        const idealDistance = isSeated ? 1.4 : this.defaultSecondPersonArm;
        const rad = (this.yawDegrees * Math.PI) / 180;

        // Position placed in front of avatar (+Z forward relative to yaw)
        const idealPos: Vector3 = {
          x: anchor.x + Math.sin(rad) * idealDistance,
          y: anchor.y + 0.15,
          z: anchor.z + Math.cos(rad) * idealDistance,
        };

        // Spring-arm collision detection: pull closer if front wall/chair encroaches
        const resolvedDistance = this.resolveSpringArmCollision(
          anchor,
          idealPos,
          idealDistance,
          obstacles,
        );

        const clampedPos: Vector3 = {
          x: anchor.x + (Math.sin(rad) * resolvedDistance),
          y: anchor.y + 0.15,
          z: anchor.z + (Math.cos(rad) * resolvedDistance),
        };

        return {
          position: clampedPos,
          target: { x: anchor.x, y: anchor.y - 0.1, z: anchor.z },
          fovDegrees: 55,
          headMeshVisible: true,
          bodyMeshVisible: true,
          activeMode: "SECOND_PERSON_FRONT",
          armDistance: resolvedDistance,
        };
      }

      case "THIRD_PERSON_FOLLOW": {
        // 3P: Follow camera behind and above avatar
        const idealDistance = isSeated ? 2.2 : this.defaultThirdPersonArm;
        const rad = (this.yawDegrees * Math.PI) / 180;
        const pitchRad = (this.pitchDegrees * Math.PI) / 180;

        // Position placed behind avatar (-Z behind relative to yaw)
        const idealPos: Vector3 = {
          x: anchor.x - Math.sin(rad) * Math.cos(pitchRad) * idealDistance,
          y: anchor.y + Math.sin(pitchRad) * idealDistance + 0.35,
          z: anchor.z - Math.cos(rad) * Math.cos(pitchRad) * idealDistance,
        };

        // Spring-arm collision detection: pull closer if back wall encroaches
        const resolvedDistance = this.resolveSpringArmCollision(
          anchor,
          idealPos,
          idealDistance,
          obstacles,
        );

        const clampedPos: Vector3 = {
          x: anchor.x - Math.sin(rad) * Math.cos(pitchRad) * resolvedDistance,
          y: anchor.y + Math.sin(pitchRad) * resolvedDistance + 0.35,
          z: anchor.z - Math.cos(rad) * Math.cos(pitchRad) * resolvedDistance,
        };

        return {
          position: clampedPos,
          target: { x: anchor.x, y: anchor.y, z: anchor.z },
          fovDegrees: 60,
          headMeshVisible: true,
          bodyMeshVisible: true,
          activeMode: "THIRD_PERSON_FOLLOW",
          armDistance: resolvedDistance,
        };
      }

      case "VR": {
        // VR: 6-DOF spatial headset tracking with recenter support
        const headOffset = vrTracking?.headPosition ?? { x: 0, y: 0, z: 0 };
        const totalYaw = this.vrYawOffsetDegrees + (vrTracking?.snapTurnAngleDegrees ?? 0);
        const rad = (totalYaw * Math.PI) / 180;

        const vrCameraPos: Vector3 = {
          x: anchor.x + headOffset.x + this.vrOrigin.x,
          y: anchor.y + headOffset.y + this.vrOrigin.y,
          z: anchor.z + headOffset.z + this.vrOrigin.z,
        };

        const target: Vector3 = {
          x: vrCameraPos.x + Math.sin(rad) * 10,
          y: vrCameraPos.y,
          z: vrCameraPos.z + Math.cos(rad) * 10,
        };

        return {
          position: vrCameraPos,
          target,
          fovDegrees: 95,
          headMeshVisible: false, // 1P VR hides head to avoid self-clipping
          bodyMeshVisible: true,
          activeMode: "VR",
          armDistance: 0,
        };
      }
    }
  }

  /**
   * Spring-Arm Collision Solver:
   * Prevents camera from passing through walls, furniture, or chairs.
   * If obstacle is between anchor and ideal camera position, pulls camera inward.
   */
  private resolveSpringArmCollision(
    anchor: Vector3,
    idealPos: Vector3,
    maxDistance: number,
    obstacles: CollisionAABB[],
  ): number {
    let closestDistance = maxDistance;

    for (const obs of obstacles) {
      // Line-segment to AABB intersection check along camera arm
      const numSteps = 10;
      for (let s = 1; s <= numSteps; s++) {
        const fraction = s / numSteps;
        const testX = anchor.x + (idealPos.x - anchor.x) * fraction;
        const testZ = anchor.z + (idealPos.z - anchor.z) * fraction;

        if (
          testX >= obs.minX - 0.2 &&
          testX <= obs.maxX + 0.2 &&
          testZ >= obs.minZ - 0.2 &&
          testZ <= obs.maxZ + 0.2
        ) {
          const hitDist = Math.max(this.minArmDistance, fraction * maxDistance - 0.25);
          if (hitDist < closestDistance) {
            closestDistance = hitDist;
          }
          break;
        }
      }
    }

    return closestDistance;
  }

  /**
   * VR Recenter: resets origin offset to align headset with avatar anchor.
   */
  public recenterVr(currentHeadPos: Vector3): void {
    this.vrOrigin = {
      x: -currentHeadPos.x,
      y: -currentHeadPos.y,
      z: -currentHeadPos.z,
    };
  }

  /**
   * VR Snap Turn: rotates view incrementally (e.g. 30° or 45° for comfort).
   */
  public vrSnapTurn(angleDegrees = 45): void {
    this.vrYawOffsetDegrees = (this.vrYawOffsetDegrees + angleDegrees) % 360;
  }

  /**
   * Processes standard gamepad input frames.
   */
  public handleGamepadInput(
    input: GamepadInputState,
  ): { cameraCycled: boolean; moveIntent: Vector3; requestedReaction?: "wave" | "clap" | "hype" } {
    let cameraCycled = false;
    if (input.cycleCameraButtonPressed) {
      this.cycleCameraMode();
      cameraCycled = true;
    }

    if (Math.abs(input.lookYaw) > 0.1 || Math.abs(input.lookPitch) > 0.1) {
      this.adjustLook(input.lookYaw * 3.0, input.lookPitch * -2.0);
    }

    const moveIntent: Vector3 = {
      x: input.moveX,
      y: 0,
      z: input.moveZ,
    };

    let requestedReaction: "wave" | "clap" | "hype" | undefined;
    if (input.emoteButtonPressed) {
      requestedReaction = "hype";
    }

    return { cameraCycled, moveIntent, requestedReaction };
  }
}
