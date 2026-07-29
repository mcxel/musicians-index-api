/**
 * floatingWorkspaceStore — open/close + active module for Pass 8.x floating panel.
 * Overlay only — never reflows fixed stage / monitors / bottom control bar.
 */

"use client";

import { useSyncExternalStore } from "react";
import {
  defaultModuleForRole,
  isModuleAllowedForRole,
  type FloatingWorkspaceModuleId,
} from "@/lib/workspace/FloatingWorkspaceModules";

export interface FloatingWorkspaceState {
  isOpen: boolean;
  activeModuleId: FloatingWorkspaceModuleId;
  /** Session role used for module allow-list (uppercase). */
  role: string;
}

type Listener = () => void;

let state: FloatingWorkspaceState = {
  isOpen: false,
  activeModuleId: "quick_memories",
  role: "FAN",
};

const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

function getSnapshot(): FloatingWorkspaceState {
  return state;
}

function getServerSnapshot(): FloatingWorkspaceState {
  return state;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const floatingWorkspaceStore = {
  getState: getSnapshot,
  subscribe,
  setRole(role: string) {
    const next = (role || "FAN").toUpperCase();
    if (state.role === next) return;
    const active = isModuleAllowedForRole(state.activeModuleId, next)
      ? state.activeModuleId
      : defaultModuleForRole(next);
    state = { ...state, role: next, activeModuleId: active };
    emit();
  },
  open(moduleId?: FloatingWorkspaceModuleId) {
    const id =
      moduleId && isModuleAllowedForRole(moduleId, state.role)
        ? moduleId
        : isModuleAllowedForRole(state.activeModuleId, state.role)
          ? state.activeModuleId
          : defaultModuleForRole(state.role);
    state = { ...state, isOpen: true, activeModuleId: id };
    emit();
  },
  close() {
    if (!state.isOpen) return;
    state = { ...state, isOpen: false };
    emit();
  },
  toggle(moduleId?: FloatingWorkspaceModuleId) {
    if (state.isOpen) {
      if (moduleId && moduleId !== state.activeModuleId) {
        floatingWorkspaceStore.open(moduleId);
        return;
      }
      floatingWorkspaceStore.close();
      return;
    }
    floatingWorkspaceStore.open(moduleId);
  },
  setModule(moduleId: FloatingWorkspaceModuleId) {
    if (!isModuleAllowedForRole(moduleId, state.role)) return;
    state = { ...state, activeModuleId: moduleId, isOpen: true };
    emit();
  },
};

export function useFloatingWorkspace(): FloatingWorkspaceState & {
  open: typeof floatingWorkspaceStore.open;
  close: typeof floatingWorkspaceStore.close;
  toggle: typeof floatingWorkspaceStore.toggle;
  setModule: typeof floatingWorkspaceStore.setModule;
  setRole: typeof floatingWorkspaceStore.setRole;
} {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    ...snap,
    open: floatingWorkspaceStore.open,
    close: floatingWorkspaceStore.close,
    toggle: floatingWorkspaceStore.toggle,
    setModule: floatingWorkspaceStore.setModule,
    setRole: floatingWorkspaceStore.setRole,
  };
}
