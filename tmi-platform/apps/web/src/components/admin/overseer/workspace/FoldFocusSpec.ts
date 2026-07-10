export type FoldFocusZone = "left" | "center" | "right" | "bottom";

export type FoldFocusState =
  | "hidden"
  | "ghost"
  | "expanded"
  | "focus"
  | "floating"
  | "fullscreen"
  | "docked"
  | "closed";

export type FoldFocusTransition =
  | "hidden_to_ghost"
  | "ghost_to_expanded"
  | "expanded_to_focus"
  | "focus_to_floating"
  | "floating_to_docked"
  | "fullscreen_to_previous"
  | "closed_to_restore_from_dock";

export type FoldFocusPermission =
  | "all"
  | "admin"
  | "staff"
  | "security"
  | "finance"
  | "operations"
  | "legal";

export interface FoldFocusWidgetContract {
  id: string;
  title: string;
  zone: FoldFocusZone;
  defaultState: Extract<FoldFocusState, "ghost" | "expanded" | "docked" | "hidden">;
  canCollapse: boolean;
  canFloat: boolean;
  canFullscreen: boolean;
  canPin: boolean;
  dockVisible: boolean;
  permissionRequirement: FoldFocusPermission | FoldFocusPermission[];
  restoreBehavior: "restore-last" | "restore-default" | "focus-on-restore";
}

export interface FoldFocusStateMachine {
  previousState?: Exclude<FoldFocusState, "fullscreen">;
  activeState: FoldFocusState;
  pinned: boolean;
  lastDockIndex?: number;
}

export const FOLD_FOCUS_TRANSITIONS: Readonly<Record<FoldFocusTransition, string>> = {
  hidden_to_ghost: "hidden -> ghost",
  ghost_to_expanded: "ghost -> expanded",
  expanded_to_focus: "expanded -> focus",
  focus_to_floating: "focus -> floating",
  floating_to_docked: "floating -> docked",
  fullscreen_to_previous: "fullscreen -> previous state",
  closed_to_restore_from_dock: "closed -> restore from dock",
};

// Spec guardrails:
// 1) This file is contract/spec only. Do not wire directly into runtime without explicit sign-off.
// 2) Avatar ultra-realistic pipeline stubs are excluded from Fold & Focus production widgets.
// 3) Any widget using mock/fabricated telemetry must remain out of runtime registration (Rule 20).
