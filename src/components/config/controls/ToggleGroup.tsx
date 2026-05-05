// ToggleGroup — groupe contigu, actif fond accent-primary, IBM Plex Mono

interface ToggleGroupProps<T extends string> {
  label?: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}

export function ToggleGroup<T extends string>({ label, value, options, onChange }: ToggleGroupProps<T>) {
  return (
    <div className="flex flex-col gap-1 py-1.5">
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-ink-3)',
          }}
        >
          {label}
        </span>
      )}
      <div
        className="flex"
        style={{ border: '1px solid var(--color-rule)' }}
      >
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className="flex-1 cursor-pointer transition-colors"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '6px 8px',
                background: active ? 'var(--color-accent-primary)' : 'transparent',
                color: active ? 'var(--color-ink-inv)' : 'var(--color-ink-3)',
                border: 'none',
                borderRight: '1px solid var(--color-rule)',
                transition: 'background 180ms ease, color 180ms ease',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'var(--color-surface-panel)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
