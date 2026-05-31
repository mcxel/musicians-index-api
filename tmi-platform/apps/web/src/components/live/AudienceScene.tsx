"use client";

/**
 * TMI AudienceScene — canvas-based 3D audience renderer
 * Fan view: back-of-head rows looking at stage screen
 * Performer view: front-facing crowd looking up at you
 * Supports 5 venue types, crowd reactions, and presence data.
 */

import { useEffect, useRef, useCallback } from "react";

// ── Venue definitions ─────────────────────────────────────────────────────────

export const VENUES = [
  { name: "Theater",   wallColor: "#1a0a04", floorColor: "#0e0602", ceilColor: "#0a0400", wallTex: true,  crowd: 2730  },
  { name: "Arena",     wallColor: "#0a0a12", floorColor: "#080810", ceilColor: "#050510", wallTex: false, crowd: 18500 },
  { name: "Club",      wallColor: "#0a0018", floorColor: "#060010", ceilColor: "#04000e", wallTex: false, crowd: 420   },
  { name: "Outdoor",   wallColor: "#050c18", floorColor: "#030a10", ceilColor: "#000608", wallTex: false, crowd: 8200  },
  { name: "Boardroom", wallColor: "#080814", floorColor: "#050510", ceilColor: "#030308", wallTex: true,  crowd: 120   },
] as const;

export type VenueIndex = 0 | 1 | 2 | 3 | 4;

const SKINS = ["#8B4513","#5C3317","#2F1B0E","#A0522D","#CD853F","#D2691E","#704214","#3D2008"];
const HAIR  = ["#1a0a00","#3d2000","#000000","#2a1500","#0a0a0a","#4a2800"];

