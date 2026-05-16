"use client";

export type ReactionType = "clap" | "heart" | "fire" | "star";

export function getReactionLabel(reaction: ReactionType): string {
  if (reaction === "clap") return "Clap";
  if (reaction === "heart") return "Heart";
  if (reaction === "fire") return "Fire";
  return "Star";
}

export function getReactionWeight(reaction: ReactionType): number {
  if (reaction === "fire") return 3;
  if (reaction === "star") return 2;
  return 1;
}
