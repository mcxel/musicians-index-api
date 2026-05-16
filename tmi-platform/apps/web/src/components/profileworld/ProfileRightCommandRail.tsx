"use client";

import type { ReactNode } from "react";

type ProfileRightCommandRailProps = {
  title: string;
  children: ReactNode;
};

export default function ProfileRightCommandRail({ title, children }: ProfileRightCommandRailProps) {
  return (
    <aside style={{ borderRadius: 16, border: "1px solid rgba(255,120,45,0.34)", background: "linear-gradient(160deg, rgba(8,17,36,0.95), rgba(4,9,20,0.96))", padding: 10, minWidth: 280 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "#ffb176", textTransform: "uppercase", marginBottom: 8, fontWeight: 900 }}>
        {title}
      </div>
      {children}
    </aside>
  );
}
