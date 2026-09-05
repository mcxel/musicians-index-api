import { redirect } from "next/navigation";
import { fanAvatarLobbyEntryHref, SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID } from "@/lib/live/canonicalWorldViewport";

export default function FanLobbyRedirectPage() {
  redirect(fanAvatarLobbyEntryHref(SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID));
}

