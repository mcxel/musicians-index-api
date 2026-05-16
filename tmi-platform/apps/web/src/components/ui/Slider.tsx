'use client';

import { useState } from 'react';

interface SliderProps {
  min?: number;
  max?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  min = 0,
  max = 100,
  value: controlledValue,
  defaultValue,
  onChange,
  disabled = false,
  className = ''
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? defaultValue ?? min);
  const value = controlledValue ?? internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed slider-thumb"
      />
      <span className="text-sm font-mono min-w-[3ch] text-right">{value}</span>
    </div>
  );
}
