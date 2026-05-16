import type { ComponentPropsWithoutRef } from "react";

type MagazineFrameProps = ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode;
};

/**
 * MagazineFrame - Print-style frame container
 * Flat, no glow, feels like printed ink on the page
 * Used for headers and structural content that should feel integrated into the page
 */
export default function MagazineFrame({
  children,
  className,
  ...props
}: MagazineFrameProps) {
  const baseClasses =
    "relative border border-white/15 rounded-lg bg-gradient-to-br from-white/4 to-white/2 box-shadow-[inset_0_0_12px_rgba(255,255,255,0.04)] overflow-hidden";

  return (
    <div className={`${baseClasses} ${className || ""}`} {...props}>
      {children}
    </div>
  );
}
