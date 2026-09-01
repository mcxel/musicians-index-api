"use client";

/**
 * AvatarCreationCenter — Rule 15 canonical canister.
 * Wraps AvatarCreator + bobblehead base picker + Fan cosmetic rack (skin continuum).
 * Rule 26: ownership UI is Fan-only via RoleGate.
 */

import RoleGate from "@/components/auth/RoleGate";
import { AvatarCreator } from "@/components/AvatarCreator";
import BobbleheadBasePicker from "@/components/avatar/BobbleheadBasePicker";
import {
  BOBBLEHEAD_DEFAULT_BASE_ID,
  getBobbleheadBaseById,
  type BobbleheadBase,
} from "@/lib/avatars/BobbleheadBaseRegistry";
import {
  FAN_SKIN_TONE_CONTINUUM,
  getFanCosmeticCatalogStats,
  listActionEmotes,
  listDanceEmotes,
  listEquippableAccessories,
  listEquippableEmotes,
  listEquippableHair,
  listEquippableInstruments,
  listEquippableProps,
  listFanCosmeticsByCategory,
  persistFanSkinT,
  readPersistedFanSkinT,
  sampleFanSkinTone,
  type FanCosmeticDef,
} from "@/lib/avatars/FanCosmeticCatalog";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  AVATAR_GLB_REGISTRY,
  type AvatarGlbSlotId,
} from "@/lib/avatars/AvatarGlbRegistry";
import {
  bobbleheadRuntimeToRigProps,
  persistBobbleheadBaseId,
  persistFaceIdentityProfile,
  readPersistedBobbleheadBaseId,
  readPersistedFaceIdentityProfile,
  resolveBobbleheadRuntimeCharacter,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";
import { AvatarFaceIdentityDirector } from "@/lib/avatar/AvatarFaceIdentityDirector";
import type { AvatarFaceIdentityProfile } from "@/lib/avatar/AvatarFaceIdentityContract";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((m) => m.AvatarViewer),
  { ssr: false },
);

interface AvatarCreationCenterProps {
  accentColor?: string;
}

type RackTab =
  | "cool"
  | "hair"
  | "glasses"
  | "clothes"
  | "props"
  | "dances"
  | "actions"
  | "emotes"
  | "instruments";

