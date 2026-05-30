"use client";

import React from "react";

interface WidgetSlotProps {
  name: string;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: boolean;
}

export default function WidgetSlot({
  name,
  children,
  fallback,
  loading = false,
  className,
  style,
  label = false,
}: WidgetSlotProps) {
  const isDev = process.env.NODE_ENV === "development";

  if (loading) {
    return (
      <div
        className={className}
        style={{
          borderRadius: 12,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          overflow: "hidden",
          position: "relative",
          ...style,
        }}
      >
        {/* Skeleton shimmer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
            animation: "tmi-shimmer 1.6s ease-in-out infinite",
          }}
        />
        {isDev && (
          <div style={{ padding: "8px 12px", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {name} · loading
          </div>
        )}
        <style>{`
          @keyframes tmi-shimmer {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (children == null) {
    if (fallback) {
      return (
        <div className={className} style={style}>
          {fallback}
        </div>
      );
    }
    return (
      <div
        className={className}
        style={{
          borderRadius: 12,
          border: "1px dashed rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 80,
          ...style,
        }}
      >
        {isDev && (
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {name} · empty
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={{ position: "relative", ...style }}>
      {(isDev || label) && (
        <div style={{
          position: "absolute",
          top: 4, left: 8, zIndex: 99,
          fontSize: 8, fontWeight: 800, letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.18)",
          pointerEvents: "none",
        }}>
          {name}
        </div>
      )}
      {children}
    </div>
  );
}
