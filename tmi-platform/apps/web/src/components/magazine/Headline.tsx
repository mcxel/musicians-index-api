// Headline — Slice 0 placeholder
// Magazine headline component, dark theme, PDF-style typography
// Supports hero, section, ticker, and billboard variants
// No interactive logic — wired to real data in Slice 4 (Editorial)

import type { CSSProperties } from "react";

export interface HeadlineProps {
  text: string;
  subtext?: string;
  variant?: "hero" | "section" | "ticker" | "billboard";
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  accent?: boolean;
  className?: string;
  "data-testid"?: string;
}

const variantStyles: Record<
  NonNullable<HeadlineProps["variant"]>,
  CSSProperties
> = {
  hero: {
    fontSize: "clamp(28px, 5vw, 52px)",
    fontWeight: 900,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    color: "rgba(255,255,255,0.95)",
  },
  section: {
    fontSize: "clamp(18px, 3vw, 28px)",
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    color: "rgba(255,255,255,0.9)",
  },
  ticker: {
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "0.02em",
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase" as const,
  },
  billboard: {
    fontSize: "clamp(22px, 4vw, 40px)",
    fontWeight: 900,
    lineHeight: 1.15,
    letterSpacing: "-0.015em",
    color: "#ff6b35",
  },
};

export default function Headline({
  text,
  subtext,
  variant = "section",
  tag: Tag = "h2",
  accent = false,
  className,
  "data-testid": testId,
}: HeadlineProps) {
  const baseStyle = variantStyles[variant];

  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
      data-testid={testId}
      data-headline-variant={variant}
    >
      <Tag
        style={{
          ...baseStyle,
          margin: 0,
          padding: 0,
          ...(accent
            ? {
                borderLeft: "3px solid #ff6b35",
                paddingLeft: 12,
              }
            : {}),
        }}
      >
        {text}
      </Tag>

      {subtext && (
        <p
          style={{
            margin: 0,
            fontSize: variant === "hero" ? 16 : 13,
            fontWeight: 400,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.5,
            ...(accent ? { paddingLeft: 15 } : {}),
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
