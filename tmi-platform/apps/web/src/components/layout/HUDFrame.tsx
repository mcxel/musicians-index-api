import type { ReactNode, CSSProperties } from 'react';

type HUDFrameProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function HUDFrame({ children, className, style }: HUDFrameProps) {
  return (
    <div
      className={className}
      style={{
        maxWidth: '100vw',
        overflowX: 'hidden',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
