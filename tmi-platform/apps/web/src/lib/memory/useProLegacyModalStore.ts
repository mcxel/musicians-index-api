"use client";

// Separate modal store for ProLegacyItem — keeps pro/fan stores isolated
import type { ProLegacyItem } from "@/types/memory";
import { useEffect, useState } from "react";

interface ProLegacyModalState {
  item: ProLegacyItem | null;
  lastItem: ProLegacyItem | null;
  isOpen: boolean;
}

let state: ProLegacyModalState = { item: null, lastItem: null, isOpen: false };
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((fn) => fn());
}

export const proLegacyModalStore = {
  getState: () => state,

  open(item: ProLegacyItem) {
    state = { item, lastItem: item, isOpen: true };
    notify();
  },

  close() {
    state = { ...state, isOpen: false };
    notify();
  },

  subscribe(fn: () => void) {
    subscribers.add(fn);
    return () => { subscribers.delete(fn); };
  },
};

export function useProLegacyModalStore() {
  const [s, setS] = useState(() => proLegacyModalStore.getState());

  useEffect(() => {
    const unsub = proLegacyModalStore.subscribe(() => setS({ ...proLegacyModalStore.getState() }));
    return () => { unsub(); };
  }, []);

  return {
    ...s,
    open: proLegacyModalStore.open.bind(proLegacyModalStore),
    close: proLegacyModalStore.close.bind(proLegacyModalStore),
  };
}
