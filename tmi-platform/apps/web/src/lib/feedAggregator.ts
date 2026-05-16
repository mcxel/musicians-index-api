"use client";

export type ArtifactFeedEvent = {
  artifactId: string;
  scope: string;
  state: "active" | "idle" | "returning" | "dissolving" | "rejoining" | "featured";
  routeTarget?: string;
  timestamp: number;
};

declare global {
  interface Window {
    __TMI_ARTIFACT_FEED__?: ArtifactFeedEvent[];
  }
}

export function publishArtifactFeed(event: ArtifactFeedEvent): void {
  if (typeof window === "undefined") return;

  const current = window.__TMI_ARTIFACT_FEED__ ?? [];
  const next = [event, ...current].slice(0, 120);
  window.__TMI_ARTIFACT_FEED__ = next;
  window.dispatchEvent(new CustomEvent<ArtifactFeedEvent>("tmi:artifact-feed", { detail: event }));
}

export function getArtifactFeedLog(): ArtifactFeedEvent[] {
  if (typeof window === "undefined") return [];
  return [...(window.__TMI_ARTIFACT_FEED__ ?? [])];
}
