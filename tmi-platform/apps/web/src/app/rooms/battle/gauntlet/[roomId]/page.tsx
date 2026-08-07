"use client";

import { useParams } from "next/navigation";
import GauntletRoomShell from "@/components/gauntlet/GauntletRoomShell";

export default function GauntletRoomPage() {
  const params = useParams();
  const roomId = typeof params?.roomId === "string" ? params.roomId : "gauntlet-main";
  return <GauntletRoomShell roomId={roomId} />;
}
