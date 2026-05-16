import type { CSSProperties, ReactNode } from "react";

type TmiGlassBodyProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export default function TmiGlassBody({ children, style }: TmiGlassBodyProps) {
  return (
    <div
      style={{
        position: "relative",
        padding: 12,
        background:
          "radial-gradient(circle at 20% 0%, rgba(0,255,255,0.08), transparent 55%), linear-gradient(180deg, rgba(12,12,26,0.84), rgba(6,6,16,0.9))",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
