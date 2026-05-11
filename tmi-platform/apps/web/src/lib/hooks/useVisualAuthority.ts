/**
 * src/lib/hooks/useVisualAuthority.ts
 *
 * React hooks for authority-enforced visual rendering.
 * Wraps all 5 authority-aware generators for component usage.
 *
 * Every public visual slot must use one of these hooks:
 * - useMagazineSlot() → Magazine covers, articles, sponsor inserts
 * - useImageSlot() → Generic image hydration  
 * - usePerformerPortrait() → Motion portraits, avatars
 * - useVenueReconstruction() → Venue 3D, environment themes
 * - useVisualRouting() → Generic visual replacement
 *
 * No bypass rendering allowed - all visuals must claim authority first.
 */

import { useCallback, useState, useEffect } from 'react';
import {
  resolveMagazineSlotWithAuthority,
  hydrateImageWithAuthority,
  resolvePerformerPortraitWithAuthority,
  reconstructVenueWithAuthority,
  routeVisualReplacementWithAuthority,
} from '@/lib/ai-visuals/AuthorityAwareVisualGenerators';

/**
 * useImageSlot - Generic image hydration with authority
 *
 * @param imageId - Unique image identifier
 * @param roomId - Chat room context
 * @param priority - 'high' | 'normal' | 'low'
 * @returns { assetId, blocked, fallback, isLoading, error }
 */
export function useImageSlot(imageId: string, roomId: string, priority: 'high' | 'normal' | 'low' = 'normal') {
  const [state, setState] = useState({
    assetId: null as string | null,
    blocked: false,
    fallback: null as string | null,
    isLoading: true,
    error: null as string | null,
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await hydrateImageWithAuthority(imageId, roomId, priority);
        setState({
          assetId: result.assetId || null,
          blocked: result.blocked || false,
          fallback: result.fallback || null,
          isLoading: false,
          error: null,
        });
      } catch (e: any) {
        setState({
          assetId: null,
          blocked: false,
          fallback: null,
          isLoading: false,
          error: e.message || 'Failed to hydrate image',
        });
      }
    })();
  }, [imageId, roomId, priority]);

  return state;
}

/**
 * useMagazineSlot - Magazine image authority enforcement
 *
 * @param slotId - Magazine slot ID (e.g., 'cover_001', 'article_hero_023')
 * @param roomId - Chat room context
 * @param context - Additional context { articleId, pageNumber, etc }
 * @returns { assetId, blocked, fallback, isLoading, error, recoveryAction }
 */
export function useMagazineSlot(
  slotId: string,
  roomId: string,
  context?: Record<string, any>
) {
  const [state, setState] = useState({
    assetId: null as string | null,
    blocked: false,
    fallback: null as string | null,
    isLoading: true,
    error: null as string | null,
    recoveryAction: null as string | null,
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await resolveMagazineSlotWithAuthority(slotId, roomId, context);
        setState({
          assetId: result.assetId || null,
          blocked: result.blocked || false,
          fallback: result.fallback || null,
          isLoading: false,
          error: null,
          recoveryAction: result.recoveryAction || null,
        });
      } catch (e: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e.message || 'Magazine slot resolution failed',
        }));
      }
    })();
  }, [slotId, roomId, context]);

  return state;
}

/**
 * usePerformerPortrait - Motion portrait with authority
 *
 * @param performerId - Artist/performer ID
 * @param roomId - Chat room context
 * @param displayName - Display name for portrait
 * @param kind - 'artist' | 'host' | 'dj'
 * @returns { portraitId, blocked, fallback, isLoading, error, animationState }
 */
export function usePerformerPortrait(
  performerId: string,
  roomId: string,
  displayName: string,
  kind: 'artist' | 'host' | 'dj' = 'artist'
) {
  const [state, setState] = useState({
    portraitId: null as string | null,
    blocked: false,
    fallback: null as string | null,
    isLoading: true,
    error: null as string | null,
    animationState: 'idle' as string,
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await resolvePerformerPortraitWithAuthority(
          performerId,
          roomId,
          displayName,
          kind
        );
        setState({
          portraitId: result.portraitId || result.assetId || null,
          blocked: result.blocked || false,
          fallback: result.fallback || null,
          isLoading: false,
          error: null,
          animationState: result.animationState || 'idle',
        });
      } catch (e: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e.message || 'Portrait resolution failed',
        }));
      }
    })();
  }, [performerId, roomId, displayName, kind]);

  return state;
}

