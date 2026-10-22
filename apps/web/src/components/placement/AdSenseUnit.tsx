"use client";

/** @deprecated LEGACY — use CanonicalAdSlot for new surfaces. */

import { useEffect, useRef } from "react";
import { getAdSensePublisherId } from "@/lib/ads/adConfig";

interface AdSenseUnitProps {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSenseUnit({
  slot = "auto",
  format = "auto",
  style,
  className,
}: AdSenseUnitProps) {
  const pushed = useRef(false);
  const pubId = getAdSensePublisherId();

  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (pushed.current) return;
    const el = insRef.current;
    if (el && el.getAttribute('data-adsbygoogle-status') === 'done') return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      // AdSense script not yet loaded or already populated
    }
  }, []);

  return (
    <ins ref={insRef}
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block", overflow: "hidden", ...style }}
      data-ad-client={pubId}
      {...(slot !== "auto" ? { "data-ad-slot": slot } : {})}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
