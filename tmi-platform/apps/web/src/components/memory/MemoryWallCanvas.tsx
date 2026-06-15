"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MemoryItem } from "@/lib/profiles/MemoryWallEngine";
import {
  generateMemoryLayout,
  canvasHeight,
  type MemoryCardLayout,
} from "@/lib/profiles/MemoryLayoutGenerator";
import MemoryCard from "@/components/memory/MemoryCard";
import { pinMemory, unpinMemory, recordMemoryInteraction } from "@/lib/profiles/MemoryWallEngine";

// ── Theme system ──────────────────────────────────────────────────────────────
type MemoryTheme = 'classic' | 'ruby' | 'diamond' | 'gold' | 'neon';
const THEMES: { id: MemoryTheme; label: string; accent: string; border: string; shadow: string }[] = [
  { id: 'classic', label: 'Classic',  accent: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.09)', shadow: 'none' },
  { id: 'ruby',    label: 'Ruby',     accent: '#E63000',                border: '#E63000',                shadow: '0 0 22px rgba(230,48,0,0.45), 0 0 4px rgba(230,48,0,0.25)' },
  { id: 'diamond', label: 'Diamond',  accent: '#00E5FF',                border: '#00E5FF',                shadow: '0 0 22px rgba(0,229,255,0.45), 0 0 4px rgba(0,229,255,0.25)' },
  { id: 'gold',    label: 'Gold',     accent: '#FFD700',                border: '#FFD700',                shadow: '0 0 22px rgba(255,215,0,0.45), 0 0 4px rgba(255,215,0,0.25)' },
  { id: 'neon',    label: 'Neon',     accent: '#AA2DFF',                border: '#AA2DFF',                shadow: '0 0 22px rgba(170,45,255,0.45), 0 0 4px rgba(170,45,255,0.25)' },
];

// ── Tab system (performer-only tabs: stamp, orbit, map) ────────────────────────
type CanisterTab = 'memories' | 'stamp' | 'orbit' | 'map';

// ── Sponsor seed data ─────────────────────────────────────────────────────────
const STAMP_SPONSORS = [
  { id: 'amplify',   name: 'AMPLIFY RECORDS',     tagline: 'Platinum',  major: true  },
  { id: 'beatlab',   name: 'BEATLAB STUDIOS',      tagline: 'Gold',      major: true  },
  { id: 'velocity',  name: 'VELOCITY AUDIO',       tagline: 'Gold',      major: false },
  { id: 'nova',      name: 'NOVA MEDIA GROUP',     tagline: 'Silver',    major: false },
  { id: 'crown',     name: 'CROWN & CO.',          tagline: 'Local',     major: false },
  { id: 'frequency', name: 'FREQUENCY LABS',       tagline: 'Local',     major: false },
  { id: 'vault',     name: 'THE VAULT COLLECTIVE', tagline: 'Event',     major: false },
  { id: 'sonic',     name: 'SONIC AXIS',           tagline: 'Product',   major: false },
  { id: 'bassline',  name: 'BASSLINE GEAR',        tagline: 'Product',   major: false },
  { id: 'truebeat',  name: 'TRUE BEAT MFG',        tagline: 'Event',     major: false },
  { id: 'hardwax',   name: 'HARDWAX VINYL',        tagline: 'Local',     major: false },
  { id: 'infinite',  name: 'INFINITE SOUND',       tagline: 'Local',     major: false },
];

const COLS = 4;

