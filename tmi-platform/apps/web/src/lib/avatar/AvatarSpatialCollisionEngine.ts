/**
 * AvatarSpatialCollisionEngine.ts — Canonical Avatar Spatial Collision & Physics Engine
 *
 * Implements:
 * - Capsule-based avatar collision bounds (height: 1.7m, radius: 0.3m).
 * - Context-sensitive personal space policy (configurable, never rigidly hardcoded):
 *     - LOBBY_FREE_ROAM: 1.2m
 *     - CROWDED_AISLE: 0.6m
 *     - SEATED_ROW: 0.45m
 *     - DANCE_FLOOR: 1.5m
 * - World-space obstacle avoidance (walls, chairs, furniture, stage perimeter).
 * - Seated avatar protection (walking avatars cannot pass through seated avatars;
 *   seated avatars do not collide with their own chair).
 */

export type SpatialContextPolicy =
  | "LOBBY_FREE_ROAM"
  | "CROWDED_AISLE"
  | "SEATED_ROW"
  | "DANCE_FLOOR";

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface CollisionAABB {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  isChair?: boolean;
}

export interface AvatarBodyCollider {
  userId: string;
  position: Vector3;
  capsuleRadiusMeters: number; // Canonical: 0.3m
  capsuleHeightMeters: number; // Canonical: 1.7m
  isSeated: boolean;
  seatId?: string;
  contextPolicy: SpatialContextPolicy;
}

export const CONTEXT_PERSONAL_SPACE_METERS: Record<SpatialContextPolicy, number> = {
  LOBBY_FREE_ROAM: 1.2,
  CROWDED_AISLE: 0.6,
  SEATED_ROW: 0.45,
  DANCE_FLOOR: 1.5,
};

export class AvatarSpatialCollisionEngine {
  private avatars = new Map<string, AvatarBodyCollider>();
  private obstacles: CollisionAABB[] = [];
  public static readonly ARENA_BOUNDS = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };

  constructor() {}

  public registerAvatar(
    userId: string,
    initialPos: Vector3,
    contextPolicy: SpatialContextPolicy = "LOBBY_FREE_ROAM"
  ): AvatarBodyCollider {
    const collider: AvatarBodyCollider = {
      userId,
      position: initialPos,
      capsuleRadiusMeters: 0.3,
      capsuleHeightMeters: 1.7,
      isSeated: false,
      contextPolicy,
    };
    this.avatars.set(userId, collider);
    return collider;
  }

  public unregisterAvatar(userId: string): void {
    this.avatars.delete(userId);
  }

  public addObstacle(obstacle: CollisionAABB): void {
    this.obstacles.push(obstacle);
  }

  public clearObstacles(): void {
    this.obstacles = [];
  }

  public setAvatarSeated(userId: string, isSeated: boolean, seatId?: string): void {
    const av = this.avatars.get(userId);
    if (!av) return;
    av.isSeated = isSeated;
    av.seatId = seatId;
    if (isSeated) {
      av.contextPolicy = "SEATED_ROW";
    } else if (av.contextPolicy === "SEATED_ROW") {
      av.contextPolicy = "LOBBY_FREE_ROAM";
    }
  }

  /**
   * Resolves proposed movement for an avatar against:
   * 1. Room / arena boundaries.
   * 2. World obstacles (walls, furniture, chairs).
   * 3. Other avatars with context-sensitive personal space.
   */
  public resolveMovement(
    userId: string,
    target: Vector3
  ): { allowed: boolean; resolvedPosition: Vector3; collisionReason?: string } {
    const self = this.avatars.get(userId);
    if (!self) {
      return { allowed: false, resolvedPosition: target, collisionReason: "Avatar not found" };
    }

    if (self.isSeated) {
      // Seated avatars cannot move until standing up
      return {
        allowed: false,
        resolvedPosition: { ...self.position },
        collisionReason: "Avatar is seated",
      };
    }

    // 1. Arena Boundary Clamping
    let clampedX = Math.max(
      AvatarSpatialCollisionEngine.ARENA_BOUNDS.minX + self.capsuleRadiusMeters,
      Math.min(AvatarSpatialCollisionEngine.ARENA_BOUNDS.maxX - self.capsuleRadiusMeters, target.x)
    );
    let clampedZ = Math.max(
      AvatarSpatialCollisionEngine.ARENA_BOUNDS.minZ + self.capsuleRadiusMeters,
      Math.min(AvatarSpatialCollisionEngine.ARENA_BOUNDS.maxZ - self.capsuleRadiusMeters, target.z)
    );

    // 2. Obstacle Collisions
    for (const obs of this.obstacles) {
      if (
        clampedX + self.capsuleRadiusMeters >= obs.minX &&
        clampedX - self.capsuleRadiusMeters <= obs.maxX &&
        clampedZ + self.capsuleRadiusMeters >= obs.minZ &&
        clampedZ - self.capsuleRadiusMeters <= obs.maxZ
      ) {
        // Collision detected with obstacle
        return {
          allowed: false,
          resolvedPosition: { ...self.position },
          collisionReason: `Collision with obstacle ${obs.id}`,
        };
      }
    }

    // 3. Avatar-to-Avatar Collision & Context-Sensitive Personal Space
    const selfSpace = CONTEXT_PERSONAL_SPACE_METERS[self.contextPolicy];

    for (const [otherId, other] of this.avatars) {
      if (otherId === userId) continue;

      const dx = clampedX - other.position.x;
      const dz = clampedZ - other.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Other avatar's personal space requirement
      const otherSpace = CONTEXT_PERSONAL_SPACE_METERS[other.contextPolicy];
      const minAllowed = (selfSpace + otherSpace) / 2;

      if (dist < minAllowed) {
        return {
          allowed: false,
          resolvedPosition: { ...self.position },
          collisionReason: `Personal space collision with avatar ${otherId}`,
        };
      }
    }

    self.position = { x: clampedX, y: target.y, z: clampedZ };
    return { allowed: true, resolvedPosition: { ...self.position } };
  }

  public getAvatar(userId: string): AvatarBodyCollider | undefined {
    return this.avatars.get(userId);
  }
}
