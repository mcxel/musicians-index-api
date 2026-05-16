"use client";

import PerformerStageConsole from "@/components/live/PerformerStageConsole";
import InteractiveAudienceHUD from "@/components/live/InteractiveAudienceHUD";
import { useSharedStageRoomData } from "@/components/live/useSharedStageRoomData";

type StageSeatLensRuntimeProps = {
  roomId: string;
  lens: "performer" | "fan";
};

export default function StageSeatLensRuntime({ roomId, lens }: StageSeatLensRuntimeProps) {
  const data = useSharedStageRoomData(roomId);

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0c0813, #201338 48%, #0b0813)", padding: 20 }}>
      <header style={{ maxWidth: 1280, margin: "0 auto 12px", color: "#f0e5ff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9f7cf2", fontWeight: 800 }}>
            Stage & Seat Lens
          </div>
          <h1 style={{ margin: "4px 0 0", fontSize: 28 }}>Live Room: {roomId}</h1>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Lens: {lens === "performer" ? "PerformerStageConsole" : "InteractiveAudienceHUD"}
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {lens === "performer" ? (
          <PerformerStageConsole roomId={roomId} data={data} />
        ) : (
          <InteractiveAudienceHUD roomId={roomId} data={data} />
        )}
      </div>
    </main>
  );
}
