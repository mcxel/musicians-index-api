import type { ReactNode } from "react";

type MagazineGridProps = {
  children: ReactNode;
  className?: string;
};

export default function MagazineGrid({ children, className }: MagazineGridProps) {
  return <div className={["magazine-grid", className].filter(Boolean).join(" ")}>{children}</div>;
}
