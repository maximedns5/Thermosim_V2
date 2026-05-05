// Champ numérique avec unité
import { useId } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  decimals?: number;
  onChange: (v: number) => void;
}

export function NumberField({ label, value, min, max, step = 1, unit, decimals = 0, onChange }: NumberFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1 py-1">
      <label htmlFor={id} className="text-xs font-sans text-ink-3 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center border border-rule focus-within:border-ink">
        <input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          className="flex-1 bg-paper text-sm font-mono text-ink px-2 py-1.5
            border-0 outline-none appearance-none
            [&::-webkit-inner-spin-button]:appearance-none"
        />
        {unit && (
          <span className="pr-2 text-xs font-mono text-ink-4 select-none">{unit}</span>
        )}
      </div>
    </div>
  );
}
