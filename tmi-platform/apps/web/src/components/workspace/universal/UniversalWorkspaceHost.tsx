/**
 * UniversalWorkspaceHost — mounts FLOATING_EXCEPTION workspace windows only.
 *
 * HQ modules (Championship, Lobby, YoPho, Messaging, Playlist, Settings, etc.)
 * mount via CanonicalBottomDrawerHost / L/R hosts / Live Discovery overlay.
 * Rendering them here as UniversalWorkspaceWindow caused the "FLOATING" chrome defect.
 *
 * LEGACY: share-studio (and any map entry with preferredSurface FLOATING) still mounts here.
 */

"use client";

import { useEffect } from "react";
import {
  useUniversalWorkspaceStore,
  wireUniversalWorkspaceCommandBus,
  getWorkspaceDef,
  UNIVERSAL_WORKSPACE_DEFS,
} from "@/lib/workspace/universal";
import { isFloatingException } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import type { UniversalWorkspaceId } from "@/lib/workspace/universal/types";
import UniversalWorkspaceWindow from "./UniversalWorkspaceWindow";
import PlaylistStudioContent from "./PlaylistStudioContent";
import ShareStudioContent from "./ShareStudioContent";
import UniversalWorkspaceStubContent from "./UniversalWorkspaceStubContent";
import type { CommandCenterRole } from "@/components/commandCenter/commandCenterRegistry";

/** Only FLOATING_EXCEPTION ids — HQ modules are LEGACY-suppressed here. */
const FLOATING_EXCEPTION_IDS = (Object.keys(UNIVERSAL_WORKSPACE_DEFS) as UniversalWorkspaceId[]).filter(
  (id) => isFloatingException(id),
);

export default function UniversalWorkspaceHost({
  userId,
  displayName,
  role = "fan",
}: {
  userId?: string;
  displayName?: string;
  role?: CommandCenterRole;
}) {
  const store = useUniversalWorkspaceStore();

  useEffect(() => {
    return wireUniversalWorkspaceCommandBus();
  }, []);

  return (
    <>
      {FLOATING_EXCEPTION_IDS.map((id) => {
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

        if (!inst.keepMounted && inst.windowState === "CLOSED") {
          return null;
        }

        let body;
        if (id === "playlist-studio") {
          // LEGACY path — should not mount; playlist is BOTTOM_DEEP. Guard kept for safety.
          body = <PlaylistStudioContent context={inst.context} userId={userId} />;
        } else if (id === "share-studio") {
          body = <ShareStudioContent context={inst.context} />;
        } else {
          body = (
            <UniversalWorkspaceStubContent
              workspaceId={id}
              role={role}
              userId={userId ?? "session"}
              displayName={displayName ?? "Member"}
            />
          );
        }

        return (
          <UniversalWorkspaceWindow key={id} id={id} instance={inst}>
            {body}
          </UniversalWorkspaceWindow>
        );
      })}
    </>
  );
}
