import { useState, useEffect, TouchEvent } from 'react';

interface SliderProps {
  question: string;
  min: number;
  max: number;
  step: number;
  value: number;
  showAboveMax?: boolean;
  onValueChange: (value: number) => void;
}

export default function Slider({ question, min, max, step, value, showAboveMax, onValueChange }: SliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4 touch-none w-full">
      <h2 className="text-[#333333] text-lg font-medium text-justify w-full">{question}</h2>
      <div className="relative pt-1 select-none">
        <input
          type="range"
          required
          min={min}
          max={max}
          step={step}
          value={localValue} // Original numeric value preserved
          onChange={(e) => onValueChange(Number(e.target.value))} // Passes pure number
          onTouchStart={handleTouchStart}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-none select-none"
        />
        <div className="flex justify-between mt-2 w-full">
          <span className="text-sm text-gray-600">{min}</span>
          <span className="text-sm font-medium text-blue-600">
            Current: {localValue === max && showAboveMax ? `${localValue} and above` : localValue}
          </span>
          <span className="text-sm text-gray-600">{max}</span>
        </div>
      </div>
    </div>
  );
}