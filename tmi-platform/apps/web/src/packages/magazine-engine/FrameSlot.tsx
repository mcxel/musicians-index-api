import type { ReactNode } from "react";

type FrameSlotProps = {
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
  children: ReactNode;
  className?: string;
};

export default function FrameSlot({
  colStart,
  colSpan,
  rowStart,
  rowSpan,
  children,
  className,
}: FrameSlotProps) {
  return (
    <div
      className={["magazine-frame-slot", className].filter(Boolean).join(" ")}
      style={{
        gridColumn: `${colStart} / span ${colSpan}`,
        gridRow: `${rowStart} / span ${rowSpan}`,
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
}
