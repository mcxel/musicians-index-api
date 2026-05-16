import React from "react";

type TmiHardFrameProps = {
  children: React.ReactNode;
  className?: string;
  accent?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

export function TmiHardFrame({ children, className = "", accent = "#00ffff", header, footer }: TmiHardFrameProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-black shadow-2xl relative ${className}`}
      style={{ borderColor: `${accent}55` }}
    >
      {header ? (
        <div
          style={{
            borderBottom: `1px solid ${accent}33`,
            padding: "10px 14px",
            background: "rgba(0,0,0,0.55)",
          }}
        >
          {header}
        </div>
      ) : null}
      <div style={{ padding: 14 }}>{children}</div>
      {footer ? (
        <div
          style={{
            borderTop: `1px solid ${accent}22`,
            padding: "8px 14px",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export default TmiHardFrame;