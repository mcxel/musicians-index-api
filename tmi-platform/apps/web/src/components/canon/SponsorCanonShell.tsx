"use client";

import type { ReactNode } from "react";

type SponsorCanonShellProps = {
  children: ReactNode;
};

export default function SponsorCanonShell({ children }: SponsorCanonShellProps) {
  return <div style={{ display: "grid", gap: 10 }}>{children}</div>;
}
