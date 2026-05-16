/**
 * AuthorityAwareVisualGenerators.ts
 *
 * Authority-enforced wrappers for the 5 key visual generators.
 * These wrap the underlying generators with authority claims, fallback logic, and recovery.
 *
 * Generators:
 * 1. DynamicMagazineImageResolver → resolveMagazineSlotWithAuthority
 * 2. RuntimeImageHydrationQueue → hydrateImageWithAuthority
 * 3. AIVisualReplacementRouter → routeVisualReplacementWithAuthority
 * 4. PerformerMotionPortraitEngine → resolvePerformerPortraitWithAuthority
 * 5. VenueAssetReconstructionPipeline → reconstructVenueWithAuthority
 */

import { executeVisualGeneration, resolveBlockedVisual } from '@/lib/ai-visuals/VisualAuthorityGateway';
import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import { resolveMagazineSlot as originalResolveMagazineSlot } from '@/lib/ai-visuals/DynamicMagazineImageResolver';
import { routeVisualReplacement as originalRouteVisualReplacement } from '@/lib/ai-visuals/AIVisualReplacementRouter';
import { resolvePerformerPortrait as originalResolvePerformerPortrait, type PerformerKind } from '@/lib/ai-visuals/PerformerMotionPortraitEngine';
import { runVenueReconstruction as originalRunVenueReconstruction } from '@/lib/ai-visuals/VenueAssetReconstructionPipeline';

/**
 * Resolve magazine slot with authority enforcement.
 * Returns the slot with asset if authority granted or cached.
 * Logs blocked attempts for recovery.
 */
export async function resolveMagazineSlotWithAuthority(
  slotId: string,
  roomId: ChatRoomId | undefined,
  context?: string
) {
  const requestId = `mag-${slotId}-${Date.now()}`;

  const result = await executeVisualGeneration(
    {
      requestId,
      roomId,
      generatorType: 'magazine',
      entityId: slotId,
      priority: 'normal',
      context: context ? { context } : undefined,
      ownerId: 'magazine-resolver',
    },
    async () => {
      try {
        const slot = originalResolveMagazineSlot(slotId, false);
        if (slot?.asset?.assetId) {
          return { assetId: slot.asset.assetId };
        }
        return null;
      } catch (error) {
        console.error(`[Magazine] Resolution failed for slot ${slotId}:`, error);
        throw error;
      }
    }
  );

  if (result.success || result.fallbackUsed) {
    return {
      slotId,
      assetId: result.assetId,
      blocked: result.blocked,
      fallback: result.fallbackUsed,
      recoveryAction: result.recoveryAction,
    };
  }

  // Unrecoverable failure
  console.error(`[Magazine] Unrecoverable failure for slot ${slotId}:`, result.blockedReason);
  return { slotId, assetId: null, blocked: result.blocked, fallback: false, error: result.blockedReason };
}

/**
 * Hydrate image with authority enforcement.
 * Returns job ID or fallback result.
 */
export async function hydrateImageWithAuthority(
  imageId: string,
  roomId: ChatRoomId | undefined,
  priority: 'critical' | 'high' | 'normal' | 'deferred' = 'normal',
  context?: Record<string, any>
) {
  const requestId = `hydrate-${imageId}-${Date.now()}`;

  const result = await executeVisualGeneration(
    {
      requestId,
      roomId,
      generatorType: 'hydration',
      entityId: imageId,
      priority,
      context,
      ownerId: 'hydration-queue',
    },
    async () => {
      // Placeholder: actual hydration logic would go here
      // For now, return a mock job ID
      return { assetId: `hydrated-${imageId}-${Date.now()}` };
    }
  );

  if (result.success || result.fallbackUsed) {
    return {
      imageId,
      jobId: result.assetId,
      hydrated: result.success,
      blocked: result.blocked,
      queued: result.recoveryAction === 'queue',
      priority: result.blocked ? 'escalated' : priority,
    };
  }

  console.error(`[Hydration] Failed for image ${imageId}:`, result.blockedReason);
  return { imageId, jobId: null, hydrated: false, blocked: result.blocked, error: result.blockedReason };
}

/**
 * Route visual replacement with authority enforcement.
 * Central hub ensuring no generator runs without authority.
 */
