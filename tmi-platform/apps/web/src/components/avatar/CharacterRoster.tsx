"use client";

import type { AvatarCharacter } from "@/lib/avatar/AvatarCharacterRegistry";

type CharacterRosterProps = {
  characters: AvatarCharacter[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
};

export default function CharacterRoster({ characters, selectedSlug, onSelect }: CharacterRosterProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#00FFFF", textTransform: "uppercase" }}>
        Character Roster
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {characters.map((character) => {
          const active = character.slug === selectedSlug;
          return (
            <button
              key={character.id}
              type="button"
              onClick={() => onSelect(character.slug)}
              style={{
                textAlign: "left",
                borderRadius: 14,
                padding: "14px",
                border: `1px solid ${active ? character.accentColor : "rgba(255,255,255,0.08)"}`,
                background: active ? `${character.accentColor}14` : "rgba(255,255,255,0.03)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: active ? character.accentColor : "#fff" }}>{character.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.16em", marginTop: 4 }}>
                    {character.role.toUpperCase()} · {character.characterType.toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: 9, fontWeight: 800, color: character.faceScanCompatible ? "#00FF88" : "#FFD700" }}>
                  {character.faceScanCompatible ? "FACE SCAN READY" : "BOBBLEHEAD READY"}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.64)", marginTop: 8, lineHeight: 1.45 }}>
                {character.tagline}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}