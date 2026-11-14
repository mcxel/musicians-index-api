"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  BOBBLEHEAD_BASES,
  BOBBLEHEAD_DEFAULT_BASE_ID,
  getBobbleheadBaseById,
  type BobbleheadBase,
} from "@/lib/avatars/BobbleheadBaseRegistry";
import {
  bobbleheadRuntimeToRigProps,
  persistBobbleheadBaseId,
  readPersistedBobbleheadBaseId,
  resolveBobbleheadRuntimeCharacter,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";
import {
  FAN_SKIN_TONE_CONTINUUM,
  persistFanSkinT,
  readPersistedFanSkinT,
  sampleFanSkinTone,
} from "@/lib/avatars/FanCosmeticCatalog";
import {
  getCanonicalAvatarDraft,
  patchCanonicalAvatarDraft,
  subscribeCanonicalAvatarDraft,
  commitCanonicalDraftToFanWorld,
} from "@/lib/avatars/CanonicalAvatarDraft";
import {
  applyAvatarLookToDraft,
  resolveAvatarPreview,
} from "@/lib/avatars/AvatarPreviewRuntime";
import { migrateAvatarLook, type AvatarLook } from "@/lib/avatars/AvatarLook";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((m) => m.AvatarViewer),
  { ssr: false }
);

export type QuickPanelTab = "LOOKS" | "EMOTES" | "PROPS" | "BASE_SKIN";

export interface AvatarQuickChangeDrawerProps {
  onClose: () => void;
  onOpenFullCenter?: () => void;
}

const VENUE_EMOTES = [
  { id: "wave", label: "Wave", icon: "👋", action: "EMOTE" as const },
  { id: "clap", label: "Clap", icon: "👏", action: "EMOTE" as const },
  { id: "dance", label: "Dance", icon: "🕺", action: "DANCE" as const },
  { id: "hype", label: "Hype", icon: "🔥", action: "HYPE" as const },
  { id: "sit", label: "Sit", icon: "🪑", action: "SIT" as const },
  { id: "idle", label: "Reset", icon: "🧍", action: "IDLE" as const },
];

const VENUE_PROPS = [
  { id: "mic", label: "Gold Mic", icon: "🎤" },
  { id: "turntable_deck", label: "DJ Deck", icon: "🎧" },
  { id: "sunglasses", label: "Neon Shades", icon: "🕶️" },
  { id: "gold_chain", label: "Gold Chain", icon: "⛓️" },
  { id: "neck_headphones", label: "Headphones", icon: "🎧" },
  { id: "crown", label: "Champion Crown", icon: "👑" },
];

function loadSavedLooksForQuick(): AvatarLook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("tmi_avatar_saved_looks");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateAvatarLook).filter((x): x is AvatarLook => x !== null);
  } catch {
    return [];
  }
}