export async function routeVisualReplacementWithAuthority(
  entityId: string,
  entityType: string,
  roomId: ChatRoomId | undefined,
  displayName: string,
  sourceRoute: string,
  targetSlot: string,
  context?: string,
  meta?: Record<string, string>
) {
  const requestId = `replace-${entityId}-${Date.now()}`;

  const result = await executeVisualGeneration(
    {
      requestId,
      roomId,
      generatorType: 'replacement',
      entityId,
      priority: entityType === 'avatar' ? 'critical' : 'normal',
      context: { entityType, displayName, sourceRoute, targetSlot, context },
      ownerId: 'visual-router',
    },
    async () => {
      try {
        const outcome = originalRouteVisualReplacement({
          entityId,
          entityType: entityType as any,
          displayName,
          sourceRoute,
          targetSlot,
          context,
          meta,
        });
        return outcome.jobId ? { assetId: outcome.jobId } : null;
      } catch (error) {
        console.error(`[Router] Routing failed for ${entityType} ${entityId}:`, error);
        throw error;
      }
    }
  );

  if (result.success || result.fallbackUsed) {
    return {
      entityId,
      entityType,
      routed: result.success,
      jobId: result.assetId,
      blocked: result.blocked,
      fallback: result.fallbackUsed,
      recoveryAction: result.recoveryAction,
    };
  }

  console.error(`[Router] Unroutable ${entityType} ${entityId}:`, result.blockedReason);
  return {
    entityId,
    entityType,
    routed: false,
    blocked: result.blocked,
    error: result.blockedReason,
  };
}

/**
 * Resolve performer portrait with authority enforcement.
 * Handles artists, hosts, DJs, battle contestants.
 */
export async function resolvePerformerPortraitWithAuthority(
  performerId: string,
  roomId: ChatRoomId | undefined,
  displayName: string,
  kind: PerformerKind = 'artist',
  genre?: string
) {
  const requestId = `portrait-${performerId}-${Date.now()}`;

  const result = await executeVisualGeneration(
    {
      requestId,
      roomId,
      generatorType: 'portrait',
      entityId: performerId,
      priority: 'high',
      context: { displayName, kind, genre },
      ownerId: 'portrait-engine',
    },
    async () => {
      try {
        const portrait = originalResolvePerformerPortrait({
          performerId,
          displayName,
          kind,
          genre,
        });
        return portrait?.performerId ? { assetId: portrait.performerId } : null;
      } catch (error) {
        console.error(`[Portrait] Resolution failed for performer ${performerId}:`, error);
        throw error;
      }
    }
  );

  if (result.success || result.fallbackUsed) {
    return {
      performerId,
      portraitId: result.assetId,
      generated: result.success,
      blocked: result.blocked,
      fallback: result.fallbackUsed,
      recoveryAction: result.recoveryAction,
    };
  }

  console.error(`[Portrait] Unrecoverable failure for performer ${performerId}:`, result.blockedReason);
  return {
    performerId,
    portraitId: null,
    generated: false,
    blocked: result.blocked,
    error: result.blockedReason,
  };
}

/**
 * Reconstruct venue with authority enforcement.
 * Multi-step pipeline: scene composition → asset generation.
 */
export async function reconstructVenueWithAuthority(
  venueId: string,
  roomId: ChatRoomId | undefined,
  venueName: string,
  venueType: 'club' | 'arena' | 'battle-hall' | 'lounge' = 'club',
  aesthetic?: string
) {
  const requestId = `venue-${venueId}-${Date.now()}`;

  const result = await executeVisualGeneration(
    {
      requestId,
      roomId,
      generatorType: 'venue',
      entityId: venueId,
      priority: 'high',
      context: { venueName, venueType, aesthetic },
      ownerId: 'venue-reconstruction',
    },
    async () => {
      try {
        const pipeline = originalRunVenueReconstruction({
          venueId,
          venueName,
          venueType,
          aesthetic,
        });
        return pipeline?.venueId ? { assetId: pipeline.venueId } : null;
      } catch (error) {
        console.error(`[Venue] Reconstruction failed for venue ${venueId}:`, error);
        throw error;
      }
    }
  );

  if (result.success || result.fallbackUsed) {
    return {
      venueId,
      reconstructedAssetId: result.assetId,
      reconstructed: result.success,
      blocked: result.blocked,
      fallback: result.fallbackUsed,
      recoveryAction: result.recoveryAction,
    };
  }

  console.error(`[Venue] Unrecoverable failure for venue ${venueId}:`, result.blockedReason);
  return {
    venueId,
    reconstructedAssetId: null,
    reconstructed: false,
    blocked: result.blocked,
    error: result.blockedReason,
  };
}
