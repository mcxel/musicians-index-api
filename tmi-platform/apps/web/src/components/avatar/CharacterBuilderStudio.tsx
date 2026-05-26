"use client";

import { useState, useCallback, useRef } from "react";
import {
  SKIN_TONES, AGE_GROUP_LABELS, HEIGHT_LABELS, BUILD_LABELS,
  OUTFIT_PRESETS, ACCESSORIES, buildDefaultSpec,
  type AvatarSpec, type AgeGroup, type HeightTier, type BodyBuild, type FaceShape,
} from "@/lib/avatar/AvatarBodyTypeEngine";
import { DANCE_MOVES, TIER_NAMES, TIER_COLORS, getTierProgress } from "@/lib/avatar/CharacterEvolutionEngine";
import { TMI_CHARACTERS, BODY_PRESETS, type TMICharacter } from "@/lib/avatar/TMICharacterRoster";

// ─── CSS 360° Avatar figure ────────────────────────────────────────────────────

function AvatarFigure({
  spec,
  rotationY,
  dancing,
  activeMoveId,
}: {
  spec: AvatarSpec;
  rotationY: number;
  dancing: boolean;
  activeMoveId: string | null;
}) {
  const skin = SKIN_TONES.find((s) => s.id === spec.skinToneId) ?? SKIN_TONES[4];
  const buildW = {
    slim: 0.72, lean: 0.85, athletic: 0.96, average: 1,
    stocky: 1.12, heavy: 1.28, large: 1.45,
  }[spec.bodyBuild] ?? 1;

  const heightMult = { "very-short": 0.68, short: 0.84, average: 1, tall: 1.14, "very-tall": 1.28 }[spec.heightTier] ?? 1;

  const isBack = rotationY > 100 && rotationY < 260;
  const isSide = (rotationY > 40 && rotationY < 130) || (rotationY > 230 && rotationY < 310);

  const outfit = OUTFIT_PRESETS.find((o) => o.id === spec.outfitId);
  const bodyColor = outfit?.primaryColor ?? "#1a1a2e";
  const accentColor = outfit?.accentColor ?? "#00FFFF";

  // Age proportions — head ratio
  const headRatio = { toddler: 0.28, child: 0.24, preteen: 0.21, teen: 0.19, "young-adult": 0.17, adult: 0.17, "middle-age": 0.17, mature: 0.17, senior: 0.18 }[spec.ageGroup] ?? 0.17;
  const totalH = 220 * heightMult;
  const headH = totalH * headRatio * 1.4;
  const bodyH = totalH * 0.38;
  const legH = totalH - headH - bodyH - 4;
  const bodyW = 70 * buildW;
  const headW = headH * 0.88;

  const danceAnim = dancing && activeMoveId ? `${activeMoveId}Anim 0.6s ease infinite alternate` : "none";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `rotateY(${isBack ? 180 : 0}deg) rotateZ(${isSide ? (rotationY < 180 ? -8 : 8) : 0}deg)`,
        transition: "transform 0.1s linear",
        animation: dancing ? `${activeMoveId ?? "dmBounce"}AvatarAnim 0.5s ease infinite alternate` : "none",
        gap: 2,
        position: "relative",
      }}
    >
      {/* Face scan glow */}
      {spec.faceScanLinked && (
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: headW + 12, height: headH + 12,
          borderRadius: "50%",
          boxShadow: `0 0 20px ${accentColor}88`,
          pointerEvents: "none",
          zIndex: 10,
        }} />
      )}

      {/* Head */}
      <div style={{
        width: headW,
        height: headH,
        borderRadius: spec.faceShape === "oval" ? "50%" :
                      spec.faceShape === "round" ? "50%" :
                      spec.faceShape === "square" ? "20%" :
                      spec.faceShape === "heart" ? "50% 50% 40% 40% / 50% 50% 60% 60%" :
                      spec.faceShape === "diamond" ? "30% 70% 70% 30% / 50% 50% 50% 50%" :
                      "40%",
        background: `linear-gradient(145deg, ${skin.highlightHex} 20%, ${skin.hex} 60%, ${skin.shadowHex} 100%)`,
        position: "relative",
        flexShrink: 0,
      }}>
        {/* Eyes */}
        {!isBack && (
          <div style={{ position: "absolute", top: "38%", left: 0, right: 0, display: "flex", justifyContent: "center", gap: headW * 0.22, padding: "0 20%" }}>
            <div style={{ width: headW * 0.12, height: headW * 0.12, borderRadius: "50%", background: "#0a0a1a" }} />
            <div style={{ width: headW * 0.12, height: headW * 0.12, borderRadius: "50%", background: "#0a0a1a" }} />
          </div>
        )}
        {/* Mouth */}
        {!isBack && (
          <div style={{ position: "absolute", bottom: "22%", left: "25%", right: "25%", height: 2, borderRadius: 2, background: skin.shadowHex }} />
        )}
      </div>

      {/* Neck */}
      <div style={{ width: headW * 0.28, height: totalH * 0.04, background: skin.hex, flexShrink: 0 }} />

      {/* Torso */}
      <div style={{
        width: bodyW,
        height: bodyH,
        borderRadius: "12px 12px 6px 6px",
        background: `linear-gradient(160deg, ${accentColor}22, ${bodyColor} 40%)`,
        border: `1px solid ${accentColor}44`,
        position: "relative",
        flexShrink: 0,
      }}>
        {/* Logo dot */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
        {/* Arms */}
        <div style={{ position: "absolute", top: "10%", left: -bodyW * 0.25 - 2, width: bodyW * 0.22, height: bodyH * 0.72, borderRadius: "6px 4px 8px 8px", background: bodyColor, border: `1px solid ${accentColor}33` }} />
        <div style={{ position: "absolute", top: "10%", right: -bodyW * 0.25 - 2, width: bodyW * 0.22, height: bodyH * 0.72, borderRadius: "4px 6px 8px 8px", background: bodyColor, border: `1px solid ${accentColor}33` }} />
      </div>

      {/* Legs */}
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <div style={{ width: bodyW * 0.37, height: legH * 0.55, borderRadius: "4px", background: bodyColor, border: `1px solid ${accentColor}22` }} />
        <div style={{ width: bodyW * 0.37, height: legH * 0.55, borderRadius: "4px", background: bodyColor, border: `1px solid ${accentColor}22` }} />
      </div>
      {/* Feet */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <div style={{ width: bodyW * 0.4, height: legH * 0.3, borderRadius: "4px 6px 6px 4px", background: "#0a0a14", border: `1px solid ${accentColor}33` }} />
        <div style={{ width: bodyW * 0.4, height: legH * 0.3, borderRadius: "6px 4px 4px 6px", background: "#0a0a14", border: `1px solid ${accentColor}33` }} />
      </div>

      <style>{`
        @keyframes dmBounceAvatarAnim { from { transform: translateY(0); } to { transform: translateY(-8px); } }
        @keyframes dmTwoStepAvatarAnim { from { transform: translateX(-6px) rotate(-2deg); } to { transform: translateX(6px) rotate(2deg); } }
        @keyframes dmHeadBobAvatarAnim { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
        @keyframes dmBodyWaveAvatarAnim { from { transform: scaleX(0.95) rotate(-2deg); } to { transform: scaleX(1.05) rotate(2deg); } }
        @keyframes dmFreezeAvatarAnim { 0%,100% { transform: scale(1.06) rotate(4deg); } 50% { transform: scale(1) rotate(0deg); } }
        @keyframes dmWindmillAvatarAnim { from { transform: rotate(-15deg) scale(1.04); } to { transform: rotate(15deg) scale(0.96); } }
      `}</style>
    </div>
  );
}

