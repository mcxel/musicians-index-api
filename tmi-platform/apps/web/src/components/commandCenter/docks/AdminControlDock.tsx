"use client";

import { getDockConfigForRole, getDockNavItems } from "@/registries/eos/DockRegistry";
import WorkspaceControlDock, {
  type WorkspaceControlDockProps,
  type WorkspaceDockButton,
  type WorkspaceDockNavItem,
} from "./WorkspaceControlDock";
import type { RoleDockCommonProps } from "./FanControlDock";

export interface AdminDockProps extends RoleDockCommonProps {
  onOpenObservatory: () => void;
  onOpenAnalytics: () => void;
  onOpenRuntime: () => void;
  onOpenSettings: () => void;
}

export default function AdminControlDock(props: AdminDockProps) {
  const config = getDockConfigForRole("admin");
  const navItems: WorkspaceDockNavItem[] = getDockNavItems("admin").map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    href: item.path,
    primary: item.primary,
  }));

  const controls: WorkspaceDockButton[] = [
    { id: "leave", label: "LEAVE", icon: "🚪", onClick: props.onLeave },
    { id: "mic", label: props.isMicActive ? "MIC ON" : "MIC OFF", icon: "🎙️", onClick: props.onToggleMic, active: props.isMicActive },
    { id: "cam", label: props.isCamActive ? "CAM ON" : "CAM OFF", icon: "📹", onClick: props.onToggleCam, active: props.isCamActive },
    { id: "camera", label: "CAMERA", icon: "📷", onClick: props.onCameraCapture },
  ];

  const quickActions: WorkspaceDockButton[] = [
    { id: "observatory", label: "OBSERVATORY", icon: "🛡", onClick: props.onOpenObservatory },
    { id: "analytics", label: "ANALYTICS", icon: "📈", onClick: props.onOpenAnalytics },
    { id: "runtime", label: "RUNTIME", icon: "⚡", onClick: props.onOpenRuntime },
    { id: "settings", label: "SETTINGS", icon: "⚙️", onClick: props.onOpenSettings },
  ];

  const dockProps: WorkspaceControlDockProps = {
    roleLabel: "Admin",
    playlistLabel: config.playlistLabel,
    accentColor: config.accentColor,
    nowPlayingTitle: props.nowPlayingTitle,
    nowPlayingSubtitle: props.nowPlayingSubtitle,
    progressLabel: props.progressLabel,
    isPlaying: props.isPlaying,
    waveTick: props.waveTick,
    workspaceOpen: props.workspaceOpen,
    online: props.online,
    statusLabel: props.online ? "SYSTEMS NOMINAL" : "NETWORK ALERT",
    statusDetail: "Platform observatory and revenue tools stay role-scoped to admin surfaces.",
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