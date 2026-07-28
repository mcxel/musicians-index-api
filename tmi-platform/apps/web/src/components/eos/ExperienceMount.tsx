"use client";

import { getExperienceComponent } from "@/registries/experiences/ExperienceComponentRegistry";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";

export interface ExperienceMountProps {
  experienceId: string;
  roomId?: string;
  venueId?: string;
}

/**
 * Resolves and mounts the registered experience module for the active manifest.
 */
export default function ExperienceMount({
  experienceId,
  roomId,
  venueId,
}: ExperienceMountProps) {
  const manifest = useExperienceRuntime();
  const Component = getExperienceComponent(experienceId);

  if (!Component) {
    return (
      <div
        style={{
          padding: 24,
          color: "rgba(255,255,255,0.6)",
          fontFamily: "monospace",
          fontSize: 12,
        }}
      >
        EOS: No component registered for experience &quot;{experienceId}&quot;.
        Registry entry required in ExperienceComponentRegistry.
      </div>
    );
  }

  return (
    <Component
      roomId={roomId}
      venueId={venueId ?? manifest.experience.venueId}
    />
  );
}
