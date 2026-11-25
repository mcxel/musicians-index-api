/**
 * VideoPanelSpatialContract — how people are PRESENT in each room type, and how live video
 * panels move in Lounges and Performer Lobbies.
 *
 * OWNER RULE (2026-11-19): in Lounges and Performer Lobbies EVERYONE — fans and performers —
 * is a live video panel. No avatars there. Avatars exist only in Fan Avatar Lobbies and
 * avatar-enabled venues (where performers still appear on real video, Rule 26).
 *
 * Panel movement is presentation/spatial state ONLY: it never remounts, renegotiates or
 * reconnects the WebRTC stream (asserted by `restartsMedia: false` on every transition).
 */

export type RoomKind = "LOUNGE" | "PERFORMER_LOBBY" | "FAN_AVATAR_LOBBY" | "AUDITORIUM";
export type PresenceMode = "VIDEO_PANEL" | "AVATAR";

/** One rule for every surface; the renderer and HUD must ask this, never decide locally. */
export function presenceModeFor(room: RoomKind, platformRole: string): PresenceMode {
  if (room === "LOUNGE" || room === "PERFORMER_LOBBY") return "VIDEO_PANEL";
  const r = platformRole.toUpperCase();
  if (r === "PERFORMER" || r === "BAND") return "VIDEO_PANEL";
  return "AVATAR";
}

export type PanelMode = "FREE" | "FOLLOW" | "DOCKED" | "CIRCLE";

export type PanelAnchor = { anchorId: string; pos: [number, number]; facing: number; kind: "BOOTH" | "SCREEN" | "WALL" | "STAGE_SIDE" };
export type KeepOut = { id: string; min: [number, number]; max: [number, number] }; // doors, stage, walkways
export type PrivacyZone = { zoneId: string; min: [number, number]; max: [number, number]; members: readonly string[] };

export type PanelState = {
  participantId: string;
  mode: PanelMode;
  pos: [number, number];
  /** Radians on the floor plane. */
  facing: number;
  dockedAt: string | null;
  circleId: string | null;
  speaking: boolean;
  restartsMedia: false;
};

export const PANEL_RADIUS_M = 0.45;
export const MIN_PANEL_GAP_M = 0.15;

const inBox = (p: [number, number], b: { min: [number, number]; max: [number, number] }) =>
  p[0] >= b.min[0] && p[0] <= b.max[0] && p[1] >= b.min[1] && p[1] <= b.max[1];

/** Push a requested position out of keep-out areas (doors, stage) to the nearest edge. */
export function clearOfKeepOuts(p: [number, number], keepOuts: readonly KeepOut[]): [number, number] {
  let q: [number, number] = [p[0], p[1]];
  for (const k of keepOuts) {
    const min: [number, number] = [k.min[0] - PANEL_RADIUS_M, k.min[1] - PANEL_RADIUS_M];
    const max: [number, number] = [k.max[0] + PANEL_RADIUS_M, k.max[1] + PANEL_RADIUS_M];
    if (!inBox(q, { min, max })) continue;
    const opts: Array<[number, [number, number]]> = [
      [q[0] - min[0], [min[0], q[1]]], [max[0] - q[0], [max[0], q[1]]],
      [q[1] - min[1], [q[0], min[1]]], [max[1] - q[1], [q[0], max[1]]],
    ];
    q = opts.sort((a, b) => a[0] - b[0])[0]![1];
  }
  return q;
}

/** Separate overlapping panels (iterative relaxation until no overlap remains; deterministic). Optional per-panel radius. */
export function separatePanels(panels: readonly PanelState[], maxIterations = 64, radiusOf: (participantId: string) => number = () => PANEL_RADIUS_M): PanelState[] {
  const out = panels.map((p) => ({ ...p, pos: [...p.pos] as [number, number] }));
  for (let it = 0; it < maxIterations; it++) {
    let moved = false;
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i]!;
        const b = out[j]!;
        if (a.mode === "DOCKED" && b.mode === "DOCKED") continue;
        let dx = b.pos[0] - a.pos[0];
        let dz = b.pos[1] - a.pos[1];
        let d = Math.hypot(dx, dz);
        // Size-aware: an enlarged device (group presence) needs more room than a compact one.
        const min = radiusOf(a.participantId) + radiusOf(b.participantId) + MIN_PANEL_GAP_M;
        if (d >= min - 1e-9) continue;
        moved = true;
        if (d < 1e-6) { dx = 1; dz = 0; d = 1e-6; }
        const push = (min - d) / 2 + 1e-6;
        const ux = dx / Math.max(d, 1e-6);
        const uz = dz / Math.max(d, 1e-6);
        if (a.mode !== "DOCKED") a.pos = [a.pos[0] - ux * push, a.pos[1] - uz * push];
        if (b.mode !== "DOCKED") b.pos = [b.pos[0] + ux * push, b.pos[1] + uz * push];
      }
    }
    if (!moved) break;
  }
  return out;
}

/** Arrange a conversation circle: evenly spaced, every panel turned toward the centre. */
export function arrangeConversationCircle(circleId: string, centre: [number, number], memberIds: readonly string[]): PanelState[] {
  const n = memberIds.length;
  const radius = Math.max(0.8, (n * (PANEL_RADIUS_M * 2 + MIN_PANEL_GAP_M)) / (2 * Math.PI));
  return [...memberIds].sort().map((id, i) => {
    const a = (2 * Math.PI * i) / Math.max(1, n);
    const pos: [number, number] = [centre[0] + radius * Math.cos(a), centre[1] + radius * Math.sin(a)];
    return { participantId: id, mode: "CIRCLE", pos, facing: Math.atan2(centre[1] - pos[1], centre[0] - pos[0]), dockedAt: null, circleId, speaking: false, restartsMedia: false };
  });
}

export function dockPanel(p: PanelState, anchor: PanelAnchor): PanelState {
  return { ...p, mode: "DOCKED", pos: [...anchor.pos], facing: anchor.facing, dockedAt: anchor.anchorId, circleId: null, restartsMedia: false };
}

/** Follow-me: trail the leader at a polite distance, never overlapping them. */
export function followTarget(p: PanelState, leader: { pos: [number, number]; facing: number }, distance = 1.1): PanelState {
  const pos: [number, number] = [leader.pos[0] - Math.cos(leader.facing) * distance, leader.pos[1] - Math.sin(leader.facing) * distance];
  return { ...p, mode: "FOLLOW", pos, facing: leader.facing, dockedAt: null, restartsMedia: false };
}

/**
 * Who a listener can HEAR. Distance attenuation everywhere; inside a privacy zone only members
 * hear each other — walking close to a private conversation never exposes its audio.
 */
export function audioGain(listener: PanelState, speaker: PanelState, zones: readonly PrivacyZone[], falloffM = 6): number {
  if (listener.participantId === speaker.participantId) return 0;
  const zone = zones.find((z) => inBox(speaker.pos, z));
  if (zone && !zone.members.includes(listener.participantId)) return 0;
  const d = Math.hypot(listener.pos[0] - speaker.pos[0], listener.pos[1] - speaker.pos[1]);
  return Math.max(0, 1 - d / falloffM);
}

/** Speaker focus is presentation only (border/light), never a layout jump or media change. */
export function applySpeakerFocus(panels: readonly PanelState[], speakingIds: ReadonlySet<string>): PanelState[] {
  return panels.map((p) => ({ ...p, speaking: speakingIds.has(p.participantId), restartsMedia: false }));
}
