/**
 * MemoryArtifactGenerator
 * Turns legendary moments into culture.
 * Automatically generates structured artifacts when a snapshot is marked legendary:
 *   - Magazine entry template (feeds into the TMI magazine engine)
 *   - Recap card (shareable social tile)
 *   - "I Was There" badge data
 *   - NFT collectible metadata
 *   - Timeline badge for admin mythology console
 */

import type { WorldStateSnapshot, PerformerIdentity } from './PersistentWorldSnapshotEngine';

export type ArtifactType = 'magazine-entry' | 'recap-card' | 'iwasthere-badge' | 'nft-metadata' | 'timeline-badge';

export interface MagazineEntryArtifact {
  type: 'magazine-entry';
  title: string;
  headline: string;
  subheadline: string;
  slug: string;
  category: 'live-recap' | 'battle-result' | 'premiere' | 'achievement' | 'platform-news';
  accentColor: string;
  featuredAt: number;
  performers: PerformerIdentity[];
  eventMeta: { vibe: string; bpm: number; crowdEnergy: number; activeRooms: number };
  bodyTemplate: string;   // article body with {{placeholder}} fields
}

export interface RecapCardArtifact {
  type: 'recap-card';
  title: string;
  label: string;
  accentColor: string;
  bgColor: string;
  statRows: Array<{ label: string; value: string }>;
  shareText: string;
  snapshotId: string;
  capturedAt: number;
}

export interface IWasThereArtifact {
  type: 'iwasthere-badge';
  eventLabel: string;
  badgeTitle: string;
  badgeSubtitle: string;
  accentColor: string;
  icon: string;           // emoji or icon id
  issuedAt: number;
  snapshotId: string;
  claimable: boolean;     // false until user was confirmed present
}

export interface NftMetadataArtifact {
  type: 'nft-metadata';
  name: string;
  description: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  accentColor: string;
  snapshotId: string;
  editionType: 'legendary' | 'rare' | 'common';
  maxSupply: number;
  mintedAt: number;
}

export interface TimelineBadgeArtifact {
  type: 'timeline-badge';
  label: string;
  emoji: string;
  color: string;
  snapshotId: string;
  timestamp: number;
  isLegendary: boolean;
}

export type MemoryArtifact =
  | MagazineEntryArtifact
  | RecapCardArtifact
  | IWasThereArtifact
  | NftMetadataArtifact
  | TimelineBadgeArtifact;

export interface ArtifactBundle {
  snapshotId: string;
  generatedAt: number;
  artifacts: MemoryArtifact[];
}

// Registry of generated artifact bundles
const artifactRegistry = new Map<string, ArtifactBundle>();

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function triggerIcon(trigger: string): string {
  const map: Record<string, string> = {
    'legendary-moment': '⭐',
    'drop': '💥',
    'vibe-change': '🎛️',
    'crowd-peak': '🔥',
    'premiere': '🎬',
    'season-start': '🏆',
    'admin-manual': '📸',
    'failover': '⚡',
  };
  return map[trigger] ?? '🎵';
}

function formatCrowdEnergy(e: number): string {
  if (e >= 0.95) return 'Maximum';
  if (e >= 0.8) return 'Intense';
  if (e >= 0.6) return 'High';
  if (e >= 0.4) return 'Moderate';
  return 'Chill';
}

