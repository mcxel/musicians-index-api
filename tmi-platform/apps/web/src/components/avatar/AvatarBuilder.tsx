"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AvatarPreviewStage from "@/components/avatar/AvatarPreviewStage";
import CharacterRoster from "@/components/avatar/CharacterRoster";
import HeadToToeCustomizer, { type AvatarCustomizerState } from "@/components/avatar/HeadToToeCustomizer";
import DanceMoveLibrary from "@/components/avatar/DanceMoveLibrary";
import AvatarEvolutionPanel from "@/components/avatar/AvatarEvolutionPanel";
import {
  AVATAR_CHARACTER_REGISTRY,
  getAvatarCharacterBySlug,
  getAvatarRosterHighlights,
  getFaceScanReadyCharacters,
  getWorldDancePartyCharacters,
} from "@/lib/avatar/AvatarCharacterRegistry";
import { getOrCreateEvolution } from "@/lib/avatar/AvatarEvolutionEngine";

type AvatarBuilderProps = {
  initialSlug?: string;
  profileSlug?: string;
  surfaceLabel: string;
  routeLinks: { label: string; href: string }[];
};

const DEFAULT_STATE: AvatarCustomizerState = {
  bodyHeight: 58,
  bodyMass: 48,
  skinLabel: "Sand",
  pose: "Idle",
  background: "Glass Stage",
  lighting: "Neon Cyan",
  outfit: "Streetwear",
  propName: "Mic",
  accessories: ["Crown", "Chain"],
};

export default function AvatarBuilder({ initialSlug, profileSlug, surfaceLabel, routeLinks }: AvatarBuilderProps) {
  const defaultCharacter = useMemo(() => getAvatarCharacterBySlug(initialSlug ?? "bebo") ?? AVATAR_CHARACTER_REGISTRY[0], [initialSlug]);
  const [selectedSlug, setSelectedSlug] = useState(defaultCharacter.slug);
  const [customizer, setCustomizer] = useState<AvatarCustomizerState>(DEFAULT_STATE);
  const [activeMoveId, setActiveMoveId] = useState<string | null>("two-step");

  const selectedCharacter = getAvatarCharacterBySlug(selectedSlug) ?? defaultCharacter;
  const evolution = getOrCreateEvolution(selectedCharacter.id);
  const highlights = getAvatarRosterHighlights();
  const faceScanReadyCount = getFaceScanReadyCharacters().length;
  const worldDancePartyCount = getWorldDancePartyCharacters().length;

  const skinMap: Record<string, string> = {
    Porcelain: "#FFE8D6",
    Sand: "#E8B88A",
    "Warm Olive": "#C68642",
    Caramel: "#8B4513",
    Mahogany: "#7B3F00",
    Ebony: "#1C0A02",
  };

  const outfitMap: Record<string, string> = {
    Streetwear: "Streetwear",
    "Performer Fit": "Performer Fit",
    Formal: "Formal",
    Futuristic: "Futuristic",
    "Arena Jersey": "Arena Jersey",
  };

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.36em", color: "#00FFFF", fontWeight: 900, textTransform: "uppercase" }}>{surfaceLabel}</div>
          <h1 style={{ margin: "6px 0 0", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#fff" }}>
            Avatar / Character Studio
          </h1>
          <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.45)", maxWidth: 760, lineHeight: 1.6, fontSize: 13 }}>
            Character roster, 360 preview, body shaping, dance moves, and evolution ready for profiles, lobbies, and World Dance Party.
          </p>
        </div>
        <div style={{ display: "grid", gap: 8, textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#FFD700" }}>{highlights.total} CHARACTERS</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{faceScanReadyCount} face scan ready · {worldDancePartyCount} world dance ready</div>
          {profileSlug && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Profile: {profileSlug}</div>}
        </div>
      </header>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {routeLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              textDecoration: "none",
              background: "rgba(255,255,255,0.04)",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0, 1fr) 320px", gap: 16, alignItems: "start" }}>
        <CharacterRoster characters={AVATAR_CHARACTER_REGISTRY} selectedSlug={selectedSlug} onSelect={setSelectedSlug} />

        <div style={{ display: "grid", gap: 16 }}>
          <AvatarPreviewStage
            profileName={selectedCharacter.name}
            skin={skinMap[customizer.skinLabel] ?? skinMap.Sand}
            hair={selectedCharacter.name}
            eyes={selectedCharacter.faceScanCompatible ? "Face scan mapped" : "Bobblehead classic"}
            outfit={outfitMap[customizer.outfit] ?? customizer.outfit}
            propName={customizer.propName}
            background={customizer.background}
            lighting={customizer.lighting}
            pose={customizer.pose}
            accessories={customizer.accessories}
            bodyHeight={customizer.bodyHeight}
            bodyMass={customizer.bodyMass}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
            <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: "#00FF88", textTransform: "uppercase", marginBottom: 8 }}>Roster Snapshot</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.66)", lineHeight: 1.6 }}>
                {selectedCharacter.bio}
              </div>
            </div>
            <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: "#FFD700", textTransform: "uppercase", marginBottom: 8 }}>Runtime Routes</div>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  `/profile/${profileSlug ?? selectedCharacter.slug}/avatar`,
                  "/hub/fan/avatar",
                  "/hub/performer/avatar",
                  "/world-dance-party",
                  "/live/rooms/world-dance-party",
                ].map((href) => (
                  <Link key={href} href={href} style={{ color: "#00FFFF", fontSize: 11, textDecoration: "none" }}>
                    {href}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <HeadToToeCustomizer value={customizer} onChange={setCustomizer} />
          <DanceMoveLibrary onPick={setActiveMoveId} />
          <AvatarEvolutionPanel
            character={selectedCharacter}
            evolution={evolution}
            faceScanReady={selectedCharacter.faceScanCompatible}
            worldDanceReady={selectedCharacter.worldDancePartyEnabled}
          />
          <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: "#FF2DAA", textTransform: "uppercase", marginBottom: 8 }}>Active Move</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>{activeMoveId ?? "No move selected"}</div>
          </div>
        </div>
      </div>
    </section>
  );
}