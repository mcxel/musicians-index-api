"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPreviousRoute } from "@/lib/routeHistory";

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
}

/**
 * BackButton — reads routeHistory to return to the actual previous page.
 * Falls back to `fallback` prop (default: "/home/1") if no history exists yet.
 */
export default function BackButton({
  fallback = "/home/1",
  label = "← Back",
  className,
}: BackButtonProps) {
  const [href, setHref] = useState(fallback);

  useEffect(() => {
    const prev = getPreviousRoute(fallback);
    setHref(prev);
  }, [fallback]);

  return (
    <Link
      href={href}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "#94a3b8",
        textDecoration: "none",
        transition: "color 0.18s ease",
        pointerEvents: "auto",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = "#67e8f9";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
      }}
    >
      {label}
    </Link>
  );
}
