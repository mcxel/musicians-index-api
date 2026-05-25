"use client";

// Module-level store with subscriber pattern — no zustand needed
import { useEffect, useState } from "react";
import type { AnyMemoryItem } from "@/types/memory";

interface MemoryModalState {
  active: AnyMemoryItem | null;
  last: AnyMemoryItem | null;
  isOpen: boolean;
}

let state: MemoryModalState = { active: null, last: null, isOpen: false };
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((fn) => fn());
}

export const memoryModalStore = {
  getState: (): MemoryModalState => state,

  open(item: AnyMemoryItem) {
    state = { active: item, last: item, isOpen: true };
    notify();
  },

  close() {
    state = { ...state, isOpen: false };
    notify();
  },

  replayLast() {
    if (state.last) {
      state = { ...state, active: state.last, isOpen: true };
      notify();
    }
  },

  subscribe(fn: () => void): () => void {
    subscribers.add(fn);
    return () => { subscribers.delete(fn); };
  },
};

export function useMemoryModalStore() {
  const [s, setS] = useState(() => memoryModalStore.getState());

  useEffect(() => {
    return memoryModalStore.subscribe(() => setS({ ...memoryModalStore.getState() }));
  }, []);

  return {
    active: s.active,
    last: s.last,
    isOpen: s.isOpen,
    open: memoryModalStore.open.bind(memoryModalStore),
    close: memoryModalStore.close.bind(memoryModalStore),
    replayLast: memoryModalStore.replayLast.bind(memoryModalStore),
  };
}
