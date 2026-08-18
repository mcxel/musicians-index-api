/**
 * YoCollectionStore — Zustand store for the authenticated user's owned artifacts.
 *
 * Fetches from GET /api/yo/collection and holds the result in memory for the
 * session. Call loadCollection() once (e.g. in a layout or profile page).
 * isOwned(cardId) is the fast membership check used by YoArtifactDetachButton.
 *
 * Rule 20: loading and empty states are explicit — no fabricated ownership.
 */

import { create } from "zustand";

export interface OwnedArtifactRecord {
  id: string;
  artifactId: string;
  releaseVersion: number;
  ownershipType: string;
  purchaseId: string | null;
  stripePaymentIntentId: string | null;
  manifestHashAtPurchase: string | null;
  purchasedAt: string;
  buyerAccentOverride: string | null;
  offlineLicenseExpiresAt: string | null;
}

interface YoCollectionState {
  status: "idle" | "loading" | "loaded" | "error";
  collection: OwnedArtifactRecord[];
  errorMessage: string | null;
  loadCollection: () => Promise<void>;
  /** Fast O(1) membership check — stable after loadCollection() resolves */
  isOwned: (cardId: string) => boolean;
  reset: () => void;
}

export const useYoCollection = create<YoCollectionState>((set, get) => ({
  status: "idle",
  collection: [],
  errorMessage: null,

  loadCollection: async () => {
    if (get().status === "loading") return;
    set({ status: "loading", errorMessage: null });
    try {
      const res = await fetch("/api/yo/collection");
      if (!res.ok) {
        set({ status: "error", errorMessage: "Unable to load collection." });
        return;
      }
      const data = await res.json();
      set({ status: "loaded", collection: data.collection ?? [] });
    } catch {
      set({ status: "error", errorMessage: "Network error loading collection." });
    }
  },

  isOwned: (cardId: string) =>
    get().collection.some((r) => r.artifactId === cardId),

  reset: () => set({ status: "idle", collection: [], errorMessage: null }),
}));
