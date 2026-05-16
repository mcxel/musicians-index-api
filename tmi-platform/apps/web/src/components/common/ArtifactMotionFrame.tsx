"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useArtifactBehavior } from "@/lib/motion/artifactStateMachine";

type ArtifactMotionFrameProps = HTMLAttributes<HTMLDivElement> & {
  artifactId: string;
  scope: string;
  routeTarget?: string;
  featured?: boolean;
  dissolveOnIdle?: boolean;
  cycleMs?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export default function ArtifactMotionFrame({
  artifactId,
  scope,
  routeTarget,
  featured = false,
  dissolveOnIdle = false,
  cycleMs,
  className,
  style,
  children,
  ...rest
}: ArtifactMotionFrameProps) {
  const behavior = useArtifactBehavior({
    artifactId,
    scope,
    routeTarget,
    featured,
    dissolveOnIdle,
    cycleMs,
  });

  return (
    <div
      className={className}
      style={{ ...style, ...behavior.style }}
      data-artifact-id={artifactId}
      data-artifact-scope={scope}
      data-artifact-motion-state={behavior.state}
      {...behavior.bind}
      {...rest}
    >
      {children}
    </div>
  );
}
