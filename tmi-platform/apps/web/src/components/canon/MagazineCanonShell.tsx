"use client";

import type { ReactNode } from "react";

type MagazineCanonShellProps = {
  children: ReactNode;
};

export default function MagazineCanonShell({ children }: MagazineCanonShellProps) {
  return <div style={{ display: "grid", gap: 10 }}>{children}</div>;
}
