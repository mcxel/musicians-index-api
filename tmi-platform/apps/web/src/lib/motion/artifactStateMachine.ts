"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { publishArtifactFeed } from "@/lib/feedAggregator";
import { emitSystemEvent } from "@/lib/systemEventBus";

export type ArtifactState = "active" | "idle" | "returning" | "dissolving" | "rejoining" | "featured";

type Trigger = "hover" | "release" | "rotation" | "inactive" | "featured" | "rejoin";

type Options = {
  artifactId: string;
  scope: string;
  routeTarget?: string;
  cycleMs?: number;
  featured?: boolean;
  dissolveOnIdle?: boolean;
};

function transitionFor(current: ArtifactState, trigger: Trigger, dissolveOnIdle: boolean): ArtifactState {
  if (trigger === "hover") return "active";
  if (trigger === "featured") return "featured";
  if (trigger === "release") return "returning";
  if (trigger === "rejoin") return "rejoining";

  if (trigger === "rotation") {
    if (current === "featured" || current === "active") return "returning";
    return "idle";
  }

  if (trigger === "inactive") {
    if (dissolveOnIdle && current !== "active" && current !== "featured") return "dissolving";
    return "idle";
  }

  return current;
}

const STATE_STYLE: Record<ArtifactState, React.CSSProperties> = {
  active: {
    transform: "scale(1.06)",
    opacity: 1,
    filter: "brightness(1.05)",
  },
  featured: {
    transform: "scale(1.1)",
    opacity: 1,
    filter: "brightness(1.08)",
  },
  idle: {
    transform: "scale(1) rotate(0deg)",
    opacity: 0.98,
    filter: "none",
  },
  returning: {
    transform: "scale(0.82) translateY(18px)",
    opacity: 0.82,
    filter: "brightness(0.95)",
  },
  dissolving: {
    transform: "scale(0.62)",
    opacity: 0.08,
    filter: "blur(5px)",
  },
  rejoining: {
    transform: "scale(0.9)",
    opacity: 0.95,
    filter: "none",
  },
};

export function useArtifactBehavior(options: Options) {
  const {
    artifactId,
    scope,
    routeTarget,
    cycleMs = 4400,
    featured = false,
    dissolveOnIdle = false,
  } = options;
  const [state, setState] = useState<ArtifactState>(featured ? "featured" : "idle");
  const mountedRef = useRef(false);

  const emitState = useCallback(
    (nextState: ArtifactState) => {
      publishArtifactFeed({
        artifactId,
        scope,
        state: nextState,
        routeTarget,
        timestamp: Date.now(),
      });

      emitSystemEvent({
        type: "homepage.artifact.state",
        actor: "ArtifactStateMachine",
        sectionId: artifactId,
        route: routeTarget,
        message: `${scope}:${artifactId} -> ${nextState}`,
      });
    },
    [artifactId, routeTarget, scope],
  );

  const transition = useCallback(
    (trigger: Trigger) => {
      setState((current) => {
        const nextState = transitionFor(current, trigger, dissolveOnIdle);
        if (nextState !== current) emitState(nextState);
        return nextState;
      });
    },
    [dissolveOnIdle, emitState],
  );

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      emitState(featured ? "featured" : "idle");
      return;
    }
    transition(featured ? "featured" : "rejoin");
  }, [emitState, featured, transition]);

  useEffect(() => {
    if (state === "active") return;

    const rotateTimer = window.setTimeout(() => transition("rotation"), Math.max(3000, Math.min(6000, cycleMs)));
    const idleTimer = window.setTimeout(() => transition("inactive"), Math.max(3200, Math.min(6100, cycleMs + 500)));
    return () => {
      window.clearTimeout(rotateTimer);
      window.clearTimeout(idleTimer);
    };
  }, [cycleMs, state, transition]);

  useEffect(() => {
    if (state !== "returning") return;
    const id = window.setTimeout(() => transition("rejoin"), 360);
    return () => window.clearTimeout(id);
  }, [state, transition]);

  useEffect(() => {
    if (state !== "rejoining") return;
    const id = window.setTimeout(() => transition("inactive"), 520);
    return () => window.clearTimeout(id);
  }, [state, transition]);

  useEffect(() => {
    if (state !== "dissolving") return;
    const id = window.setTimeout(() => transition("rejoin"), 520);
    return () => window.clearTimeout(id);
  }, [state, transition]);

  const bind = useMemo(
    () => ({
      onMouseEnter: () => transition("hover"),
      onFocus: () => transition("hover"),
      onMouseLeave: () => transition("release"),
      onBlur: () => transition("release"),
    }),
    [transition],
  );

  const style: React.CSSProperties = {
    ...STATE_STYLE[state],
    transition: "transform 520ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 420ms ease, filter 420ms ease",
    pointerEvents: "auto",
  };

  return { state, style, bind };
}
