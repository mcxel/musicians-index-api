import type { VoicePersonality } from './HostVoicePersonalityEngine';

export interface HostPermissions {
  canModerate: boolean;
  canTriggerPrizes: boolean;
  canStartCountdown: boolean;
  canOpenVoting: boolean;
  canCloseVoting: boolean;
  canAnnounceWinner: boolean;
}

export interface ShowHostRecord {
  hostId: string;
  displayName: string;
  showId: string;
  roomRoute: string;
  hostRole: string;
  permissions: HostPermissions;
  avatarAssetUrl: string;
  voiceEnabled: boolean;
  personality: VoicePersonality;
}

const _hosts = new Map<string, ShowHostRecord>();

export const ShowHostRegistry = {
  registerHost(record: ShowHostRecord): void {
    _hosts.set(record.hostId, record);
  },

  getHostByShow(showId: string): ShowHostRecord | undefined {
    for (const h of _hosts.values()) {
      if (h.showId === showId) return h;
    }
    return undefined;
  },

  getHostById(hostId: string): ShowHostRecord | undefined {
    return _hosts.get(hostId);
  },

  all(): ShowHostRecord[] {
    return Array.from(_hosts.values());
  },
};

// ── Pre-wired show hosts ──────────────────────────────────────────────────────

const SHOW_HOSTS: ShowHostRecord[] = [
  {
    hostId: 'host-monday-stage',
    displayName: 'Marcel',
    showId: 'monday-night-stage',
    roomRoute: '/shows/monday-night-stage',
    hostRole: 'main-host',
    voiceEnabled: true,
    personality: 'smooth',
    avatarAssetUrl: '/images/avatars/host-marcel.png',
    permissions: { canModerate: true, canTriggerPrizes: true, canStartCountdown: true, canOpenVoting: true, canCloseVoting: true, canAnnounceWinner: true },
  },
  {
    hostId: 'host-joke-offs',
    displayName: 'Chuckles',
    showId: 'joke-offs',
    roomRoute: '/rooms/joke-offs',
    hostRole: 'comedian-host',
    voiceEnabled: true,
    personality: 'funny',
    avatarAssetUrl: '/images/avatars/host-chuckles.png',
    permissions: { canModerate: true, canTriggerPrizes: false, canStartCountdown: true, canOpenVoting: true, canCloseVoting: true, canAnnounceWinner: true },
  },
  {
    hostId: 'host-dirty-dozens',
    displayName: 'Roastmaster X',
    showId: 'dirty-dozens',
    roomRoute: '/rooms/dirty-dozens',
    hostRole: 'battle-host',
    voiceEnabled: true,
    personality: 'sarcastic',
    avatarAssetUrl: '/images/avatars/host-roast.png',
    permissions: { canModerate: true, canTriggerPrizes: false, canStartCountdown: true, canOpenVoting: true, canCloseVoting: true, canAnnounceWinner: true },
  },
  {
    hostId: 'host-deal-or-feud',
    displayName: 'Suit & Tie',
    showId: 'deal-or-feud',
    roomRoute: '/shows/deal-or-feud',
    hostRole: 'game-host',
    voiceEnabled: true,
    personality: 'dramatic',
    avatarAssetUrl: '/images/avatars/host-suit.png',
    permissions: { canModerate: true, canTriggerPrizes: true, canStartCountdown: true, canOpenVoting: true, canCloseVoting: true, canAnnounceWinner: true },
  },
  {
    hostId: 'host-name-tune',
    displayName: 'DJ Memory',
    showId: 'name-that-tune',
    roomRoute: '/shows/name-that-tune',
    hostRole: 'game-host',
    voiceEnabled: true,
    personality: 'hype',
    avatarAssetUrl: '/images/avatars/host-memory.png',
    permissions: { canModerate: true, canTriggerPrizes: true, canStartCountdown: true, canOpenVoting: false, canCloseVoting: false, canAnnounceWinner: true },
  },
  {
    hostId: 'host-monthly-idol',
    displayName: 'Simon',
    showId: 'monthly-idol',
    roomRoute: '/shows/monthly-idol',
    hostRole: 'judge-host',
    voiceEnabled: true,
    personality: 'serious',
    avatarAssetUrl: '/images/avatars/host-simon.png',
    permissions: { canModerate: true, canTriggerPrizes: false, canStartCountdown: true, canOpenVoting: true, canCloseVoting: true, canAnnounceWinner: true },
  },
  {
    hostId: 'host-world-dance',
    displayName: 'Rhythm',
    showId: 'world-dance-party',
    roomRoute: '/rooms/world-dance-party',
    hostRole: 'party-host',
    voiceEnabled: true,
    personality: 'hype',
    avatarAssetUrl: '/images/avatars/host-rhythm.png',
    permissions: { canModerate: true, canTriggerPrizes: true, canStartCountdown: true, canOpenVoting: false, canCloseVoting: false, canAnnounceWinner: false },
  },
  {
    hostId: 'host-cypher-arena',
    displayName: 'Bar God',
    showId: 'cypher-arena',
    roomRoute: '/rooms/cypher-arena',
    hostRole: 'cypher-host',
    voiceEnabled: true,
    personality: 'chaotic',
    avatarAssetUrl: '/images/avatars/host-bargod.png',
    permissions: { canModerate: true, canTriggerPrizes: false, canStartCountdown: true, canOpenVoting: true, canCloseVoting: true, canAnnounceWinner: true },
  },
  {
    hostId: 'host-battle-arena',
    displayName: 'The Ref',
    showId: 'battle-arena',
    roomRoute: '/rooms/battle-arena',
    hostRole: 'referee',
    voiceEnabled: true,
    personality: 'hype',
    avatarAssetUrl: '/images/avatars/host-ref.png',
    permissions: { canModerate: true, canTriggerPrizes: false, canStartCountdown: true, canOpenVoting: true, canCloseVoting: true, canAnnounceWinner: true },
  },
  {
    hostId: 'host-stream-radio',
    displayName: 'Voice of TMI',
    showId: 'stream-win-radio',
    roomRoute: '/rooms/radio-station',
    hostRole: 'radio-host',
    voiceEnabled: true,
    personality: 'smooth',
    avatarAssetUrl: '/images/avatars/host-radio.png',
    permissions: { canModerate: true, canTriggerPrizes: true, canStartCountdown: false, canOpenVoting: false, canCloseVoting: false, canAnnounceWinner: false },
  },
];

SHOW_HOSTS.forEach(h => ShowHostRegistry.registerHost(h));
