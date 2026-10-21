"use client";

/**
 * Fault-isolated R3F Canvas — @react-three/fiber re-throws inner errors during
 * Canvas render (see CanvasImpl `if (error) throw error`), which otherwise
 * reaches Next.js app/error.tsx (SYSTEM INTERRUPT). PrimaryRendererFaultBoundary
 * keeps 3D failures local (P0 dashboard survival).
 */

import React, { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import useMeasure from "react-use-measure";
import { FiberProvider, useContextBridge } from "its-fine";
import { createRoot, events as createEvents, extend, unmountComponentAtNode, type CanvasProps } from "@react-three/fiber";
import PrimaryRendererFaultBoundary from "@/components/3d/PrimaryRendererFaultBoundary";

export function R3FSurfaceFallback({ label = "3D preview paused" }: { label?: string }) {
  return (
    <div
      role="status"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 6,
        background: "radial-gradient(circle at 50% 30%, rgba(0,255,255,0.06), #050510 70%)",
        border: "1px dashed rgba(0,255,255,0.25)",
        borderRadius: 8,
        color: "rgba(255,255,255,0.55)",
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: 8,
      }}
    >
      <span style={{ fontSize: 16, opacity: 0.5 }}>🛰</span>
      {label}
      <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)" }}>
        Command center still operational
      </span>
    </div>
  );
}

type SafeReactThreeCanvasProps = CanvasProps & {
  faultContext?: string;
  fallbackLabel?: string;
};

function SuspendMarker() {
  useLayoutEffect(() => {
    document.querySelector("[data-avatar-viewer]")?.setAttribute("data-canvas-suspended", "1");
  }, []);
  return null;
}

class CanvasTreeErrorBoundary extends React.Component<
  { set: (error: Error) => void; children?: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  componentDidCatch(error: Error) {
    this.props.set(error);
    this.setState({ error: true });
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}

/**
 * Same R3F root as Canvas, without rethrowing the inner suspend promise.
 * R3F's Canvas does `if (block) throw block` with a promise that never
 * resolves. The nearest Next.js Suspense then hides the page
 * (`display: none !important`), the canvas measures 0×0, and the fiber
 * root never starts. Pending children stay inside this canvas Suspense.
 */
const LayoutStableCanvas = React.forwardRef(function LayoutStableCanvas(
  {
    children,
    fallback,
    resize,
    style,
    gl,
    events = createEvents,
    eventSource,
    eventPrefix,
    shadows,
    linear,
    flat,
    legacy,
    orthographic,
    frameloop,
    dpr,
    performance,
    raycaster,
    camera,
    scene,
    onPointerMissed,
    onCreated,
    ...props
  }: CanvasProps,
  forwardedRef: React.ForwardedRef<HTMLCanvasElement>,
) {
  useMemo(() => extend(THREE), []);
  const Bridge = useContextBridge();
  const [containerRef, containerRect] = useMeasure({
    scroll: true,
    debounce: { scroll: 50, resize: 0 },
    ...resize,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => canvasRef.current as HTMLCanvasElement);
  const onMissed = useRef(onPointerMissed);
  onMissed.current = onPointerMissed;
  const [error, setError] = useState<Error | null>(null);
  const root = useRef<ReturnType<typeof createRoot> | null>(null);
  if (error) throw error;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!(containerRect.width > 0 && containerRect.height > 0 && canvas)) {
      canvas?.closest("[data-avatar-viewer]")?.setAttribute("data-root-boot", "zero");
      return;
    }
    canvas.closest("[data-avatar-viewer]")?.setAttribute(
      "data-root-boot",
      `${Math.round(containerRect.width)}x${Math.round(containerRect.height)}`,
    );
    try {
      if (!root.current) root.current = createRoot(canvas);
      root.current.configure({
      gl,
      events,
      shadows,
      linear,
      flat,
      legacy,
      orthographic,
      frameloop,
      dpr,
      performance,
      raycaster,
      camera,
      scene,
      size: containerRect,
      onPointerMissed: (...args: unknown[]) => onMissed.current?.(...(args as Parameters<NonNullable<typeof onPointerMissed>>)),
      onCreated: (state) => {
        const target = eventSource
          ? typeof eventSource === "object" && "current" in eventSource
            ? eventSource.current
            : eventSource
          : divRef.current;
        if (target && typeof (target as HTMLElement).addEventListener === "function") {
          state.events.connect?.(target as HTMLElement);
        }
        if (eventPrefix) {
          state.setEvents({
            compute: (event, rootState) => {
              const pointerEvent = event as unknown as Record<string, number>;
              const x = pointerEvent[`${eventPrefix}X`];
              const y = pointerEvent[`${eventPrefix}Y`];
              rootState.pointer.set((x / rootState.size.width) * 2 - 1, -(y / rootState.size.height) * 2 + 1);
              rootState.raycaster.setFromCamera(rootState.pointer, rootState.camera);
            },
          });
        }
        onCreated?.(state);
      },
    });
    root.current.render(
      <Bridge>
        <CanvasTreeErrorBoundary set={setError}>
          <React.Suspense fallback={<SuspendMarker />}>{children}</React.Suspense>
        </CanvasTreeErrorBoundary>
      </Bridge>,
    );
    } catch (err) {
      canvas.closest("[data-avatar-viewer]")?.setAttribute(
        "data-root-boot",
        `error:${err instanceof Error ? err.message : "render"}`.slice(0, 180),
      );
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    return () => {
      if (canvas) unmountComponentAtNode(canvas);
    };
  }, []);

  const pointerEvents = eventSource ? "none" : "auto";
  return (
    <div
      ref={divRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents,
        ...style,
      }}
      {...props}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
        <canvas ref={canvasRef} style={{ display: "block" }}>
          {fallback}
        </canvas>
      </div>
    </div>
  );
});

export default function SafeReactThreeCanvas({
  faultContext = "3D Surface",
  fallbackLabel,
  children,
  ...canvasProps
}: SafeReactThreeCanvasProps) {
  return (
    <PrimaryRendererFaultBoundary fallbackLabel={fallbackLabel ?? faultContext}>
      <FiberProvider>
        <LayoutStableCanvas {...canvasProps}>{children}</LayoutStableCanvas>
      </FiberProvider>
    </PrimaryRendererFaultBoundary>
  );
}
