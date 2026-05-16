import type { CSSProperties, ReactNode } from "react";

type MotionCardProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  glowTone?: string;
  hover?: boolean;
};

export default function MotionCard({ children, className, style }: MotionCardProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
