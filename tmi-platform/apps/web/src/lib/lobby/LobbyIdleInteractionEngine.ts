type SeatVisualState = "open" | "occupied" | "vip" | "reserved" | "speaker" | "host";

export type LobbySeatInteractionInput = {
  id: string;
  occupantName?: string | null;
  visualState: SeatVisualState;
};

export type LobbyIdleInteraction = {
  key: string;
  emoji: string;
  label: string;
  detail: string;
  accent: string;
  pulse: boolean;
};

type InteractionTemplate = Omit<LobbyIdleInteraction, "key">;

const INTERACTION_LIBRARY: Record<SeatVisualState, InteractionTemplate[]> = {
  open: [
    { emoji: "○", label: "Open seat", detail: "Waiting for the next claim.", accent: "#5f4688", pulse: false },
  ],
  occupied: [
    { emoji: "🎧", label: "Locked in", detail: "Catching the mix and nodding on beat.", accent: "#00FF88", pulse: true },
    { emoji: "💬", label: "Chatting", detail: "Dropping comments into the room feed.", accent: "#7dd3fc", pulse: false },
    { emoji: "👏", label: "Reacting", detail: "Prepping the next clap burst.", accent: "#facc15", pulse: true },
  ],
  vip: [
    { emoji: "🥂", label: "VIP wave", detail: "Calling down bottle service between tracks.", accent: "#FFD700", pulse: true },
    { emoji: "📸", label: "Camera ready", detail: "Taking a polished stage selfie.", accent: "#fde68a", pulse: false },
    { emoji: "✨", label: "Spotlight ready", detail: "Holding the front-row spotlight line.", accent: "#FFD700", pulse: true },
  ],
  reserved: [
    { emoji: "📍", label: "Reserved", detail: "Seat lock is holding for a late arrival.", accent: "#FF2DAA", pulse: false },
    { emoji: "🕒", label: "ETA watch", detail: "Queue is waiting on the reserved guest.", accent: "#fb7185", pulse: true },
  ],
  speaker: [
    { emoji: "🎙", label: "Mic check", detail: "Testing gain and pacing the next line.", accent: "#00FFFF", pulse: true },
    { emoji: "📣", label: "Crowd cue", detail: "Pulling reactions from the floor.", accent: "#22d3ee", pulse: true },
    { emoji: "🎚", label: "Level set", detail: "Dialing stage levels before the handoff.", accent: "#67e8f9", pulse: false },
  ],
  host: [
    { emoji: "👑", label: "Room control", detail: "Driving the room tempo and seat flow.", accent: "#FFD700", pulse: true },
    { emoji: "🧭", label: "Directing", detail: "Pointing the next performer into position.", accent: "#facc15", pulse: false },
    { emoji: "⚡", label: "Host override", detail: "Ready to force the next transition.", accent: "#f59e0b", pulse: true },
  ],
};

function seedFromSeat(seat: LobbySeatInteractionInput): number {
  return `${seat.id}:${seat.occupantName ?? "guest"}:${seat.visualState}`
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
}

export function getLobbyIdleInteraction(seat: LobbySeatInteractionInput, beat: number): LobbyIdleInteraction {
  const templates = INTERACTION_LIBRARY[seat.visualState];
  const seed = seedFromSeat(seat);
  const index = (seed + beat) % templates.length;
  const template = templates[index] ?? templates[0]!;

  return {
    key: `${seat.id}-${beat}-${index}`,
    ...template,
  };
}

export function summarizeLobbyIdleInteractions(seats: LobbySeatInteractionInput[], beat: number): {
  headline: string;
  detail: string;
} {
  const activeSeats = seats.filter((seat) => seat.visualState !== "open");
  if (activeSeats.length === 0) {
    return {
      headline: "Floor idle",
      detail: "No occupied seats are cycling ambient interactions yet.",
    };
  }

  const interactions = activeSeats.map((seat) => getLobbyIdleInteraction(seat, beat));
  const primary = interactions[0]!;
  const pulsingCount = interactions.filter((interaction) => interaction.pulse).length;

  return {
    headline: `${primary.emoji} ${primary.label}`,
    detail: `${activeSeats.length} occupied seats active, ${pulsingCount} seats currently pushing crowd energy.`,
  };
}