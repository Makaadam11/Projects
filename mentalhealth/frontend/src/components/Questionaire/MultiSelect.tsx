import { useState } from 'react';

type StressFactor = {
  id: string;
  label: string;
};

const stressFactors: StressFactor[] = [
  { id: 'employment', label: 'Yes (due to employment-related issues)' },
  { id: 'circumstances', label: 'Yes (due to other circumstances, such as health, family issues, etc)' },
  { id: 'university', label: 'Yes (due to university work)' },
  { id: 'no', label: 'No' }
];

interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
}

export default function MultiSelect({ value = [], onValueChange }: MultiSelectProps) {
  const handleChange = (factorId: string) => {
    let newValue: string[];

    if (factorId === 'no') {
      // If "No" is selected, uncheck all others
      newValue = value.includes('no') ? [] : ['no'];
    } else {
      // If any other option is selected, remove "No" if it's present
      newValue = value.includes(factorId)
        ? value.filter(id => id !== factorId)
        : [...value.filter(id => id !== 'no'), factorId];
    }

    onValueChange(newValue);
  };

  return (
    <div className="w-full max-w-[600px] space-y-4">
      <h2 className="text-[#333333] text-lg font-medium">
        In general, do you feel you normally experience stress while in the University? (tick all that apply)
      </h2>
      <div className="space-y-2">
        {stressFactors.map((factor) => (
          <label
            key={factor.id}
            className="flex items-center p-3 bg-[rgb(240,240,240)] rounded hover:bg-[rgb(230,230,230)] cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={value.includes(factor.id)}
              onChange={() => handleChange(factor.id)}
              className="w-6 h-6 mr-3 rounded border-gray-300 text-[rgb(0,122,204)] focus:ring-[rgb(0,122,204)]"
            />
            <span className="text-[#333333]">{factor.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}