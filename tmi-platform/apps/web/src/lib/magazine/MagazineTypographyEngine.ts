import type { CSSProperties } from "react";

export function headlineStyle(accentColor: string): CSSProperties {
  return {
    margin: "4px 0 0",
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: "-0.04em",
    color: "#24190f",
    textShadow: "0 1px 0 rgba(255,255,255,0.45)",
  };
}

export function captionStyle(accentColor: string): CSSProperties {
  return {
    margin: 0,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.2em",
    color: accentColor,
    textTransform: "uppercase",
    transform: "skewX(-9deg)",
    transformOrigin: "left center",
  };
}

export function pullQuoteStyle(): CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 800,
    color: "#4d3a2a",
    fontStyle: "italic",
    lineHeight: 1.35,
    borderLeft: "2px solid rgba(50,39,29,0.25)",
    paddingLeft: 8,
  };
}

export function dropCapText(text: string): string {
  if (!text) return text;
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}
