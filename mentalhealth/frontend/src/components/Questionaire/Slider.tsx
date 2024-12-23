import { useState, useEffect, TouchEvent } from 'react';

interface SliderProps {
  question: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
}

export default function Slider({ question, min, max, step, value, onValueChange }: SliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault(); // Prevent page scroll
  };

  return (
    <div className="space-y-4 touch-none">
      <h2 className="text-[#333333] text-lg font-medium">{question}</h2>
      <div className="relative pt-1 select-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={(e) => onValueChange(Number(e.target.value))}
          onTouchStart={handleTouchStart}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                   touch-none select-none"
        />
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">{min}</span>
          <span className="text-sm font-medium text-blue-600">Current: {localValue}</span>
          <span className="text-sm text-gray-600">{max}</span>
        </div>
      </div>
    </div>
  );
}