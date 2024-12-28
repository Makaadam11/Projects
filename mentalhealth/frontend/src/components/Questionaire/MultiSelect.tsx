import { useState, useEffect } from 'react'

interface MultiSelectProps {
  question: string;
  options: string[];
  value: string[];
  onValueChange: (value: string[]) => void;
}

export default function MultiSelect({ question, options, value = [], onValueChange }: MultiSelectProps) {
  const [localValue, setLocalValue] = useState<string[]>(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (option: string) => {
    const newValue = localValue.includes(option)
      ? localValue.filter(v => v !== option)
      : [...localValue, option]
    setLocalValue(newValue)
    onValueChange(newValue)
  }

  return (
    <div className="w-full  space-y-4">
      <h2 className="text-[#333333] text-lg font-medium">
        {question}
      </h2>
      <div className="space-y-2 w-full">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center p-3 bg-[rgb(240,240,240)] rounded hover:bg-[rgb(230,230,230)] cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={localValue.includes(option)}
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