"use client";

import type { ReactNode } from "react";

type MagazineRootProps = {
  children: ReactNode;
};

export default function MagazineRoot({ children }: MagazineRootProps) {
  return <div className="magazine-root">{children}</div>;
}
