// MemoryWallEngine — in-memory store for user memory items
// In production: replace with API calls to /api/profile/memories

import type { MemoryItem, MemoryItemKind } from "@/types/memory";

const store = new Map<string, MemoryItem[]>(); // userId → items

export const MemoryWallEngine = {
  addItem(userId: string, item: MemoryItem): void {
    const existing = store.get(userId) ?? [];
    store.set(userId, [item, ...existing]);
  },

  getItems(userId: string): MemoryItem[] {
    return store.get(userId) ?? [];
  },

  getPublicItems(userId: string): MemoryItem[] {
    return (store.get(userId) ?? []).filter((i) => i.visibility === "public");
  },

  removeItem(userId: string, itemId: string): void {
    const existing = store.get(userId) ?? [];
    store.set(userId, existing.filter((i) => i.id !== itemId));
  },

  addTicketMemory(userId: string, opts: {
    ticketId: string;
    eventTitle: string;
    venueName: string;
    date: string;
    mediaUrl?: string;
  }): MemoryItem {
    const item: MemoryItem = {
      id: `ticket-${opts.ticketId}`,
      kind: "ticket",
      title: opts.eventTitle,
      subtitle: opts.venueName,
      mediaUrl: opts.mediaUrl,
      eventTitle: opts.eventTitle,
      venueName: opts.venueName,
      date: opts.date,
      visibility: "public",
      capturedAt: new Date().toISOString(),
    };
    this.addItem(userId, item);
    return item;
  },

  addPolaroid(userId: string, opts: {
    id: string;
    title: string;
    mediaUrl: string;
    roomPrivacy?: "public" | "private" | "protected";
  }): MemoryItem | null {
    if (opts.roomPrivacy === "private" || opts.roomPrivacy === "protected") return null;
    const item: MemoryItem = {
      id: opts.id,
      kind: "polaroid",
      title: opts.title,
      mediaUrl: opts.mediaUrl,
      visibility: "public",
      capturedAt: new Date().toISOString(),
    };
    this.addItem(userId, item);
    return item;
  },
};

export default MemoryWallEngine;
