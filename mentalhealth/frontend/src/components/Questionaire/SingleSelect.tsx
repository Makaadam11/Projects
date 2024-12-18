import { useState, useEffect } from 'react'

interface SingleSelectProps {
  value: string
  onValueChange: (value: string) => void
}

const ethnicGroups = [
  { id: 'white', label: 'White' },
  { id: 'mixed', label: 'Mixed/multiple ethnic groups' },
  { id: 'asian', label: 'Asian/Asian British' },
  { id: 'black', label: 'Black/African/Caribbean/Black British' },
  { id: 'other', label: 'Other ethnic group' },
]

export default function SingleSelect({ value, onValueChange }: SingleSelectProps) {
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
      <h2 className="font-medium">Ethnic Group</h2>
      <div className="space-y-2">
        {ethnicGroups.map((group) => (
          <label
            key={group.id}
            className="flex items-center p-3 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
          >
            <input
              type="radio"
              name="ethnicGroup"
              value={group.id}
              checked={localValue === group.id}
              onChange={(e) => handleChange(e.target.value)}
              className="mr-3"
            />
            <span>{group.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}