'use client';

import React from 'react';
import { getCountry } from '@/lib/global/GlobalCountryRegistry';

interface CountryFlagBadgeProps {
  countryCode: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CountryFlagBadge: React.FC<CountryFlagBadgeProps> = ({
  countryCode,
  showName = true,
  size = 'md',
  className = '',
}) => {
  const country = getCountry(countryCode);
  if (!country) return null;

  const sizeClass = {
    sm: 'text-sm h-6 px-2',
    md: 'text-base h-8 px-3',
    lg: 'text-lg h-10 px-4',
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg bg-gray-900 border border-cyan-500/30 hover:border-cyan-500 transition-colors ${sizeClass} ${className}`}
    >
      <span className="text-xl leading-none">{country.flag}</span>
      {showName && <span className="font-medium text-cyan-300">{country.name}</span>}
    </div>
  );
};

export default CountryFlagBadge;
