"use client";

import type { ReactNode } from "react";

export default function TmiHomepageDualOverlayShell({
  rear,
  front,
  children,
}: {
  rear?: ReactNode;
  front?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-fuchsia-300/30 bg-black/50">
      <div className="pointer-events-none absolute inset-0 z-10">{rear}</div>
      <div className="relative z-20">{children}</div>
      <div className="absolute inset-0 z-30">{front}</div>
    </section>
  );
}
