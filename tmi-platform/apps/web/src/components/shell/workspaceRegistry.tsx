"use client";

import type { ReactNode } from "react";
import { InventoryCanister } from "@/components/canisters/InventoryCanister";
import MessagesWidget from "@/components/widgets/MessagesWidget";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import { PlaylistCanister } from "@/components/canisters/PlaylistCanister";
import { LobbyWallWorkspace } from "@/components/workspaces/LobbyWallWorkspace";
import { NotesWorkspace } from "@/components/workspaces/NotesWorkspace";
import type { WorkspaceDefinition, WorkspaceId, WorkspaceRole } from "@/components/shell/workspaceTypes";

const WORKSPACE_MODE_CONTRACT: WorkspaceDefinition["supportedModes"] = ["full-page", "drawer", "widget"];

const REGISTRY: WorkspaceDefinition[] = [
  {
    id: "inventory",
    label: "Inventory",
    icon: "🎒",
    category: "personal",
    description: "Avatar loadout, wearables, and props.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "messages",
    label: "Messages",
    icon: "💬",
    category: "social",
    description: "Direct messages and social communication.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "memory-wall",
    label: "Memory Wall",
    icon: "📸",
    category: "media",
    description: "Photos, clips, and room memories.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "playlists",
    label: "Playlists",
    icon: "🎵",
    category: "media",
    description: "Tracks, queue, and playback controls.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "lobby-wall",
    label: "Lobby Wall",
    icon: "🧱",
    category: "media",
    description: "Fast room and challenge access wall by role.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "camera",
    label: "Camera",
    icon: "📹",
    category: "creator",
    description: "Camera tools and recording controls.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "rewards",
    label: "Rewards",
    icon: "⭐",
    category: "personal",
    description: "Points, XP, and progression.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "store",
    label: "Store",
    icon: "🛍️",
    category: "commerce",
    description: "Merchandise and digital purchases.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙️",
    category: "personal",
    description: "Account, audio, and accessibility settings.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "notes",
    label: "Notes",
    icon: "📝",
    category: "personal",
    description: "A personal notepad for lyrics and ideas.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: ["drawer"],
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "tickets",
    label: "Tickets",
    icon: "🎟️",
    category: "commerce",
    description: "Ticket wallet and access history.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "🏪",
    category: "commerce",
    description: "Marketplace inventory and offers.",
    requiresAuth: true,
    requiredRoles: ["fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "magazine",
    label: "Magazine",
    icon: "📰",
    category: "media",
    description: "Issue feed, stories, and saved reads.",
    requiresAuth: false,
    requiredRoles: ["guest", "fan", "performer", "artist", "producer", "sponsor", "advertiser", "venue", "promoter", "writer", "admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "observatory",
    label: "Observatory",
    icon: "📊",
    category: "admin",
    description: "Runtime monitoring and command overview.",
    requiresAuth: true,
    requiredRoles: ["admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "big-ace",
    label: "Big Ace",
    icon: "🧠",
    category: "operations",
    description: "Executive runtime service workspace.",
    requiresAuth: true,
    requiredRoles: ["admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
  {
    id: "mc",
    label: "MC",
    icon: "🎛️",
    category: "operations",
    description: "Operations runtime and escalation console.",
    requiresAuth: true,
    requiredRoles: ["admin", "staff", "mc", "big-ace"],
    supportedModes: WORKSPACE_MODE_CONTRACT,
    defaultDrawerMode: "half",
    supportsFullscreen: true,
    supportsMinimize: true,
  },
];

const REGISTRY_MAP: Record<WorkspaceId, WorkspaceDefinition> = REGISTRY.reduce((acc, workspace) => {
  acc[workspace.id] = workspace;
  return acc;
}, {} as Record<WorkspaceId, WorkspaceDefinition>);

function ComingSoonWorkspace({ label }: { label: string }): ReactNode {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(170, 45, 255, 0.35)",
        background: "rgba(6, 8, 20, 0.76)",
        backdropFilter: "blur(16px)",
        padding: 20,
        color: "rgba(229, 231, 255, 0.92)",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 13, color: "rgba(229, 231, 255, 0.72)" }}>Coming soon to drawer.</div>
    </div>
  );
}

export function getWorkspaceRegistry(): WorkspaceDefinition[] {
  return REGISTRY;
}

export function getWorkspaceRegistryForRole(role: WorkspaceRole, isAuthenticated: boolean): WorkspaceDefinition[] {
  return REGISTRY.filter((workspace) => {
    if (workspace.requiresAuth && !isAuthenticated) return false;
    if (!workspace.requiredRoles || workspace.requiredRoles.length === 0) return true;
    return workspace.requiredRoles.includes(role);
  });
}

export function resolveWorkspaceAccess(role: WorkspaceRole, isAuthenticated: boolean): WorkspaceId[] {
  return getWorkspaceRegistryForRole(role, isAuthenticated).map((workspace) => workspace.id);
}

export function getWorkspaceDefinition(id: WorkspaceId): WorkspaceDefinition {
  return REGISTRY_MAP[id];
}

export function renderWorkspaceContent(id: WorkspaceId): ReactNode {
  switch (id) {
    case "inventory":
      return <InventoryCanister accentColor="#AA2DFF" />;
    case "messages":
      return <MessagesWidget />;
    case "memory-wall":
      return <MemoryWallCanister entityId="fan-self" entityType="fan" title="Your Memory Wall" accentColor="#FF2DAA" />;
    case "playlists":
      return <PlaylistCanister entityId="fan-self" entityName="Your Playlists" accentColor="#AA2DFF" isOwner />;
    case "lobby-wall":
      return <LobbyWallWorkspace role="fan" />;
    case "notes":
      return <NotesWorkspace />;
    default:
      return ComingSoonWorkspace({ label: getWorkspaceDefinition(id).label });
  }
}

export function renderWorkspaceContentForRole(id: WorkspaceId, role: WorkspaceRole): ReactNode {
  if (id === "lobby-wall") {
    return <LobbyWallWorkspace role={role} />;
  }
  return renderWorkspaceContent(id);
}
