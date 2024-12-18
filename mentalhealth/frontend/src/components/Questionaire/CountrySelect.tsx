import { useState } from 'react';

interface CountrySelectProps {
  label?: string;
  onChange?: (country: string) => void;
  value?: string;
  id?: string;
}

export const DropdownSelect = ({
  label = "What Country are you from?",
  onChange,
  value,
  id = "country-select"
}: CountrySelectProps) => {
  const [selectedCountry, setSelectedCountry] = useState(value || '');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(event.target.value);
    onChange?.(event.target.value);
  };

  return (
    <div className="flex flex-col gap-2 p-4 w-[400px]">
      <label 
        htmlFor={id}
        className="text-[rgba(0,0,0,0.87)] text-base"
      >
        {label}
      </label>
      <div className="relative w-full h-[40px] bg-[rgba(240,240,240,1)] border border-[rgba(200,200,200,1)] rounded">
        <select
          id={id}
          value={selectedCountry}
          onChange={handleChange}
          className="w-full h-[36px] px-[10px] bg-white border-none outline-none appearance-none cursor-pointer"
        >
          <option value="">Select a country</option>
          <option value="AF">Afghanistan</option>
          <option value="AL">Albania</option>
          <option value="DZ">Algeria</option>
          {/* Add all countries - abbreviated list shown for brevity */}
          <option value="US">United States</option>
          <option value="GB">United Kingdom</option>
          <option value="CA">Canada</option>
          <option value="FR">France</option>
          <option value="DE">Germany</option>
          <option value="IT">Italy</option>
          <option value="JP">Japan</option>
          <option value="CN">China</option>
          <option value="IN">India</option>
          <option value="BR">Brazil</option>
          {/* ... more countries ... */}
          <option value="ZW">Zimbabwe</option>
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 4L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};