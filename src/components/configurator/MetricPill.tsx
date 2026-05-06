// MetricPill — badge métrique temps réel, IBM Plex Mono
interface MetricPillProps {
  label: string;
  value: string | number;
  unit?: string;
  accent?: string;
  critical?: boolean;
}

export function MetricPill({ label, value, unit, accent = '#1A3550', critical }: MetricPillProps) {
  return (
    <div
      className="inline-flex flex-col items-start px-3 py-2 rounded-sm"
      style={{
        background: `${accent}10`,
        border: `1px solid ${accent}28`,
      }}
    >
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: `${accent}99`, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: critical ? '#C1440E' : accent, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>
        {typeof value === 'number' ? value.toFixed(value < 10 ? 2 : 0) : value}
        {unit && <span style={{ fontSize: 9, color: `${accent}80`, marginLeft: 2 }}>{unit}</span>}
      </span>
    </div>
  );
}
