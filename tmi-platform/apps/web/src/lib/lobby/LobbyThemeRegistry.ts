/**
 * Fan Lobby visual themes — stylized backdrop treatments (gradient, accent,
 * ambient icons), not 3D environment models. No rigged/modeled barbershop or
 * bank interior exists in this codebase (see Rule 18) - these are honest 2D
 * dressing on the same free-roam floor, matched to `LobbyPresence.activeTheme`.
 */

export interface LobbyThemeDef {
  id: string;
  label: string;
  tagline: string;
  background: string;
  accent: string;
  floorTint: string;
  ambientIcons: string[];
}

export const LOBBY_THEMES: LobbyThemeDef[] = [
  {
    id: "MEDIA_LOUNGE",
    label: "Media Lounge",
    tagline: "The default fan hangout",
    background: "radial-gradient(circle at 50% 20%, rgba(0,255,255,0.12), rgba(5,5,16,0.98) 65%)",
    accent: "#00FFFF",
    floorTint: "rgba(0,255,255,0.05)",
    ambientIcons: ["📺", "🎧", "🛋️"],
  },
  {
    id: "BARBERSHOP",
    label: "Barbershop",
    tagline: "Pull up a chair, talk your talk",
    background: "radial-gradient(circle at 50% 20%, rgba(255,120,45,0.14), rgba(10,7,5,0.98) 65%)",
    accent: "#FF7B2F",
    floorTint: "rgba(255,120,45,0.06)",
    ambientIcons: ["💈", "✂️", "🪞"],
  },
  {
    id: "BANK_LOBBY",
    label: "Bank Lobby",
    tagline: "Marble floors, big plans",
    background: "radial-gradient(circle at 50% 20%, rgba(255,215,0,0.10), rgba(8,9,14,0.98) 65%)",
    accent: "#FFD700",
    floorTint: "rgba(255,215,0,0.05)",
    ambientIcons: ["🏦", "💳", "🗂️"],
  },
  {
    id: "VIP_ROOFTOP",
    label: "VIP Rooftop",
    tagline: "City lights, VIP only",
    background: "radial-gradient(circle at 50% 20%, rgba(255,45,170,0.14), rgba(6,4,14,0.98) 65%)",
    accent: "#FF2DAA",
    floorTint: "rgba(255,45,170,0.06)",
    ambientIcons: ["🌆", "🍾", "✨"],
  },
];

export function getLobbyTheme(themeId: string): LobbyThemeDef {
  return LOBBY_THEMES.find((t) => t.id === themeId) ?? LOBBY_THEMES[0];
}
