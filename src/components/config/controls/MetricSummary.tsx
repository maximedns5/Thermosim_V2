// Résumé métrique compact — valeur + unité + label
interface MetricSummaryProps {
  label: string;
  value: number | string;
  unit?: string;
  sub?: string;
  critical?: boolean;
  large?: boolean;
}

export function MetricSummary({ label, value, unit, sub, critical = false, large = false }: MetricSummaryProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-sans text-ink-4 uppercase tracking-wide leading-none">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono tabular-nums ${large ? 'text-lg' : 'text-sm'} ${critical ? 'text-accent' : 'text-ink'}`}>
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {unit && <span className="text-xs font-mono text-ink-4">{unit}</span>}
      </div>
      {sub && <span className="text-xs font-sans text-ink-4 leading-none">{sub}</span>}
    </div>
  );
}
