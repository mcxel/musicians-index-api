// apps/web/src/registries/media/MediaPlayerFamilyRegistry.ts
//
// LEGACY / NOT THE REAL SYSTEM — do not build further on this registry.
//
// The real, live, commerce-wired media-player chassis system is
// MEDIA_PLAYER_CHASSIS_REGISTRY (apps/web/src/lib/artifacts/PlaylistArtifactEngine.ts),
// rendered by PlaylistArtifact.tsx with real animated per-chassis skin shells
// (SubmarineSkin/UFOSkin/RocketSkin/TreeSkin/HouseSkin/CarSkin/TrainSkin/
// BabySkin/DjFaceSkin) and real ArtifactTrack playback data. This hash-ID
// registry (the "Playlist Base 9 foundry" output) was built without knowledge
// of that already-shipped system and duplicates it with strictly inferior
// output — every entry here still shares identical placeholder geometry/
// palette (a colored box + "Media Player" label), explicitly marked `STUB`.
//
// PlaylistSkinWrapper.tsx (this registry's one real consumer, rendered by
// ProfileMediaPlayerShowcase.tsx on the live performer public profile page)
// is the reason this file isn't deleted outright — it still has a real
// production caller. Redirecting that page to the real chassis system is
// open follow-up work, not yet done.
//
// Canonical static registry for playlist media-player skin families (Rule 8 —
// Registry First). Every family below is real, statically-imported component +
// token data from src/components/playlist/families/<id>/. There are no
// `Component: null` placeholders and no runtime filesystem/path discovery.
//
// Certification status is honest, not aspirational: these 20 families currently
// share identical placeholder geometry/palette (a colored box + "Media Player"
// label). The real per-family body-shape/screen-mask/button-cluster/propeller/
// bubble-fx decomposition from the Playlist Base 9 reference art has not been
// done yet, so every entry is marked `STUB` until that asset work lands.

import type { ComponentType } from 'react';

