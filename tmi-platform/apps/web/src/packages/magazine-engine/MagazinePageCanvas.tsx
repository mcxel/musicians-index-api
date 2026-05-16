import type { ComponentPropsWithoutRef, ReactNode } from "react";

type MagazinePageCanvasProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
};

export default function MagazinePageCanvas({ children, className, ...props }: MagazinePageCanvasProps) {
  return (
    <div {...props} className={["magazine-page-canvas", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
