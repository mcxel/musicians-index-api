"use client";

/**
 * TMI AudienceScene — canvas-based audience renderer
 * Fan view: back-of-head rows looking at stage screen
 * Performer view: front-facing crowd looking up at you
 * Supports 5 venue types, BPM sync, phone glow, spotlight beams, crowd reactions.
 *
 * Phase C2 (2026-06-24): accepts entities: AvatarEntity[] so every seat is driven
 * by a real canonical entity — skin tone from SKIN_HEX, emotion hints in face
 * shape, stable per-entity seed (no per-frame Math.random color flicker).
 * Backward-compatible: occupancyRatio fallback unchanged when entities is absent.
 */

import { useEffect, useRef, useCallback } from "react";
import { SKIN_HEX, type AvatarEntity } from "@/lib/avatars/UnifiedAvatarRuntime";
import { avatarAttentionRuntime } from "@/lib/engines/attention/AvatarAttentionRuntime";

// ── Venue definitions ─────────────────────────────────────────────────────────

export const VENUES = [
  { name: "Theater",   wallColor: "#1a0a04", floorColor: "#0e0602", ceilColor: "#0a0400", wallTex: true,  crowd: 2730,  accentR: 255, accentG: 80,  accentB: 20  },
  { name: "Arena",     wallColor: "#0a0a12", floorColor: "#080810", ceilColor: "#050510", wallTex: false, crowd: 18500, accentR: 0,   accentG: 200, accentB: 255 },
  { name: "Club",      wallColor: "#0a0018", floorColor: "#060010", ceilColor: "#04000e", wallTex: false, crowd: 420,   accentR: 170, accentG: 45,  accentB: 255 },
  { name: "Outdoor",   wallColor: "#050c18", floorColor: "#030a10", ceilColor: "#000608", wallTex: false, crowd: 8200,  accentR: 0,   accentG: 255, accentB: 136 },
  { name: "Boardroom", wallColor: "#080814", floorColor: "#050510", ceilColor: "#030308", wallTex: true,  crowd: 120,   accentR: 255, accentG: 215, accentB: 0   },
] as const;

export type VenueIndex = 0 | 1 | 2 | 3 | 4;

const SKINS = ["#8B4513","#5C3317","#2F1B0E","#A0522D","#CD853F","#D2691E","#704214","#3D2008"];
const HAIR  = ["#1a0a00","#3d2000","#000000","#2a1500","#0a0a0a","#4a2800"];

// ── Stable integer hash from entity id — prevents per-frame color flicker ─────

function hashId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h) ^ id.charCodeAt(i);
  return Math.abs(h);
}

// ── Phone/lighter seed data — deterministic per seat ─────────────────────────

