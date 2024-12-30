import { useState, useEffect } from 'react';

interface SingleSelectProps {
  question: string;
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
}

export default function SingleSelect({ 
  question, 
  options, 
  value, 
  onValueChange 
}: SingleSelectProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (selectedValue: string) => {
    setLocalValue(selectedValue);
    onValueChange(selectedValue);
  };

  return (
    <div className="w-full  space-y-4">
      <h2 className="text-[#333333] text-lg font-medium w-full text-justify">
        {question}
      </h2>
      <div className="space-y-2 \">
        {options.map(option => (
          <label
            key={option}
            className="flex items-center p-3 bg-[rgb(240,240,240)] rounded hover:bg-[rgb(230,230,230)] cursor-pointer"
          >
            <input
              type="radio"
              required
              name={question} // Add unique name per question group
              value={option}
              checked={localValue === option}
              onChange={() => handleChange(option)}
              className="w-6 h-6 mr-3 rounded border-gray-300 text-[rgb(0,122,204)] focus:ring-[rgb(0,122,204)]"
            />
            <span className="text-[#333333]">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}