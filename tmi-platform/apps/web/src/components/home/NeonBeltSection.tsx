import type { ReactNode } from "react";

type NeonBeltSectionProps = {
  title: string;
  subtitle: string;
  accent: string;
  children: ReactNode;
};

export default function NeonBeltSection({ title, subtitle, accent, children }: NeonBeltSectionProps) {
  return (
    <section
      style={{
        minHeight: "95vh",
        borderRadius: 22,
        border: `1px solid ${accent}55`,
        background: "linear-gradient(160deg, rgba(12,9,22,0.94), rgba(9,8,16,0.98))",
        boxShadow: `0 0 22px ${accent}33`,
        padding: 18,
        display: "grid",
        alignContent: "start",
        gap: 14,
      }}
    >
      <header style={{ display: "grid", gap: 4 }}>
        <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 900, color: accent }}>{title}</p>
        <h2 style={{ margin: 0, fontSize: 28, color: "#f8f2ff", fontWeight: 900 }}>{subtitle}</h2>
      </header>
      {children}
    </section>
  );
}
