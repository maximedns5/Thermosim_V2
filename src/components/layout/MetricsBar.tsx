// MetricsBar — fond #0A0D12, FlipCounter Solari, texte ivoire
import { FlipCounter } from '../ui/FlipCounter';
import { DpeLabel } from '../charts/DpeLabel';
import { useDerivedMetrics } from '../../hooks/useDerivedMetrics';
import { useUIStore } from '../../store/uiStore';
import { useBuildingStore } from '../../store/buildingStore';

interface MetricCellProps {
  label: string;
  children: React.ReactNode;
  title?: string;
}

function MetricCell({ label, children, title }: MetricCellProps) {
  return (
    <div
      className="flex flex-1 flex-col justify-center px-5 gap-0.5"
      style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      title={title}
    >
      <span
        className="uppercase tracking-widest leading-none"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          color: 'rgba(232,228,218,0.45)',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export function MetricsBar() {
  const m = useDerivedMetrics();
  const { aptSizeM2 } = useUIStore();
  const config = useBuildingStore((s) => s.config);
  const critical = m.dpe === 'F' || m.dpe === 'G';

  const A_floor = config.geometry.length * config.geometry.width;
  const nAptTotal = Math.max(1, Math.floor(A_floor / aptSizeM2)) * config.geometry.nFloors;
  const costPerApt = m.cost_eur / nAptTotal;

  return (
    <div
      className="flex h-16 select-none"
      style={{ background: '#0A0D12' }}
    >
      <MetricCell label="Wall U">
        <FlipCounter value={m.U_wall} decimals={3} unit="W/(m²·K)" dark />
      </MetricCell>

      <MetricCell label="Wall R">
        <FlipCounter value={m.R_wall} decimals={2} unit="m²·K/W" dark />
      </MetricCell>

      <MetricCell label="Design Q">
        <FlipCounter value={m.Q_design_W / 1000} decimals={1} unit="kW" dark />
      </MetricCell>

      <MetricCell label="Primary EP">
        <div className="flex items-center gap-3">
          <FlipCounter value={m.EP_m2} decimals={0} unit="kWhEP/(m²·yr)" dark critical={critical} />
          <DpeLabel letter={m.dpe} compact dark />
        </div>
      </MetricCell>

      <MetricCell label="CO₂">
        <FlipCounter value={m.CO2_m2} decimals={1} unit="kgCO₂/(m²·yr)" dark critical={critical} />
      </MetricCell>

      <MetricCell label="Total cost">
        <FlipCounter value={m.cost_eur} decimals={0} unit="€/yr" dark />
      </MetricCell>

      <MetricCell label="Cost / apt" title={`${nAptTotal} apt(s) of ${aptSizeM2} m²`}>
        <FlipCounter value={costPerApt} decimals={0} unit="€/yr" dark />
      </MetricCell>
    </div>
  );
}
