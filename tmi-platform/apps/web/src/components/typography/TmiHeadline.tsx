import React from "react";
import "@/styles/tmiTypography.css";

type TmiHeadlineProps = {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  color?: string;
  style?: React.CSSProperties;
};

export function TmiHeadline({
  children,
  className = "",
  as = "h1",
  color = "#ffffff",
  style,
}: TmiHeadlineProps) {
  const Tag = as;
  return (
    <Tag
      className={`tmi-masthead ${className}`}
      style={{ margin: 0, color, fontSize: "clamp(30px, 5.2vw, 64px)", textShadow: "none", ...style }}
    >
      {children}
    </Tag>
  );
}

export default TmiHeadline;