const DEMO_SEEDS: Omit<MemoryItem, "memoryId" | "displayOrder">[] = [
  { entityId: "demo", entityType: "fan", contentType: "achievement", contentUrl: "", title: "First Battle Win", description: "Took the crown in round 3.", tags: ["battle", "win"], createdAt: Date.now() - 86400000 * 14, source: "system-captured", isPublic: true, likes: 18, shares: 4 },
  { entityId: "demo", entityType: "fan", contentType: "cypher-moment", contentUrl: "", title: "Cypher Night Vol.7", description: "Held it down front row.", tags: ["cypher", "live"], createdAt: Date.now() - 86400000 * 9, source: "user-uploaded", isPublic: true, likes: 31, shares: 7 },
  { entityId: "demo", entityType: "fan", contentType: "ticket-stub", contentUrl: "", title: "Monday Stage — Row B", tags: ["ticket", "stage"], createdAt: Date.now() - 86400000 * 6, source: "system-captured", isPublic: true, likes: 5, shares: 1, pinnedAt: Date.now() - 1000 },
  { entityId: "demo", entityType: "fan", contentType: "photo", contentUrl: "", title: "Backstage Pass Night", tags: ["backstage", "vip"], createdAt: Date.now() - 86400000 * 4, source: "user-uploaded", isPublic: true, likes: 44, shares: 12 },
  { entityId: "demo", entityType: "fan", contentType: "meet-and-greet", contentUrl: "", title: "Met the headliner", tags: ["meet-greet"], createdAt: Date.now() - 86400000 * 3, source: "user-uploaded", isPublic: true, likes: 22, shares: 9 },
  { entityId: "demo", entityType: "fan", contentType: "battle-win", contentUrl: "", title: "3-0 Sweep — Cypher Arena", tags: ["battle", "sweep"], createdAt: Date.now() - 86400000 * 2, source: "system-captured", isPublic: true, likes: 67, shares: 20 },
  { entityId: "demo", entityType: "fan", contentType: "event-attendance", contentUrl: "", title: "Monthly Idol Finale", tags: ["idol", "finale"], createdAt: Date.now() - 86400000 * 1, source: "system-captured", isPublic: true, likes: 11, shares: 2 },
  { entityId: "demo", entityType: "fan", contentType: "screenshot", contentUrl: "", title: "Chat explosion moment", tags: ["social", "chat"], createdAt: Date.now(), source: "user-uploaded", isPublic: true, likes: 8, shares: 3 },
];

function seedId(i: number): string {
  return `demo-${i}-${Date.now()}`;
}

interface MemoryWallCanvasProps {
  entityId: string;
  entityType: "fan" | "artist" | "performer" | "venue";
  initialMemories?: MemoryItem[];
  accentColor?: string;
}

interface ComposerState {
  title: string;
  contentType: MemoryItem["contentType"];
  contentUrl: string;
  description: string;
  isPublic: boolean;
}

const COMPOSER_TYPES: Array<{ value: MemoryItem["contentType"]; label: string }> = [
  { value: "photo",            label: "🖼 Photo"         },
  { value: "video",            label: "🎥 Video"         },
  { value: "screenshot",       label: "📸 Screenshot"    },
  { value: "achievement",      label: "🏆 Achievement"   },
  { value: "cypher-moment",    label: "🎤 Cypher Moment" },
  { value: "meet-and-greet",   label: "🤝 Meet & Greet"  },
  { value: "event-attendance", label: "🎪 Attendance"    },
  { value: "ticket-stub",      label: "🎫 Ticket Stub"   },
];

