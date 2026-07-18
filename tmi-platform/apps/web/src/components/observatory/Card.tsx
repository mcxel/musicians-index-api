'use client';

import React, { ReactNode } from 'react';
import { getComponentStyle, ObservatoryRole } from '@/theme/ObservatoryDesignTokens';

export interface CardProps {
  role: ObservatoryRole;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ role, children, onClick, className }: CardProps) {
  const style = getComponentStyle('card', role);

  return (
    <div
      style={{
        ...style,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
      onClick={onClick}
      className={className}
    >
      {children}
    </div>
  );
}

export default Card;
