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
import { persistBobbleheadBaseId } from "@/lib/avatars/BobbleheadRuntimeCharacter";
import {
  FAN_SKIN_TONE_CONTINUUM,
  getFanCosmeticCatalogStats,
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

interface AvatarCreationCenterProps {
  accentColor?: string;
}

type RackTab = "cool" | "hair" | "glasses" | "clothes" | "props" | "emotes" | "instruments";

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
          ...listFanCosmeticsByCategory("clothing"),
          ...listFanCosmeticsByCategory("jackets"),
          ...listFanCosmeticsByCategory("shoes"),
        ];
      case "props":
        return listEquippableProps().filter((c) => c.inventoryCategory !== "instruments");
      case "emotes":
        return listEquippableEmotes();
      case "instruments":
        return listEquippableInstruments();
      default:
        return [
          ...listEquippableAccessories().slice(0, 12),
          ...listFanCosmeticsByCategory("headphones"),
          ...listFanCosmeticsByCategory("vfx").slice(0, 6),
        ];
    }
  }, [rackTab]);

  const tabs: { id: RackTab; label: string }[] = [
    { id: "cool", label: "Cool" },
    { id: "hair", label: "Hair" },
    { id: "glasses", label: "Glasses" },
    { id: "clothes", label: "Fits" },
    { id: "props", label: "Props" },
    { id: "emotes", label: "Emotes" },
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
            {stats.clothing} · emotes {stats.emotes} · props {stats.props} · instruments{" "}
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

        <div style={{ padding: "14px 18px" }}>
          <AvatarCreator />
        </div>
      </div>
    </RoleGate>
  );
}

export default AvatarCreationCenter;
