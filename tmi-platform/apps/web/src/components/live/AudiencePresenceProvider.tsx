'use client';

/**
 * AudiencePresenceProvider — React context layer over AudiencePresenceEngine.
 *
 * Wrap GoLiveRuntime (or any persistent runtime shell) with this provider.
 * The underlying engine is module-level, so the entity survives even if the
 * provider temporarily unmounts — but in normal use the provider stays mounted
 * alongside GoLiveRuntime for the entire session.
 *
 * Usage:
 *   <AudiencePresenceProvider>
 *     <GoLiveRuntime ... />
 *   </AudiencePresenceProvider>
 *
 * In any child component:
 *   const { entity, setEntity, clearEntity, recoverSeat } = useAudiencePresence();
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  type AudienceEntity,
  getAudienceEntity,
  onAudienceEntityChange,
  setAudienceEntity,
  clearAudienceEntity,
  recoverSeat as engineRecoverSeat,
  deactivateAudienceEntity,
  updateAudienceViewpoint,
} from '@/lib/live/AudiencePresenceEngine';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AudiencePresenceContextValue {
  /** The current user's seat/identity in the active room. Null when not in a room. */
  entity: AudienceEntity | null;
  /** Join a room — sets the entity and fires all listeners. */
  setEntity: (e: AudienceEntity) => void;
  /** Fully exit — clears the entity. Called when show ends. */
  clearEntity: () => void;
  /** Mark inactive without losing seat — called on mode switch / canister open. */
  deactivate: () => void;
  /** Re-activate with the same seat when returning to the same room. */
  recoverSeat: (roomId: string) => AudienceEntity | null;
  /** Update camera viewpoint without re-joining. */
  updateViewpoint: (yaw: number, pitch: number) => void;
}

const AudiencePresenceContext = createContext<AudiencePresenceContextValue>({
  entity: null,
  setEntity: () => {},
  clearEntity: () => {},
  deactivate: () => {},
  recoverSeat: () => null,
  updateViewpoint: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AudiencePresenceProvider({ children }: { children: ReactNode }) {
  const [entity, setEntityState] = useState<AudienceEntity | null>(getAudienceEntity);

  useEffect(() => {
    // Sync React state with the module-level singleton
    return onAudienceEntityChange(setEntityState);
  }, []);

  return (
    <AudiencePresenceContext.Provider
      value={{
        entity,
        setEntity: setAudienceEntity,
        clearEntity: clearAudienceEntity,
        deactivate: deactivateAudienceEntity,
        recoverSeat: engineRecoverSeat,
        updateViewpoint: updateAudienceViewpoint,
      }}
    >
      {children}
    </AudiencePresenceContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAudiencePresence(): AudiencePresenceContextValue {
  return useContext(AudiencePresenceContext);
}
