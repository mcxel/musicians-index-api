import type { ReactNode } from 'react';

type HUDFrameProps = {
  children: ReactNode;
  className?: string;
};

export default function HUDFrame({ children, className }: HUDFrameProps) {
  return <div className={className}>{children}</div>;
}
