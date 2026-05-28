"use client";

import { useEffect, useRef } from "react";

interface AdSenseUnitProps {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
  className?: string;
}

const PUB_ID = "ca-pub-4088577529436039";

export default function AdSenseUnit({
  slot = "auto",
  format = "auto",
  style,
  className,
}: AdSenseUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // AdSense script not yet loaded
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block", overflow: "hidden", ...style }}
      data-ad-client={PUB_ID}
      {...(slot !== "auto" ? { "data-ad-slot": slot } : {})}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