function phoneGlowColor(idx: number): [number, number, number] {
  const palette: [number,number,number][] = [
    [0,255,255],[255,45,170],[170,45,255],[255,215,0],[0,255,136],[255,255,255],
    [100,200,255],[255,150,50],[200,255,80],[255,100,200],
  ];
  return palette[idx % palette.length]!;
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/**
 * Draw a single audience head.
 * Attention-driven: headYaw and headPitch control head rotation
 * emotion drives mouth shape in forward (performer-view) heads only:
 *   'laugh' | 'celebrate' → wide open smile
 *   'shock'               → round open mouth
 *   'smirk'               → asymmetric one-sided curve
 *   'disappointed'        → frown arc
 *   anything else         → standard smile
 */
function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, sz: number,
  skin: string, hair: string, headYaw: number, headPitch: number,
  forward: boolean, lit: number,
  emotion?: string,
) {
  const L = lit;
  const ch = (hex: string, idx: number) =>
    Math.round(parseInt(hex.slice(1 + idx * 2, 3 + idx * 2), 16) * L);

  const skinRgb = `rgb(${ch(skin,0)},${ch(skin,1)},${ch(skin,2)})`;
  const hairRgb = `rgb(${ch(hair,0)},${ch(hair,1)},${ch(hair,2)})`;

  ctx.save();

  if (!forward) {
    // Back-of-head (fan view looking at stage) — attention-driven rotation
    ctx.strokeStyle = `rgba(${ch(skin,0)},${ch(skin,1)},${ch(skin,2)},.75)`;
    ctx.lineWidth = sz * 0.32;
    ctx.lineCap = "round";

    // Convert attention yaw/pitch to hair strand angles
    const hairAngle1 = headYaw * 0.8;
    const hairAngle2 = headYaw * 0.6 + headPitch * 0.3;

    if (Math.random() < 0.10) {
      ctx.beginPath();
      ctx.moveTo(x - sz * 0.3, y + sz * 0.6);
      ctx.lineTo(x - sz * 0.3 + Math.sin(hairAngle1) * sz * 1.2, y - sz * 1.1 + headPitch * sz * 0.5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x-sz*.4,y+sz*.7);
      ctx.lineTo(x-sz*.4+Math.sin(hairAngle1)*sz*.6, y+sz+Math.cos(hairAngle1)*sz*.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x+sz*.4,y+sz*.7);
      ctx.lineTo(x+sz*.4+Math.sin(hairAngle2)*sz*.5, y+sz+Math.cos(hairAngle2)*sz*.3);
      ctx.stroke();
    }

    ctx.fillStyle = skinRgb;
    ctx.beginPath();
    ctx.ellipse(x + headYaw * sz * 0.3, y+sz*.8, sz*.72, sz*.9, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = hairRgb;
    ctx.beginPath();
    ctx.ellipse(x + headYaw * sz * 0.3, y + headPitch * sz * 0.2, sz*.78, sz*.8, 0, 0, Math.PI*2);
    ctx.fill();
  } else {
    // Front-facing (performer view looking at crowd) — attention-driven face orientation
    ctx.fillStyle = skinRgb;
    const faceOffsetX = headYaw * sz * 0.15;  // slight x shift based on yaw
    const faceOffsetY = headPitch * sz * 0.1;  // slight y shift based on pitch

    ctx.beginPath();
    ctx.ellipse(x + faceOffsetX, y+sz*.5 + faceOffsetY, sz*.56, sz*.65, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + faceOffsetX, y + faceOffsetY, sz*.66, sz*.72, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = hairRgb;
    ctx.beginPath();
    ctx.arc(x + faceOffsetX, y - sz*.1 + faceOffsetY, sz*.7, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = skinRgb;

    // Eyes follow head yaw
    const eyeOffsetX = headYaw * sz * 0.2;
    ctx.beginPath();
    ctx.ellipse(x-sz*.22 + eyeOffsetX, y + faceOffsetY, sz*.12, sz*.16, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x+sz*.22 + eyeOffsetX, y + faceOffsetY, sz*.12, sz*.16, 0, 0, Math.PI*2);
    ctx.fill();

    // Mouth — shape driven by emotion
    ctx.strokeStyle = `rgba(50,18,0,${0.65*L})`;
    ctx.lineWidth=sz*.12;
    ctx.lineCap="round";
    if (emotion === 'laugh' || emotion === 'celebrate') {
      ctx.beginPath();
      ctx.arc(x + faceOffsetX, y+sz*.18 + faceOffsetY, sz*.28, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else if (emotion === 'shock') {
      ctx.beginPath();
      ctx.ellipse(x + faceOffsetX, y+sz*.24 + faceOffsetY, sz*.10, sz*.14, 0, 0, Math.PI*2);
      ctx.stroke();
    } else if (emotion === 'smirk') {
      ctx.beginPath();
      ctx.arc(x + sz*.05 + faceOffsetX, y+sz*.22 + faceOffsetY, sz*.18, 0.2, Math.PI - 0.4);
      ctx.stroke();
    } else if (emotion === 'disappointed') {
      ctx.beginPath();
      ctx.arc(x + faceOffsetX, y+sz*.30 + faceOffsetY, sz*.22, Math.PI, 0);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x + faceOffsetX, y+sz*.22 + faceOffsetY, sz*.22, 0, Math.PI);
      ctx.stroke();
    }

    // Arms — affected by head yaw
    ctx.strokeStyle = `rgba(${ch(skin,0)*.8},${ch(skin,1)*.8},${ch(skin,2)*.8},.75)`;
    ctx.lineWidth=sz*.32;
    ctx.lineCap="round";
    const armAngle1 = headYaw * 0.6;
    const armAngle2 = headYaw * 0.4 + 1.2;
    ctx.beginPath();
    ctx.moveTo(x-sz*.5,y+sz*.5);
    ctx.lineTo(x-sz*.6+Math.sin(armAngle1)*sz*.9, y+sz*.4+Math.cos(armAngle1)*sz*.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x+sz*.5,y+sz*.5);
    ctx.lineTo(x+sz*.6+Math.sin(armAngle2)*sz*.8, y+sz*.4+Math.cos(armAngle2)*sz*.5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBricks(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: string) {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(0,0,0,.35)";
  ctx.lineWidth = 0.8;
  const bw = 44, bh = 16;
  for (let r = 0; r * bh < h; r++) {
    const off = (r % 2) * bw / 2;
    for (let c = 0; c * bw < w + bw; c++) ctx.strokeRect(x + c*bw - off, y + r*bh, bw, bh);
  }
}

function drawSpotBeam(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  bx: number,
  angle: number,
  r: number, g: number, b: number,
  alpha: number,
) {
  const spread = 0.18;
  const len = H * 0.85;
  const ex = bx + Math.sin(angle) * len * 0.5;
  const ey = H * 0.9;

  const grad = ctx.createLinearGradient(bx, 0, ex, ey);
  grad.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.9})`);
  grad.addColorStop(0.45, `rgba(${r},${g},${b},${alpha * 0.35})`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(bx, 0);
  ctx.lineTo(ex - W * spread, ey);
  ctx.lineTo(ex + W * spread, ey);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.globalCompositeOperation = "screen";
  ctx.fill();
  ctx.restore();
}

function drawPhoneGlow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number, g: number, b: number,
  alpha: number, sz: number,
) {
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = `rgba(${r},${g},${b},${alpha})`;
  ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.85})`;
  const pw = sz * 0.7, ph = sz * 1.0;
  ctx.beginPath();
  ctx.roundRect(x - pw/2, y - ph - 2, pw, ph, 2);
  ctx.fill();
  ctx.fillStyle = `rgba(${Math.min(r+60,255)},${Math.min(g+60,255)},${Math.min(b+60,255)},${alpha * 0.6})`;
  ctx.beginPath();
  ctx.roundRect(x - pw/2 + 1, y - ph - 1, pw - 2, ph - 2, 1);
  ctx.fill();
  ctx.restore();
}

function drawLighterGlow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  alpha: number, sz: number, t: number, seed: number,
) {
  const flicker = 0.7 + Math.sin(t * 0.18 + seed) * 0.3;
  const fy = y - sz * 1.4 + Math.sin(t * 0.12 + seed) * sz * 0.3;
  ctx.save();
  const grad = ctx.createRadialGradient(x, fy, 0, x, fy, sz * 1.8);
  grad.addColorStop(0, `rgba(255,200,40,${alpha * flicker * 0.9})`);
  grad.addColorStop(0.3, `rgba(255,100,10,${alpha * flicker * 0.5})`);
  grad.addColorStop(1, `rgba(255,40,0,0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, fy, sz * 1.2, sz * 2.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface AudienceSceneProps {
  view?: "fan" | "performer";
  venue?: VenueIndex;
  watcherCount?: number;
  onReaction?: (emoji: string) => void;
  hideControls?: boolean;
  bpm?: number;
  accentColor?: string;
  screenLabel?: string;
  screenSubLabel?: string;
  /**
   * 0.0–1.0 fraction of seats occupied.
   * Ignored when `entities` is provided (occupancy derived from entities.length).
   * Kept for backward compatibility with callers not yet wired to useAudienceWorld.
   */
  occupancyRatio?: number;
  /**
   * Phase C2: canonical room entities from useAudienceWorld({ entities }).
   * When provided, each occupied seat reads real skin tone, emotion, and stable
   * entity-id seed from the AvatarEntity — no per-frame random color flicker.
   * occupancyRatio is derived automatically; no need to pass it separately.
   */
  entities?: AvatarEntity[];
}

interface SceneState {
  wave: boolean;
  jump: boolean;
  hype: boolean;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0,2), 16),
    parseInt(h.slice(2,4), 16),
    parseInt(h.slice(4,6), 16),
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AudienceScene({
  view = "fan",
  venue = 0,
  watcherCount,
  onReaction,
  hideControls = false,
  bpm = 120,
  accentColor,
  screenLabel,
  screenSubLabel,
  occupancyRatio = 1.0,
  entities,
}: AudienceSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef   = useRef(0);
  const frameRef  = useRef<number | null>(null);
  const stateRef  = useRef<SceneState>({ wave: false, jump: false, hype: false });
  // Refs so changes to entities/occupancyRatio don't restart the rAF loop
  const entitiesRef    = useRef<AvatarEntity[] | undefined>(entities);
  const occupancyRef   = useRef(occupancyRatio);
  entitiesRef.current  = entities;
  occupancyRef.current = occupancyRatio;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const v = VENUES[venue] ?? VENUES[0];
    const t = timeRef.current++;
    const s = stateRef.current;

    const FAN_TOTAL_SEATS  = 84;   // 7 rows × avg 12 seats
    const PERF_TOTAL_SEATS = 114;  // 8 rows × avg 14 seats
    const totalSeats = view === "fan" ? FAN_TOTAL_SEATS : PERF_TOTAL_SEATS;

    // Entity mode: real AvatarEntity data per seat
    const liveEntities = entitiesRef.current;
    const entityMode   = liveEntities !== undefined && liveEntities.length > 0;
    const effectiveOccupancy = entityMode
      ? Math.min(1, liveEntities.length / totalSeats)
      : Math.max(0, Math.min(1, occupancyRef.current));
    const occupiedUpTo = Math.floor(totalSeats * effectiveOccupancy);

    const beatDur   = (60 / bpm) * 60;
    const beatPhase = (t % beatDur) / beatDur;
    const beatPulse = Math.pow(Math.max(0, 1 - beatPhase * 2), 2);

    const [aR, aG, aB] = accentColor ? hexToRgb(accentColor) : [v.accentR, v.accentG, v.accentB];

    ctx.clearRect(0, 0, W, H);

    if (view === "fan") {
      // ── Background ──
      if (v.wallTex) drawBricks(ctx, 0, 0, W, H * 0.52, v.wallColor);
      else { ctx.fillStyle = v.wallColor; ctx.fillRect(0, 0, W, H * 0.52); }
      ctx.fillStyle = v.floorColor; ctx.fillRect(0, H * 0.52, W, H * 0.48);

      const fr = ctx.createLinearGradient(0, H * 0.52, 0, H);
      fr.addColorStop(0, `rgba(${aR},${aG},${aB},0.04)`);
      fr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fr; ctx.fillRect(0, H * 0.52, W, H * 0.48);

      // ── Stage screen ──
      const scrX = 180, scrY = 30, scrW = 440, scrH = 210;
      ctx.fillStyle = "#120806"; ctx.fillRect(scrX-12, scrY-12, scrW+24, scrH+24);
      ctx.strokeStyle = `rgba(${aR},${aG},${aB},0.5)`; ctx.lineWidth = 2;
      ctx.strokeRect(scrX-2, scrY-2, scrW+4, scrH+4);

      const ga = 0.84 + Math.sin(t * 0.02) * 0.13 + beatPulse * 0.12;
      const ag = ctx.createRadialGradient(scrX+scrW/2, scrY+scrH/2, 10, scrX+scrW/2, scrY+scrH/2, scrW*.75);
      ag.addColorStop(0, `rgba(${aR},${aG},${aB},${ga * 0.9})`);
      ag.addColorStop(0.35, `rgba(${Math.floor(aR*.7)},${Math.floor(aG*.7)},${Math.floor(aB*.7)},${ga * 0.65})`);
      ag.addColorStop(0.7, `rgba(${Math.floor(aR*.3)},${Math.floor(aG*.3)},${Math.floor(aB*.3)},${ga * 0.3})`);
      ag.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ag; ctx.fillRect(scrX, scrY, scrW, scrH);

      ctx.strokeStyle = `rgba(255,255,255,${0.04 + Math.sin(t * 0.03) * 0.02})`;
      ctx.lineWidth = 1.5;
      for (let sl = 0; sl < scrH; sl += 6) {
        ctx.beginPath(); ctx.moveTo(scrX, scrY + sl); ctx.lineTo(scrX + scrW, scrY + sl); ctx.stroke();
      }

      const mainLabel = screenLabel ?? "● LIVE";
      const subLabel  = screenSubLabel ?? "TMI · THE MUSICIAN'S INDEX";
      ctx.font = "bold 22px 'Orbitron', monospace";
      ctx.fillStyle = `rgba(255,255,255,${0.7 + Math.sin(t * 0.05) * 0.25 + beatPulse * 0.25})`;
      ctx.textAlign = "center";
      ctx.fillText(mainLabel, scrX + scrW / 2, scrY + scrH / 2 + 8);
      ctx.font = "10px 'Exo 2', monospace";
      ctx.fillStyle = `rgba(${aR},${aG},${aB},0.7)`;
      ctx.fillText(subLabel, scrX + scrW / 2, scrY + scrH - 16);
      ctx.textAlign = "left";

      ctx.save();
      ctx.shadowBlur = 18 + beatPulse * 22;
      ctx.shadowColor = `rgba(${aR},${aG},${aB},0.7)`;
      ctx.strokeStyle = `rgba(${aR},${aG},${aB},${0.25 + beatPulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(scrX, scrY, scrW, scrH);
      ctx.restore();

      const wg = ctx.createRadialGradient(scrX+scrW/2, scrY+scrH, 0, scrX+scrW/2, scrY+scrH, scrW*.9);
      wg.addColorStop(0, `rgba(${aR},${aG},${aB},${(0.12 + beatPulse * 0.08) * ga})`);
      wg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wg; ctx.fillRect(0, scrY, W, scrH + 90);

      const beamColors: [number,number,number][] = [[aR,aG,aB],[255,255,255],[aR,aG,aB]];
      for (let b = 0; b < 3; b++) {
        const sweepAngle = Math.sin(t * 0.018 + b * 1.1) * 0.35;
        const [br,bg_,bb] = beamColors[b]!;
        drawSpotBeam(ctx, W, H, W * (0.25 + b * 0.25), sweepAngle, br, bg_, bb, 0.055 + beatPulse * 0.03);
      }

      // ── Audience rows (back-of-head, fan looking at stage) ──
      const fanRows = [
        { y: 310, seats: 15, sw: 48, sz: 9.5,  lit: 0.15 },
        { y: 332, seats: 14, sw: 52, sz: 11,   lit: 0.22 },
        { y: 355, seats: 13, sw: 57, sz: 13,   lit: 0.32 },
        { y: 376, seats: 12, sw: 62, sz: 14.5, lit: 0.44 },
        { y: 397, seats: 11, sw: 68, sz: 16,   lit: 0.58 },
        { y: 418, seats: 10, sw: 74, sz: 17.5, lit: 0.72 },
        { y: 440, seats: 9,  sw: 80, sz: 18.5, lit: 0.85 },
      ];
      let fanSeatIdx   = 0;
      let entityFanIdx = 0; // separate counter for entity array (only increments on occupied)
      fanRows.forEach((row, ri) => {
        const sx = (W - row.seats * row.sw) / 2;
        for (let c = 0; c < row.seats; c++) {
          const idx  = ri * 20 + c;
          const seed = idx * 137.5;
          const px   = sx + c * row.sw + row.sw / 2;
          const wb = s.wave ? Math.sin(t * 0.04 + c * 0.6 + ri * 0.3) * 4.5 : 0;
          const jb = s.jump ? Math.abs(Math.sin(t * 0.08)) * -7 : 0;
          const beatBob = beatPulse * -2.5 * row.lit;
          const hy = row.y + wb + jb + beatBob;

          if (fanSeatIdx++ < occupiedUpTo) {
            const entity  = entityMode ? liveEntities[entityFanIdx++] : undefined;
            const skinHex = entity
              ? (SKIN_HEX[entity.appearance.skinTone] ?? SKINS[(idx*7+c*3) % SKINS.length]!)
              : SKINS[(idx*7+c*3) % SKINS.length]!;
            const hairSeed = entity ? hashId(entity.id) : (idx*5+ri*2);
            const hairHex  = HAIR[hairSeed % HAIR.length]!;
            const emotion  = entity?.emotion;

            // Get attention-driven head rotation from runtime
            const attentionOutput = entity
              ? avatarAttentionRuntime.getVisualOutput(entity.id)
              : null;
            const headYaw = attentionOutput?.headYaw ?? 0;
            const headPitch = attentionOutput?.headPitch ?? 0;

            drawHead(ctx, px, hy, row.sz, skinHex, hairHex, headYaw, headPitch, false, row.lit, emotion);

            const phoneRoll = (seed * 6271) % 100;
            if (phoneRoll < 65 && row.lit > 0.3) {
              const [pr,pg,pb] = phoneGlowColor(idx);
              const swayX = px + Math.sin(t * 0.022 + seed) * row.sz * 0.8;
              const glowAlpha = (0.45 + Math.sin(t * 0.04 + seed) * 0.2) * (row.lit * 0.8);
              drawPhoneGlow(ctx, swayX, hy - row.sz * 0.8, pr, pg, pb, glowAlpha, row.sz * 0.55);
            } else if (phoneRoll < 77 && row.lit > 0.5) {
              const lighterAlpha = (0.55 + Math.sin(t * 0.03 + seed) * 0.25) * row.lit;
              const swayX = px + Math.sin(t * 0.019 + seed) * row.sz * 0.5;
              drawLighterGlow(ctx, swayX, hy - row.sz * 1.2, lighterAlpha, row.sz * 0.7, t, seed);
            }
          } else {
            ctx.save();
            ctx.globalAlpha = 0.18 * row.lit;
            ctx.strokeStyle = `rgba(${aR},${aG},${aB},0.4)`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.ellipse(px, hy + row.sz * 0.5, row.sz * 0.7, row.sz * 0.55, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
          }
        }
      });

      const bottomGlow = ctx.createLinearGradient(0, H * 0.75, 0, H);
      bottomGlow.addColorStop(0, "rgba(0,0,0,0)");
      bottomGlow.addColorStop(1, `rgba(${aR},${aG},${aB},${0.06 + beatPulse * 0.06})`);
      ctx.fillStyle = bottomGlow; ctx.fillRect(0, H * 0.75, W, H * 0.25);

    } else {
      // ── PERFORMER VIEW ──────────────────────────────────────────────────────

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, v.ceilColor); bg.addColorStop(1, v.floorColor);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      if (v.wallTex) drawBricks(ctx, 0, 0, W, H * 0.42, v.wallColor);
      else { ctx.fillStyle = v.wallColor; ctx.fillRect(0, 0, W, H * 0.42); }

      const sg = ctx.createRadialGradient(W/2, H, 0, W/2, H, W * 0.65);
      sg.addColorStop(0, `rgba(255,100,0,${0.28 + beatPulse * 0.12})`);
      sg.addColorStop(0.5, "rgba(180,60,0,.1)");
      sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sg; ctx.fillRect(0, H * 0.48, W, H * 0.52);

      const sfr = ctx.createLinearGradient(0, H * 0.88, 0, H);
      sfr.addColorStop(0, `rgba(${aR},${aG},${aB},${0.08 + beatPulse * 0.06})`);
      sfr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sfr; ctx.fillRect(0, H * 0.88, W, H * 0.12);

      const perfBeamCols: [number,number,number][] = [
        [aR,aG,aB],[255,255,255],[aR,aG,aB],[255,150,50],[aR,aG,aB],
      ];
      for (let b = 0; b < 5; b++) {
        const sweepAngle = Math.sin(t * 0.016 + b * 0.78) * 0.45;
        const [br,bg_,bb] = perfBeamCols[b]!;
        drawSpotBeam(ctx, W, H, W * (0.15 + b * 0.175), sweepAngle, br, bg_, bb,
          0.07 + beatPulse * 0.05 + (b === 2 ? 0.03 : 0));
      }

      const followGrad = ctx.createRadialGradient(W/2, H*0.15, 0, W/2, H*0.15, W*0.22);
      followGrad.addColorStop(0, `rgba(255,220,180,${0.18 + beatPulse * 0.1})`);
      followGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = followGrad; ctx.fillRect(0, 0, W, H * 0.5);

      // ── Audience rows (front-facing, front rows fill first) ──
      const perfRows = [
        { ri: 0, yB: H*0.40, seats: 20, sw: 36, sz: 8,    lit: 0.65 },
        { ri: 1, yB: H*0.46, seats: 18, sw: 40, sz: 9.5,  lit: 0.72 },
        { ri: 2, yB: H*0.52, seats: 16, sw: 44, sz: 11,   lit: 0.78 },
        { ri: 3, yB: H*0.58, seats: 14, sw: 50, sz: 13,   lit: 0.84 },
        { ri: 4, yB: H*0.65, seats: 12, sw: 56, sz: 14.5, lit: 0.90 },
        { ri: 5, yB: H*0.72, seats: 10, sw: 62, sz: 16,   lit: 0.94 },
        { ri: 6, yB: H*0.79, seats: 8,  sw: 70, sz: 17.5, lit: 0.97 },
        { ri: 7, yB: H*0.86, seats: 6,  sw: 80, sz: 19,   lit: 1    },
      ];
      const perfSeatStart = PERF_TOTAL_SEATS - occupiedUpTo;
      let perfGlobalIdx   = 0;
      let entityPerfIdx   = 0;
      perfRows.forEach(row => {
        const sx = (W - row.seats * row.sw) / 2;
        for (let c = 0; c < row.seats; c++) {
          const idx  = row.ri * 30 + c;
          const seed = idx * 137.5;
          const px   = sx + c * row.sw + row.sw / 2;
          const wb = s.wave ? Math.sin(t*0.04+c*0.5)*5.5 : 0;
          const jb = s.jump ? Math.abs(Math.sin(t*0.08+c*0.3))*-9 : 0;
          const hb = s.hype ? (Math.sin(t*0.06+c*0.4)*4.5+Math.sin(t*0.03+c*0.2)*3.5) : 0;
          const beatBob = beatPulse * -3 * row.lit;
          const hy = row.yB + wb + jb + hb + beatBob;

          if (perfGlobalIdx++ >= perfSeatStart) {
            const entity  = entityMode ? liveEntities[entityPerfIdx++] : undefined;
            const skinHex = entity
              ? (SKIN_HEX[entity.appearance.skinTone] ?? SKINS[(idx*7+c*3)%SKINS.length]!)
              : SKINS[(idx*7+c*3)%SKINS.length]!;
            const hairSeed = entity ? hashId(entity.id) : (idx*5+row.ri*2);
            const hairHex  = HAIR[hairSeed % HAIR.length]!;
            const emotion  = entity?.emotion;

            // Get attention-driven head rotation from runtime
            const attentionOutput = entity
              ? avatarAttentionRuntime.getVisualOutput(entity.id)
              : null;
            const headYaw = attentionOutput?.headYaw ?? 0;
            const headPitch = attentionOutput?.headPitch ?? 0;

            drawHead(ctx, px, hy, row.sz, skinHex, hairHex, headYaw, headPitch, true, row.lit, emotion);

            const phoneRoll = (seed * 6271) % 100;
            if (phoneRoll < 70) {
              const [pr,pg,pb] = phoneGlowColor(idx);
              const swayX = px + Math.sin(t * 0.02 + seed) * row.sz * 0.9;
              const glowAlpha = (0.4 + Math.sin(t * 0.035 + seed) * 0.2) * (0.5 + row.lit * 0.5);
              drawPhoneGlow(ctx, swayX, hy - row.sz * 0.7, pr, pg, pb, glowAlpha, row.sz * 0.5);
            } else if (phoneRoll < 82) {
              const lighterAlpha = (0.6 + Math.sin(t * 0.028 + seed) * 0.25);
              const swayX = px + Math.sin(t * 0.017 + seed) * row.sz * 0.5;
              drawLighterGlow(ctx, swayX, hy - row.sz * 1.1, lighterAlpha * row.lit, row.sz * 0.8, t, seed);
            }
          } else {
            ctx.save();
            ctx.globalAlpha = 0.15 * row.lit;
            ctx.strokeStyle = `rgba(${aR},${aG},${aB},0.35)`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.ellipse(px, hy + row.sz * 0.4, row.sz * 0.6, row.sz * 0.5, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
          }
        }
      });

      const crowdWash = ctx.createLinearGradient(0, H*0.38, 0, H*0.65);
      crowdWash.addColorStop(0, `rgba(${aR},${aG},${aB},${0.06 + beatPulse * 0.04})`);
      crowdWash.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = crowdWash; ctx.fillRect(0, H*0.38, W, H*0.27);

      const tf = ctx.createLinearGradient(0, H*0.86, 0, H);
      tf.addColorStop(0, "rgba(0,0,0,0)"); tf.addColorStop(1, v.floorColor);
      ctx.fillStyle = tf; ctx.fillRect(0, H*0.86, W, H*0.14);

      const rimGlow = ctx.createLinearGradient(0, H*0.91, 0, H*0.96);
      rimGlow.addColorStop(0, `rgba(${aR},${aG},${aB},${0.35 + beatPulse * 0.3})`);
      rimGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rimGlow; ctx.fillRect(0, H*0.91, W, H*0.05);
    }

    // ── Watcher count ──
    if (watcherCount !== undefined) {
      ctx.font = "bold 11px 'Exo 2', monospace";
      ctx.fillStyle = "rgba(0,255,136,0.8)";
      ctx.fillText(`👁 ${watcherCount.toLocaleString()}`, 10, H - 10);
    }

    // ── BPM beat flash at very top ──
    if (beatPulse > 0.5) {
      const flashAlpha = (beatPulse - 0.5) * 0.14;
      const flashGrad = ctx.createLinearGradient(0, 0, 0, H * 0.12);
      flashGrad.addColorStop(0, `rgba(${aR},${aG},${aB},${flashAlpha})`);
      flashGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = flashGrad;
      ctx.fillRect(0, 0, W, H * 0.12);
    }

    frameRef.current = requestAnimationFrame(render);
  }, [view, venue, watcherCount, bpm, accentColor, screenLabel, screenSubLabel]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(render);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [render]);

  const triggerWave = () => {
    stateRef.current.wave = true; onReaction?.("🌊");
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tmi-xp-reward', { detail: { amount: 5, action: 'Crowd Wave' } }));
    setTimeout(() => { stateRef.current.wave = false; }, 3200);
  };
  const triggerJump = () => {
    stateRef.current.jump = true; onReaction?.("⬆");
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tmi-xp-reward', { detail: { amount: 10, action: 'Crowd Jump' } }));
    setTimeout(() => { stateRef.current.jump = false; }, 2400);
  };
  const triggerHype = () => {
    stateRef.current.hype = true; onReaction?.("🔥");
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tmi-xp-reward', { detail: { amount: 15, action: 'Crowd Hype' } }));
    setTimeout(() => { stateRef.current.hype = false; }, 4000);
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={900}
        height={480}
        style={{ display: "block", width: "100%", borderRadius: 8 }}
      />
      {!hideControls && (
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {[
            { label: "🌊 WAVE", fn: triggerWave, color: "rgba(0,200,255,.7)",   text: "#00CFFF" },
            { label: "⬆ JUMP",  fn: triggerJump, color: "rgba(170,45,255,.7)",  text: "#AA2DFF" },
            { label: "🔥 HYPE",  fn: triggerHype, color: "rgba(255,215,0,.7)",   text: "#FFD700" },
          ].map(({ label, fn, color, text }) => (
            <button key={label} onClick={fn} style={{
              background: "rgba(0,0,0,0.65)", border: `1px solid ${color}`, color: text,
              borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer",
              fontWeight: 700, backdropFilter: "blur(4px)",
            }}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
