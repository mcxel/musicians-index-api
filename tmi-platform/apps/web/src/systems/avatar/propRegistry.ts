// ============================================================
// AVATAR PROP REGISTRY
// TMI Platform — The Musicians Index
// ============================================================

import type { AvatarPropCategory, AvatarRole } from './types';

export interface PropDefinition {
  id: string;
  label: string;
  category: AvatarPropCategory;
  holdSlot: 'left-hand' | 'right-hand' | 'both-hands' | 'overhead' | 'body';
  animated: boolean;
  glowEffect: boolean;
  allowedRoles: AvatarRole[];
  assetId: string;
  soundEffect?: string;
}

export const PROP_REGISTRY: PropDefinition[] = [
  {
    id: 'mic-standard',
    label: 'Standard Microphone',
    category: 'microphone',
    holdSlot: 'right-hand',
    animated: false,
    glowEffect: false,
    allowedRoles: ['host', 'cohost', 'guest', 'artist'],
    assetId: 'prop-mic-standard',
  },
  {
    id: 'mic-wireless',
    label: 'Wireless Microphone',
    category: 'microphone',
    holdSlot: 'right-hand',
    animated: false,
    glowEffect: false,
    allowedRoles: ['host', 'cohost', 'guest', 'artist'],
    assetId: 'prop-mic-wireless',
  },
  {
    id: 'mic-golden',
    label: 'Golden Microphone',
    category: 'microphone',
    holdSlot: 'right-hand',
    animated: true,
    glowEffect: true,
    allowedRoles: ['host', 'artist'],
    assetId: 'prop-mic-golden',
    soundEffect: 'sfx-mic-golden',
  },
  {
    id: 'guitar-electric',
    label: 'Electric Guitar',
    category: 'instrument',
    holdSlot: 'both-hands',
    animated: true,
    glowEffect: false,
    allowedRoles: ['artist', 'guest'],
    assetId: 'prop-guitar-electric',
  },
  {
    id: 'guitar-acoustic',
    label: 'Acoustic Guitar',
    category: 'instrument',
    holdSlot: 'both-hands',
    animated: false,
    glowEffect: false,
    allowedRoles: ['artist', 'guest'],
    assetId: 'prop-guitar-acoustic',
  },
  {
    id: 'dj-headphones',
    label: 'DJ Headphones',
    category: 'instrument',
    holdSlot: 'body',
    animated: false,
    glowEffect: false,
    allowedRoles: ['artist', 'guest'],
    assetId: 'prop-dj-headphones',
  },
  {
    id: 'sign-fan',
    label: 'Fan Sign',
    category: 'sign',
    holdSlot: 'overhead',
    animated: false,
    glowEffect: false,
    allowedRoles: ['fan', 'audience', 'vip'],
    assetId: 'prop-sign-fan',
  },
  {
    id: 'sign-glowing',
    label: 'Glowing Sign',
    category: 'sign',
    holdSlot: 'overhead',
    animated: true,
    glowEffect: true,
    allowedRoles: ['fan', 'audience', 'vip'],
    assetId: 'prop-sign-glowing',
  },
  {
    id: 'glow-stick',
    label: 'Glow Stick',
    category: 'glow-item',
    holdSlot: 'right-hand',
    animated: true,
    glowEffect: true,
    allowedRoles: ['fan', 'audience', 'vip', 'npc'],
    assetId: 'prop-glow-stick',
  },
  {
    id: 'glow-wristband',
    label: 'Glow Wristband',
    category: 'glow-item',
    holdSlot: 'body',
    animated: true,
    glowEffect: true,
    allowedRoles: ['fan', 'audience', 'vip', 'npc'],
    assetId: 'prop-glow-wristband',
  },
  {
    id: 'trophy',
    label: 'Trophy',
    category: 'stage-prop',
    holdSlot: 'right-hand',
    animated: true,
    glowEffect: true,
    allowedRoles: ['artist', 'host'],
    assetId: 'prop-trophy',
    soundEffect: 'sfx-trophy-reveal',
  },
  {
    id: 'confetti-cannon',
    label: 'Confetti Cannon',
    category: 'stage-prop',
    holdSlot: 'both-hands',
    animated: true,
    glowEffect: false,
    allowedRoles: ['host', 'cohost'],
    assetId: 'prop-confetti-cannon',
    soundEffect: 'sfx-confetti-pop',
  },
];

export function getPropById(id: string): PropDefinition | undefined {
  return PROP_REGISTRY.find((p) => p.id === id);
}

export function getPropsForRole(role: AvatarRole): PropDefinition[] {
  return PROP_REGISTRY.filter((p) => p.allowedRoles.includes(role));
}

export function getPropsByCategory(category: AvatarPropCategory): PropDefinition[] {
  return PROP_REGISTRY.filter((p) => p.category === category);
}
