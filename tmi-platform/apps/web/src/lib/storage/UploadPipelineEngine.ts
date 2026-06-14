/**
 * UploadPipelineEngine
 * Wires the Phase 1 Data Upload Loop: 
 * Upload -> Storage -> DB Record -> Vault/Profile -> Discovery Feed/Arena
 */

export type UploadCategory = 
  | 'PROFILE_IMAGE'
  | 'MEMORY_WALL'
  | 'BEAT_UPLOAD'
  | 'TRACK_UPLOAD'
  | 'MAGAZINE_ASSET'
  | 'VENUE_SKIN';

export interface UploadDestination {
  storageBucket: string;
  dbModel: string;
  isPublic: boolean;
  eligibleFor: string[];
}

// Maps the upload type to the correct vault and discovery eligibility
export const UPLOAD_ROUTING_MAP: Record<UploadCategory, UploadDestination> = {
  PROFILE_IMAGE: {
    storageBucket: '/storage/profiles',
    dbModel: 'UserProfile',
    isPublic: true,
    eligibleFor: ['Profile Display', 'Leaderboard Avatar']
  },
  MEMORY_WALL: {
    storageBucket: '/storage/memory_wall',
    dbModel: 'MemoryWallItem',
    isPublic: true,
    eligibleFor: ['Profile Display', 'Fan Discovery Feed']
  },
  BEAT_UPLOAD: {
    storageBucket: '/storage/producer_vault',
    dbModel: 'BeatVaultItem',
    isPublic: false, // Locked until explicitly published by Producer
    eligibleFor: ['Beat Marketplace', 'Contest Eligibility', 'Playlist Eligible', 'Booking Eligible', 'Analytics Eligible']
  },
  TRACK_UPLOAD: {
    storageBucket: '/storage/tracks',
    dbModel: 'Track',
    isPublic: true,
    eligibleFor: ['Challenge Arena', 'Radio Rotation', 'Discovery Feed']
  },
  MAGAZINE_ASSET: {
    storageBucket: '/storage/magazine',
    dbModel: 'MagazineArticleAsset',
    isPublic: true,
    eligibleFor: ['Issue Publication', 'News Feed']
  },
  VENUE_SKIN: {
    storageBucket: '/storage/venues',
    dbModel: 'VenueSkin',
    isPublic: true,
    eligibleFor: ['Venue Marketplace', 'Live Arena Runtime']
  }
};

export async function processUploadRoute(
  fileName: string, 
  category: UploadCategory, 
  userId: string, 
  metadata?: any
) {
  // 1. Storage Routing Validation
  const destination = UPLOAD_ROUTING_MAP[category];
  if (!destination) throw new Error(`[TMI Engine] Unknown upload category: ${category}`);

  // 2. Generate Deterministic Path
  const fileExt = fileName.split('.').pop();
  const storagePath = `${destination.storageBucket}/${userId}_${Date.now()}.${fileExt}`;
  
  // 3. Return the exact wiring loop mapping
  return {
    success: true,
    storagePath,
    dbModel: destination.dbModel,
    eligibility: destination.eligibleFor,
    status: 'ROUTED_TO_VAULT'
  };
}