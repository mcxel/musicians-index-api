'use client';
import React from 'react';

interface NeonBorderProps {
  color?: string;
  width?: number | string;
  borderWidth?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function NeonBorder({
  color = '#00FFFF',
  width = '100%',
  borderWidth = 2,
  children,
  className,
  style,
}: NeonBorderProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        ...style,
      }}
    >
      <style>{`
        @keyframes neon-glow {
          0%, 100% {
            box-shadow: 0 0 5px ${color}, 0 0 10px ${color}40, inset 0 0 5px ${color}20;
            border-color: ${color};
          }
          50% {
            box-shadow: 0 0 15px ${color}, 0 0 30px ${color}60, inset 0 0 10px ${color}40;
            border-color: ${color}ff;
          }
        }
        .neon-border {
          animation: neon-glow 2s ease-in-out infinite;
        }
      `}</style>
      <div
        className="neon-border"
        style={{
          border: `${borderWidth}px solid ${color}`,
          borderRadius: 'inherit',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
