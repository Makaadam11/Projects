import { useState, useEffect } from 'react'
interface SingleSelectProps {
  question: string;
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
}

export default function SingleSelect({ question, options, value, onValueChange }: SingleSelectProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    onValueChange(newValue)
  }

  return (
    <div className="space-y-4">
      <h2 className="font-medium">{question}</h2>
      <div className="space-y-2">
        {options.map(option =>  (
          <label
            key={option}
            className="flex items-center p-3 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
          >
            <input
              type="radio"
              name="ethnicGroup"
              value={value}
              checked={localValue === option}
              onChange={(e) => handleChange(e.target.value)}
              className="mr-3"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  )
}