// ── Drawing helpers ───────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, sz: number,
  skin: string, hair: string, aph: number,
  forward: boolean, lit: number,
) {
  const L = lit;
  const ch = (hex: string, idx: number) =>
    Math.round(parseInt(hex.slice(1 + idx * 2, 3 + idx * 2), 16) * L);

  const skinRgb = `rgb(${ch(skin,0)},${ch(skin,1)},${ch(skin,2)})`;
  const hairRgb = `rgb(${ch(hair,0)},${ch(hair,1)},${ch(hair,2)})`;

  ctx.save();

  if (!forward) {
    // Back-of-head (fan view)
    ctx.strokeStyle = `rgba(${ch(skin,0)},${ch(skin,1)},${ch(skin,2)},.75)`;
    ctx.lineWidth = sz * 0.32;
    ctx.lineCap = "round";
    if (Math.random() < 0.10) {
      ctx.beginPath();
      ctx.moveTo(x - sz * 0.3, y + sz * 0.6);
      ctx.lineTo(x - sz * 0.3 + Math.sin(aph) * sz * 1.2, y - sz * 1.1);
      ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(x-sz*.4,y+sz*.7); ctx.lineTo(x-sz*.4+Math.sin(aph)*sz*.6, y+sz+Math.cos(aph)*sz*.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x+sz*.4,y+sz*.7); ctx.lineTo(x+sz*.4+Math.sin(aph+1)*sz*.5, y+sz+Math.cos(aph+1)*sz*.3); ctx.stroke();
    }
    ctx.fillStyle = skinRgb;
    ctx.beginPath(); ctx.ellipse(x, y+sz*.8, sz*.72, sz*.9, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = hairRgb;
    ctx.beginPath(); ctx.ellipse(x, y, sz*.78, sz*.8, 0, 0, Math.PI*2); ctx.fill();

  } else {
    // Front-facing (performer view)
    ctx.fillStyle = skinRgb;
    ctx.beginPath(); ctx.ellipse(x, y+sz*.5, sz*.56, sz*.65, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, y, sz*.66, sz*.72, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = hairRgb;
    ctx.beginPath(); ctx.arc(x, y - sz*.1, sz*.7, Math.PI, 0); ctx.fill();
    ctx.fillStyle = skinRgb;
    ctx.beginPath(); ctx.ellipse(x-sz*.74, y+sz*.1, sz*.22, sz*.18, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+sz*.74, y+sz*.1, sz*.22, sz*.18, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = `rgba(30,10,0,${0.8 * L})`;
    ctx.beginPath(); ctx.ellipse(x-sz*.22, y, sz*.12, sz*.16, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+sz*.22, y, sz*.12, sz*.16, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = `rgba(50,18,0,${0.65*L})`; ctx.lineWidth=sz*.12; ctx.lineCap="round";
    ctx.beginPath(); ctx.arc(x, y+sz*.22, sz*.22, 0, Math.PI); ctx.stroke();
    ctx.strokeStyle = `rgba(${ch(skin,0)*.8},${ch(skin,1)*.8},${ch(skin,2)*.8},.75)`;
    ctx.lineWidth=sz*.32; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(x-sz*.5,y+sz*.5); ctx.lineTo(x-sz*.6+Math.sin(aph)*sz*.9, y+sz*.4+Math.cos(aph)*sz*.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+sz*.5,y+sz*.5); ctx.lineTo(x+sz*.6+Math.sin(aph+1.2)*sz*.8, y+sz*.4+Math.cos(aph+1.2)*sz*.5); ctx.stroke();
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface AudienceSceneProps {
  view?: "fan" | "performer";
  venue?: VenueIndex;
  watcherCount?: number;
  onReaction?: (emoji: string) => void;
  hideControls?: boolean;
}

interface SceneState {
  wave: boolean;
  jump: boolean;
  hype: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AudienceScene({
  view = "fan",
  venue = 0,
  watcherCount,
  onReaction,
  hideControls = false,
}: AudienceSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef   = useRef(0);
  const frameRef  = useRef<number | null>(null);
  const stateRef  = useRef<SceneState>({ wave: false, jump: false, hype: false });

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const v = VENUES[venue] ?? VENUES[0];
    const t = timeRef.current++;
    const s = stateRef.current;

    ctx.clearRect(0, 0, W, H);

    if (view === "fan") {
      if (v.wallTex) drawBricks(ctx, 0, 0, W, H * 0.52, v.wallColor);
      else { ctx.fillStyle = v.wallColor; ctx.fillRect(0, 0, W, H * 0.52); }
      ctx.fillStyle = v.floorColor; ctx.fillRect(0, H * 0.52, W, H * 0.48);

      // Screen glow
      const scrX = 180, scrY = 30, scrW = 440, scrH = 210;
      ctx.fillStyle = "#1a0900"; ctx.fillRect(scrX-10, scrY-10, scrW+20, scrH+20);
      const ag = ctx.createRadialGradient(scrX+scrW/2, scrY+scrH/2, 10, scrX+scrW/2, scrY+scrH/2, scrW*.75);
      const ga = 0.84 + Math.sin(t * 0.02) * 0.13;
      ag.addColorStop(0, `rgba(255,160,40,${ga})`);
      ag.addColorStop(0.4, `rgba(200,100,15,${ga * 0.82})`);
      ag.addColorStop(1, "rgba(40,15,0,0)");
      ctx.fillStyle = ag; ctx.fillRect(scrX, scrY, scrW, scrH);

      // Scanline
      ctx.strokeStyle = `rgba(255,255,255,${0.04 + Math.sin(t * 0.03) * 0.02})`;
      ctx.lineWidth = 1.5;
      for (let sl = 0; sl < scrH; sl += 6) {
        ctx.beginPath(); ctx.moveTo(scrX, scrY + sl); ctx.lineTo(scrX + scrW, scrY + sl); ctx.stroke();
      }

      // "LIVE" text on screen
      ctx.font = "bold 22px 'Orbitron', monospace";
      ctx.fillStyle = `rgba(255,220,80,${0.7 + Math.sin(t * 0.05) * 0.3})`;
      ctx.textAlign = "center";
      ctx.fillText("● LIVE", scrX + scrW / 2, scrY + scrH / 2 + 8);
      ctx.font = "11px 'Exo 2', monospace";
      ctx.fillStyle = "rgba(255,200,80,0.5)";
      ctx.fillText("TMI · THE MUSICIAN'S INDEX", scrX + scrW / 2, scrY + scrH - 16);
      ctx.textAlign = "left";

      // Wall glow
      const wg = ctx.createRadialGradient(scrX+scrW/2, scrY+scrH, 0, scrX+scrW/2, scrY+scrH, scrW*.9);
      wg.addColorStop(0, `rgba(255,140,20,${0.16*ga})`); wg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wg; ctx.fillRect(0, scrY, W, scrH + 90);

      // Audience rows (back-of-head)
      const fanRows = [
        { y: 310, seats: 15, sw: 48, sz: 9.5,  lit: 0.15 },
        { y: 332, seats: 14, sw: 52, sz: 11,   lit: 0.22 },
        { y: 355, seats: 13, sw: 57, sz: 13,   lit: 0.32 },
        { y: 376, seats: 12, sw: 62, sz: 14.5, lit: 0.44 },
        { y: 397, seats: 11, sw: 68, sz: 16,   lit: 0.58 },
        { y: 418, seats: 10, sw: 74, sz: 17.5, lit: 0.72 },
        { y: 440, seats: 9,  sw: 80, sz: 18.5, lit: 0.85 },
      ];
      fanRows.forEach((row, ri) => {
        const sx = (W - row.seats * row.sw) / 2;
        for (let c = 0; c < row.seats; c++) {
          const idx = ri * 20 + c;
          const px = sx + c * row.sw + row.sw / 2;
          const wb = s.wave ? Math.sin(t * 0.04 + c * 0.6 + ri * 0.3) * 4.5 : 0;
          const jb = s.jump ? Math.abs(Math.sin(t * 0.08)) * -7 : 0;
          drawHead(ctx, px, row.y + wb + jb, row.sz, SKINS[(idx*7+c*3) % SKINS.length]!, HAIR[(idx*5+ri*2) % HAIR.length]!, t*0.025+(c*0.4)+(ri*0.2), false, row.lit);
        }
      });

    } else {
      // PERFORMER VIEW
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, v.ceilColor); bg.addColorStop(1, v.floorColor);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      if (v.wallTex) drawBricks(ctx, 0, 0, W, H * 0.42, v.wallColor);
      else { ctx.fillStyle = v.wallColor; ctx.fillRect(0, 0, W, H * 0.42); }

      // Stage warm glow
      const sg = ctx.createRadialGradient(W/2, H, 0, W/2, H, W * 0.65);
      sg.addColorStop(0, "rgba(255,100,0,.32)"); sg.addColorStop(0.5, "rgba(180,60,0,.1)"); sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sg; ctx.fillRect(0, H * 0.48, W, H * 0.52);

      // Spotlight beams
      for (let b = 0; b < 3; b++) {
        const bx = W * (0.25 + b * 0.25);
        const bAlpha = 0.04 + Math.sin(t * 0.02 + b * 1.2) * 0.02;
        const sg2 = ctx.createRadialGradient(bx, 0, 0, bx, H * 0.5, W * 0.2);
        sg2.addColorStop(0, `rgba(255,200,100,${bAlpha})`);
        sg2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = sg2;
        ctx.fillRect(0, 0, W, H);
      }

      // Audience rows (front-facing)
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
      perfRows.forEach(row => {
        const sx = (W - row.seats * row.sw) / 2;
        for (let c = 0; c < row.seats; c++) {
          const idx = row.ri * 30 + c;
          const px = sx + c * row.sw + row.sw / 2;
          const wb = s.wave ? Math.sin(t*0.04+c*0.5)*5.5 : 0;
          const jb = s.jump ? Math.abs(Math.sin(t*0.08+c*0.3))*-9 : 0;
          const hb = s.hype ? (Math.sin(t*0.06+c*0.4)*4.5+Math.sin(t*0.03+c*0.2)*3.5) : 0;
          drawHead(ctx, px, row.yB+wb+jb+hb, row.sz, SKINS[(idx*7+c*3)%SKINS.length]!, HAIR[(idx*5+row.ri*2)%HAIR.length]!, t*0.028+(c*0.35)+(row.ri*0.15), true, row.lit);
        }
      });

      const tf = ctx.createLinearGradient(0, H*0.86, 0, H);
      tf.addColorStop(0, "rgba(0,0,0,0)"); tf.addColorStop(1, v.floorColor);
      ctx.fillStyle = tf; ctx.fillRect(0, H*0.86, W, H*0.14);
    }

    // Watcher count overlay
    if (watcherCount !== undefined) {
      ctx.font = "bold 11px 'Exo 2', monospace";
      ctx.fillStyle = "rgba(0,255,136,0.8)";
      ctx.fillText(`👁 ${watcherCount.toLocaleString()}`, 10, H - 10);
    }

    frameRef.current = requestAnimationFrame(render);
  }, [view, venue, watcherCount]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(render);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [render]);

  const triggerWave = () => { stateRef.current.wave = true; onReaction?.("🌊"); setTimeout(() => { stateRef.current.wave = false; }, 3200); };
  const triggerJump = () => { stateRef.current.jump = true; onReaction?.("⬆"); setTimeout(() => { stateRef.current.jump = false; }, 2400); };
  const triggerHype = () => { stateRef.current.hype = true; onReaction?.("🔥"); setTimeout(() => { stateRef.current.hype = false; }, 4000); };

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
            { label: "🌊 WAVE", fn: triggerWave, color: "rgba(220,70,0,.7)", text: "#FF8C00" },
            { label: "⬆ JUMP", fn: triggerJump, color: "rgba(220,70,0,.7)", text: "#FF8C00" },
            { label: "🔥 HYPE", fn: triggerHype, color: "#FFD700", text: "#FFD700" },
          ].map(({ label, fn, color, text }) => (
            <button key={label} onClick={fn} style={{
              background: "rgba(0,0,0,0.6)", border: `1px solid ${color}`, color: text,
              borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer",
              fontWeight: 700, backdropFilter: "blur(4px)",
            }}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
