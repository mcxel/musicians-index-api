import type { ReactNode } from 'react';

type FooterHUDProps = {
  children?: ReactNode;
  className?: string;
};

export default function FooterHUD({ children, className }: FooterHUDProps) {
  return <footer className={className}>{children}</footer>;
}
