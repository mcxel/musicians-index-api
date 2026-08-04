/**
 * UniversalWorkspaceHost — mounts Phase 1 workspace windows + wires Command Bus.
 * Mount once from MasterControlDock (Flight Deck). Content stays mounted after first open.
 */

"use client";

import { useEffect } from "react";
import {
  useUniversalWorkspaceStore,
  wireUniversalWorkspaceCommandBus,
  getWorkspaceDef,
} from "@/lib/workspace/universal";
import type { UniversalWorkspaceId } from "@/lib/workspace/universal/types";
import UniversalWorkspaceWindow from "./UniversalWorkspaceWindow";
import PlaylistStudioContent from "./PlaylistStudioContent";
import ShareStudioContent from "./ShareStudioContent";

const PHASE1_IDS: UniversalWorkspaceId[] = ["playlist-studio", "share-studio"];

export default function UniversalWorkspaceHost({ userId }: { userId?: string }) {
  const store = useUniversalWorkspaceStore();

  useEffect(() => {
    return wireUniversalWorkspaceCommandBus();
  }, []);

  return (
    <>
      {PHASE1_IDS.map((id) => {
        const def = getWorkspaceDef(id);
        const instance = store[id];
        if (!instance && !def.phase1Content) return null;
        const inst = instance ?? {
          id,
          windowState: "CLOSED" as const,
          geometry: def.defaultGeometry,
          previousGeometry: null,
          zIndex: 9600,
          context: {},
          keepMounted: false,
        };

        // Only mount shell after first open (keepMounted) or while transitioning.
        if (
          !inst.keepMounted &&
          inst.windowState === "CLOSED"
        ) {
          return null;
        }

        return (
          <UniversalWorkspaceWindow key={id} id={id} instance={inst}>
            {id === "playlist-studio" ? (
              <PlaylistStudioContent context={inst.context} userId={userId} />
            ) : (
              <ShareStudioContent context={inst.context} />
            )}
          </UniversalWorkspaceWindow>
        );
      })}
    </>
  );
}
