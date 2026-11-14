import { redirect } from "next/navigation";

/**
 * LEGACY /rooms/live-concert — Batch 002A.
 * Prototype shell with fabricated participants is no longer a production destination.
 * Category deep-links resolve to canonical discovery (not an arbitrary live room).
 */
export default function LiveConcertRoomPage() {
  redirect("/rooms?legacy=live-concert");
}
