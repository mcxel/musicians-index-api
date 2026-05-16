"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

export interface CanvasCard {
  id: string;
  title: string;
  subtitle?: string;
  stat?: string;
  badge?: string;
  badgeColor?: string;
  href: string;
  accentColor?: string;
  initialX?: number;
  initialY?: number;
  width?: number;
}

interface CinemationCanvasProps {
  cards: CanvasCard[];
  height?: number;
  enableDrag?: boolean;
}

interface CardPos {
  x: number;
  y: number;
  zIndex: number;
}

export const DEFAULT_CANVAS_CARDS: CanvasCard[] = [
  { id: "cc1", title: "Crown Holder", subtitle: "Wavetek · This Week", stat: "14,200 votes", badge: "CROWN", badgeColor: "#FFD700", href: "/leaderboard", accentColor: "#FFD700", initialX: 20, initialY: 30, width: 200 },
  { id: "cc2", title: "Battle Ring", subtitle: "8 active battles", stat: "LIVE NOW", badge: "HOT", badgeColor: "#FF2DAA", href: "/battles", accentColor: "#FF2DAA", initialX: 240, initialY: 20, width: 180 },
  { id: "cc3", title: "Cypher Arena", subtitle: "16 open cyphers", stat: "Join free", badge: "OPEN", badgeColor: "#00FF88", href: "/cypher", accentColor: "#00FF88", initialX: 440, initialY: 50, width: 180 },
  { id: "cc4", title: "Beat Drop", subtitle: "New this week: 24 beats", stat: "$29 basic", badge: "NEW", badgeColor: "#AA2DFF", href: "/beats/marketplace", accentColor: "#AA2DFF", initialX: 640, initialY: 25, width: 180 },
  { id: "cc5", title: "Neon Vibe Show", subtitle: "Live event · Tonight 8PM", stat: "$85 VIP", badge: "TICKETS", badgeColor: "#00FFFF", href: "/tickets", accentColor: "#00FFFF", initialX: 140, initialY: 180, width: 200 },
  { id: "cc6", title: "Sponsor Drop", subtitle: "Roland × TMI collab", stat: "Ads open", badge: "PARTNER", badgeColor: "#FFD700", href: "/sponsors", accentColor: "#FFD700", initialX: 360, initialY: 190, width: 200 },
];

export default function CinemationCanvas({ cards, height = 320, enableDrag = true }: CinemationCanvasProps) {
  const [positions, setPositions] = useState<Record<string, CardPos>>(() => {
    const init: Record<string, CardPos> = {};
    cards.forEach((c, i) => {
      init[c.id] = { x: c.initialX ?? i * 160, y: c.initialY ?? 20, zIndex: i + 1 };
    });
    return init;
  });
  const [topZ, setTopZ] = useState(cards.length + 1);

  const dragging = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (!enableDrag) return;
    e.preventDefault();
    const z = topZ + 1;
    setTopZ(z);
    setPositions(prev => ({ ...prev, [id]: { ...prev[id], zIndex: z } }));
    dragging.current = { id, startX: e.clientX, startY: e.clientY, origX: positions[id]?.x ?? 0, origY: positions[id]?.y ?? 0 };
  }, [enableDrag, positions, topZ]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return;
      const dx = e.clientX - dragging.current.startX;
      const dy = e.clientY - dragging.current.startY;
      setPositions(prev => ({
        ...prev,
        [dragging.current!.id]: { ...prev[dragging.current!.id], x: dragging.current!.origX + dx, y: dragging.current!.origY + dy },
      }));
    }
    function onUp() { dragging.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height, overflow: "hidden", background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ position: "absolute", top: 8, right: 12, fontSize: 8, color: "rgba(255,255,255,0.2)", fontWeight: 700 }}>
        {enableDrag ? "DRAG TO REARRANGE" : "CANVAS"}
      </div>
      {cards.map(card => {
        const pos = positions[card.id] ?? { x: 0, y: 0, zIndex: 1 };
        const accent = card.accentColor ?? "#00FFFF";
        return (
          <div
            key={card.id}
            onMouseDown={e => onMouseDown(e, card.id)}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              zIndex: pos.zIndex,
              width: card.width ?? 180,
              cursor: enableDrag ? "grab" : "pointer",
              userSelect: "none",
            }}
          >
            <div style={{
              background: `linear-gradient(135deg, rgba(0,0,0,0.8), ${accent}10)`,
              border: `1px solid ${accent}30`,
              borderRadius: 10,
              padding: "12px 14px",
              backdropFilter: "blur(10px)",
              boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 12px ${accent}15`,
              transition: "box-shadow 0.2s",
            }}>
              {card.badge && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 7, fontWeight: 900, color: card.badgeColor ?? accent, border: `1px solid ${card.badgeColor ?? accent}50`, borderRadius: 3, padding: "2px 6px" }}>{card.badge}</span>
                </div>
              )}
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3, lineHeight: 1.2 }}>{card.title}</div>
              {card.subtitle && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>{card.subtitle}</div>}
              {card.stat && <div style={{ fontSize: 11, fontWeight: 700, color: accent }}>{card.stat}</div>}
              <Link href={card.href} style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textDecoration: "none", display: "block", marginTop: 8, letterSpacing: "0.1em" }} onClick={e => e.stopPropagation()}>
                OPEN →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
