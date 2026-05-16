/**
 * Resident Host Registry — Central casting mesh for the 5 TMI hosts.
 * Maps each host to their scheduled stage slot and wires their engines.
 */

export type HostId =
  | 'record-ralph'
  | 'bobby-stanley'
  | 'karen'
  | 'bebo'
  | 'julius';

export type StageSlot =
  | 'world-dance-party'   // Record Ralph — daily
  | 'monthly-idle'        // Bobby Stanley — monthly idle periods
  | 'monday-night'        // Karen — Monday Night Stage
  | 'weekend-bash'        // Bebo — Friday/Sat/Sun high-energy
  | 'versus-battle'       // Julius — battle commentary
  | 'any';                // Floater / guest

export interface HostEntry {
  id: HostId;
  displayName: string;
  primarySlot: StageSlot;
  fallbackSlots: StageSlot[];
  personalityType: 'turntablist' | 'dealer' | 'stage-lead' | 'hype-host' | 'analytical';
  voiceSkin: string; // key for TTS voice profile
  animPriority: 'boss' | 'hype' | 'smooth' | 'neutral';
  active: boolean;
}

export const RESIDENT_HOST_ROSTER: HostEntry[] = [
  {
    id: 'record-ralph',
    displayName: 'Record Ralph',
    primarySlot: 'world-dance-party',
    fallbackSlots: ['weekend-bash'],
    personalityType: 'turntablist',
    voiceSkin: 'ralph-smooth',
    animPriority: 'hype',
    active: true,
  },
  {
    id: 'bobby-stanley',
    displayName: 'Bobby Stanley "The Hustler Dealer"',
    primarySlot: 'monthly-idle',
    fallbackSlots: ['any'],
    personalityType: 'dealer',
    voiceSkin: 'bobby-smooth',
    animPriority: 'smooth',
    active: true,
  },
  {
    id: 'karen',
    displayName: 'Karen',
    primarySlot: 'monday-night',
    fallbackSlots: ['versus-battle'],
    personalityType: 'stage-lead',
    voiceSkin: 'karen-broadcast',
    animPriority: 'neutral',
    active: true,
  },
  {
    id: 'bebo',
    displayName: 'Bebo',
    primarySlot: 'weekend-bash',
    fallbackSlots: ['versus-battle', 'any'],
    personalityType: 'hype-host',
    voiceSkin: 'bebo-energy',
    animPriority: 'hype',
    active: true,
  },
  {
    id: 'julius',
    displayName: 'Julius',
    primarySlot: 'versus-battle',
    fallbackSlots: ['monday-night'],
    personalityType: 'analytical',
    voiceSkin: 'julius-mascot',
    animPriority: 'smooth',
    active: true,
  },
];

/** Returns the active host for a given slot, respecting fallback chain */
export function resolveHostForSlot(slot: StageSlot): HostEntry | null {
  const primary = RESIDENT_HOST_ROSTER.find(
    (h) => h.active && h.primarySlot === slot,
  );
  if (primary) return primary;

  const fallback = RESIDENT_HOST_ROSTER.find(
    (h) => h.active && h.fallbackSlots.includes(slot),
  );
  return fallback ?? null;
}

/**
 * Returns the host that should be on stage right now based on day-of-week.
 * This mirrors the DJ Residency rotation logic.
 */
export function resolveCurrentHost(): HostEntry {
  const day = new Date().getDay(); // 0=Sun, 1=Mon … 6=Sat

  if (day === 1) return resolveHostForSlot('monday-night') ?? RESIDENT_HOST_ROSTER[2]!; // Karen
  if (day === 5 || day === 6 || day === 0) return resolveHostForSlot('weekend-bash') ?? RESIDENT_HOST_ROSTER[3]!; // Bebo
  // Tue–Thu defaults to World Dance Party (Ralph) or versus (Julius)
  return resolveHostForSlot('world-dance-party') ?? RESIDENT_HOST_ROSTER[0]!;
}

/** Returns all active hosts */
export function getActiveHosts(): HostEntry[] {
  return RESIDENT_HOST_ROSTER.filter((h) => h.active);
}
