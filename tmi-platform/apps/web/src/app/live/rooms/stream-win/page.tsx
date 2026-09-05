import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  loungeSideRoomEntryHref,
  SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
} from "@/lib/live/canonicalWorldViewport";

export const metadata: Metadata = {
  title: "Stream & Win | TMI",
  description: "Listen in the playlist lounge — video hangout, earn points for listening.",
};

/** Stream & Win / mixed-genre radio → canonical LOUNGE_SIDE_ROOM mill (no avatar lobby). */
export default function StreamWinRoomPage() {
  redirect(
    loungeSideRoomEntryHref(SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID, { from: "stream-win" }),
  );
}
