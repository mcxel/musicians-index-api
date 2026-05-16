"use client";

import type { ReactNode } from "react";

type AdvertiserCanonShellProps = {
  children: ReactNode;
};

export default function AdvertiserCanonShell({ children }: AdvertiserCanonShellProps) {
  return <div style={{ display: "grid", gap: 10 }}>{children}</div>;
}
