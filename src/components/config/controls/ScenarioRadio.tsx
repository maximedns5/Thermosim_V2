// ScenarioRadio — sélecteur de scénario radio button style technique
import React from 'react';

interface ScenarioOption {
  value: string;
  label: string;
  description?: string;
}

interface ScenarioRadioProps {
  name: string;
  options: ScenarioOption[];
  value: string;
  onChange: (value: string) => void;
}

export function ScenarioRadio({ name, options, value, onChange }: ScenarioRadioProps) {
  return (
    <fieldset className="flex flex-col gap-1">
      {options.map((opt) => {
        const checked = opt.value === value;
        return (
          <label
            key={opt.value}
            className={[
              'flex items-start gap-2 px-2 py-1.5 cursor-pointer',
              'border transition-colors duration-100',
              checked
                ? 'border-[#0A0A0A] bg-[#0A0A0A]'
                : 'border-[#D9D7D2] hover:border-[#0A0A0A]',
            ].join(' ')}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {/* Indicateur carré style blueprint */}
            <span
              className={[
                'mt-0.5 flex-shrink-0 w-3 h-3 border',
                checked
                  ? 'border-[#F4F2ED] bg-[#F4F2ED]'
                  : 'border-[#0A0A0A]',
              ].join(' ')}
            />
            <span className="flex flex-col">
              <span
                className={[
                  'font-mono text-xs font-medium',
                  checked ? 'text-[#F4F2ED]' : 'text-[#0A0A0A]',
                ].join(' ')}
              >
                {opt.label}
              </span>
              {opt.description && (
                <span
                  className={[
                    'font-sans text-[9px] mt-0.5',
                    checked ? 'text-[#D9D7D2]' : 'text-[#6B6560]',
                  ].join(' ')}
                >
                  {opt.description}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
