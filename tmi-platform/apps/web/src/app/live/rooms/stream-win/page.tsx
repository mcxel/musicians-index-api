import type { Metadata } from "next";
import { registerRoute } from "@/lib/routing/RouteClosureRegistry";
import { registerReturnPath } from "@/lib/routing/ReturnPathResolver";
import SeatArrivalTransition from "@/components/live/SeatArrivalTransition";
import StreamWinRoom from "@/components/stream-win/StreamWinRoom";

export const metadata: Metadata = {
  title: "Stream & Win | TMI",
  description: "Listen to tracks, react, vote, and win prizes. No purchase required.",
};

export default function StreamWinRoomPage() {
  registerRoute("/live/rooms/stream-win", "open", {
    returnRoute: "/live/rooms",
    fallbackRoute: "/",
    nextAction: "interact",
  });
  registerReturnPath({
    fromRoute: "/live/rooms/stream-win",
    toRoute: "/live/rooms",
    label: "Back to Lobby",
  });

  return (
    <>
      <SeatArrivalTransition />
      <StreamWinRoom roomId="stream-win-main" />
    </>
  );
}