import Skin_02b652031e12 from '@/components/playlist/families/02b652031e12/PlaylistSkin';
import tokens_02b652031e12 from '@/components/playlist/families/02b652031e12/tokens.json';
import Skin_050f68bca9e7 from '@/components/playlist/families/050f68bca9e7/PlaylistSkin';
import tokens_050f68bca9e7 from '@/components/playlist/families/050f68bca9e7/tokens.json';
import Skin_12a9b00cdf0a from '@/components/playlist/families/12a9b00cdf0a/PlaylistSkin';
import tokens_12a9b00cdf0a from '@/components/playlist/families/12a9b00cdf0a/tokens.json';
import Skin_22f04fc2b3be from '@/components/playlist/families/22f04fc2b3be/PlaylistSkin';
import tokens_22f04fc2b3be from '@/components/playlist/families/22f04fc2b3be/tokens.json';
import Skin_23b619ed0500 from '@/components/playlist/families/23b619ed0500/PlaylistSkin';
import tokens_23b619ed0500 from '@/components/playlist/families/23b619ed0500/tokens.json';
import Skin_2522bd4c6537 from '@/components/playlist/families/2522bd4c6537/PlaylistSkin';
import tokens_2522bd4c6537 from '@/components/playlist/families/2522bd4c6537/tokens.json';
import Skin_25d630b66bc6 from '@/components/playlist/families/25d630b66bc6/PlaylistSkin';
import tokens_25d630b66bc6 from '@/components/playlist/families/25d630b66bc6/tokens.json';
import Skin_38d0901fef71 from '@/components/playlist/families/38d0901fef71/PlaylistSkin';
import tokens_38d0901fef71 from '@/components/playlist/families/38d0901fef71/tokens.json';
import Skin_401cc96b466b from '@/components/playlist/families/401cc96b466b/PlaylistSkin';
import tokens_401cc96b466b from '@/components/playlist/families/401cc96b466b/tokens.json';
import Skin_4c2958a9cdf8 from '@/components/playlist/families/4c2958a9cdf8/PlaylistSkin';
import tokens_4c2958a9cdf8 from '@/components/playlist/families/4c2958a9cdf8/tokens.json';
import Skin_4d06eb1fe05b from '@/components/playlist/families/4d06eb1fe05b/PlaylistSkin';
import tokens_4d06eb1fe05b from '@/components/playlist/families/4d06eb1fe05b/tokens.json';
import Skin_51369ee24d8a from '@/components/playlist/families/51369ee24d8a/PlaylistSkin';
import tokens_51369ee24d8a from '@/components/playlist/families/51369ee24d8a/tokens.json';
import Skin_55f422526576 from '@/components/playlist/families/55f422526576/PlaylistSkin';
import tokens_55f422526576 from '@/components/playlist/families/55f422526576/tokens.json';
import Skin_59267edb5c61 from '@/components/playlist/families/59267edb5c61/PlaylistSkin';
import tokens_59267edb5c61 from '@/components/playlist/families/59267edb5c61/tokens.json';
import Skin_5c4c05339510 from '@/components/playlist/families/5c4c05339510/PlaylistSkin';
import tokens_5c4c05339510 from '@/components/playlist/families/5c4c05339510/tokens.json';
import Skin_62dee3c5ef15 from '@/components/playlist/families/62dee3c5ef15/PlaylistSkin';
import tokens_62dee3c5ef15 from '@/components/playlist/families/62dee3c5ef15/tokens.json';
import Skin_948117314f34 from '@/components/playlist/families/948117314f34/PlaylistSkin';
import tokens_948117314f34 from '@/components/playlist/families/948117314f34/tokens.json';
import Skin_a6052251b3de from '@/components/playlist/families/a6052251b3de/PlaylistSkin';
import tokens_a6052251b3de from '@/components/playlist/families/a6052251b3de/tokens.json';
import Skin_a7c7fd1e912c from '@/components/playlist/families/a7c7fd1e912c/PlaylistSkin';
import tokens_a7c7fd1e912c from '@/components/playlist/families/a7c7fd1e912c/tokens.json';
import Skin_e82a1cdb0bfc from '@/components/playlist/families/e82a1cdb0bfc/PlaylistSkin';
import tokens_e82a1cdb0bfc from '@/components/playlist/families/e82a1cdb0bfc/tokens.json';

export interface MediaPlayerFamilyTokens {
  palette: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  geometry: {
    silhouette: string;
    screenMask: string;
  };
  variants: string[];
}

export interface MediaPlayerFamilyCapabilities {
  animated: boolean;
  hasScreenMask: boolean;
  hasButtonCluster: boolean;
  hasPropeller: boolean;
  hasBubbleFx: boolean;
}

export type MediaPlayerCompatibleSurface = 'PLAYLIST' | 'PROFILE' | 'YOPHO' | 'ARTIST_ID';

export interface MediaPlayerFamilyEntry {
  familyId: string;
  tokens: MediaPlayerFamilyTokens;
  Component: ComponentType;
  /** Alternate token set used when rendered on a public profile showcase. Not yet authored — null means "use `tokens`". */
  profileFlavorTokens: MediaPlayerFamilyTokens | null;
  capabilities: MediaPlayerFamilyCapabilities;
  compatibility: {
    surfaces: MediaPlayerCompatibleSurface[];
    fallbackFamilyId: string;
  };
  certification: {
    status: 'STUB' | 'CERTIFIED';
    version: string;
    sourceReference: string;
  };
}

// Every family currently ships the same placeholder rendering behavior — this
// object is honest about that rather than inventing per-family capability flags.
const STUB_CAPABILITIES: MediaPlayerFamilyCapabilities = {
  animated: false,
  hasScreenMask: false,
  hasButtonCluster: false,
  hasPropeller: false,
  hasBubbleFx: false,
};

/** First family in the registry — used as the safe, always-registered fallback target. */
export const DEFAULT_MEDIA_PLAYER_FAMILY_ID = '02b652031e12';