export default function MemoryWallCanvas({
  entityId,
  entityType,
  initialMemories = [],
  accentColor = "#00FFFF",
}: MemoryWallCanvasProps) {
  const [memories, setMemories] = useState<MemoryItem[]>(initialMemories);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composer, setComposer] = useState<ComposerState>({
    title: "", contentType: "photo", contentUrl: "", description: "", isPublic: true,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(960);
  const [theme, setTheme] = useState<MemoryTheme>(() => {
    if (typeof window === 'undefined') return 'classic';
    return (localStorage.getItem('tmi_memory_wall_theme') as MemoryTheme) ?? 'classic';
  });
  const [activeTab, setActiveTab] = useState<CanisterTab>('memories');

  // Seed demo items if wall is empty
  useEffect(() => {
    if (memories.length === 0) {
      setMemories(
        DEMO_SEEDS.map((s, i) => ({ ...s, memoryId: seedId(i), displayOrder: i }))
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Observe container resize for responsive columns
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const cols = Math.max(1, Math.min(COLS, Math.floor(containerWidth / 240)));
  const layout: MemoryCardLayout[] = useMemo(
    () => generateMemoryLayout(memories, cols),
    [memories, cols],
  );
  const height = canvasHeight(memories.length, cols);

  const handleLike = useCallback((memoryId: string) => {
    recordMemoryInteraction(memoryId, "like");
    setMemories(prev =>
      prev.map(m => m.memoryId === memoryId ? { ...m, likes: m.likes + 1 } : m)
    );
  }, []);

  const handlePin = useCallback((memoryId: string) => {
    setMemories(prev => {
      const m = prev.find(x => x.memoryId === memoryId);
      if (!m) return prev;
      if (m.pinnedAt) {
        unpinMemory(memoryId);
        return prev.map(x => x.memoryId === memoryId ? { ...x, pinnedAt: undefined } : x);
      } else {
        pinMemory(memoryId);
        return prev.map(x => x.memoryId === memoryId ? { ...x, pinnedAt: Date.now() } : x);
      }
    });
  }, []);

  const handleAddMemory = useCallback(async () => {
    if (!composer.title.trim()) return;
    const tempId = `mem-${entityId}-${Date.now()}`;
    const newMemory: MemoryItem = {
      memoryId:    tempId,
      entityId,
      entityType,
      contentType:  composer.contentType,
      contentUrl:   composer.contentUrl.trim(),
      title:        composer.title.trim(),
      description:  composer.description.trim() || undefined,
      tags:         [],
      createdAt:    Date.now(),
      source:       "user-uploaded",
      isPublic:     composer.isPublic,
      likes:        0,
      shares:       0,
      displayOrder: memories.length,
    };
    // Optimistic local add
    setMemories(prev => [...prev, newMemory]);
    setComposer({ title: "", contentType: "photo", contentUrl: "", description: "", isPublic: true });
    setComposerOpen(false);

    // Persist to API
    try {
      const res = await fetch('/api/memory/wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId,
          entityType,
          contentType: newMemory.contentType,
          contentUrl: newMemory.contentUrl,
          title: newMemory.title,
          description: newMemory.description,
          isPublic: newMemory.isPublic,
          displayOrder: newMemory.displayOrder,
        }),
      });
      if (res.ok) {
        const { memory: saved } = await res.json() as { memory?: MemoryItem };
        if (saved?.memoryId) {
          setMemories(prev => prev.map(m => m.memoryId === tempId ? saved : m));
        }
      }
    } catch {
      // Silent — memory stays visible locally
    }
  }, [composer, entityId, entityType, memories.length]);

  const handleSetTheme = (t: MemoryTheme) => {
    setTheme(t);
    localStorage.setItem('tmi_memory_wall_theme', t);
  };
  const curTheme = THEMES.find(th => th.id === theme)!;
  const isPerformer = entityType === 'performer';

  return (
    <div style={{ width: "100%" }}>
      {/* Injected keyframe animations */}
      <style>{`
        @keyframes stampIn{from{transform:scale(0.7) rotate(-5deg);opacity:0}to{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes glowPulseOrbit{0%,100%{opacity:.55}50%{opacity:1}}
      `}</style>

      {/* Theme selector */}
      <div style={{ display:"flex", gap:6, marginBottom:16, alignItems:"center" }}>
        <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", fontWeight:800, marginRight:4 }}>THEME</span>
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => handleSetTheme(t.id)}
            style={{
              padding:"5px 12px", fontSize:9, fontWeight:900, letterSpacing:"0.12em", cursor:"pointer",
              background: theme === t.id ? `${t.border}18` : "rgba(255,255,255,0.03)",
              border: `1px solid ${theme === t.id ? t.border : "rgba(255,255,255,0.08)"}`,
              borderRadius:20, color: theme === t.id ? t.accent : "rgba(255,255,255,0.35)",
              boxShadow: theme === t.id ? t.shadow : "none",
              transition:"all 0.2s ease",
            }}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Performer tab selector */}
      {isPerformer && (
        <div style={{ display:"flex", gap:2, marginBottom:16, borderBottom:"1px solid rgba(255,255,255,0.06)", paddingBottom:0 }}>
          {([
            { id:'memories', label:'Memory Wall'    },
            { id:'stamp',    label:'Sponsor Stamps' },
            { id:'orbit',    label:'Sponsor Orbit'  },
            { id:'map',      label:'Booking Map'    },
          ] as { id: CanisterTab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding:"8px 16px", fontSize:9, fontWeight:900, letterSpacing:"0.1em", cursor:"pointer",
                background:"transparent", border:"none",
                borderBottom: activeTab === tab.id ? `2px solid ${curTheme.border}` : "2px solid transparent",
                color: activeTab === tab.id ? curTheme.accent : "rgba(255,255,255,0.3)",
                marginBottom:-1, transition:"all 0.2s ease",
              }}
            >
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* ── TAB: MEMORY WALL ──────────────────────────────── */}
      {activeTab === 'memories' && (<>
        {/* Filter bar + add button */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", fontWeight:800 }}>
            {memories.length} MEMORIES
          </div>
          <div style={{ flex:1 }} />
          <button
            onClick={() => setComposerOpen(p => !p)}
            style={{
              padding:"7px 16px", fontSize:10, fontWeight:900, letterSpacing:"0.1em", cursor:"pointer",
              background: composerOpen ? `${curTheme.border}22` : "rgba(255,255,255,0.05)",
              border: `1px solid ${composerOpen ? `${curTheme.border}55` : "rgba(255,255,255,0.1)"}`,
              borderRadius:20, color: composerOpen ? curTheme.accent : "rgba(255,255,255,0.5)",
            }}
          >
            {composerOpen ? "✕ Cancel" : "+ Add Memory"}
          </button>
        </div>

        {/* Composer */}
        {composerOpen && (
          <div style={{
            marginBottom:20, background:"rgba(255,255,255,0.03)",
            border:`1px solid ${curTheme.border}30`, borderRadius:12,
            padding:"16px 20px", display:"flex", flexDirection:"column", gap:10,
            boxShadow: curTheme.shadow,
          }}>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", fontWeight:800 }}>
              NEW MEMORY
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {COMPOSER_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => setComposer(p => ({ ...p, contentType: ct.value }))}
                  style={{
                    padding:"5px 11px", fontSize:9, fontWeight:800, cursor:"pointer",
                    background: composer.contentType === ct.value ? `${curTheme.border}20` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${composer.contentType === ct.value ? `${curTheme.border}55` : "rgba(255,255,255,0.08)"}`,
                    borderRadius:6, color: composer.contentType === ct.value ? curTheme.accent : "rgba(255,255,255,0.45)",
                  }}
                >
                  {ct.label}
                </button>
              ))}
            </div>
            <input
              value={composer.title}
              onChange={e => setComposer(p => ({ ...p, title: e.target.value }))}
              placeholder="Title *"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#fff", fontSize:12, outline:"none" }}
            />
            <input
              value={composer.contentUrl}
              onChange={e => setComposer(p => ({ ...p, contentUrl: e.target.value }))}
              placeholder="Media URL (optional)"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#fff", fontSize:12, outline:"none" }}
            />
            <input
              value={composer.description}
              onChange={e => setComposer(p => ({ ...p, description: e.target.value }))}
              placeholder="Caption (optional)"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#fff", fontSize:12, outline:"none" }}
            />
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:10, color:"rgba(255,255,255,0.5)" }}>
                <input
                  type="checkbox"
                  checked={composer.isPublic}
                  onChange={e => setComposer(p => ({ ...p, isPublic: e.target.checked }))}
                  style={{ accentColor: curTheme.accent }}
                />
                Public
              </label>
              <div style={{ flex:1 }} />
              <button
                onClick={handleAddMemory}
                disabled={!composer.title.trim()}
                style={{
                  padding:"8px 20px", fontSize:10, fontWeight:900, letterSpacing:"0.1em",
                  cursor: composer.title.trim() ? "pointer" : "not-allowed",
                  background: composer.title.trim() ? `${curTheme.border}22` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${composer.title.trim() ? `${curTheme.border}55` : "rgba(255,255,255,0.07)"}`,
                  borderRadius:8, color: composer.title.trim() ? curTheme.accent : "rgba(255,255,255,0.25)",
                }}
              >
                Save Memory
              </button>
            </div>
          </div>
        )}

        {/* Collage canvas — themed border + glow */}
        <div
          ref={containerRef}
          style={{
            position:"relative", width:"100%", height, minHeight:400,
            border:`1px solid ${curTheme.border}`,
            boxShadow: curTheme.shadow,
            borderRadius:12,
            transition:"border-color 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          {memories.map(memory => {
            const cardLayout = layout.find(l => l.memoryId === memory.memoryId);
            if (!cardLayout) return null;
            return (
              <MemoryCard
                key={memory.memoryId}
                memory={memory}
                layout={cardLayout}
                onLike={handleLike}
                onPin={handlePin}
              />
            );
          })}
        </div>
      </>)}

      {/* ── TAB: SPONSOR STAMP WALL ────────────────────────── */}
      {activeTab === 'stamp' && (
        <div style={{ padding:"20px 0" }}>
          {/* Slot progress */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <span style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.15em", fontWeight:800 }}>SPONSOR SLOTS</span>
            <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.06)", borderRadius:4 }}>
              <div style={{ height:4, width:`${(STAMP_SPONSORS.length/20)*100}%`, background:curTheme.border, borderRadius:4, boxShadow:curTheme.shadow, transition:"width 0.5s ease" }} />
            </div>
            <span style={{ fontSize:9, color:curTheme.accent, fontWeight:800 }}>{STAMP_SPONSORS.length} / 20</span>
          </div>

          <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:"0.15em", fontWeight:800, marginBottom:10 }}>MAJOR SPONSORS</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:10, marginBottom:24 }}>
            {STAMP_SPONSORS.filter(s => s.major).map((sp, i) => (
              <div
                key={sp.id}
                title={`${sp.name} — ${sp.tagline}`}
                style={{
                  padding:"18px 14px", background:`${curTheme.border}12`,
                  border:`2px solid ${curTheme.border}55`, borderRadius:10, cursor:"pointer",
                  textAlign:"center",
                  animation:`stampIn 0.35s ease forwards ${i*0.06}s`, opacity:0,
                  boxShadow: curTheme.shadow,
                }}
              >
                <div style={{ fontSize:12, fontWeight:900, color:curTheme.accent, letterSpacing:"0.06em", lineHeight:1.2 }}>{sp.name}</div>
                <div style={{ fontSize:8, color:"rgba(255,255,255,0.4)", letterSpacing:"0.15em", marginTop:5 }}>{sp.tagline.toUpperCase()}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:"0.15em", fontWeight:800, marginBottom:10 }}>LOCAL + EVENT SPONSORS</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(110px, 1fr))", gap:8 }}>
            {STAMP_SPONSORS.filter(s => !s.major).map((sp, i) => (
              <div
                key={sp.id}
                title={`${sp.name} — ${sp.tagline}`}
                style={{
                  padding:"11px 10px", background:"rgba(255,255,255,0.03)",
                  border:`1px solid ${curTheme.border}30`, borderRadius:8, cursor:"pointer",
                  textAlign:"center",
                  animation:`stampIn 0.35s ease forwards ${0.12+i*0.04}s`, opacity:0,
                }}
              >
                <div style={{ fontSize:9, fontWeight:900, color:"rgba(255,255,255,0.7)", letterSpacing:"0.04em", lineHeight:1.3 }}>{sp.name}</div>
                <div style={{ fontSize:7, color:"rgba(255,255,255,0.25)", letterSpacing:"0.12em", marginTop:4 }}>{sp.tagline.toUpperCase()}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:24, textAlign:"center" }}>
            <button style={{
              padding:"10px 28px", fontSize:10, fontWeight:900, letterSpacing:"0.12em",
              background:`${curTheme.border}18`, border:`1px solid ${curTheme.border}50`,
              borderRadius:20, color:curTheme.accent, cursor:"pointer",
            }}>
              + CLAIM SPONSOR SLOT
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: SPONSOR ORBIT ────────────────────────────── */}
      {activeTab === 'orbit' && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 0" }}>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", fontWeight:800, marginBottom:32 }}>
            SPONSOR ORBIT — LIVE RING
          </div>
          <div style={{ position:"relative", width:340, height:340 }}>
            {/* Ring tracks */}
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:`1px dashed ${curTheme.border}22` }} />
            <div style={{ position:"absolute", top:50, left:50, right:50, bottom:50, borderRadius:"50%", border:`1px dashed ${curTheme.border}33` }} />
            {/* Center performer node */}
            <div style={{
              position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)",
              width:72, height:72, borderRadius:"50%",
              background:`radial-gradient(circle, ${curTheme.border}28, #050510)`,
              border:`2px solid ${curTheme.border}`, boxShadow:curTheme.shadow,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:900, color:curTheme.accent,
              textAlign:"center", letterSpacing:"0.06em", lineHeight:1.1,
            }}>
              YOU
            </div>
            {/* Inner ring — major sponsors */}
            {STAMP_SPONSORS.filter(s => s.major).map((sp, i, arr) => {
              const angle = (i / arr.length) * 360;
              const rad = (angle * Math.PI) / 180;
              const r = 92, cx = 170;
              return (
                <div key={sp.id} title={sp.name} style={{
                  position:"absolute",
                  left: cx + r * Math.cos(rad) - 32,
                  top:  cx + r * Math.sin(rad) - 32,
                  width:64, height:64, borderRadius:"50%",
                  background:`${curTheme.border}18`, border:`2px solid ${curTheme.border}55`,
                  boxShadow:curTheme.shadow,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  textAlign:"center", padding:4,
                  fontSize:7, fontWeight:900, color:curTheme.accent,
                  letterSpacing:"0.04em", lineHeight:1.2,
                  animation:`glowPulseOrbit 3s ease-in-out infinite ${i*0.4}s`,
                  cursor:"pointer",
                }}>
                  {sp.name.split(' ').slice(0,2).join(' ')}
                </div>
              );
            })}
            {/* Outer ring — local sponsors */}
            {STAMP_SPONSORS.filter(s => !s.major).slice(0,8).map((sp, i) => {
              const angle = (i / 8) * 360;
              const rad = (angle * Math.PI) / 180;
              const r = 148, cx = 170;
              return (
                <div key={sp.id} title={sp.name} style={{
                  position:"absolute",
                  left: cx + r * Math.cos(rad) - 22,
                  top:  cx + r * Math.sin(rad) - 22,
                  width:44, height:44, borderRadius:"50%",
                  background:"rgba(255,255,255,0.04)", border:`1px solid ${curTheme.border}30`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  textAlign:"center", padding:3,
                  fontSize:5.5, fontWeight:900, color:"rgba(255,255,255,0.5)",
                  lineHeight:1.2,
                  animation:`glowPulseOrbit 4s ease-in-out infinite ${i*0.3}s`,
                  cursor:"pointer",
                }}>
                  {sp.name.split(' ')[0]}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:28, fontSize:9, color:"rgba(255,255,255,0.2)", letterSpacing:"0.12em" }}>
            CLICK ANY BUBBLE FOR SPONSOR OFFER
          </div>
        </div>
      )}

      {/* ── TAB: BOOKING MAP ──────────────────────────────── */}
      {activeTab === 'map' && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, padding:"20px 0" }}>
          {/* City grid */}
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              {['ALL VENUES','ARENA','CLUB','THEATER','OUTDOOR'].map(f => (
                <button key={f} style={{
                  padding:"5px 12px", fontSize:8, fontWeight:900, letterSpacing:"0.1em",
                  background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)",
                  borderRadius:20, color:"rgba(255,255,255,0.4)", cursor:"pointer",
                }}>{f}</button>
              ))}
            </div>
            <div style={{
              background:"rgba(255,255,255,0.02)", border:`1px solid ${curTheme.border}20`,
              borderRadius:12, padding:20, minHeight:300, position:"relative",
              boxShadow:`inset 0 0 40px rgba(0,0,0,0.3)`,
            }}>
              {/* Grid lines */}
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ position:"absolute", left:`${i*14}%`, top:0, bottom:0, width:1, background:"rgba(255,255,255,0.03)" }} />
              ))}
              {[1,2,3,4].map(i => (
                <div key={i} style={{ position:"absolute", top:`${i*22}%`, left:0, right:0, height:1, background:"rgba(255,255,255,0.03)" }} />
              ))}
              {/* Venue pins */}
              {[
                { name:"The Arena",    x:22, y:35, available:true  },
                { name:"Club Neon",    x:58, y:28, available:true  },
                { name:"Velvet Room",  x:40, y:55, available:false },
                { name:"City Theater", x:72, y:60, available:true  },
                { name:"Rooftop Open", x:15, y:68, available:true  },
                { name:"Stage 5",      x:82, y:42, available:true  },
              ].map(v => (
                <div key={v.name} title={v.name} style={{
                  position:"absolute", left:`${v.x}%`, top:`${v.y}%`,
                  width:12, height:12, borderRadius:"50%",
                  background: v.available ? curTheme.border : "rgba(255,255,255,0.15)",
                  boxShadow: v.available ? curTheme.shadow : "none",
                  cursor:"pointer",
                  animation: v.available ? `glowPulseOrbit 2.5s ease-in-out infinite` : "none",
                }} />
              ))}
              <div style={{ position:"absolute", bottom:10, left:12, fontSize:8, color:"rgba(255,255,255,0.18)", letterSpacing:"0.1em" }}>
                CITY GRID — CLICK PIN FOR DETAILS
              </div>
            </div>
          </div>

          {/* Logistics sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", fontWeight:800 }}>VENUE DETAILS</div>
            <div style={{
              background:"rgba(255,255,255,0.03)", border:`1px solid ${curTheme.border}25`,
              borderRadius:10, padding:16, display:"flex", flexDirection:"column", gap:10,
            }}>
              <div style={{ fontWeight:900, fontSize:13, color:"#fff" }}>The Arena</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.08em" }}>CAPACITY: 2,400 · ARENA</div>
              <div style={{ height:1, background:"rgba(255,255,255,0.06)" }} />
              {[
                { label:"Distance",   value:"12 mi"        },
                { label:"Hotel Est.", value:"$89/night"    },
                { label:"Ride Est.",  value:"$14 each way" },
                { label:"Door Deal",  value:"70/30 split"  },
              ].map(row => (
                <div key={row.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>{row.label}</span>
                  <input
                    defaultValue={row.value}
                    style={{
                      background:"transparent", border:"none",
                      borderBottom:"1px solid rgba(255,255,255,0.1)",
                      color:curTheme.accent, fontSize:9, fontWeight:800,
                      textAlign:"right", outline:"none", width:100,
                    }}
                  />
                </div>
              ))}
              <button style={{
                marginTop:8, padding:"9px 0", fontSize:9, fontWeight:900, letterSpacing:"0.12em",
                background:`${curTheme.border}18`, border:`1px solid ${curTheme.border}50`,
                borderRadius:8, color:curTheme.accent, cursor:"pointer",
              }}>
                REQUEST BOOKING →
              </button>
            </div>

            <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", fontWeight:800 }}>SEARCH RADIUS</div>
            <div style={{ display:"flex", gap:6 }}>
              {['10 mi','25 mi','50 mi','100 mi'].map(r => (
                <button key={r} style={{
                  flex:1, padding:"6px 0", fontSize:8, fontWeight:900,
                  background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:6, color:"rgba(255,255,255,0.35)", cursor:"pointer",
                }}>{r}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
