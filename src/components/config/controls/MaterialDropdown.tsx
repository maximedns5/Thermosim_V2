// MaterialDropdown — style liste technique, animation ouverture
import { useId } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface MaterialDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  hint?: string;
}

export function MaterialDropdown({ label, value, options, onChange, hint }: MaterialDropdownProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1 py-1.5">
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
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none transition-colors"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-ink)',
            background: 'transparent',
            border: '1px solid var(--color-rule)',
            borderRadius: 0,
            padding: '6px 28px 6px 8px',
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-primary)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-rule)'; }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-panel)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {/* Custom arrow */}
        <svg
          className="absolute pointer-events-none"
          style={{ right: 8, top: '50%', transform: 'translateY(-50%)' }}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
        >
          <path d="M1 1l4 4 4-4" stroke="var(--color-ink-3)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      {hint && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--color-ink-4)', marginTop: 2 }}>
          {hint}
        </p>
      )}
    </div>
  );
}
