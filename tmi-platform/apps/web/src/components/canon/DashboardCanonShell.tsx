"use client";

import type { ReactNode } from "react";

type DashboardCanonShellProps = {
  title: string;
  children: ReactNode;
};

export default function DashboardCanonShell({ title, children }: DashboardCanonShellProps) {
  return (
    <section style={{ borderRadius: 18, border: "1px solid rgba(90,215,255,0.24)", background: "rgba(4,10,24,0.92)", padding: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8bc6e7", marginBottom: 8, fontWeight: 800 }}>
        {title}
      </div>
      {children}
    </section>
  );
}
