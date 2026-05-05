// TechSlider — rail gradient, thumb ivoire, IBM Plex Mono valeur
import { useId } from 'react';

interface TechSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  decimals?: number;
  onChange: (v: number) => void;
  critical?: boolean;
}

export function TechSlider({
  label, value, min, max, step = 0.01, unit = '', decimals = 2, onChange, critical = false,
}: TechSliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1 py-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-ink-3)',
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
            color: critical ? 'var(--color-accent)' : 'var(--color-accent-primary)',
          }}
        >
          {value.toFixed(decimals)}
          {unit && (
            <span style={{ color: 'var(--color-ink-3)', fontSize: 9 }}> {unit}</span>
          )}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track gradient */}
        <div
          className="absolute inset-x-0"
          style={{
            height: 1,
            background: `linear-gradient(to right, var(--color-accent-primary) ${pct}%, var(--color-rule) ${pct}%)`,
          }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="relative w-full bg-transparent cursor-pointer"
          style={{
            height: 20,
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        />
      </div>
      <style>{`
        input[type=range]#${CSS.escape(id)}::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #E8E4DA;
          box-shadow: 0 0 0 3px rgba(26,53,80,0.2);
          cursor: pointer;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        input[type=range]#${CSS.escape(id)}::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 5px rgba(26,53,80,0.15);
        }
        input[type=range]#${CSS.escape(id)}:active::-webkit-slider-thumb {
          transform: scale(0.95);
          box-shadow: 0 0 0 4px rgba(26,53,80,0.3);
        }
        input[type=range]#${CSS.escape(id)}::-webkit-slider-runnable-track { height: 0; }
        input[type=range]#${CSS.escape(id)}:focus { outline: none; }
      `}</style>
    </div>
  );
}