export function AvatarCreationCenter({ accentColor = "#AA2DFF" }: AvatarCreationCenterProps) {
  const [baseId, setBaseId] = useState(BOBBLEHEAD_DEFAULT_BASE_ID);
  const [skinT, setSkinT] = useState(() => readPersistedFanSkinT());
  const [rackTab, setRackTab] = useState<RackTab>("cool");
  const selected = getBobbleheadBaseById(baseId);
  const skin = useMemo(() => sampleFanSkinTone(skinT), [skinT]);
  const stats = useMemo(() => getFanCosmeticCatalogStats(), []);

  const onSelect = useCallback((base: BobbleheadBase) => {
    setBaseId(base.id);
    persistBobbleheadBaseId(base.id);
  }, []);

  const onSkin = useCallback((t: number) => {
    setSkinT(t);
    persistFanSkinT(t);
  }, []);

  const rackItems: FanCosmeticDef[] = useMemo(() => {
    switch (rackTab) {
      case "hair":
        return listEquippableHair();
      case "glasses":
        return listFanCosmeticsByCategory("glasses");
      case "clothes":
        return [
          ...listFanCosmeticsByCategory("tops"),
          ...listFanCosmeticsByCategory("bottoms"),
          ...listFanCosmeticsByCategory("clothing"),
          ...listFanCosmeticsByCategory("jackets"),
          ...listFanCosmeticsByCategory("shoes"),
          ...listFanCosmeticsByCategory("outfits"),
        ];
      case "props":
        return listEquippableProps().filter((c) => c.inventoryCategory !== "instruments");
      case "dances":
        return listDanceEmotes();
      case "actions":
        return listActionEmotes();
      case "emotes":
        return listEquippableEmotes().filter((c) => c.emoteKind !== "action" && c.emoteKind !== "dance");
      case "instruments":
        return listEquippableInstruments();
      default:
        return [
          ...listEquippableAccessories().slice(0, 12),
          ...listFanCosmeticsByCategory("headphones"),
          ...listFanCosmeticsByCategory("auras").slice(0, 4),
          ...listFanCosmeticsByCategory("vfx").slice(0, 4),
        ];
    }
  }, [rackTab]);

  const tabs: { id: RackTab; label: string }[] = [
    { id: "cool", label: "Cool" },
    { id: "hair", label: "Hair" },
    { id: "glasses", label: "Glasses" },
    { id: "clothes", label: "Fits" },
    { id: "props", label: "Props" },
    { id: "dances", label: "Dances" },
    { id: "actions", label: "Actions" },
    { id: "emotes", label: "Gestures" },
    { id: "instruments", label: "Band" },
  ];

  return (
    <RoleGate
      allow={["FAN", "USER", "ADMIN", "STAFF"]}
      fallback={
        <div
          style={{
            padding: 18,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${accentColor}22`,
            borderRadius: 14,
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          Avatar ownership is Fan-only. Performers use real photo / live camera identity.
        </div>
      }
    >
      <div
        style={{
          background: "rgba(255,255,255,0.015)",
          border: `1px solid ${accentColor}22`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${accentColor}18` }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
            👤 AVATAR CREATION CENTER
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
            Bobblehead base + skin continuum + cosmetics → AvatarRig in lobbies / Arena seats.
          </div>
        </div>

        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${accentColor}12` }}>
          <BobbleheadBasePicker
            selectedBaseId={baseId}
            onSelect={onSelect}
            accentColor={accentColor}
          />
          {selected && (
            <div style={{ marginTop: 10, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
              Selected: <span style={{ color: "#fff", fontWeight: 700 }}>{selected.displayName}</span>
              {" · "}
              {selected.previewHonestyLabel}
            </div>
          )}
        </div>

        {/* Global skin tone continuum */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${accentColor}12` }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>
            SKIN TONE · GLOBAL CONTINUUM
          </div>
          <div
            style={{
              height: 18,
              borderRadius: 9,
              marginBottom: 8,
              background: `linear-gradient(90deg, ${FAN_SKIN_TONE_CONTINUUM.map((s) => s.hex).join(", ")})`,
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={skinT}
            onChange={(e) => onSkin(Number(e.target.value))}
            aria-label="Skin tone continuum"
            style={{ width: "100%", accentColor: skin.hex }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: skin.hex,
                border: "2px solid #00FFFF",
              }}
            />
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
              {skin.label} · {skin.hex} · drives AvatarRig world skin
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
            {FAN_SKIN_TONE_CONTINUUM.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.label}
                onClick={() => onSkin(s.t)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: s.hex,
                  border: Math.abs(skinT - s.t) < 0.04 ? "2px solid #00FFFF" : "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Cool accessories rack */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${accentColor}12` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800 }}>
              COOL ACCESSORIES · PROPS · BAND
            </div>
            <Link href="/store/fan#cosmetics-catalog" style={{ fontSize: 9, color: "#00FFFF" }}>
              Fan Store →
            </Link>
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
            Catalog {stats.total} SKUs · hair {stats.hair} · glasses {stats.glasses} · clothes{" "}
            {stats.clothing} · dances {stats.dances} · actions {stats.actionEmotes} · gestures{" "}
            {stats.emotes} · props {stats.props} · instruments{" "}
            {stats.instruments} · skin stops {stats.skinStops}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRackTab(t.id)}
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "4px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  border: `1px solid ${rackTab === t.id ? accentColor : "rgba(255,255,255,0.12)"}`,
                  background: rackTab === t.id ? `${accentColor}33` : "rgba(255,255,255,0.04)",
                  color: rackTab === t.id ? accentColor : "rgba(255,255,255,0.55)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
              gap: 6,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {rackItems.slice(0, 36).map((item) => (
              <div
                key={item.id}
                title={item.description}
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: `1px solid ${item.accent}44`,
                  borderRadius: 8,
                  padding: "8px 6px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18 }}>{item.icon}</div>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#fff", marginTop: 2, lineHeight: 1.2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 7, color: item.accent, marginTop: 2, fontWeight: 700 }}>
                  {item.pointsCost === 0 ? "FREE" : `${item.pointsCost} pts`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certified Avatar Asset Inventory */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${accentColor}12` }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>
            CERTIFIED AVATAR ASSETS (FOUNDRY & MANUFACTURING REGISTRY)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
            {AVATAR_GLB_REGISTRY.map((slot) => (
              <div
                key={slot.id}
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: `1px solid ${slot.certified ? "#00FF8855" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{slot.id}</span>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      color: slot.certified ? "#00FF88" : "#FF9900",
                      background: slot.certified ? "rgba(0,255,136,0.1)" : "rgba(255,153,0,0.1)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {slot.certified ? "PASS (CERTIFIED)" : "UNBOUND (FOUNDRY)"}
                  </span>
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  {slot.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live 3D Canvas Viewport */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${accentColor}12` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FFFF", fontWeight: 800 }}>
              3D CANVAS PREVIEW (AvatarRig/1.0 · ARKit-52 · LOD0-2)
            </div>
            <button
              type="button"
              onClick={() => {
                persistBobbleheadBaseId(baseId);
                persistFanSkinT(skinT);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("bb:loadout:changed", { detail: { baseId, skinT } }));
                  window.dispatchEvent(new CustomEvent("tmi:avatar:equipped", { detail: { baseId, skinT } }));
                }
              }}
              style={{
                background: "linear-gradient(135deg, #00FFFF, #AA2DFF)",
                color: "#050510",
                fontWeight: 900,
                fontSize: 10,
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              💾 SAVE & EQUIP TO RUNTIME
            </button>
          </div>
          <div
            style={{
              height: 240,
              borderRadius: 12,
              border: `1px solid ${accentColor}33`,
              background: "radial-gradient(ellipse at center, rgba(170,45,255,0.1) 0%, rgba(5,5,16,0.8) 70%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <AvatarViewer
              {...bobbleheadRuntimeToRigProps(resolveBobbleheadRuntimeCharacter(baseId), { skinT })}
              size={240}
              enableOrbit={true}
            />
          </div>
        </div>

        <div style={{ padding: "14px 18px" }}>
          <AvatarCreator />
        </div>
      </div>
    </RoleGate>
  );
}

export default AvatarCreationCenter;
