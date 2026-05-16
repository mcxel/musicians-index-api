"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface HomeVerticalDriftTimelineProps {
  children: ReactNode;
  nextRoute: string;
  durationMs?: number;
  returnSequence?: boolean;
  returnDurationMs?: number;
}

function readTimelineSpeed(searchParams: URLSearchParams | null): number {
  const raw = searchParams?.get("tmiTimelineSpeed");
  const parsed = raw ? Number(raw) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return parsed;
}

function buildNextUrl(basePath: string, searchParams: URLSearchParams | null): string {
  const speedRaw = searchParams?.get("tmiTimelineSpeed");
  if (!speedRaw) return basePath;
  return `${basePath}?tmiTimelineSpeed=${encodeURIComponent(speedRaw)}`;
}

export default function HomeVerticalDriftTimeline({
  children,
  nextRoute,
  durationMs = 4 * 60 * 1000,
  returnSequence = false,
  returnDurationMs = 10000,
}: HomeVerticalDriftTimelineProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [returning, setReturning] = useState(false);

  const speed = useMemo(() => readTimelineSpeed(searchParams), [searchParams]);
  const effectiveDurationMs = Math.max(1, Math.round(durationMs / speed));
  const effectiveReturnDurationMs = Math.max(1, Math.round(returnDurationMs / speed));

  useEffect(() => {
    let routeTimer: ReturnType<typeof setTimeout> | null = null;
    let returnTimer: ReturnType<typeof setTimeout> | null = null;

    const nextUrl = buildNextUrl(nextRoute, searchParams);
    router.prefetch(nextUrl);

    if (returnSequence) {
      returnTimer = setTimeout(() => {
        setReturning(true);
      }, effectiveDurationMs);

      routeTimer = setTimeout(() => {
        router.replace(nextUrl);
      }, effectiveDurationMs + effectiveReturnDurationMs);
    } else {
      routeTimer = setTimeout(() => {
        router.replace(nextUrl);
      }, effectiveDurationMs);
    }

    return () => {
      if (routeTimer) clearTimeout(routeTimer);
      if (returnTimer) clearTimeout(returnTimer);
    };
  }, [
    effectiveDurationMs,
    effectiveReturnDurationMs,
    nextRoute,
    returnSequence,
    router,
    searchParams,
  ]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes homeVerticalDrift {
  0%   { transform: translateY(0); }
  25%  { transform: translateY(-14px); }
  40%  { transform: translateY(-14px); }
  65%  { transform: translateY(14px); }
  80%  { transform: translateY(14px); }
  100% { transform: translateY(0); }
}

@keyframes home5CloseRotateReturn {
  0%   { transform: translateY(0) rotateY(0deg) rotateZ(0deg) scale(1); opacity: 1; }
  30%  { transform: translateY(-8px) rotateY(-14deg) rotateZ(-1deg) scale(0.985); }
  55%  { transform: translateY(4px) rotateY(12deg) rotateZ(1deg) scale(0.975); }
  80%  { transform: translateY(0) rotateY(0deg) rotateZ(0deg) scale(0.965); opacity: 0.95; }
  100% { transform: translateY(0) rotateY(0deg) rotateZ(0deg) scale(0.96); opacity: 0.92; }
}
          `,
        }}
      />
      <div
        style={{
          minHeight: "100vh",
          willChange: "transform, opacity",
          animation: returning
            ? `home5CloseRotateReturn ${effectiveReturnDurationMs}ms cubic-bezier(.22,.8,.2,1) forwards`
            : "homeVerticalDrift 28s ease-in-out infinite",
        }}
      >
        {children}
      </div>
    </>
  );
}