function stubEntry(
  familyId: string,
  tokens: MediaPlayerFamilyTokens,
  Component: ComponentType,
): MediaPlayerFamilyEntry {
  return {
    familyId,
    tokens,
    Component,
    profileFlavorTokens: null,
    capabilities: STUB_CAPABILITIES,
    compatibility: {
      surfaces: ['PLAYLIST'],
      fallbackFamilyId: DEFAULT_MEDIA_PLAYER_FAMILY_ID,
    },
    certification: {
      status: 'STUB',
      version: '0.1.0-stub',
      sourceReference: 'Playlist Base 9 (geometry/palette not yet derived from source art)',
    },
  };
}

export const MediaPlayerFamilyRegistry: Record<string, MediaPlayerFamilyEntry> = {
  '02b652031e12': stubEntry('02b652031e12', tokens_02b652031e12, Skin_02b652031e12),
  '050f68bca9e7': stubEntry('050f68bca9e7', tokens_050f68bca9e7, Skin_050f68bca9e7),
  '12a9b00cdf0a': stubEntry('12a9b00cdf0a', tokens_12a9b00cdf0a, Skin_12a9b00cdf0a),
  '22f04fc2b3be': stubEntry('22f04fc2b3be', tokens_22f04fc2b3be, Skin_22f04fc2b3be),
  '23b619ed0500': stubEntry('23b619ed0500', tokens_23b619ed0500, Skin_23b619ed0500),
  '2522bd4c6537': stubEntry('2522bd4c6537', tokens_2522bd4c6537, Skin_2522bd4c6537),
  '25d630b66bc6': stubEntry('25d630b66bc6', tokens_25d630b66bc6, Skin_25d630b66bc6),
  '38d0901fef71': stubEntry('38d0901fef71', tokens_38d0901fef71, Skin_38d0901fef71),
  '401cc96b466b': stubEntry('401cc96b466b', tokens_401cc96b466b, Skin_401cc96b466b),
  '4c2958a9cdf8': stubEntry('4c2958a9cdf8', tokens_4c2958a9cdf8, Skin_4c2958a9cdf8),
  '4d06eb1fe05b': stubEntry('4d06eb1fe05b', tokens_4d06eb1fe05b, Skin_4d06eb1fe05b),
  '51369ee24d8a': stubEntry('51369ee24d8a', tokens_51369ee24d8a, Skin_51369ee24d8a),
  '55f422526576': stubEntry('55f422526576', tokens_55f422526576, Skin_55f422526576),
  '59267edb5c61': stubEntry('59267edb5c61', tokens_59267edb5c61, Skin_59267edb5c61),
  '5c4c05339510': stubEntry('5c4c05339510', tokens_5c4c05339510, Skin_5c4c05339510),
  '62dee3c5ef15': stubEntry('62dee3c5ef15', tokens_62dee3c5ef15, Skin_62dee3c5ef15),
  '948117314f34': stubEntry('948117314f34', tokens_948117314f34, Skin_948117314f34),
  'a6052251b3de': stubEntry('a6052251b3de', tokens_a6052251b3de, Skin_a6052251b3de),
  'a7c7fd1e912c': stubEntry('a7c7fd1e912c', tokens_a7c7fd1e912c, Skin_a7c7fd1e912c),
  'e82a1cdb0bfc': stubEntry('e82a1cdb0bfc', tokens_e82a1cdb0bfc, Skin_e82a1cdb0bfc),
};

/**
 * Resolve a family by id. Unknown, disabled, or missing ids fall back to the
 * default registered family — never null, never a blank render (per the
 * "invalid family must never blank" requirement).
 */
export function resolveMediaPlayerFamily(familyId: string | null | undefined): MediaPlayerFamilyEntry {
  if (familyId && MediaPlayerFamilyRegistry[familyId]) {
    return MediaPlayerFamilyRegistry[familyId];
  }
  return MediaPlayerFamilyRegistry[DEFAULT_MEDIA_PLAYER_FAMILY_ID];
}

export const MEDIA_PLAYER_FAMILY_IDS: string[] = Object.keys(MediaPlayerFamilyRegistry);
