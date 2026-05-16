'use client';

import Link from 'next/link';

interface ChevronProps {
  direction: 'up' | 'down' | 'left' | 'right';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  href?: string;
}

export function Chevron({ direction, onClick, disabled = false, className = '', href }: ChevronProps) {
  const rotations = {
    up: 'rotate-180',
    down: 'rotate-0',
    left: 'rotate-90',
    right: '-rotate-90'
  };

  const content = (
    <svg
      className={`w-6 h-6 ${rotations[direction]}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const baseClasses = `inline-flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses} aria-label={`Navigate ${direction}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      aria-label={`Navigate ${direction}`}
    >
      {content}
    </button>
  );
}
