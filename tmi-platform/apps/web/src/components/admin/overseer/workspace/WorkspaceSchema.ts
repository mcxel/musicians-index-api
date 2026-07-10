import type { ReactNode } from "react";

export type WorkspaceRole = "marcel" | "bigace" | "jaypaul" | "justin" | "michaelcharlie" | "legal";

export type WorkspacePermission =
  | "founder.override"
  | "ai.executive"
  | "revenue.manage"
  | "security.manage"
  | "automation.manage"
  | "media.manage"
  | "queue.manage"
  | "deployment.manage"
  | "music.manage"
  | "read.only";

export type WorkspaceWidgetKey =
  | "chain-command"
  | "money-billing"
  | "bot-roster"
  | "media-matrix"
  | "unified-inbox"
  | "broadcast-monitor"
  | "battle-lobby"
  | "feed-explorer"
  | "security-wall"
  | "account-linker"
  | "stripe-observatory"
  | "revenue-panel"
  | "magazine-analytics"
  | "automation-workforce"
  | "runtime-health"
  | "queue-processing"
  | "deployment-status"
  | "media-pipeline"
  | "music-studio"
  | "music-submissions"
  | "observer-reports"
  | "legal-overview"
  | "legal-doc-disclaimer"
  | "legal-doc-promoter"
  | "legal-doc-ticket"
  | "legal-doc-terms"
  | "legal-doc-privacy"
  | "legal-doc-dmca"
  | "legal-doc-community"
  | "legal-contact";

export type WorkspacePanelConfig = {
  id: string;
  title: string;
  widget: WorkspaceWidgetKey;
  accent?: string;
  statusLabel?: string;
  fixedHeight?: number;
  flex?: number;
  fullscreenKey?: string;
  requiredPermission?: WorkspacePermission;
};

export type WorkspaceDefinition = {
  key: WorkspaceRole;
  label: string;
  title: string;
  subtitle: string;
  leftRail: WorkspacePanelConfig[];
  center: WorkspacePanelConfig[];
  rightRail: WorkspacePanelConfig[];
  bottom: WorkspacePanelConfig[];
  dockButtons?: Array<{ label: string; href: string }>;
};

export type WorkspaceRibbon = {
  title: string;
  subtitle: string;
  roleBadges: ReactNode;
};
