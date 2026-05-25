"use client";

// Module-level store with subscriber pattern — no zustand needed
import type { MemoryItem } from "@/types/memory";

interface MemoryModalState {
  item: MemoryItem | null;
  lastItem: MemoryItem | null;
  isOpen: boolean;
}

let state: MemoryModalState = { item: null, lastItem: null, isOpen: false };
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((fn) => fn());
}

export const memoryModalStore = {
  getState: () => state,

  open(item: MemoryItem) {
    state = { item, lastItem: item, isOpen: true };
    notify();
  },

  close() {
    state = { ...state, isOpen: false };
    notify();
  },

  subscribe(fn: () => void) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};

// React hook
import { useEffect, useState } from "react";

export function useMemoryModalStore() {
  const [s, setS] = useState(() => memoryModalStore.getState());

  useEffect(() => {
    const unsub = memoryModalStore.subscribe(() => setS({ ...memoryModalStore.getState() }));
    return () => { unsub(); };
  }, []);

  return {
    ...s,
    open: memoryModalStore.open.bind(memoryModalStore),
    close: memoryModalStore.close.bind(memoryModalStore),
  };
}
