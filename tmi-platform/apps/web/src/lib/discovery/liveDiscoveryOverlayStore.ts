/**
 * liveDiscoveryOverlayStore — open/close Live Lobby Walls overlay.
 * Non-modal floating panel — does not reflow Overseer / Flight Deck monitors.
 */

"use client";

import { useSyncExternalStore } from "react";
import type { LiveDiscoveryCategory } from "./LiveDiscoveryRecord";

export interface LiveDiscoveryOverlayState {
  isOpen: boolean;
  /** Optional locked "channel" mode — e.g. battles only */
  lockedCategory: LiveDiscoveryCategory | null;
  /** User-controlled TV Mode — auto shuffle highlight (panel itself never auto-moves) */
  tvMode: boolean;
  /** Highlighted card id while TV Mode is on */
  tvHighlightId: string | null;
}

type Listener = () => void;

let state: LiveDiscoveryOverlayState = {
  isOpen: false,
  lockedCategory: null,
  tvMode: false,
  tvHighlightId: null,
};

const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

function getSnapshot(): LiveDiscoveryOverlayState {
  return state;
}

function getServerSnapshot(): LiveDiscoveryOverlayState {
  return state;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const liveDiscoveryOverlayStore = {
  getState: getSnapshot,
  subscribe,
  open(opts?: { lockedCategory?: LiveDiscoveryCategory | null }) {
    state = {
      ...state,
      isOpen: true,
      lockedCategory: opts?.lockedCategory ?? state.lockedCategory,
    };
    emit();
  },
  close() {
    if (!state.isOpen) return;
    state = { ...state, isOpen: false };
    emit();
  },
  toggle(opts?: { lockedCategory?: LiveDiscoveryCategory | null }) {
    if (state.isOpen) {
      liveDiscoveryOverlayStore.close();
      return;
    }
    liveDiscoveryOverlayStore.open(opts);
  },
  setLockedCategory(category: LiveDiscoveryCategory | null) {
    state = { ...state, lockedCategory: category };
    emit();
  },
  setTvMode(on: boolean) {
    state = {
      ...state,
      tvMode: on,
      tvHighlightId: on ? state.tvHighlightId : null,
    };
    emit();
  },
  setTvHighlightId(id: string | null) {
    if (state.tvHighlightId === id) return;
    state = { ...state, tvHighlightId: id };
    emit();
  },
};

export function useLiveDiscoveryOverlay() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    ...snap,
    open: liveDiscoveryOverlayStore.open,
    close: liveDiscoveryOverlayStore.close,
    toggle: liveDiscoveryOverlayStore.toggle,
    setLockedCategory: liveDiscoveryOverlayStore.setLockedCategory,
    setTvMode: liveDiscoveryOverlayStore.setTvMode,
    setTvHighlightId: liveDiscoveryOverlayStore.setTvHighlightId,
  };
}
