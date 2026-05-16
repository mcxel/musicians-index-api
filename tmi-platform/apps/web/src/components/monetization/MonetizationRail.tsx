"use client";

import Link from "next/link";
import {
  getMonetizationOptions,
  type MonetizationAction,
  type MonetizationTarget,
} from "@/lib/monetization/MonetizationEngine";
import "@/styles/tmiTypography.css";

interface MonetizationRailProps {
  target: MonetizationTarget;
  /** Restrict which buttons appear. Defaults to all available. */
  actions?: MonetizationAction[];
  /** Optional heading override */
  heading?: string;
  /** Layout: "row" = horizontal strip, "grid" = 2–3 col grid */
  layout?: "row" | "grid";
}

export default function MonetizationRail({
  target,
  actions,
  heading,
  layout = "row",
}: MonetizationRailProps) {
  const options = getMonetizationOptions(target, actions);

  if (options.length === 0) return null;

  return (
    <section
      style={{
        border: "1px solid rgba(255,215,0,0.22)",
        borderRadius: 14,
        background:
          "linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(5,5,16,0.88) 100%)",
        padding: "14px 16px",
        display: "grid",
        gap: 10,
      }}
    >
      {heading && (
        <div className="tmi-hud-label" style={{ fontSize: 9, color: "#FFD700" }}>
          {heading}
        </div>
      )}

      <div
        style={
          layout === "grid"
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 8,
              }
            : {
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }
        }
      >
        {options.map((opt) => (
          <Link
            key={opt.action}
            href={opt.href}
            style={{
              textDecoration: "none",
              border: `1px solid ${opt.accent}44`,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${opt.accent}18, rgba(5,5,16,0.82))`,
              padding: "10px 14px",
              display: "flex",
              flexDirection: layout === "grid" ? "column" : "row",
              alignItems: layout === "grid" ? "flex-start" : "center",
              gap: layout === "grid" ? 4 : 8,
              minWidth: layout === "row" ? 100 : undefined,
              transition: "box-shadow 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px ${opt.accent}44`;
              (e.currentTarget as HTMLElement).style.borderColor = `${opt.accent}88`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "";
              (e.currentTarget as HTMLElement).style.borderColor = `${opt.accent}44`;
            }}
          >
            <span
              className="tmi-button-text"
              style={{ color: opt.accent, fontSize: 11 }}
            >
              {opt.label}
            </span>
            {layout === "grid" && (
              <span
                className="tmi-body-copy"
                style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}
              >
                {opt.description}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
