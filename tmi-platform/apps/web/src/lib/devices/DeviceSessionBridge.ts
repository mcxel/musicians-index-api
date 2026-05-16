/**
 * DeviceSessionBridge
 * Bridges the canonical web session to every connected app surface.
 * The website session is the source of truth. App surfaces receive
 * read-only projections of the session. Mutations go through the website.
 */

import type { DeviceClass } from "./DeviceCapabilityRegistry";

// ─── Session Types ────────────────────────────────────────────────────────────

export type SessionRole =
  | "fan"
  | "fan_teen"
  | "performer"
  | "performer_teen"
  | "venue"
  | "artist"
  | "host"
  | "admin"
  | "guest";

export type AgeClass = "minor" | "adult" | "unknown";

export interface WebSessionToken {
  /** Opaque session ID from the website auth layer */
  sessionId: string;
  userId: string;
  role: SessionRole;
  ageClass: AgeClass;
  guardianApproved: boolean;
  /** Unix ms expiry — app surfaces must re-handshake before this */
  expiresAt: number;
  /** Teen safety restrictions that travel with the session */
  teenRestrictions: TeenRestrictions;
  /** ISO 8601 */
  issuedAt: string;
}

export interface TeenRestrictions {
  active: boolean;
  blockDMs: boolean;
  blockVoiceRooms: boolean;
  blockVideoRooms: boolean;
  blockAdultSpaces: boolean;
  blockUnverifiedPerformerContact: boolean;
  requireGuardianForPurchase: boolean;
}

export interface DeviceSessionRecord {
  deviceId: string;
  deviceClass: DeviceClass;
  /** Projected (read-only) copy of the web session */
  session: WebSessionToken;
  connectedAt: number;
  lastHeartbeatAt: number;
  /** Whether this device's session projection is still valid */
  isActive: boolean;
}

export interface SessionProjection {
  userId: string;
  role: SessionRole;
  ageClass: AgeClass;
  guardianApproved: boolean;
  teenRestrictions: TeenRestrictions;
  expiresAt: number;
  /** The bridge-signed token devices use to authenticate API calls */
  bridgeToken: string;
}

// ─── Bridge ───────────────────────────────────────────────────────────────────

const DEFAULT_TEEN_RESTRICTIONS: TeenRestrictions = {
  active: true,
  blockDMs: true,
  blockVoiceRooms: true,
  blockVideoRooms: true,
  blockAdultSpaces: true,
  blockUnverifiedPerformerContact: true,
  requireGuardianForPurchase: true,
};

const ADULT_RESTRICTIONS: TeenRestrictions = {
  active: false,
  blockDMs: false,
  blockVoiceRooms: false,
  blockVideoRooms: false,
  blockAdultSpaces: false,
  blockUnverifiedPerformerContact: false,
  requireGuardianForPurchase: false,
};

export class DeviceSessionBridge {
  private static _instance: DeviceSessionBridge | null = null;
  private _webSession: WebSessionToken | null = null;
  private _devices: Map<string, DeviceSessionRecord> = new Map();
  private _listeners: Set<(record: DeviceSessionRecord) => void> = new Set();

  static getInstance(): DeviceSessionBridge {
    if (!DeviceSessionBridge._instance) {
      DeviceSessionBridge._instance = new DeviceSessionBridge();
    }
    return DeviceSessionBridge._instance;
  }

  // ── Web session management ─────────────────────────────────────────────────

  setWebSession(session: WebSessionToken): void {
    // Enforce teen restrictions: minor sessions always get full restrictions,
    // regardless of what the caller passes.
    const isMinor = session.ageClass === "minor" || session.role === "fan_teen" || session.role === "performer_teen";
    session.teenRestrictions = isMinor ? DEFAULT_TEEN_RESTRICTIONS : ADULT_RESTRICTIONS;
    this._webSession = session;

    // Re-project to all connected devices immediately
    for (const [deviceId, record] of this._devices.entries()) {
      if (record.isActive) {
        this._projectSessionToDevice(deviceId, record.deviceClass);
      }
    }
  }

