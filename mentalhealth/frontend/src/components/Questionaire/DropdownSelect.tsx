import { useState, useEffect } from 'react';

interface DropdownSelectProps {
  question: string;
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
}

export default function DropdownSelect({ 
  question, 
  options, 
  value, 
  onValueChange 
}: DropdownSelectProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalValue(event.target.value);
    onValueChange(event.target.value);
  };

  return (
    <div className="w-full max-w-[600px] space-y-4">
      <h2 className="text-[#333333] text-lg font-medium">
        {question}
      </h2>
      <div className="relative">
        <select
          value={localValue}
          required
          onChange={handleChange}
          className="w-full p-3 bg-[rgb(240,240,240)] border border-[rgba(200,200,200,1)] 
                   rounded appearance-none cursor-pointer hover:bg-[rgb(230,230,230)]"
        >
          <option value="">Select an option</option>
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" 
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}