/**
 * Performer Lobby room modes — same room record, mode field only.
 * Not separate engines. Data/config this pass.
 */

export type PerformerLobbyMode =
  | "SOCIAL"
  | "REHEARSAL"
  | "BAND_PRACTICE"
  | "AUDITION"
  | "BACKROOM"
  | "GREEN_ROOM"
  | "LISTENING";

export const PERFORMER_LOBBY_MODES: readonly PerformerLobbyMode[] = [
  "SOCIAL",
  "REHEARSAL",
  "BAND_PRACTICE",
  "AUDITION",
  "BACKROOM",
  "GREEN_ROOM",
  "LISTENING",
] as const;

export const PERFORMER_LOBBY_MODE_LABELS: Record<PerformerLobbyMode, string> = {
  SOCIAL: "Social Hangout",
  REHEARSAL: "Rehearsal",
  BAND_PRACTICE: "Band Practice",
  AUDITION: "Audition",
  BACKROOM: "Backroom Session",
  GREEN_ROOM: "Green Room",
  LISTENING: "Listening Session",
};

/** Maps lobby mode → RehearsalAudioRuntime profile when audio engine is active. */
export const MODE_TO_REHEARSAL_PROFILE = {
  SOCIAL: "MEETING",
  REHEARSAL: "VOCAL_REHEARSAL",
  BAND_PRACTICE: "FULL_BAND",
  AUDITION: "AUDITION",
  BACKROOM: "MEETING",
  GREEN_ROOM: "MEETING",
  LISTENING: "LISTENING_SESSION",
} as const satisfies Record<PerformerLobbyMode, string>;

export function parsePerformerLobbyMode(value?: string | null): PerformerLobbyMode {
  const v = (value ?? "SOCIAL").trim().toUpperCase().replace(/-/g, "_");
  if ((PERFORMER_LOBBY_MODES as readonly string[]).includes(v)) {
    return v as PerformerLobbyMode;
  }
  const aliases: Record<string, PerformerLobbyMode> = {
    PRIVATE_MEETING: "BACKROOM",
    BACKROOM_SESSION: "BACKROOM",
    LISTENING_SESSION: "LISTENING",
    BAND: "BAND_PRACTICE",
  };
  return aliases[v] ?? "SOCIAL";
}
