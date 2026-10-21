/**
 * Shared quick-tool actions — Fan + Performer Command Center (desktop + mobile).
 * Single authority for workspace toggles; preserves roomId / player / WebRTC.
 */

import { toggleVenueToolsPanel } from "@/components/hud/VenueToolsToggleButton";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import {
  isVenueToolsReadOnly,
  resolveVenueToolsPolicy,
  type VenueToolsPolicyContext,
} from "@/lib/venue/VenueToolsRegistry";
import {
  startStreamWin,
  exitStreamWin,
  isStreamWinActive,
} from "@/lib/radio/StreamWinModeRuntime";
import {
  openCanonicalWorkspaceQuick,
  presentCanonicalWorkspace,
} from "@/lib/workspace/universal/openCanonicalPresentation";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import { gpsDestinationState } from "@/lib/commandCenter/gpsReleaseAllowlist";
import { useMobileGpsMonitorLayoutStore } from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";
import type { MobileCommandCenterRole, MobileQuickPanelActionId } from "./mobileCommandCenterCapabilities";
import {
  incrementFunctionCaller,
  recordFunctionInvocation,
} from "@/registries/shell/FunctionHealthRegistry";
import { getShellButtonByCommandId } from "@/registries/shell/ButtonCommandRegistry";

export interface QuickToolsActionContext extends Partial<Omit<VenueToolsPolicyContext, "role">> {
  role: MobileCommandCenterRole;
  router: { push: (href: string) => void };
  hubRoomId?: string | null;
  isLive?: boolean;
  activePanel: ReturnType<typeof useCompactQuickPanelStore.getState>["activePanel"];
  togglePanel: (id: Exclude<ReturnType<typeof useCompactQuickPanelStore.getState>["activePanel"], null>, corner?: "bottom-left" | "bottom-right") => void;
  openPanel: (id: Exclude<ReturnType<typeof useCompactQuickPanelStore.getState>["activePanel"], null>, corner?: "bottom-left" | "bottom-right") => void;
  closePanel: () => void;
  onShareScreen?: () => void;
  onRecord?: () => void;
  onShare?: () => void;
  onMemory?: () => void;
}

export function runQuickToolAction(
  id: MobileQuickPanelActionId,
  ctx: QuickToolsActionContext,
): void {
  incrementFunctionCaller("runQuickToolAction", "button", "mobile-quick-panel");
  recordFunctionInvocation("runQuickToolAction", true);

  const commandMap: Partial<Record<MobileQuickPanelActionId, string>> = {
    magazine: "shell.magazine",
    playlist: "shell.playlist",
    avatar: "shell.avatar",
    lobbies: "shell.lobbies",
    "venue-tools": "shell.venue-tools",
    messages: "shell.messages-quick",
    yopho: "shell.yopho",
    "stream-win": "shell.stream-win",
  };
  const commandId = commandMap[id];
  if (commandId) {
    const def = getShellButtonByCommandId(commandId);
    if (def) incrementFunctionCaller(def.commandId, "button", def.surface);
  }

  switch (id) {
    case "magazine":
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "tmi_magazine_origin",
          window.location.pathname + window.location.search,
        );
      }
      ctx.router.push("/magazine/issue/current");
      break;
    case "playlist":
      openCanonicalWorkspaceQuick("playlist", "DRAWER");
      break;
    case "avatar":
      // Fan Avatar Canister (Foundry GLB) — DRAWER, not CompactQuickPanel stub HUD
      presentCanonicalWorkspace("avatar-quick", "DRAWER");
      break;
    case "inventory":
      presentCanonicalWorkspace("inventory", "DRAWER");
      break;
    case "lobbies": {
      // Desktop Hub law: LOBBIES expands lower DRAWER under monitors (not Mini overlay).
      // Phone may still open Mini via CompactQuickPanelHost paths that call openPanel directly.
      const isDesktop =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        !window.matchMedia("(max-width: 900px)").matches;
      if (isDesktop) {
        const { drawerWorkspace, isDrawerExpanded, closeSurface } =
          useWorkspacePresentationStore.getState();
        if (
          (drawerWorkspace === "lobby" || drawerWorkspace === "live-destinations") &&
          isDrawerExpanded
        ) {
          closeSurface("DRAWER");
        } else {
          presentCanonicalWorkspace("lobby", "DRAWER");
        }
        ctx.closePanel();
      } else {
        ctx.togglePanel("lobbies", "bottom-left");
      }
      break;
    }
    case "stream-win":
      if (ctx.activePanel === "stream-win" || isStreamWinActive()) {
        exitStreamWin();
        ctx.closePanel();
      } else {
        void startStreamWin().then((started) => {
          if (started) ctx.openPanel("stream-win", "bottom-left");
        });
      }
      break;
    case "remote":
      ctx.togglePanel("remote", "bottom-right");
      break;
    case "messages":
      if (gpsDestinationState("messages") !== "LIVE") {
        useMobileGpsMonitorLayoutStore.getState().showReleaseNote("messages");
        break;
      }
      openCanonicalWorkspaceQuick("messaging", "DRAWER");
      break;
    case "venue-tools":
      useCompactQuickPanelStore.getState().setVenueContext({
        isLoungeHost: ctx.role === "performer",
        roomId: ctx.hubRoomId ?? undefined,
        readOnly: isVenueToolsReadOnly(
          resolveVenueToolsPolicy({
            role: ctx.role,
            isLive: ctx.isLive,
            isGoLiveContext: Boolean(ctx.hubRoomId),
          }),
        ),
      });
      toggleVenueToolsPanel("bottom-right");
      break;
    case "yopho":
      ctx.togglePanel("yopho", "bottom-left");
      break;
    case "share-screen":
      ctx.onShareScreen?.();
      break;
    case "record":
      ctx.onRecord?.();
      break;
    case "share":
      ctx.onShare?.();
      break;
    case "memory":
      ctx.onMemory?.();
      break;
    case "cast": {
      const { drawerWorkspace, isDrawerExpanded, closeSurface } =
        useWorkspacePresentationStore.getState();
      if (drawerWorkspace === "live-destinations" && isDrawerExpanded) {
        closeSurface("DRAWER");
      } else {
        presentCanonicalWorkspace("live-destinations", "DRAWER");
      }
      break;
    }
    case "user-id":
      ctx.togglePanel("user-id", "bottom-right");
      break;
    default:
      break;
  }
}

export function isQuickToolActive(
  id: MobileQuickPanelActionId,
  ctx: {
    activePanel: ReturnType<typeof useCompactQuickPanelStore.getState>["activePanel"];
    screenShareActive?: boolean;
  },
): boolean {
  if (id === "lobbies") {
    const drawer = useWorkspacePresentationStore.getState().drawerWorkspace;
    return ctx.activePanel === "lobbies" || drawer === "lobby";
  }
  if (id === "cast") {
    return useWorkspacePresentationStore.getState().drawerWorkspace === "live-destinations";
  }
  if (id === "stream-win") return ctx.activePanel === "stream-win" || isStreamWinActive();
  if (id === "remote") return ctx.activePanel === "remote";
  if (id === "yopho") return ctx.activePanel === "yopho";
  if (id === "avatar") {
    return useWorkspacePresentationStore.getState().drawerWorkspace === "avatar-quick";
  }
  if (id === "user-id") return ctx.activePanel === "user-id";
  if (id === "venue-tools") return ctx.activePanel === "venue";
  if (id === "share-screen") return Boolean(ctx.screenShareActive);
  return false;
}
