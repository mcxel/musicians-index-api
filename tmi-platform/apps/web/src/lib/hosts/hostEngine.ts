/**
 * Host Performance Engine
 * Defines host entities, room casting, scripts, and PA announcement queues.
 */

export type HostRole =
  | 'MAIN_HOST'
  | 'CO_HOST'
  | 'BATTLE_REF'
  | 'CYPHER_JUDGE'
  | 'PA_ANNOUNCER'
  | 'PRIZE_HOST'
  | 'CROWD_HYPE'
  | 'SPONSOR_READ'
  | 'DIRTY_DOZENS_JUDGE';

export interface HostDefinition {
  id: string;
  name: string;
  shortName: string;
  role: HostRole;
  rooms: string[];
  emoji: string;
  color: string;
  voicePreset: string;
  danceStyle: string;
  personality: string;
  scriptPacks: string[];
  prizeAware: boolean;
}

export const HOST_ROSTER: HostDefinition[] = [
  {
    id: 'gregory-marcel',
    name: 'Gregory Marcel',
    shortName: 'Marcel',
    role: 'MAIN_HOST',
    rooms: ['monday-stage', 'monthly-idol', 'world-premiere'],
    emoji: '🎙️',
    color: '#FF2DAA',
    voicePreset: 'smooth-alabama-v1',
    danceStyle: 'two-step-hype',
    personality: 'Smooth southern MC energy — crowd-first, story-driven, prize-aware',
    scriptPacks: ['intro', 'outro', 'battle-prompt', 'prize-announce', 'sponsor-read', 'crowd-hype'],
    prizeAware: true,
  },
  {
    id: 'julius',
    name: 'Julius',
    shortName: 'Julius',
    role: 'CO_HOST',
    rooms: ['cypher', 'dirty-dozens', 'mini-cypher'],
    emoji: '🦊',
    color: '#AA2DFF',
    voicePreset: 'cheeky-magician-v1',
    danceStyle: 'pop-lock-chaos',
    personality: 'Wild-card energy — roast-ready, battle-ref instincts, crowd troll',
    scriptPacks: ['battle-prompt', 'roast-prompt', 'referee-cue', 'crowd-troll', 'prize-announce'],
    prizeAware: true,
  },
  {
    id: 'record-ralph',
    name: 'Record Ralph',
    shortName: 'Ralph',
    role: 'CROWD_HYPE',
    rooms: ['world-dance-party', 'monday-stage', 'world-concert'],
    emoji: '🎧',
    color: '#00FFFF',
    voicePreset: 'florida-cool-v1',
    danceStyle: 'dj-bounce-full',
    personality: 'High BPM DJ hype — beat-drop intuition, crowd-read expert',
    scriptPacks: ['intro', 'dj-drop', 'crowd-hype', 'transition-cue', 'sponsor-read'],
    prizeAware: false,
  },
  {
    id: 'nova-mc',
    name: 'Nova MC',
    shortName: 'Nova',
    role: 'BATTLE_REF',
    rooms: ['cypher', 'dirty-dozens', 'dirty-dozens'],
    emoji: '⚔️',
    color: '#FFD700',
    voicePreset: 'sharp-ref-v1',
    danceStyle: 'battle-stance',
    personality: 'No-nonsense referee — rule enforcer, fair judge, crowd translator',
    scriptPacks: ['round-start', 'round-end', 'foul-call', 'vote-open', 'winner-announce'],
    prizeAware: true,
  },
  {
    id: 'aura-pa',
    name: 'Aura',
    shortName: 'Aura',
    role: 'PA_ANNOUNCER',
    rooms: ['monday-stage', 'cypher', 'world-premiere', 'monthly-idol', 'dirty-dozens', 'world-dance-party'],
    emoji: '📢',
    color: '#00FFFF',
    voicePreset: 'smooth-pa-v1',
    danceStyle: 'none',
    personality: 'Clear broadcast voice — official, trustworthy, crowd-friendly',
    scriptPacks: ['room-open', 'countdown', 'call-up', 'sponsor-read', 'prize-alert', 'safety', 'room-close'],
    prizeAware: true,
  },
];

/** Room casting matrix — which hosts appear in each room */
export const ROOM_CAST: Record<string, HostDefinition[]> = Object.fromEntries(
  (() => {
    const map: Record<string, HostDefinition[]> = {};
    for (const host of HOST_ROSTER) {
      for (const room of host.rooms) {
        if (!map[room]) map[room] = [];
        map[room].push(host);
      }
    }
    return Object.entries(map);
  })()
);

export type PAScriptKey =
  | 'room-open'
  | 'countdown'
  | 'call-up'
  | 'sponsor-read'
  | 'prize-alert'
  | 'winner-announce'
  | 'safety'
  | 'room-close';

export const PA_SCRIPTS: Record<PAScriptKey, string[]> = {
  'room-open': [
    'Welcome to the stage — the show starts now!',
    'The room is open. Find your spot and get ready.',
    'We are LIVE. Welcome everyone.',
  ],
  'countdown': [
    'Battle begins in 3… 2… 1…',
    'Get ready — 3 seconds to showtime.',
    '3… 2… 1… LET\'S GO!',
  ],
  'call-up': [
    '{performer} — you\'re up. Step to the stage.',
    'Next up: {performer}. The floor is yours.',
    'Give it up for {performer}!',
  ],
  'sponsor-read': [
    'This moment brought to you by {sponsor}.',
    'Tonight\'s battle is sponsored by {sponsor} — thank you!',
    'Shoutout to {sponsor} for making this possible.',
  ],
  'prize-alert': [
    'A prize drop is coming — stay in the room to be eligible!',
    'Winner bonus incoming. {prizeDesc}.',
    'Random audience reward alert — {prizeDesc}!',
  ],
  'winner-announce': [
    'The winner is… {winner}! Congratulations!',
    '{winner} takes the crown tonight. Well deserved.',
    'And the victor is {winner}! 👑',
  ],
  'safety': [
    'This room uses strobe lighting. A reduced-FX mode is available in settings.',
    'Please keep all chat respectful. Our moderation team is active.',
    'If you experience discomfort from visual effects, use safe-mode in your profile settings.',
  ],
  'room-close': [
    'That\'s a wrap! Thanks for joining us tonight.',
    'The room is closing. See you next time.',
    'Show\'s over — check the rewards page for any prizes you won!',
  ],
};

export function getPA(key: PAScriptKey, vars: Record<string, string> = {}): string {
  const lines = PA_SCRIPTS[key];
  let line = lines[Math.floor(Math.random() * lines.length)];
  for (const [k, v] of Object.entries(vars)) {
    line = line.replace(`{${k}}`, v);
  }
  return line;
}

export function getRoomCast(roomId: string): HostDefinition[] {
  return ROOM_CAST[roomId] ?? [];
}
