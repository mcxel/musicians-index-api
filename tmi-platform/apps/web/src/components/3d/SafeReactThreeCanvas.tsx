"use client";

/**
 * Fault-isolated R3F Canvas — @react-three/fiber re-throws inner errors during
 * Canvas render (see CanvasImpl `if (error) throw error`), which otherwise
 * reaches Next.js app/error.tsx (SYSTEM INTERRUPT). PrimaryRendererFaultBoundary
 * keeps 3D failures local (P0 dashboard survival).
 *
 * P0 2026-11-08: never throw between hooks on LayoutStableCanvas (Rules of Hooks).
 * CanvasTreeErrorBoundary publishes componentStack forensics for ACC asset-swap crashes.
 */

import React, { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import useMeasure from "react-use-measure";
import { FiberProvider, useContextBridge } from "its-fine";
import { createRoot, events as createEvents, extend, unmountComponentAtNode, type CanvasProps } from "@react-three/fiber";
import PrimaryRendererFaultBoundary from "@/components/3d/PrimaryRendererFaultBoundary";

export type R3fTreeErrorForensics = {
  message: string;
  name: string;
  stack: string;
  componentStack: string;
  offendingHint: string;
  capturedAt: string;
  resetKey: string;
};

export type HookOrderErrorForensics = {
  message: string;
  stack: string;
  source: string;
  capturedAt: string;
  surface: "LayoutStableCanvas" | "window" | "console";
};

declare global {
  interface Window {
    /** Canonical forensics payload (double-underscore). */
    __TMI_R3F_TREE_ERROR__?: R3fTreeErrorForensics | null;
    /** Copilot verification alias — same object as __TMI_R3F_TREE_ERROR__. */
    TMI_R3F_TREE_ERROR?: R3fTreeErrorForensics | null;
    /** Fast Refresh / Rules-of-Hooks crash forensics (dev). */
    __TMI_HOOK_ORDER_ERROR__?: HookOrderErrorForensics | null;
  }
}

const HOOK_ORDER_RE =
  /Rendered more hooks|Rendered fewer hooks|change in the order of Hooks|Rules of Hooks/i;

let hookOrderConsolePatchDepth = 0;
let hookOrderOriginalConsoleError: typeof console.error | null = null;

function publishHookOrderError(forensics: HookOrderErrorForensics): void {
  if (typeof window !== "undefined") {
    window.__TMI_HOOK_ORDER_ERROR__ = forensics;
  }
  const host =
    typeof document !== "undefined" ? document.querySelector("[data-avatar-viewer]") : null;
  if (host) {
    host.setAttribute("data-hook-order-error", forensics.message.slice(0, 220));
    host.setAttribute("data-hook-order-source", forensics.source.slice(0, 120));
    host.setAttribute("data-hook-order-at", forensics.capturedAt);
  }
  // Prefer original console to avoid recursion through the patch.
  (hookOrderOriginalConsoleError ?? console.warn).call(
    console,
    "[LayoutStableCanvas] hook-order forensics",
    forensics,
  );
}

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
  /** Remount fault boundaries when the avatar asset identity changes (GLB swap). */
  treeResetKey?: string;
};

function SuspendMarker() {
  useLayoutEffect(() => {
    document.querySelector("[data-avatar-viewer]")?.setAttribute("data-canvas-suspended", "1");
  }, []);
  return null;
}

function extractOffendingHint(componentStack: string): string {
  const lines = componentStack
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const app = lines.find((l) =>
    /Avatar|Certified|Foundry|Living|Showroom|Preset|SceneCensus|AvatarRig|PartMount|Orbit|Camera/i.test(
      l,
    ),
  );
  return (app || lines[0] || "unknown").slice(0, 160);
}

function publishR3fTreeError(forensics: R3fTreeErrorForensics): void {
  if (typeof window !== "undefined") {
    window.__TMI_R3F_TREE_ERROR__ = forensics;
    window.TMI_R3F_TREE_ERROR = forensics;
  }
  const host =
    typeof document !== "undefined" ? document.querySelector("[data-avatar-viewer]") : null;
  if (host) {
    host.setAttribute("data-r3f-tree-error", forensics.message.slice(0, 220));
    host.setAttribute("data-r3f-error-name", forensics.name.slice(0, 80));
    host.setAttribute("data-r3f-offending-hint", forensics.offendingHint);
    host.setAttribute("data-r3f-component-stack", forensics.componentStack.slice(0, 600));
    host.setAttribute("data-r3f-error-at", forensics.capturedAt);
    host.setAttribute("data-r3f-reset-key", forensics.resetKey.slice(0, 120));
  }
  // eslint-disable-next-line no-console
  console.warn("[CanvasTreeErrorBoundary] R3F child tree fault", forensics);
}

function clearR3fTreeErrorAttrs(): void {
  if (typeof window !== "undefined") {
    window.__TMI_R3F_TREE_ERROR__ = null;
    window.TMI_R3F_TREE_ERROR = null;
  }
  const host =
    typeof document !== "undefined" ? document.querySelector("[data-avatar-viewer]") : null;
  if (!host) return;
  host.removeAttribute("data-r3f-tree-error");
  host.removeAttribute("data-r3f-error-name");
  host.removeAttribute("data-r3f-offending-hint");
  host.removeAttribute("data-r3f-component-stack");
  host.removeAttribute("data-r3f-error-at");
  host.removeAttribute("data-r3f-reset-key");
}