/**
 * useVenueReconstruction - Venue 3D/environment with authority
 *
 * @param venueId - Venue identifier
 * @param roomId - Chat room context
 * @param venueName - Venue display name
 * @param venueType - 'intimate' | 'theater' | 'arena' | 'festival'
 * @returns { reconstructedAssetId, blocked, fallback, isLoading, error, environmentState }
 */
export function useVenueReconstruction(
  venueId: string,
  roomId: string,
  venueName: string,
  venueType: string = 'theater'
) {
  const [state, setState] = useState({
    reconstructedAssetId: null as string | null,
    blocked: false,
    fallback: null as string | null,
    isLoading: true,
    error: null as string | null,
    environmentState: 'initializing' as string,
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await reconstructVenueWithAuthority(
          venueId,
          roomId,
          venueName,
          venueType
        );
        setState({
          reconstructedAssetId: result.reconstructedAssetId || result.assetId || null,
          blocked: result.blocked || false,
          fallback: result.fallback || null,
          isLoading: false,
          error: null,
          environmentState: result.environmentState || 'ready',
        });
      } catch (e: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e.message || 'Venue reconstruction failed',
        }));
      }
    })();
  }, [venueId, roomId, venueName, venueType]);

  return state;
}

/**
 * useVisualRouting - Generic visual replacement router
 *
 * Routes any visual entity type through authority enforcement.
 *
 * @param entityId - Entity identifier
 * @param entityType - 'magazine' | 'sponsor' | 'venue' | 'ticket' | 'nft' | etc
 * @param roomId - Chat room context
 * @param metadata - Additional metadata { artistId, articleId, etc }
 * @returns { assetId, blocked, fallback, isLoading, error, resolvedType }
 */
export function useVisualRouting(
  entityId: string,
  entityType: string,
  roomId: string,
  metadata?: Record<string, any>
) {
  const [state, setState] = useState({
    assetId: null as string | null,
    blocked: false,
    fallback: null as string | null,
    isLoading: true,
    error: null as string | null,
    resolvedType: entityType as string,
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await routeVisualReplacementWithAuthority(
          entityId,
          entityType,
          roomId,
          metadata
        );
        setState({
          assetId: result.assetId || result.jobId || result.portraitId || null,
          blocked: result.blocked || false,
          fallback: result.fallback || null,
          isLoading: false,
          error: null,
          resolvedType: result.resolvedType || entityType,
        });
      } catch (e: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e.message || 'Visual routing failed',
        }));
      }
    })();
  }, [entityId, entityType, roomId, metadata]);

  return state;
}

/**
 * useVisualRetry - Manually retry a blocked visual
 *
 * Used by recovery center to manually trigger visual recovery.
 *
 * @param entityId - Visual entity ID
 * @param generatorType - Which generator to use for retry
 * @param roomId - Chat room context
 * @returns { isRetrying, retryCount, lastError, triggerRetry }
 */
export function useVisualRetry(
  entityId: string,
  generatorType: string,
  roomId: string
) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const triggerRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      // Import recovery coordinator
      const { VisualRecoveryCoordinator } = await import(
        '@/lib/ai-visuals/VisualRecoveryCoordinator'
      );

      const coordinator = new VisualRecoveryCoordinator();
      const result = await coordinator.attemptVisualRecovery(
        entityId,
        generatorType,
        roomId,
        {}
      );

      if (!result) {
        setLastError('Recovery attempt returned null result');
      } else {
        setRetryCount((prev) => prev + 1);
        setLastError(null);
      }
    } catch (e: any) {
      setLastError(e.message || 'Retry failed');
    } finally {
      setIsRetrying(false);
    }
  }, [entityId, generatorType, roomId]);

  return { isRetrying, retryCount, lastError, triggerRetry };
}