export function generateArtifactBundle(snapshot: WorldStateSnapshot): ArtifactBundle {
  const existing = artifactRegistry.get(snapshot.id);
  if (existing) return existing;

  const artifacts: MemoryArtifact[] = [];

  // Magazine entry
  const magazine: MagazineEntryArtifact = {
    type: 'magazine-entry',
    title: snapshot.label,
    headline: `${snapshot.label} — A Night That Defined TMI`,
    subheadline: `${snapshot.activeRooms} rooms. ${formatCrowdEnergy(snapshot.crowdEnergy)} energy. ${snapshot.bpm} BPM.`,
    slug: slugify(snapshot.label),
    category: snapshot.trigger === 'drop' ? 'live-recap' : snapshot.trigger === 'legendary-moment' ? 'battle-result' : 'platform-news',
    accentColor: snapshot.accentColor,
    featuredAt: snapshot.capturedAt,
    performers: snapshot.performers,
    eventMeta: {
      vibe: snapshot.vibe,
      bpm: snapshot.bpm,
      crowdEnergy: snapshot.crowdEnergy,
      activeRooms: snapshot.activeRooms,
    },
    bodyTemplate: `**${snapshot.label}** went down on {{date}} at {{time}}.\n\nThe vibe was set to **${snapshot.vibe}** — {{bpm}} BPM with ${formatCrowdEnergy(snapshot.crowdEnergy).toLowerCase()} crowd energy across **${snapshot.activeRooms} simultaneous rooms**.\n\n{{performer_intro}}\n\nThe moment is now part of TMI history. You can replay the full event from the [World Memory Timeline](/admin/world-memory).`,
  };
  artifacts.push(magazine);

  // Recap card
  const recap: RecapCardArtifact = {
    type: 'recap-card',
    title: snapshot.label,
    label: triggerIcon(snapshot.trigger) + ' ' + snapshot.trigger.replace(/-/g, ' ').toUpperCase(),
    accentColor: snapshot.accentColor,
    bgColor: '#040410',
    statRows: [
      { label: 'Vibe',         value: snapshot.vibe },
      { label: 'BPM',          value: snapshot.bpm.toString() },
      { label: 'Crowd Energy', value: `${Math.round(snapshot.crowdEnergy * 100)}%` },
      { label: 'Active Rooms', value: snapshot.activeRooms.toString() },
      { label: 'Avg RTT',      value: `${snapshot.avgRttMs.toFixed(0)}ms` },
    ],
    shareText: `I just witnessed "${snapshot.label}" on TMI — ${Math.round(snapshot.crowdEnergy * 100)}% crowd energy, ${snapshot.bpm} BPM, ${snapshot.activeRooms} rooms live. This is real music culture. 🔥`,
    snapshotId: snapshot.id,
    capturedAt: snapshot.capturedAt,
  };
  artifacts.push(recap);

  // I Was There badge
  const badge: IWasThereArtifact = {
    type: 'iwasthere-badge',
    eventLabel: snapshot.label,
    badgeTitle: 'I Was There',
    badgeSubtitle: snapshot.label,
    accentColor: snapshot.accentColor,
    icon: triggerIcon(snapshot.trigger),
    issuedAt: snapshot.capturedAt,
    snapshotId: snapshot.id,
    claimable: true,
  };
  artifacts.push(badge);

  // NFT metadata (ERC-1155 style)
  const editionType: NftMetadataArtifact['editionType'] = snapshot.isLegendary
    ? 'legendary'
    : snapshot.crowdEnergy >= 0.9 ? 'rare' : 'common';
  const maxSupply = editionType === 'legendary' ? 100 : editionType === 'rare' ? 1000 : 10000;

  const nft: NftMetadataArtifact = {
    type: 'nft-metadata',
    name: `TMI Moment: "${snapshot.label}"`,
    description: `A verified cultural artifact from The Musician's Index. Captured at ${new Date(snapshot.capturedAt).toISOString()}. Crowd energy: ${Math.round(snapshot.crowdEnergy * 100)}%. Vibe: ${snapshot.vibe}.`,
    attributes: [
      { trait_type: 'Vibe',          value: snapshot.vibe },
      { trait_type: 'BPM',           value: snapshot.bpm },
      { trait_type: 'Crowd Energy',  value: Math.round(snapshot.crowdEnergy * 100) },
      { trait_type: 'Active Rooms',  value: snapshot.activeRooms },
      { trait_type: 'Trigger',       value: snapshot.trigger },
      { trait_type: 'Edition',       value: editionType },
      { trait_type: 'Legendary',     value: snapshot.isLegendary ? 'Yes' : 'No' },
    ],
    accentColor: snapshot.accentColor,
    snapshotId: snapshot.id,
    editionType,
    maxSupply,
    mintedAt: snapshot.capturedAt,
  };
  artifacts.push(nft);

  // Timeline badge
  const timelineBadge: TimelineBadgeArtifact = {
    type: 'timeline-badge',
    label: snapshot.label,
    emoji: triggerIcon(snapshot.trigger),
    color: snapshot.accentColor,
    snapshotId: snapshot.id,
    timestamp: snapshot.capturedAt,
    isLegendary: snapshot.isLegendary,
  };
  artifacts.push(timelineBadge);

  const bundle: ArtifactBundle = {
    snapshotId: snapshot.id,
    generatedAt: Date.now(),
    artifacts,
  };

  artifactRegistry.set(snapshot.id, bundle);
  return bundle;
}

export function getArtifactBundle(snapshotId: string): ArtifactBundle | undefined {
  return artifactRegistry.get(snapshotId);
}

export function getAllBundles(): ArtifactBundle[] {
  return [...artifactRegistry.values()].sort((a, b) => b.generatedAt - a.generatedAt);
}

export function getArtifactsByType<T extends ArtifactType>(
  type: T,
): Extract<MemoryArtifact, { type: T }>[] {
  const results: Extract<MemoryArtifact, { type: T }>[] = [];
  for (const bundle of artifactRegistry.values()) {
    for (const artifact of bundle.artifacts) {
      if (artifact.type === type) {
        results.push(artifact as Extract<MemoryArtifact, { type: T }>);
      }
    }
  }
  return results;
}

export function getArtifactStats(): {
  totalBundles: number;
  totalArtifacts: number;
  byType: Record<ArtifactType, number>;
} {
  const byType: Record<ArtifactType, number> = {
    'magazine-entry': 0, 'recap-card': 0, 'iwasthere-badge': 0,
    'nft-metadata': 0, 'timeline-badge': 0,
  };
  let totalArtifacts = 0;
  for (const bundle of artifactRegistry.values()) {
    for (const artifact of bundle.artifacts) {
      byType[artifact.type as ArtifactType]++;
      totalArtifacts++;
    }
  }
  return { totalBundles: artifactRegistry.size, totalArtifacts, byType };
}
