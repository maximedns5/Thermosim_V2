// SankeyEnergy — diagramme de flux d'énergie SVG
import { useMemo } from 'react';
import { useSimulationStore } from '../../store/simulationStore';

const W = 320, H = 160;

export function SankeyEnergy() {
  const { steadyResult } = useSimulationStore();

  if (!steadyResult) {
    return <div className="text-xs font-mono text-ink-4 h-20 flex items-center">Simulation required</div>;
  }

  const { Q_walls_W, Q_windows_W, Q_roof_W, Q_floor_W, Q_ventilation_W } = steadyResult;
  const total = Q_walls_W + Q_windows_W + Q_roof_W + Q_floor_W + Q_ventilation_W;

  const flows = [
    { label: 'Walls',       value: Q_walls_W,       x: 200 },
    { label: 'Windows',     value: Q_windows_W,     x: 200 },
    { label: 'Roof',        value: Q_roof_W,         x: 200 },
    { label: 'Floor',       value: Q_floor_W,        x: 200 },
    { label: 'Ventilation', value: Q_ventilation_W,  x: 200 },
  ];

  let yOffset = 20;

  return (
    <div className="space-y-1">
      <p className="text-xs font-sans text-ink-3 uppercase tracking-wider">Heat loss flow — steady state</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-rule bg-paper" role="img">
        {/* Nœud source */}
        <rect x={50} y={H / 2 - 20} width={40} height={40} fill="#E2DFD8" stroke="#C8C5BE" />
        <text x={70} y={H / 2 + 5} textAnchor="middle" fontSize={8} fontFamily="IBM Plex Mono" fill="#0A0A0A">
          {Math.round(total)} W
        </text>

        {flows.map((f, i) => {
          const barH = Math.max(4, (f.value / total) * (H - 40));
          const y1 = yOffset;
          yOffset += barH + 4;
          const ratio = (f.value / total * 100).toFixed(1);

          return (
            <g key={i}>
              {/* Connexion */}
              <line x1={90} y1={H / 2} x2={180} y2={y1 + barH / 2} stroke="#C8C5BE" strokeWidth={Math.max(1, barH / 3)} />
              {/* Barre */}
              <rect x={180} y={y1} width={30} height={barH} fill="#E2DFD8" stroke="#6B6B6B" />
              {/* Label */}
              <text x={215} y={y1 + barH / 2 + 3} fontSize={7} fontFamily="IBM Plex Mono" fill="#2B2B2B">
                {f.label} {ratio} %
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
