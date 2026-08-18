"use client";

import { getDockConfigForRole, getDockNavItems } from "@/registries/eos/DockRegistry";
import WorkspaceControlDock, {
  type WorkspaceControlDockProps,
  type WorkspaceDockButton,
  type WorkspaceDockNavItem,
} from "./WorkspaceControlDock";

export interface RoleDockCommonProps {
  nowPlayingTitle: string;
  nowPlayingSubtitle: string;
  progressLabel: string;
  isPlaying: boolean;
  waveTick: number;
  workspaceOpen: boolean;
  online: boolean;
  unreadMessages: number;
  unreadNotifications: number;
  isMicActive: boolean;
  isCamActive: boolean;
  isHandRaised: boolean;
  isShareActive: boolean;
  onToggleWorkspace: () => void;
  onOpenPlaylist: () => void;
  onPrev: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onLeave: () => void;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleHand: () => void;
  onToggleEmotes: () => void;
  onCameraCapture: () => void;
  onOpenAvatar: () => void;
  onOpenInventory: () => void;
  onOpenRewards: () => void;
  onOpenStore: () => void;
  onOpenMemory: () => void;
  onToggleShare: () => void;
}

export default function FanControlDock(props: RoleDockCommonProps) {
  const config = getDockConfigForRole("fan");
  const navItems: WorkspaceDockNavItem[] = getDockNavItems("fan").map((item) => ({
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
    { id: "emotes", label: "EMOTES", icon: "😃", onClick: props.onToggleEmotes },
    { id: "camera", label: "CAMERA", icon: "📷", onClick: props.onCameraCapture },
  ];

  const quickActions: WorkspaceDockButton[] = [
    { id: "avatar", label: "AVATAR", icon: "👤", onClick: props.onOpenAvatar },
    { id: "inventory", label: "INVENTORY", icon: "🎒", onClick: props.onOpenInventory },
    { id: "rewards", label: "REWARDS", icon: "🏆", onClick: props.onOpenRewards },
    { id: "store", label: "STORE", icon: "🛍", onClick: props.onOpenStore },
    { id: "screen", label: "SCREEN", icon: "🧠", onClick: props.onOpenMemory },
    { id: "share", label: props.isShareActive ? "STOP SHARE" : "SHARE", icon: "🖥", onClick: props.onToggleShare, active: props.isShareActive },
  ];

  const dockProps: WorkspaceControlDockProps = {
    roleLabel: "Fan",
    playlistLabel: config.playlistLabel,
    accentColor: config.accentColor,
    nowPlayingTitle: props.nowPlayingTitle,
    nowPlayingSubtitle: props.nowPlayingSubtitle,
    progressLabel: props.progressLabel,
    isPlaying: props.isPlaying,
    waveTick: props.waveTick,
    workspaceOpen: props.workspaceOpen,
    online: props.online,
    statusLabel: props.online ? "ONLINE" : "OFFLINE",
    statusDetail: "Type message, react, capture memory, then drop back into the venue.",
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