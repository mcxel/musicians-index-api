"use client";

import type { CSSProperties, ReactNode } from 'react';

export function BezelFrame({
  children,
  variant = "admin",
  outerStyle,
  innerStyle,
  innerPadding = 0,
  id,
}: {
  children?: ReactNode;
  variant?: "admin" | "fan" | "performer" | "neutral" | "ornate-gold";
  outerStyle?: CSSProperties;
  innerStyle?: CSSProperties;
  innerPadding?: number;
  id?: string;
}) {
  const palette =
    variant === "fan"
      ? {
          outer: "linear-gradient(180deg, rgba(255,230,166,0.34), rgba(132,81,30,0.48))",
          innerBorder: "1px solid rgba(248,199,95,0.65)",
          innerBg: "linear-gradient(180deg, rgba(43,22,16,0.96), rgba(16,9,12,0.98))",
        }
      : variant === "performer"
        ? {
            outer: "linear-gradient(180deg, rgba(238,240,255,0.34), rgba(164,101,255,0.45) 52%, rgba(46,225,255,0.4))",
            innerBorder: "1px solid rgba(201,198,255,0.6)",
            innerBg: "linear-gradient(180deg, rgba(31,16,42,0.95), rgba(13,9,22,0.98))",
          }
        : variant === "neutral"
          ? {
              outer: "linear-gradient(180deg, rgba(194,198,212,0.28), rgba(96,104,122,0.45))",
              innerBorder: "1px solid rgba(177,184,204,0.5)",
              innerBg: "linear-gradient(180deg, rgba(24,27,35,0.95), rgba(12,15,22,0.98))",
            }
          : variant === "ornate-gold"
            ? {
                outer: "linear-gradient(135deg, rgba(255,228,149,0.55) 0%, rgba(166,124,0,0.78) 48%, rgba(255,223,133,0.5) 100%)", // Gold/Brass
                innerBorder: "1px solid rgba(212,175,55,0.82)",
                innerBg: "linear-gradient(180deg, rgba(21,12,10,0.97), rgba(10,6,9,0.99))",
              }
          : {
              outer: "linear-gradient(180deg, rgba(255,224,158,0.32), rgba(126,71,31,0.5))",
              innerBorder: "1px solid rgba(241,181,66,0.62)",
              innerBg: "linear-gradient(180deg, rgba(58,25,16,0.94), rgba(24,10,11,0.98))",
            };

  return (
    <section
      id={id}
      style={{
        borderRadius: 11,
        padding: 2,
        background: palette.outer,
        boxShadow:
          "0 0 0 1px rgba(44,22,11,0.95), inset 0 0 0 1px rgba(255,238,198,0.2), 0 9px 22px rgba(0,0,0,0.44)",
        minHeight: 0,
        display: "flex",
        ...outerStyle,
      }}
    >
      <div
        style={{
          borderRadius: 9,
          border: palette.innerBorder,
          background: palette.innerBg,
          boxShadow:
            "inset 0 0 0 1px rgba(255,216,143,0.18), inset 0 0 24px rgba(0,0,0,0.55)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          width: "100%",
          padding: innerPadding,
          position: "relative",
          ...innerStyle,
        }}
      >
        <span style={{ position: "absolute", top: 3, left: 3, width: 8, height: 8, borderTop: "2px solid rgba(255,215,127,0.7)", borderLeft: "2px solid rgba(255,215,127,0.7)", pointerEvents: "none" }} />
        <span style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, borderTop: "2px solid rgba(255,215,127,0.7)", borderRight: "2px solid rgba(255,215,127,0.7)", pointerEvents: "none" }} />
        <span style={{ position: "absolute", bottom: 3, left: 3, width: 8, height: 8, borderBottom: "2px solid rgba(255,215,127,0.7)", borderLeft: "2px solid rgba(255,215,127,0.7)", pointerEvents: "none" }} />
        <span style={{ position: "absolute", bottom: 3, right: 3, width: 8, height: 8, borderBottom: "2px solid rgba(255,215,127,0.7)", borderRight: "2px solid rgba(255,215,127,0.7)", pointerEvents: "none" }} />
        {children}
      </div>
    </section>
  );
}