class CanvasTreeErrorBoundary extends React.Component<
  {
    set: (error: Error | null) => void;
    children?: ReactNode;
    resetKey: string;
  },
  { error: boolean; message: string; componentStack: string }
> {
  state = { error: false, message: "", componentStack: "" };

  static getDerivedStateFromError(error: Error) {
    return { error: true, message: error?.message || "R3F tree error" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const componentStack = info.componentStack || "";
    const forensics: R3fTreeErrorForensics = {
      message: error?.message || String(error),
      name: error?.name || "Error",
      stack: error?.stack || "",
      componentStack,
      offendingHint: extractOffendingHint(componentStack),
      capturedAt: new Date().toISOString(),
      resetKey: this.props.resetKey,
    };
    publishR3fTreeError(forensics);
    this.setState({ componentStack });
    this.props.set(error);
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      clearR3fTreeErrorAttrs();
      this.setState({ error: false, message: "", componentStack: "" });
      this.props.set(null);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <group userData={{ tmiR3fTreeFault: this.state.message.slice(0, 120) }}>
          {/* Empty group keeps R3F root alive; forensics live on window + data-* attrs. */}
        </group>
      );
    }
    return this.props.children;
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
    treeResetKey = "default",
    ...props
  }: CanvasProps & { treeResetKey?: string },
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
  // Do NOT throw between hooks — a mid-render `if (error) throw` skips later
  // useLayoutEffect/useEffect and triggers "Rendered more hooks than during the
  // previous render" (Fan Hub Critical System Error). Throw only after all hooks.

  useEffect(() => {
    setError(null);
    clearR3fTreeErrorAttrs();
  }, [treeResetKey]);

  // Fast Refresh can replace this module mid-render and trip Rules of Hooks.
  // Capture exact message/stack for Phase A — do not dismiss as "dev-only" without forensics.
  useEffect(() => {
    const capture = (message: string, stack: string, source: string, surface: HookOrderErrorForensics["surface"]) => {
      if (!HOOK_ORDER_RE.test(message) && !HOOK_ORDER_RE.test(stack)) return;
      publishHookOrderError({
        message: message.slice(0, 400),
        stack: stack.slice(0, 1200),
        source: source.slice(0, 200),
        capturedAt: new Date().toISOString(),
        surface,
      });
    };
    const onWindowError = (event: ErrorEvent) => {
      capture(
        String(event.message || event.error?.message || ""),
        String(event.error?.stack || ""),
        String(event.filename || "window.error"),
        "window",
      );
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason || "");
      const stack = reason instanceof Error ? reason.stack || "" : "";
      capture(message, stack, "unhandledrejection", "window");
    };
    if (hookOrderConsolePatchDepth === 0) {
      hookOrderOriginalConsoleError = console.error.bind(console);
      console.error = (...args: unknown[]) => {
        const joined = args
          .map((a) => (a instanceof Error ? `${a.message}\n${a.stack || ""}` : String(a)))
          .join(" ");
        capture(joined, joined, "console.error", "console");
        hookOrderOriginalConsoleError?.(...args);
      };
    }
    hookOrderConsolePatchDepth += 1;
    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onRejection);
      hookOrderConsolePatchDepth = Math.max(0, hookOrderConsolePatchDepth - 1);
      if (hookOrderConsolePatchDepth === 0 && hookOrderOriginalConsoleError) {
        console.error = hookOrderOriginalConsoleError;
        hookOrderOriginalConsoleError = null;
      }
    };
  }, []);

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
        onPointerMissed: (...args: unknown[]) =>
          onMissed.current?.(...(args as Parameters<NonNullable<typeof onPointerMissed>>)),
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
                rootState.pointer.set(
                  (x / rootState.size.width) * 2 - 1,
                  -(y / rootState.size.height) * 2 + 1,
                );
                rootState.raycaster.setFromCamera(rootState.pointer, rootState.camera);
              },
            });
          }
          onCreated?.(state);
        },
      });
      root.current.render(
        <Bridge>
          <CanvasTreeErrorBoundary set={setError} resetKey={treeResetKey}>
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

  // Rethrow after every hook so PrimaryRendererFaultBoundary can isolate the
  // failure without violating Rules of Hooks on this fiber.
  if (error) throw error;

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
  treeResetKey = "default",
  children,
  ...canvasProps
}: SafeReactThreeCanvasProps) {
  // Do NOT key-remount PrimaryRendererFaultBoundary on GLB identity change —
  // that destroyed LayoutStableCanvas + WebGL context on every Urban Cap ↔ Foundry
  // swap. Pass resetKey so componentDidUpdate recovers only after a real fault.
  return (
    <PrimaryRendererFaultBoundary
      resetKey={treeResetKey}
      fallbackLabel={fallbackLabel ?? faultContext}
    >
      <FiberProvider>
        <LayoutStableCanvas treeResetKey={treeResetKey} {...canvasProps}>
          {children}
        </LayoutStableCanvas>
      </FiberProvider>
    </PrimaryRendererFaultBoundary>
  );
}
