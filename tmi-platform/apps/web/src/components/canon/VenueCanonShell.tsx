"use client";

import type { ReactNode } from "react";

type VenueCanonShellProps = {
  children: ReactNode;
};

export default function VenueCanonShell({ children }: VenueCanonShellProps) {
  return <div style={{ display: "grid", gap: 10 }}>{children}</div>;
}