export function DeckCanister({
  title,
  live = true,
  children,
  rightLabel,
}: {
  title: string;
  live?: boolean;
  children: ReactNode;
  rightLabel?: string;
}) {
  return (
    <BezelFrame>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "7px 10px",
          borderBottom: "1px solid rgba(241,181,66,0.45)",
          background:
            "linear-gradient(180deg, rgba(109,46,23,0.92), rgba(57,23,21,0.95))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: live ? "#00ff88" : "#f59e0b",
              boxShadow: `0 0 8px ${live ? "#00ff88" : "#f59e0b"}`,
            }}
          />
          <span
            style={{
              color: "#f4d07f",
              fontSize: 10,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {rightLabel ? (
            <span
              style={{
                fontSize: 8,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,240,210,0.85)",
                border: "1px solid rgba(241,181,66,0.38)",
                borderRadius: 999,
                padding: "2px 6px",
              }}
            >
              {rightLabel}
            </span>
          ) : null}
          <span style={dotStyle("#f4d07f")} />
          <span style={dotStyle("#f4d07f")} />
        </div>
      </header>
      <div style={{ flex: 1, minHeight: 0, padding: 8 }}>{children}</div>
    </BezelFrame>
  );
}

export function Canister({
  title,
  status = "live",
  rightLabel,
  children,
}: {
  title: string;
  status?: "live" | "idle" | "warn";
  rightLabel?: string;
  children: ReactNode;
}) {
  return (
    <DeckCanister
      title={title}
      live={status === "live"}
      rightLabel={rightLabel ?? status.toUpperCase()}
    >
      {children}
    </DeckCanister>
  );
}

export function MetricCard({
  title,
  value,
  trend,
  tone = "amber",
}: {
  title: string;
  value: string | number;
  trend?: number;
  tone?: "amber" | "cyan" | "green";
}) {
  const color =
    tone === "cyan" ? "#00ffff" : tone === "green" ? "#22c55e" : "#f4d07f";

  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid rgba(241,181,66,0.28)",
        background: "linear-gradient(180deg, rgba(18,9,12,0.76), rgba(10,5,8,0.9))",
        padding: "7px 8px",
        minHeight: 56,
      }}
    >
      <div
        style={{
          fontSize: 8,
          color: "rgba(255,216,143,0.62)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 800,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 3,
          color,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: "0.03em",
        }}
      >
        {value}
      </div>
      {typeof trend === "number" ? (
        <div
          style={{
            marginTop: 2,
            fontSize: 8,
            color: trend >= 0 ? "#22c55e" : "#fb7185",
            fontWeight: 800,
          }}
        >
          {trend >= 0 ? "+" : ""}
          {trend}%
        </div>
      ) : null}
    </div>
  );
}

export function DeckButton({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: 8,
        border: active
          ? "1px solid rgba(255,212,120,0.8)"
          : "1px solid rgba(241,181,66,0.38)",
        background: active
          ? "linear-gradient(180deg, rgba(190,109,37,0.44), rgba(84,37,28,0.72))"
          : "linear-gradient(180deg, rgba(102,45,29,0.5), rgba(38,16,16,0.7))",
        color: active ? "#fff1c3" : "#f4d07f",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "5px 8px",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export function DeckChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 7,
        border: "1px solid rgba(241,181,66,0.32)",
        background: "rgba(19,10,12,0.72)",
        padding: "5px 7px",
      }}
    >
      <div
        style={{
          fontSize: 8,
          color: "rgba(255,225,163,0.58)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 800,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "#ffe3a3",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function MonitorViewport({
  title,
  sub,
  footer,
  children,
}: {
  title: string;
  sub?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <BezelFrame outerStyle={{ background: "#05070c" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          padding: "5px 8px",
          borderBottom: "1px solid rgba(241,181,66,0.35)",
          background: "linear-gradient(180deg, rgba(52,20,19,0.92), rgba(22,9,12,0.96))",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: "#ffe0a3",
              fontSize: 9,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
          {sub ? (
            <div style={{ color: "rgba(255,216,143,0.65)", fontSize: 8, marginTop: 2 }}>
              {sub}
            </div>
          ) : null}
        </div>
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#00ff88",
          }}
        >
          LIVE
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>{children}</div>
      {footer ? (
        <div
          style={{
            borderTop: "1px solid rgba(241,181,66,0.35)",
            padding: "5px 8px",
            background: "linear-gradient(180deg, rgba(31,12,14,0.92), rgba(16,7,10,0.97))",
          }}
        >
          {footer}
        </div>
      ) : null}
    </BezelFrame>
  );
}

function dotStyle(color: string): CSSProperties {
  return {
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: color,
    boxShadow: `0 0 5px ${color}`,
  };
}
