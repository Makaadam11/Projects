import { useState, useEffect } from 'react'

interface Props {
  value: number
  onValueChange: (value: number) => void
}

const hourMarks = [0, 3, 5, 8, 11, 14, 16, 19, 22, 25, 27, 30]

export default function Slider({ value, onValueChange }: Props) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: number) => {
    setLocalValue(newValue)
    onValueChange(newValue)
  }

  return (
    <div className="space-y-4">
      <h2 className="font-medium">Study Hours per Week</h2>
      <div className="relative pt-1">
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={localValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm">
          {hourMarks.map((mark) => (
            <span key={mark}>{mark}h</span>
          ))}
        </div>
      </div>
      <div className="text-center">
        Selected: {localValue} hours
      </div>
    </div>
  )
}