// ─── Named Character Card ──────────────────────────────────────────────────────

function NamedCharacterCard({ char, selected, onSelect }: { char: TMICharacter; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        background: selected ? `${char.accentColor}18` : "rgba(255,255,255,0.03)",
        border: `1px solid ${selected ? char.accentColor + "88" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 10,
        padding: "12px 14px",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${char.accentColor}44, ${char.secondaryColor}22)`, border: `2px solid ${char.accentColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
          {char.characterType === "robot" ? "🤖" : char.characterType === "animal" ? "🐾" : "🎤"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: selected ? char.accentColor : "#fff", letterSpacing: "0.06em" }}>{char.name}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{char.role.toUpperCase()}</div>
        </div>
      </div>
      {selected && (
        <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, fontStyle: "italic" }}>
          {char.tagline}
        </div>
      )}
    </button>
  );
}

// ─── Main Studio ───────────────────────────────────────────────────────────────

export default function CharacterBuilderStudio() {
  const [mode, setMode] = useState<"build" | "named" | "roster">("named");
  const [spec, setSpec] = useState<AvatarSpec>(() => buildDefaultSpec());
  const [selectedCharId, setSelectedCharId] = useState<string>("bebo");
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dancing, setDancing] = useState(false);
  const [activeMoveId, setActiveMoveId] = useState<string | null>(null);
  const [tab, setTab] = useState<"body" | "skin" | "outfit" | "dance" | "evolution">("body");
  const rotRef = useRef(rotationY);
  rotRef.current = rotationY;

  const selectedChar = TMI_CHARACTERS.find((c) => c.id === selectedCharId);
  const displaySpec = mode === "named" && selectedChar ? selectedChar.avatarSpec : spec;
  const tierProgress = getTierProgress(displaySpec.id);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX;
    setRotationY((r) => (r + delta * 0.8 + 360) % 360);
    setDragStartX(e.clientX);
  }, [isDragging, dragStartX]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  function triggerDance(moveId: string) {
    setActiveMoveId(moveId);
    setDancing(true);
    const move = DANCE_MOVES.find((m) => m.id === moveId);
    if (move && !move.loopable) {
      setTimeout(() => setDancing(false), move.durationMs);
    }
  }

  const freeRotate = () => {
    let r = rotRef.current;
    const step = () => {
      r = (r + 1.5) % 360;
      setRotationY(r);
    };
    const id = setInterval(step, 16);
    setTimeout(() => clearInterval(id), 3000);
  };

  return (
    <div style={{ background: "#050510", color: "#fff", minHeight: "100vh", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 6 }}>TMI CHARACTER STUDIO</div>
        <h1 style={{ margin: 0, fontSize: "clamp(1.4rem,3vw,2.2rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>Build Your Identity</h1>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          360° · All body types · All ages · Dance-ready · Face scan compatible
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {(["named", "build", "roster"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{ flex: 1, padding: "12px 8px", background: mode === m ? "rgba(255,45,170,0.08)" : "transparent", border: "none", borderBottom: `2px solid ${mode === m ? "#FF2DAA" : "transparent"}`, color: mode === m ? "#FF2DAA" : "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", cursor: "pointer", transition: "all 0.2s" }}
          >
            {m === "named" ? "🎭 CHARACTERS" : m === "build" ? "🛠️ BUILD YOURS" : "👥 ROSTER"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mode === "roster" ? "1fr" : "1fr 340px", minHeight: "calc(100vh - 140px)" }}>
        {/* ── LEFT: 360° preview ── */}
        {mode !== "roster" && (
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", userSelect: "none", cursor: isDragging ? "grabbing" : "grab", position: "relative", background: "radial-gradient(ellipse at center, rgba(0,255,255,0.04) 0%, transparent 70%)" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Rotation hint */}
            <div style={{ position: "absolute", top: 16, left: 0, right: 0, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", pointerEvents: "none" }}>
              DRAG TO ROTATE 360°
            </div>

            {/* Character name */}
            {mode === "named" && selectedChar && (
              <div style={{ position: "absolute", top: 36, left: 0, right: 0, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: selectedChar.accentColor, letterSpacing: "-0.02em" }}>{selectedChar.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginTop: 2 }}>{selectedChar.role.toUpperCase()} · {selectedChar.characterType.toUpperCase()}</div>
              </div>
            )}

            {/* Evolution tier badge */}
            <div style={{ position: "absolute", top: mode === "named" ? 96 : 36, right: 20, background: `${tierProgress.tierColor}22`, border: `1px solid ${tierProgress.tierColor}66`, borderRadius: 20, padding: "4px 12px", fontSize: 9, color: tierProgress.tierColor, fontWeight: 800, letterSpacing: "0.15em" }}>
              {tierProgress.tierName.toUpperCase()}
            </div>

            {/* 3D figure */}
            <div style={{ margin: "80px 0 20px", transform: `perspective(600px)`, display: "flex", justifyContent: "center" }}>
              <AvatarFigure
                spec={displaySpec}
                rotationY={rotationY}
                dancing={dancing}
                activeMoveId={activeMoveId}
              />
            </div>

            {/* Angle indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                {rotationY < 45 || rotationY > 315 ? "FRONT" :
                 rotationY < 135 ? "RIGHT" :
                 rotationY < 225 ? "BACK" : "LEFT"}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)" }}>{Math.round(rotationY)}°</div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={freeRotate} style={{ padding: "8px 16px", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, color: "#00FFFF", fontSize: 10, cursor: "pointer", fontWeight: 700, letterSpacing: "0.1em" }}>
                🔄 AUTO-ROTATE
              </button>
              <button
                onClick={() => { if (dancing) { setDancing(false); setActiveMoveId(null); } else { triggerDance("bounce"); } }}
                style={{ padding: "8px 16px", background: dancing ? "rgba(255,45,170,0.15)" : "rgba(255,45,170,0.06)", border: `1px solid ${dancing ? "#FF2DAA88" : "rgba(255,45,170,0.2)"}`, borderRadius: 8, color: "#FF2DAA", fontSize: 10, cursor: "pointer", fontWeight: 700, letterSpacing: "0.1em" }}
              >
                {dancing ? "⏸ STOP" : "💃 DANCE"}
              </button>
              {spec.faceScanLinked || displaySpec.faceScanLinked ? (
                <div style={{ padding: "8px 14px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, color: "#00FF88", fontSize: 10, fontWeight: 700 }}>
                  ✅ FACE LINKED
                </div>
              ) : (
                <button
                  onClick={() => setSpec((s) => ({ ...s, faceScanLinked: true }))}
                  style={{ padding: "8px 16px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, color: "#00FF88", fontSize: 10, cursor: "pointer", fontWeight: 700, letterSpacing: "0.1em" }}
                >
                  📷 FACE SCAN
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── RIGHT: Controls ── */}
        {mode === "named" && (
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", overflowY: "auto", maxHeight: "calc(100vh - 140px)" }}>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>SELECT CHARACTER</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {TMI_CHARACTERS.map((c) => (
                  <NamedCharacterCard
                    key={c.id}
                    char={c}
                    selected={selectedCharId === c.id}
                    onSelect={() => setSelectedCharId(c.id)}
                  />
                ))}
              </div>

              {selectedChar && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>SIGNATURE MOVES</div>
                  {selectedChar.signatureMoves.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => triggerDance(m.id)}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${selectedChar.accentColor}22`, borderRadius: 8, color: "#fff", fontSize: 11, cursor: "pointer", textAlign: "left", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <span>{m.name}</span>
                      <span style={{ fontSize: 9, color: selectedChar.accentColor, letterSpacing: "0.1em" }}>{m.triggerOn.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "build" && (
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", overflowY: "auto", maxHeight: "calc(100vh - 140px)" }}>
            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
              {(["body", "skin", "outfit", "dance", "evolution"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{ flex: 1, minWidth: 60, padding: "10px 6px", background: tab === t ? "rgba(255,45,170,0.08)" : "transparent", border: "none", borderBottom: `2px solid ${tab === t ? "#FF2DAA" : "transparent"}`, color: tab === t ? "#FF2DAA" : "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", cursor: "pointer" }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ padding: 16 }}>
              {/* Body tab */}
              {tab === "body" && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>QUICK PRESETS</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 20 }}>
                    {BODY_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSpec((s) => ({ ...s, ageGroup: p.ageGroup as AgeGroup, heightTier: p.heightTier as HeightTier, bodyBuild: p.bodyBuild as BodyBuild }))}
                        style={{ padding: "8px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, cursor: "pointer", textAlign: "left" }}
                      >
                        <div style={{ fontSize: 14 }}>{p.icon}</div>
                        <div style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>{p.label}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{p.description}</div>
                      </button>
                    ))}
                  </div>

                  {/* Age group */}
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>AGE GROUP</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
                    {(Object.entries(AGE_GROUP_LABELS) as [AgeGroup, string][]).map(([key, label]) => (
                      <button key={key} onClick={() => setSpec((s) => ({ ...s, ageGroup: key }))}
                        style={{ padding: "5px 10px", borderRadius: 16, border: `1px solid ${spec.ageGroup === key ? "#FF2DAA88" : "rgba(255,255,255,0.1)"}`, background: spec.ageGroup === key ? "rgba(255,45,170,0.12)" : "transparent", color: spec.ageGroup === key ? "#FF2DAA" : "rgba(255,255,255,0.4)", fontSize: 9, cursor: "pointer", fontWeight: 700 }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Height */}
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>HEIGHT</div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                    {(Object.entries(HEIGHT_LABELS) as [HeightTier, string][]).map(([key, label]) => (
                      <button key={key} onClick={() => setSpec((s) => ({ ...s, heightTier: key }))}
                        style={{ flex: 1, padding: "6px 4px", borderRadius: 8, border: `1px solid ${spec.heightTier === key ? "#00FFFF88" : "rgba(255,255,255,0.08)"}`, background: spec.heightTier === key ? "rgba(0,255,255,0.1)" : "transparent", color: spec.heightTier === key ? "#00FFFF" : "rgba(255,255,255,0.35)", fontSize: 8, cursor: "pointer", fontWeight: 700 }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Build */}
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>BUILD</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(Object.entries(BUILD_LABELS) as [BodyBuild, string][]).map(([key, label]) => (
                      <button key={key} onClick={() => setSpec((s) => ({ ...s, bodyBuild: key }))}
                        style={{ padding: "5px 10px", borderRadius: 16, border: `1px solid ${spec.bodyBuild === key ? "#AA2DFF88" : "rgba(255,255,255,0.1)"}`, background: spec.bodyBuild === key ? "rgba(170,45,255,0.12)" : "transparent", color: spec.bodyBuild === key ? "#AA2DFF" : "rgba(255,255,255,0.4)", fontSize: 9, cursor: "pointer", fontWeight: 700 }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skin tab */}
              {tab === "skin" && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>SKIN TONE</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {SKIN_TONES.map((tone) => (
                      <button key={tone.id} onClick={() => setSpec((s) => ({ ...s, skinToneId: tone.id }))}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${tone.highlightHex}, ${tone.hex} 50%, ${tone.shadowHex})`, border: `3px solid ${spec.skinToneId === tone.id ? "#FF2DAA" : "rgba(255,255,255,0.1)"}`, boxShadow: spec.skinToneId === tone.id ? `0 0 12px #FF2DAA66` : "none", transition: "all 0.2s" }} />
                        <div style={{ fontSize: 8, color: spec.skinToneId === tone.id ? "#FF2DAA" : "rgba(255,255,255,0.3)", textAlign: "center", fontWeight: 700, letterSpacing: "0.05em" }}>{tone.label}</div>
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: 20, fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>FACE SHAPE</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(["oval", "round", "square", "heart", "diamond", "oblong"] as FaceShape[]).map((shape) => (
                      <button key={shape} onClick={() => setSpec((s) => ({ ...s, faceShape: shape }))}
                        style={{ padding: "6px 12px", borderRadius: 16, border: `1px solid ${spec.faceShape === shape ? "#FFD70088" : "rgba(255,255,255,0.1)"}`, background: spec.faceShape === shape ? "rgba(255,215,0,0.1)" : "transparent", color: spec.faceShape === shape ? "#FFD700" : "rgba(255,255,255,0.4)", fontSize: 9, cursor: "pointer", fontWeight: 700 }}>
                        {shape.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Outfit tab */}
              {tab === "outfit" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {OUTFIT_PRESETS.map((o) => {
                    const locked = (o.unlockedAtTier ?? 0) > (spec.evolutionTier ?? 0);
                    return (
                      <button key={o.id} disabled={locked} onClick={() => !locked && setSpec((s) => ({ ...s, outfitId: o.id }))}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: spec.outfitId === o.id ? `${o.accentColor}15` : "rgba(255,255,255,0.03)", border: `1px solid ${spec.outfitId === o.id ? o.accentColor + "66" : "rgba(255,255,255,0.06)"}`, borderRadius: 8, cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.35 : 1 }}>
                        <span style={{ fontSize: 18 }}>{o.icon}</span>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{o.label}</div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{o.category.toUpperCase()}</div>
                        </div>
                        {locked && <div style={{ fontSize: 9, color: "#FF2DAA", fontWeight: 700 }}>TIER {o.unlockedAtTier}+</div>}
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: o.accentColor }} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dance tab */}
              {tab === "dance" && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>AVAILABLE MOVES</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {DANCE_MOVES.filter((m) => m.unlockedAtTier <= (spec.evolutionTier ?? 0)).map((move) => (
                      <button key={move.id} onClick={() => triggerDance(move.id)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: activeMoveId === move.id && dancing ? "rgba(255,45,170,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${activeMoveId === move.id && dancing ? "#FF2DAA88" : "rgba(255,255,255,0.06)"}`, borderRadius: 8, cursor: "pointer" }}>
                        <span style={{ fontSize: 18 }}>{move.icon}</span>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{move.name}</div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{move.description}</div>
                        </div>
                        <div style={{ fontSize: 9, color: "#AA2DFF", letterSpacing: "0.1em", fontWeight: 700 }}>{move.category.toUpperCase()}</div>
                      </button>
                    ))}
                    {DANCE_MOVES.filter((m) => m.unlockedAtTier > (spec.evolutionTier ?? 0)).length > 0 && (
                      <div style={{ padding: "10px", fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
                        +{DANCE_MOVES.filter((m) => m.unlockedAtTier > (spec.evolutionTier ?? 0)).length} moves locked — level up to unlock
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Evolution tab */}
              {tab === "evolution" && (
                <div>
                  <div style={{ marginBottom: 16, padding: "12px 14px", background: `${tierProgress.tierColor}10`, border: `1px solid ${tierProgress.tierColor}33`, borderRadius: 10 }}>
                    <div style={{ fontSize: 9, letterSpacing: "0.2em", color: tierProgress.tierColor, marginBottom: 4, fontWeight: 800 }}>CURRENT TIER</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: tierProgress.tierColor }}>{tierProgress.tierName}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{tierProgress.xp.toLocaleString()} XP</div>
                    <div style={{ marginTop: 8, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${tierProgress.pct}%`, background: tierProgress.tierColor, borderRadius: 2, transition: "width 0.4s" }} />
                    </div>
                    {tierProgress.xpToNext !== null && (
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{tierProgress.xpToNext.toLocaleString()} XP to next tier</div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[0, 1, 2, 3, 4, 5, 6].map((t) => {
                      const passed = t <= (spec.evolutionTier ?? 0);
                      const color = TIER_COLORS[t as keyof typeof TIER_COLORS];
                      const name = TIER_NAMES[t as keyof typeof TIER_NAMES];
                      return (
                        <div key={t} style={{ padding: "8px 12px", background: passed ? `${color}08` : "rgba(255,255,255,0.02)", border: `1px solid ${passed ? color + "44" : "rgba(255,255,255,0.06)"}`, borderRadius: 8, opacity: passed ? 1 : 0.45, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 11, color: passed ? color : "rgba(255,255,255,0.4)", fontWeight: 800 }}>TIER {t} — {name.toUpperCase()}</div>
                          {passed && <div style={{ fontSize: 9, color: color }}>✓</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roster view */}
        {mode === "roster" && (
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 20 }}>OFFICIAL TMI CAST</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {TMI_CHARACTERS.map((c) => (
                <div key={c.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${c.accentColor}33`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ height: 6, background: `linear-gradient(90deg, ${c.accentColor}, ${c.secondaryColor})` }} />
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: `radial-gradient(circle at 35%, ${c.accentColor}44, ${c.secondaryColor}22)`, border: `2px solid ${c.accentColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        {c.characterType === "robot" ? "🤖" : c.characterType === "animal" ? "🐾" : c.characterType === "ai-construct" ? "🌐" : "🎤"}
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: c.accentColor }}>{c.name}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>{c.role.toUpperCase()} · {c.characterType.toUpperCase()}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 0 12px" }}>{c.tagline}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {c.faceScanCompatible && <span style={{ fontSize: 9, padding: "2px 8px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 10, color: "#00FF88" }}>FACE SCAN</span>}
                      {c.worldDancePartyEnabled && <span style={{ fontSize: 9, padding: "2px 8px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, color: "#FFD700" }}>DANCE PARTY</span>}
                      {c.evolutionEnabled && <span style={{ fontSize: 9, padding: "2px 8px", background: `${c.accentColor}10`, border: `1px solid ${c.accentColor}33`, borderRadius: 10, color: c.accentColor }}>EVOLVES</span>}
                    </div>
                    <button
                      onClick={() => { setMode("named"); setSelectedCharId(c.id); }}
                      style={{ width: "100%", marginTop: 12, padding: "8px", background: `${c.accentColor}10`, border: `1px solid ${c.accentColor}44`, borderRadius: 8, color: c.accentColor, fontSize: 10, fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em" }}
                    >
                      VIEW 360° →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 20 }}>ALL BODY PRESETS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                {BODY_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setMode("build"); setSpec((s) => ({ ...s, ageGroup: p.ageGroup as AgeGroup, heightTier: p.heightTier as HeightTier, bodyBuild: p.bodyBuild as BodyBuild })); }}
                    style={{ padding: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon}</div>
                    <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{p.label}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{p.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