  clearWebSession(): void {
    this._webSession = null;
    for (const record of this._devices.values()) {
      record.isActive = false;
    }
  }

  getWebSession(): WebSessionToken | null {
    return this._webSession;
  }

  isSessionValid(): boolean {
    if (!this._webSession) return false;
    return Date.now() < this._webSession.expiresAt;
  }

  // ── Device registration ────────────────────────────────────────────────────

  registerDevice(deviceId: string, deviceClass: DeviceClass): DeviceSessionRecord | null {
    if (!this._webSession || !this.isSessionValid()) return null;

    const session = this._projectSessionToDevice(deviceId, deviceClass);
    if (!session) return null;

    const record: DeviceSessionRecord = {
      deviceId,
      deviceClass,
      session: this._webSession,
      connectedAt: Date.now(),
      lastHeartbeatAt: Date.now(),
      isActive: true,
    };

    this._devices.set(deviceId, record);
    this._notifyListeners(record);
    return record;
  }

  unregisterDevice(deviceId: string): void {
    const record = this._devices.get(deviceId);
    if (record) {
      record.isActive = false;
      this._devices.set(deviceId, record);
    }
  }

  heartbeat(deviceId: string): boolean {
    const record = this._devices.get(deviceId);
    if (!record || !record.isActive) return false;
    if (!this.isSessionValid()) {
      record.isActive = false;
      return false;
    }
    record.lastHeartbeatAt = Date.now();
    return true;
  }

  getDevice(deviceId: string): DeviceSessionRecord | null {
    return this._devices.get(deviceId) ?? null;
  }

  getActiveDevices(): DeviceSessionRecord[] {
    return [...this._devices.values()].filter((d) => d.isActive);
  }

  // ── Session projection ────────────────────────────────────────────────────

  projectSession(deviceId: string): SessionProjection | null {
    const session = this._webSession;
    if (!session || !this.isSessionValid()) return null;

    return {
      userId: session.userId,
      role: session.role,
      ageClass: session.ageClass,
      guardianApproved: session.guardianApproved,
      teenRestrictions: session.teenRestrictions,
      expiresAt: session.expiresAt,
      bridgeToken: this._signBridgeToken(deviceId, session),
    };
  }

  private _projectSessionToDevice(deviceId: string, _deviceClass: DeviceClass): SessionProjection | null {
    return this.projectSession(deviceId);
  }

  private _signBridgeToken(deviceId: string, session: WebSessionToken): string {
    // Deterministic opaque token — replace with HMAC-SHA256 in the API layer.
    const raw = `${deviceId}:${session.sessionId}:${session.userId}:${session.expiresAt}`;
    return btoa(raw).replace(/=/g, "").substring(0, 48);
  }

  // ── Teen restriction enforcement ──────────────────────────────────────────

  /** Returns true only if the restriction is NOT active (safe to proceed). */
  checkTeenRestriction(
    deviceId: string,
    restriction: keyof Omit<TeenRestrictions, "active">,
  ): { allowed: boolean; reason: string } {
    const record = this._devices.get(deviceId);
    if (!record || !record.isActive) {
      return { allowed: false, reason: "device not registered" };
    }
    const t = record.session.teenRestrictions;
    if (!t.active) return { allowed: true, reason: "teen restrictions not active" };
    if (t[restriction]) {
      return { allowed: false, reason: `teen restriction: ${restriction} is blocked` };
    }
    return { allowed: true, reason: "restriction not triggered" };
  }

  // ── Listeners ─────────────────────────────────────────────────────────────

  onDeviceChange(cb: (record: DeviceSessionRecord) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _notifyListeners(record: DeviceSessionRecord): void {
    for (const cb of this._listeners) cb(record);
  }
}

export const deviceSessionBridge = DeviceSessionBridge.getInstance();
