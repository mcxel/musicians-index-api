/**
 * launchDockStore — non-blocking Launch Dock draft / ready state.
 * Inspiration mode: configure while watching something else.
 * Persists privacy + last destination preference.
 */

"use client";

import { useSyncExternalStore } from "react";
import {
  loadPersistedLivePrivacy,
  loadPersistedPreferredExperience,
  persistLivePrivacy,
  persistPreferredExperience,
  type LivePrivacy,
} from "@/lib/live/LiveDestinationRouter";

export type LaunchDockPhase = "idle" | "launching" | "error";

export interface LaunchDockState {
  isOpen: boolean;
  collapsed: boolean;
  privacy: LivePrivacy;
  preferredExperience: string;
  camReady: boolean;
  micReady: boolean;
  /** Destination + media pre-selected — GO LIVE executes instantly */
  markedReady: boolean;
  phase: LaunchDockPhase;
  errorMsg: string;
  role: string;
}

type Listener = () => void;

function initialState(): LaunchDockState {
  return {
    isOpen: false,
    collapsed: false,
    privacy: "public",
    preferredExperience: "live",
    camReady: false,
    micReady: false,
    markedReady: false,
    phase: "idle",
    errorMsg: "",
    role: "FAN",
  };
}

let state: LaunchDockState = initialState();
let hydrated = false;

const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = {
    ...state,
    privacy: loadPersistedLivePrivacy(),
    preferredExperience: loadPersistedPreferredExperience() ?? "live",
  };
}

function getSnapshot(): LaunchDockState {
  hydrateFromStorage();
  return state;
}

function getServerSnapshot(): LaunchDockState {
  return state;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function computeReady(s: LaunchDockState): boolean {
  // Ready = privacy chosen + cam/mic attempted (granted OR explicitly skipped via mark)
  return s.markedReady && Boolean(s.privacy);
}

export const launchDockStore = {
  getState: getSnapshot,
  subscribe,

  open() {
    hydrateFromStorage();
    state = { ...state, isOpen: true, collapsed: false };
    emit();
  },

  close() {
    if (!state.isOpen) return;
    state = { ...state, isOpen: false };
    emit();
  },

  toggle() {
    if (state.isOpen) launchDockStore.close();
    else launchDockStore.open();
  },

  collapse() {
    state = { ...state, collapsed: true, isOpen: true };
    emit();
  },

  expand() {
    state = { ...state, collapsed: false, isOpen: true };
    emit();
  },

  setRole(role: string) {
    const next = (role || "FAN").toUpperCase();
    if (state.role === next) return;
    state = { ...state, role: next };
    emit();
  },

  setPrivacy(privacy: LivePrivacy) {
    persistLivePrivacy(privacy);
    state = { ...state, privacy };
    emit();
  },

  setPreferredExperience(experienceId: string) {
    persistPreferredExperience(experienceId);
    state = { ...state, preferredExperience: experienceId };
    emit();
  },

  setCamReady(ready: boolean) {
    state = { ...state, camReady: ready };
    emit();
  },

  setMicReady(ready: boolean) {
    state = { ...state, micReady: ready };
    emit();
  },

  /** User confirms readiness — enables one-button GO LIVE */
  markReady(ready = true) {
    state = { ...state, markedReady: ready };
    emit();
  },

  setPhase(phase: LaunchDockPhase, errorMsg = "") {
    state = { ...state, phase, errorMsg };
    emit();
  },

  isReady(): boolean {
    return computeReady(getSnapshot());
  },
};

export function useLaunchDock(): LaunchDockState & {
  open: typeof launchDockStore.open;
  close: typeof launchDockStore.close;
  toggle: typeof launchDockStore.toggle;
  collapse: typeof launchDockStore.collapse;
  expand: typeof launchDockStore.expand;
  setRole: typeof launchDockStore.setRole;
  setPrivacy: typeof launchDockStore.setPrivacy;
  setPreferredExperience: typeof launchDockStore.setPreferredExperience;
  setCamReady: typeof launchDockStore.setCamReady;
  setMicReady: typeof launchDockStore.setMicReady;
  markReady: typeof launchDockStore.markReady;
  setPhase: typeof launchDockStore.setPhase;
  isReady: boolean;
} {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    ...snap,
    open: launchDockStore.open,
    close: launchDockStore.close,
    toggle: launchDockStore.toggle,
    collapse: launchDockStore.collapse,
    expand: launchDockStore.expand,
    setRole: launchDockStore.setRole,
    setPrivacy: launchDockStore.setPrivacy,
    setPreferredExperience: launchDockStore.setPreferredExperience,
    setCamReady: launchDockStore.setCamReady,
    setMicReady: launchDockStore.setMicReady,
    markReady: launchDockStore.markReady,
    setPhase: launchDockStore.setPhase,
    isReady: computeReady(snap),
  };
}
