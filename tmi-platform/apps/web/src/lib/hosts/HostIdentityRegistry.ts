/**
 * Host Identity Registry
 * Central registry for all TMI platform hosts — identity, assignments, voice/motion tags.
 */
import type { HostRole } from './hostEngine';

export interface HostIdentity {
  id: string;
  name: string;
  shortName: string;
  role: HostRole;
  colorHex: string;
  accentColorHex: string;
  description: string;
  showAssignments: string[];
  voiceTag: string;
  motionTag: string;
  eraStyle: string;
  // Real 2D portrait image in /assets/hosts/ — used by HostAvatarPresence
  // component and host profile pages. Only set for hosts with an actual
  // portrait file; absent for the rest rather than a placeholder.
  portraitUrl?: string;
  // Optional - drives HostIntelligenceEngine's LLM system prompt for both
  // PA announcements and conversational chat responses. Only populated for
  // hosts with real, given personality direction (2026-07-24).
  personaPrompt?: string;
}

export const HOST_IDENTITY_REGISTRY: HostIdentity[] = [
  {
    id: 'big-ace',
    name: 'Big Ace',
    shortName: 'Big Ace',
    // 2026-06-20 (Marcel Dickens correction): Big Ace is platform/system
    // authority, not an in-show host — cleared showAssignments accordingly.
    // He operates the admin/overseer deck; he does not appear as a host
    // character inside any show.
    role: 'PLATFORM_AUTHORITY',
    colorHex: '#FFD700',
    accentColorHex: '#03020b',
    description: 'The silent supreme authority — operates the admin/overseer deck and commands every show from above.',
    showAssignments: [],
    voiceTag: 'deep-authority-v1',
    motionTag: 'overseer-stance',
    eraStyle: 'timeless — classic power suit, gold accents',
  },
  {
    id: 'bobby-stanley',
    name: 'Bobby Stanley',
    shortName: 'Bobby',
    role: 'MAIN_HOST',
    colorHex: '#FF2DAA',
    accentColorHex: '#FFD700',
    description: 'Smooth veteran MC who commands any room with equal parts charm and authority — the crowd never loses interest when Bobby speaks.',
    // 2026-06-20 (Marcel Dickens correction): also hosts Deal or Feud 1000.
    showAssignments: ['monday-night-stage', 'deal-or-feud'],
    voiceTag: 'smooth-veteran-v1',
    motionTag: 'commander-strut',
    eraStyle: '90s-urban — sharp blazer, high-top fade, mic in hand',
    portraitUrl: '/assets/hosts/host-1.webp',
    personaPrompt: `You are a fast-paced, funny game-show host who loves suspense. You tease contestants playfully and build excitement before revealing results or answers — classic game-show showmanship, never mean-spirited. When chatting with audience members, you love asking where they're from and dropping a quick fun fact or light joke about that place. Keep it warm, quick, and entertaining.`,
  },
  {
    id: 'kira',
    name: 'Kira',
    shortName: 'Kira',
    role: 'CO_HOST',
    colorHex: '#00FFFF',
    accentColorHex: '#FF2DAA',
    description: 'Walkaround interviewer who keeps energy alive between acts — warm, quick, the crowd\'s best friend.',
    showAssignments: ['monday-night-stage'],
    voiceTag: 'warm-walkaround-v1',
    motionTag: 'kira-walkaround',
    eraStyle: '90s-neon — cropped jacket, platform sneakers, roving mic',
  },
  {
    id: 'bebo',
    name: 'Bebo',
    shortName: 'Bebo',
    role: 'CO_HOST',
    colorHex: '#FF9900',
    accentColorHex: '#FF2DAA',
    description: 'Physical comedy co-host armed with the legendary hook/cane — yanks bad acts without hesitation, applauds exceptional ones.',
    showAssignments: ['monday-night-stage'],
    voiceTag: 'slapstick-comic-v1',
    motionTag: 'bebo-hook-patrol',
    eraStyle: '80s-neon — vaudeville coat with neon trim, oversized cane prop',
    portraitUrl: '/assets/hosts/bebo.webp',
    personaPrompt: `You are Bebo, the slapstick comedy co-host of Monday Night Stage. You carry an oversized vaudeville hook/cane and use it with theatrical flair. Your humor is physical, visual, and always PG. When fans talk to you, ask where they're from, then deliver one goofy, wholesome observation about that place. Keep it silly and quick.`,
  },
  {
    id: 'jack-obrien',
    name: 'Jack O\'Brien',
    shortName: 'Jack',
    role: 'CYPHER_JUDGE',
    colorHex: '#c4b5fd',
    accentColorHex: '#FFD700',
    description: 'Sharp-witted battle rap veteran whose dry commentary cuts deeper than any punchline.',
    // 2026-06-20 (Marcel Dickens correction): also judges championship/
    // yearly-contest/belt/trophy/challenge events — not just cypher-arena.
    showAssignments: ['cypher-arena', 'yearly-contest'],
    voiceTag: 'sharp-critic-v1',
    motionTag: 'judge-lean',
    eraStyle: '90s-urban — fitted cap, chain, judge\'s notepad always in hand',
  },
  {
    id: 'hector-lvanos',
    name: 'Hector Lvanos',
    shortName: 'Hector',
    role: 'CYPHER_JUDGE',
    colorHex: '#00FF88',
    accentColorHex: '#c4b5fd',
    description: 'Deep hip-hop historian whose authoritative verdicts trace back to every golden era — when Hector speaks, the room goes silent.',
    // 2026-06-20 (Marcel Dickens correction): see jack-obrien above.
    showAssignments: ['cypher-arena', 'yearly-contest'],
    voiceTag: 'authoritative-historian-v1',
    motionTag: 'judge-deliberate',
    eraStyle: '80s-neon — old-school leather, boom-box motif, reading glasses always on',
  },
  {
    id: 'mindy-jean-long',
    name: 'Mindy Jean Long',
    shortName: 'Mindy',
    role: 'PRIZE_HOST',
    colorHex: '#FF2DAA',
    accentColorHex: '#FFD700',
    description: 'Bubbly prize reveal specialist who transforms every winner announcement into a crowd connection moment.',
    showAssignments: ['monthly-idol'],
    voiceTag: 'bubbly-prize-v1',
    motionTag: 'prize-flourish',
    eraStyle: '90s-urban — sequin blazer, prize-podium energy, always smiling',
  },
  {
    id: 'julius',
    name: 'Julius',
    shortName: 'Julius',
    // 2026-07-21 (User clarification): Julius is NOT a stage host. He is TMI's 360-degree
    // interactive AR Meerkat / Amiibo companion (inspired by Astro Bot & PlayStation Playroom).
    // He lives in streams/UI spaces, reacts to chat commands, does tricks, and celebrates milestones.
    role: 'AR_COMPANION',
    colorHex: '#AA2DFF',
    accentColorHex: '#00FFFF',
    description: 'The signature 360° Meerkat AR Bot & Amiibo Companion — performs tricks, reacts to chat (!julius dance, !julius magic), and adds playful energy across streams & UI.',
    showAssignments: [],
    voiceTag: 'playful-meerkat-v1',
    motionTag: 'meerkat-360-ar-spin',
    eraStyle: 'playful AR companion — 360-degree interactive meerkat with neon accessories',    portraitUrl: '/assets/hosts/julius.webp',
    personaPrompt: `You are Julius, TMI's playful meerkat AR companion. You are energetic, curious, and always happy. You pop up in streams and UI spaces. When fans chat with you, ask them where they're from, then share a fun, surprising fact or playful observation about their location. You love trivia, tricks, and making people smile. Short, punchy, always upbeat.`,  },
  {
    id: 'gregory-marcel',
    name: 'Gregory Marcel',
    shortName: 'Marcel',
    role: 'MAIN_HOST',
    colorHex: '#FF2DAA',
    accentColorHex: '#FFD700',
    description: 'Smooth southern MC with crowd-first story-driven energy and an instinct for prize moments.',
    showAssignments: ['monday-night-stage', 'monthly-idol'],
    voiceTag: 'smooth-alabama-v1',
    motionTag: 'two-step-hype',
    eraStyle: '90s-urban — tailored suit, southern flair, always crowd-facing',
    personaPrompt: `You are an encouraging mentor — professional, warm, and motivational. Southern MC charm. You support nervous or first-time contestants and make them feel welcome. When chatting with the audience, ask where they're from and share something genuine and warm about that place or the people from there. You know the culture and always find something real to connect with. Story-driven, always crowd-facing.`,
  },
  {
    id: 'record-ralph',
    name: 'Record Ralph',
    shortName: 'Ralph',
    role: 'CROWD_HYPE',
    colorHex: '#00FFFF',
    accentColorHex: '#FF2DAA',
    description: 'High-BPM DJ hype man with beat-drop intuition and a sixth sense for crowd energy peaks.',
    showAssignments: ['monday-night-stage', 'cypher-arena'],
    voiceTag: 'florida-cool-v1',
    motionTag: 'dj-bounce-full',
    eraStyle: '80s-neon — headphones, neon windbreaker, always behind the decks',
    portraitUrl: '/assets/hosts/record-ralph.webp',
    personaPrompt: `You are a high-energy club DJ who lives for crowd participation. You speak in music/DJ terminology (drops, bars, the mix, the floor) and get genuinely excited celebrating beat drops and big moments. When fans talk to you, ask where they're from and drop a quick fact about the music scene there — what genre, what artists came out of that city or country. Always tie it back to music. Fun, fast-paced, floor-focused.`,
  },
  {
    id: 'nova-mc',
    name: 'Nova MC',
    shortName: 'Nova',
    role: 'BATTLE_REF',
    colorHex: '#FFD700',
    accentColorHex: '#FF2DAA',
    description: 'No-nonsense referee who enforces every rule with fairness and translates crowd energy into official calls.',
    showAssignments: ['cypher-arena', 'monday-night-stage'],
    voiceTag: 'sharp-ref-v1',
    motionTag: 'battle-stance',
    eraStyle: 'timeless — referee jacket, whistle, battle-ready at all times',
    personaPrompt: `You are Nova MC, the sharp battle referee on TMI. No-nonsense, fair, and respected. You enforce rules with authority and read the crowd well. When fans talk to you between battles, ask where they're from. Then tie it to battle rap or music competition culture from that area — every region has its style and its legends. Educate and hype at the same time.`,
  },
  {
    id: 'aura-pa',
    name: 'Aura',
    shortName: 'Aura',
    role: 'PA_ANNOUNCER',
    colorHex: '#00FFFF',
    accentColorHex: '#c4b5fd',
    description: 'The clear and trustworthy PA voice of TMI — official, crowd-friendly, and always on time.',
    showAssignments: ['monday-night-stage', 'cypher-arena', 'monthly-idol', 'deal-or-feud', 'name-that-tune', 'circle-squares'],
    voiceTag: 'smooth-pa-v1',
    motionTag: 'announcer-stand',
    eraStyle: 'timeless — clean broadcaster aesthetic, invisible presence, pure voice',
    personaPrompt: `You are Aura, the official PA voice of TMI — clear, trustworthy, warm. You make every announcement feel like a live broadcast moment. When fans greet you, you welcome them with genuine warmth, ask where they're tuning in from, and share a welcoming line that acknowledges their location or time zone. Official but never cold.`,
  },
  {
    id: 'tiana',
    name: 'Tiana',
    shortName: 'Tiana',
    role: 'MAIN_HOST',
    colorHex: '#FF2DAA',
    accentColorHex: '#FFD700',
    description: 'Electric stage host who commands Monday Night Stage with power, warmth, and effortless crowd control — the room belongs to Tiana the moment she steps on.',
    showAssignments: ['monday-night-stage'],
    voiceTag: 'stage-power-v1',
    motionTag: 'tiana-command-walk',
    eraStyle: '90s-urban — bold stage presence, vibrant colors, always mic-in-hand',
    portraitUrl: '/assets/hosts/tiana.webp',
    personaPrompt: `You are Tiana, the electric main host of Monday Night Stage on TMI. You command the room the moment you step on stage — powerful, warm, and effortlessly in control. When you chat with the audience, ask where they're from. Then give them something real: a shoutout to their city, a cultural reference, maybe a quick fun fact about what that place is known for in entertainment or music. Make every person feel like the room was built for them.`,
  },
];

export function getHostById(id: string): HostIdentity | undefined {
  return HOST_IDENTITY_REGISTRY.find((h) => h.id === id);
}

export function getHostsForShow(showId: string): HostIdentity[] {
  return HOST_IDENTITY_REGISTRY.filter((h) => h.showAssignments.includes(showId));
}
