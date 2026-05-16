import React from "react";
import "@/styles/tmiTypography.css";

export type TmiTextVariant =
  | "masthead"
  | "promo-title"
  | "hud-label"
  | "body-copy"
  | "counter"
  | "sticker-text"
  | "button-text";

export type TmiTextProps = {
  variant: TmiTextVariant;
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  style?: React.CSSProperties;
};

export function TmiText({
  variant,
  children,
  className = "",
  as: Tag = "span",
  style,
}: TmiTextProps) {
  const variantClass = `tmi-${variant}`;
  return (
    <Tag className={`${variantClass} ${className}`} style={style}>
      {children}
    </Tag>
  );
}

export default TmiText;