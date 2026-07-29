/**
 * MediaCard — thin alias for MotionMediaCard (Pass 8.x Memory MaaS).
 * Prefer MotionMediaCard as the atomic card; this keeps call-sites naming-stable.
 */

"use client";

export { default } from "@/components/memory/MotionMediaCard";
export type { MotionMediaCardProps as MediaCardProps } from "@/components/memory/MotionMediaCard";
