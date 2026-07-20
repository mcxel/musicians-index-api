/**
 * BotAvatarAssembler.ts — 360 BobbleHead Bot Avatar Assembly Pipeline
 *
 * Binds Bot images face cutouts (Bot image 1.png through 181.png) to 360
 * BobbleHead Avatar Bases across 6 standardized body build profiles.
 */

import { HeadAttachmentProfile, getHeadAttachmentProfile } from './HeadAttachmentProfile';
import { BodyBuild } from '@/lib/avatars/UnifiedAvatarRuntime';

export type BobbleHeadBodyBuild = BodyBuild;

export interface BobbleHeadBotAvatarConfig {
  botId: string;
  botName: string;
  role: 'fan' | 'performer' | 'dj' | 'cypher_host' | 'comedy';
  faceImageUrl: string;
  bodyBuild: BobbleHeadBodyBuild;
  headAttachment: HeadAttachmentProfile;
  accentColor: string;
  has360Rotation: boolean;
}

const BOBBLEHEAD_BODY_BUILDS: BobbleHeadBodyBuild[] = [
  'slim',
  'athletic',
  'average',
  'curvy',
  'heavy',
];

const ACCENT_PALETTE = ['#FF2DAA', '#00FFFF', '#FFD700', '#00FF88', '#AA2DFF', '#FF8C00'];

/**
 * Generates a fully assembled 360 BobbleHead Bot Avatar configuration from a bot image face cutout.
 */
export function assembleBobbleHeadBotAvatar(
  botId: string,
  botName: string,
  faceImageIndex: number,
  role: 'fan' | 'performer' | 'dj' | 'cypher_host' | 'comedy' = 'fan'
): BobbleHeadBotAvatarConfig {
  const bodyBuild = BOBBLEHEAD_BODY_BUILDS[faceImageIndex % BOBBLEHEAD_BODY_BUILDS.length]!;
  const accentColor = ACCENT_PALETTE[faceImageIndex % ACCENT_PALETTE.length]!;
  const faceImageUrl = `/bots/bot-image-${faceImageIndex}.png`;

  const headAttachment: HeadAttachmentProfile = {
    ...getHeadAttachmentProfile(bodyBuild as BodyBuild),
    faceScanPlateId: faceImageUrl,
  };

  return {
    botId,
    botName,
    role,
    faceImageUrl,
    bodyBuild,
    headAttachment,
    accentColor,
    has360Rotation: true,
  };
}

/**
 * Pre-generates a catalog of 180+ automated 360 BobbleHead bot avatar configurations.
 */
export function generateAutomatedBotRoster(count: number = 50): BobbleHeadBotAvatarConfig[] {
  const roster: BobbleHeadBotAvatarConfig[] = [];
  const roles: ('fan' | 'performer' | 'dj' | 'cypher_host' | 'comedy')[] = [
    'fan', 'fan', 'fan', 'dj', 'cypher_host', 'comedy',
  ];

  for (let i = 1; i <= count; i++) {
    const role = roles[i % roles.length]!;
    roster.push(assembleBobbleHeadBotAvatar(`bot-${i}`, `TMI Bot #${i}`, i, role));
  }

  return roster;
}
