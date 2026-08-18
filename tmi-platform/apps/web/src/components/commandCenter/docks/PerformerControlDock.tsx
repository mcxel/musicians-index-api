"use client";

import { getDockConfigForRole, getDockNavItems } from "@/registries/eos/DockRegistry";
import WorkspaceControlDock, {
  type WorkspaceControlDockProps,
  type WorkspaceDockButton,
  type WorkspaceDockNavItem,
} from "./WorkspaceControlDock";
import type { RoleDockCommonProps } from "./FanControlDock";

export interface PerformerDockProps extends RoleDockCommonProps {
  onGoLive: () => void;
  onOpenMediaLocker: () => void;
  onOpenUploadStudio: () => void;
  onOpenBeatVault: () => void;
  onOpenAnalytics: () => void;
  onOpenBooking: () => void;
  onOpenRevenue: () => void;
  onOpenBroadcastSettings: () => void;
}

export default function PerformerControlDock(props: PerformerDockProps) {
  const config = getDockConfigForRole("performer");
  const navItems: WorkspaceDockNavItem[] = getDockNavItems("performer").map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    href: item.path,
    primary: item.primary,
    badge:
      item.id === "messages"
        ? props.unreadMessages
        : item.id === "notifications"
          ? props.unreadNotifications
          : undefined,
  }));

  const controls: WorkspaceDockButton[] = [
    { id: "leave", label: "LEAVE", icon: "🚪", onClick: props.onLeave, disabled: true },
    { id: "mic", label: props.isMicActive ? "MIC ON" : "MIC OFF", icon: "🎙️", onClick: props.onToggleMic, active: props.isMicActive },
    { id: "cam", label: props.isCamActive ? "CAM ON" : "CAM OFF", icon: "📹", onClick: props.onToggleCam, active: props.isCamActive },
    { id: "hand", label: "HAND", icon: "✋", onClick: props.onToggleHand, active: props.isHandRaised },
    { id: "overlays", label: "OVERLAYS", icon: "🎭", onClick: props.onToggleEmotes },
    { id: "go-live", label: "STAGE / GO LIVE", icon: "🔴", onClick: props.onGoLive, emphasis: true },
  ];

  const quickActions: WorkspaceDockButton[] = [
    { id: "media-locker", label: "MEDIA", icon: "🎵", onClick: props.onOpenMediaLocker },
    { id: "upload", label: "UPLOAD", icon: "⬆️", onClick: props.onOpenUploadStudio },
    { id: "beat-vault", label: "BEAT VAULT", icon: "🥁", onClick: props.onOpenBeatVault },
    { id: "analytics", label: "ANALYTICS", icon: "📊", onClick: props.onOpenAnalytics },
    { id: "booking", label: "BOOKING", icon: "📅", onClick: props.onOpenBooking },
    { id: "revenue", label: "REVENUE", icon: "💰", onClick: props.onOpenRevenue },
    { id: "broadcast-settings", label: "SETTINGS", icon: "⚙️", onClick: props.onOpenBroadcastSettings },
    { id: "share", label: props.isShareActive ? "STOP SHARE" : "SHARE", icon: "🖥", onClick: props.onToggleShare, active: props.isShareActive },
  ];

  const dockProps: WorkspaceControlDockProps = {
    roleLabel: "Performer",
    playlistLabel: config.playlistLabel,
    accentColor: config.accentColor,
    nowPlayingTitle: props.nowPlayingTitle,
    nowPlayingSubtitle: props.nowPlayingSubtitle,
    progressLabel: props.progressLabel,
    isPlaying: props.isPlaying,
    waveTick: props.waveTick,
    workspaceOpen: props.workspaceOpen,
    online: props.online,
    statusLabel: props.online ? "BROADCAST READY" : "OFFLINE",
    statusDetail: "Media Locker, upload, booking, revenue, and broadcast tools stay in the same dock shell.",
    controls,
    navItems,
    quickActions,
    onToggleWorkspace: props.onToggleWorkspace,
    onOpenPlaylist: props.onOpenPlaylist,
    onPrev: props.onPrev,
    onTogglePlay: props.onTogglePlay,
    onNext: props.onNext,
  };

  return <WorkspaceControlDock {...dockProps} />;
}