export default function AvatarQuickChangeDrawer({
  onClose,
  onOpenFullCenter,
}: AvatarQuickChangeDrawerProps) {
  const [activeTab, setActiveTab] = useState<QuickPanelTab>("LOOKS");
  const [draft, setDraft] = useState(() => getCanonicalAvatarDraft());
  const [savedLooks, setSavedLooks] = useState<AvatarLook[]>(() => loadSavedLooksForQuick());
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeCanonicalAvatarDraft((next) => {
      setDraft(next);
    });
    setSavedLooks(loadSavedLooksForQuick());
    return unsub;
  }, []);

  const selectedBase = useMemo(
    () => getBobbleheadBaseById(draft.baseId) ?? BOBBLEHEAD_BASES[0]!,
    [draft.baseId]
  );
  const skin = useMemo(() => sampleFanSkinTone(draft.skinT), [draft.skinT]);

  const preview = useMemo(() => {
    return resolveAvatarPreview({
      ...draft,
      displayName: selectedBase.displayName,
      fidelity: "full",
    });
  }, [draft, selectedBase.displayName]);

  const handleSelectBase = (baseId: string) => {
    patchCanonicalAvatarDraft({ baseId });
    persistBobbleheadBaseId(baseId);
    commitCanonicalDraftToFanWorld();
    showToast("Base Updated");
  };

  const handleSkinChange = (t: number) => {
    patchCanonicalAvatarDraft({ skinT: t });
    persistFanSkinT(t);
    commitCanonicalDraftToFanWorld();
  };

  const handleApplyLook = (look: AvatarLook) => {
    applyAvatarLookToDraft(look);
    commitCanonicalDraftToFanWorld();
    showToast(`Equipped "${look.name}"`);
  };

  const handleTriggerEmote = (action: typeof VENUE_EMOTES[number]["action"], label: string) => {
    patchCanonicalAvatarDraft({ previewAction: action });
    showToast(`Emote: ${label}`);
    if (action !== "IDLE" && action !== "SIT") {
      window.setTimeout(() => {
        patchCanonicalAvatarDraft({ previewAction: "IDLE" });
      }, 4500);
    }
  };

  const handleToggleProp = (propId: string) => {
    const isEquipped = draft.equippedCosmeticIds.includes(propId);
    const nextIds = isEquipped
      ? draft.equippedCosmeticIds.filter((id) => id !== propId)
      : [...draft.equippedCosmeticIds, propId];
    patchCanonicalAvatarDraft({
      equippedCosmeticIds: nextIds,
      activePropId: isEquipped ? undefined : propId,
    });
    commitCanonicalDraftToFanWorld();
    showToast(isEquipped ? "Prop Removed" : "Prop Equipped");
  };

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    window.setTimeout(() => setActionFeedback(null), 1800);
  };

  return (
    <div
      data-testid="tmi-avatar-quick-change-drawer"
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 50,
        width: 320,
        maxHeight: "85vh",
        background: "rgba(5,5,18,0.98)",
        border: "1px solid rgba(0,255,255,0.45)",
        borderRadius: 14,
        padding: 12,
        boxShadow: "0 20px 50px rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        backdropFilter: "blur(12px)",
        overflowY: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: "#00FFFF" }}>
            👤 VENUE AVATAR QUICK PANEL
          </span>
          {actionFeedback && (
            <span style={{ fontSize: 8, color: "#00FF88", fontWeight: 800 }}>
              {actionFeedback}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            fontSize: 9,
            fontWeight: 800,
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#fff",
            borderRadius: 4,
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* 3D Mini Viewport with Luminous Platform */}
      <div
        data-avatar-quick-viewport="1"
        style={{
          height: 160,
          minHeight: 160,
          width: "100%",
          borderRadius: 10,
          border: "1px solid rgba(0,255,255,0.3)",
          background: "radial-gradient(ellipse at center, rgba(0,255,255,0.1) 0%, rgba(5,5,16,0.95) 75%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <AvatarViewer
            {...(preview.rigProps ?? {})}
            size={160}
            fill
            enableOrbit={true}
            cameraFocus="body"
            isPlaying={draft.previewAction !== "IDLE"}
          />
        </div>
        {/* Luminous Platform */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: 100,
            height: 14,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,255,255,0.3) 0%, transparent 70%)",
            boxShadow: "0 0 15px rgba(0,255,255,0.4)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 4,
            right: 4,
            background: "rgba(0,0,0,0.75)",
            padding: "2px 6px",
            borderRadius: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>
            {selectedBase.displayName} · {skin.label}
          </span>
          <span style={{ fontSize: 7, color: "#00FFFF", fontWeight: 700 }}>
            {draft.previewAction}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3 }}>
        {[
          { id: "LOOKS" as QuickPanelTab, label: "🎨 LOOKS" },
          { id: "EMOTES" as QuickPanelTab, label: "🕺 EMOTES" },
          { id: "PROPS" as QuickPanelTab, label: "🎤 PROPS" },
          { id: "BASE_SKIN" as QuickPanelTab, label: "👗 STYLE" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-testid={`quick-tab-${tab.id.toLowerCase()}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontSize: 8,
              fontWeight: 900,
              padding: "5px 2px",
              borderRadius: 6,
              border: `1px solid ${activeTab === tab.id ? "#00FFFF" : "rgba(255,255,255,0.12)"}`,
              background: activeTab === tab.id ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.03)",
              color: activeTab === tab.id ? "#00FFFF" : "rgba(255,255,255,0.6)",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: LOOKS */}
      {activeTab === "LOOKS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 150, overflowY: "auto" }}>
          {savedLooks.length === 0 ? (
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", textAlign: "center", padding: "12px 0" }}>
              No saved looks yet. Create loadouts in Full Studio!
            </div>
          ) : (
            savedLooks.map((look) => (
              <button
                key={look.lookId}
                type="button"
                data-testid={`quick-look-${look.lookId}`}
                onClick={() => handleApplyLook(look)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(0,255,255,0.2)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <span>{look.name}</span>
                <span style={{ fontSize: 7, color: "#FFD700" }}>EQUIP →</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Tab 2: EMOTES */}
      {activeTab === "EMOTES" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {VENUE_EMOTES.map((em) => (
            <button
              key={em.id}
              type="button"
              data-testid={`quick-emote-${em.id}`}
              onClick={() => handleTriggerEmote(em.action, em.label)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "6px 2px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 16 }}>{em.icon}</span>
              <span style={{ fontSize: 8, fontWeight: 800, marginTop: 2 }}>{em.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tab 3: PROPS */}
      {activeTab === "PROPS" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 4 }}>
          {VENUE_PROPS.map((prop) => {
            const isEquipped = draft.equippedCosmeticIds.includes(prop.id);
            return (
              <button
                key={prop.id}
                type="button"
                data-testid={`quick-prop-${prop.id}`}
                onClick={() => handleToggleProp(prop.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 8px",
                  borderRadius: 6,
                  background: isEquipped ? "rgba(0,255,255,0.18)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isEquipped ? "#00FFFF" : "rgba(255,255,255,0.12)"}`,
                  color: isEquipped ? "#00FFFF" : "#fff",
                  fontSize: 8,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <span>{prop.icon}</span>
                <span>{prop.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab 4: BASE & SKIN */}
      {activeTab === "BASE_SKIN" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>
            AVATAR BASE
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
            {BOBBLEHEAD_BASES.slice(0, 6).map((base) => (
              <button
                key={base.id}
                type="button"
                onClick={() => handleSelectBase(base.id)}
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  padding: "4px 2px",
                  borderRadius: 5,
                  border: `1px solid ${draft.baseId === base.id ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
                  background: draft.baseId === base.id ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.03)",
                  color: draft.baseId === base.id ? "#00FFFF" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {base.displayName.split(" ")[0]}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginTop: 4 }}>
            SKIN TONE CONTINUUM
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {FAN_SKIN_TONE_CONTINUUM.slice(0, 8).map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.label}
                onClick={() => handleSkinChange(s.t)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: s.hex,
                  border: Math.abs(draft.skinT - s.t) < 0.08 ? "2px solid #00FFFF" : "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 6, marginTop: 4, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 6 }}>
        <button
          type="button"
          onClick={() => {
            commitCanonicalDraftToFanWorld();
            onClose();
          }}
          style={{
            flex: 1,
            fontSize: 9,
            fontWeight: 900,
            padding: "8px 10px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #00FFFF, #AA2DFF)",
            color: "#050510",
            border: "none",
            cursor: "pointer",
          }}
        >
          ✓ DONE & KEEP
        </button>

        {onOpenFullCenter ? (
          <button
            type="button"
            data-testid="quick-open-full-studio-btn"
            onClick={() => {
              onClose();
              onOpenFullCenter();
            }}
            style={{
              fontSize: 8,
              fontWeight: 800,
              padding: "8px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(0,255,255,0.4)",
              color: "#00FFFF",
              cursor: "pointer",
            }}
          >
            FULL STUDIO →
          </button>
        ) : (
          <Link
            href="/avatar/studio"
            onClick={onClose}
            style={{
              fontSize: 8,
              fontWeight: 800,
              padding: "8px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(0,255,255,0.4)",
              color: "#00FFFF",
              textAlign: "center",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            FULL STUDIO →
          </Link>
        )}
      </div>
    </div>
  );
}
