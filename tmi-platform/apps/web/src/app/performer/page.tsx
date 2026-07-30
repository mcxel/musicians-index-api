"use client";

import React from "react";
import FlightDeckShell from "@/components/shell/FlightDeckShell";
import PerformerExperienceRuntime from "@/components/performer/PerformerExperienceRuntime";

export default function PerformerStagePage() {
  return (
    <FlightDeckShell activeExperienceId="performer-lobby" userRole="PERFORMER">
      <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-slate-950">
        <PerformerExperienceRuntime stageId="marcel-monday-stage-1" performerName="Marcel Monday" />
      </div>
    </FlightDeckShell>
  );
}
