// ScenarioRadar — comparaison de scénarios (SVG radar chart)
import { useMemo } from 'react';
import { SCENARIOS } from '../../engine/data/scenarios';
import { solveSteady } from '../../engine/solver/steady';
import { useBuildingStore } from '../../store/buildingStore';
import type { BuildingConfig } from '../../engine/types';

const AXES = ['U wall', 'U window', 'Q design', 'EP/m²', 'CO₂/m²'];
const N = AXES.length;
const CX = 110, CY = 100, R = 75;

function angleForAxis(i: number) {
  return (i / N) * Math.PI * 2 - Math.PI / 2;
}
function point(i: number, r: number) {
  const a = angleForAxis(i);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as [number, number];
}

export function ScenarioRadar() {
  const { config } = useBuildingStore();

  // On ne calcule pas les scenarios complexes ici (pas de données climatiques)
  // On affiche juste des indicateurs qualitatifs des scénarios
  const scenarioData = useMemo(() => {
    return Object.values(SCENARIOS).map((s) => ({
      name: s.name,
      // Scores normatifs 0-1 (estimés d'après scenarios.ts)
      values: [
        s.id === 'passoire' ? 0.05 : s.id === 'reno_basique' ? 0.3 : s.id === 'reno_perf' ? 0.6 : s.id === 'passif' ? 0.9 : 0.4,
        s.id === 'passoire' ? 0.1 : s.id === 'reno_basique' ? 0.35 : s.id === 'reno_perf' ? 0.65 : s.id === 'passif' ? 0.92 : 0.45,
        s.id === 'passoire' ? 0.1 : s.id === 'reno_basique' ? 0.3 : s.id === 'reno_perf' ? 0.65 : s.id === 'passif' ? 0.9 : 0.3,
        s.id === 'passoire' ? 0.05 : s.id === 'reno_basique' ? 0.25 : s.id === 'reno_perf' ? 0.6 : s.id === 'passif' ? 0.9 : 0.35,
        s.id === 'passoire' ? 0.05 : s.id === 'reno_basique' ? 0.25 : s.id === 'reno_perf' ? 0.6 : s.id === 'passif' ? 0.9 : 0.55,
      ],
    }));
  }, []);

  const COLORS = ['#C8C5BE', '#A0A0A0', '#6B6B6B', '#2B2B2B', '#0A0A0A'];

  return (
    <div className="space-y-1">
      <p className="text-xs font-sans text-ink-3 uppercase tracking-wider">Comparaison scénarios</p>
      <svg viewBox={`0 0 280 200`} className="w-full border border-rule bg-paper" role="img">
        {/* Cercles de fond */}
        {[0.25, 0.5, 0.75, 1].map((r, ri) => (
          <polygon key={ri}
            points={AXES.map((_, i) => point(i, R * r).join(',')).join(' ')}
            fill="none" stroke="#E2DFD8" strokeWidth={0.5}
          />
        ))}

        {/* Axes */}
        {AXES.map((ax, i) => {
          const [x, y] = point(i, R);
          const [lx, ly] = point(i, R + 12);
          return (
            <g key={i}>
              <line x1={CX} y1={CY} x2={x} y2={y} stroke="#C8C5BE" strokeWidth={0.5} />
              <text x={lx} y={ly + 4} textAnchor="middle" fontSize={6.5} fontFamily="IBM Plex Mono" fill="#6B6B6B">{ax}</text>
            </g>
          );
        })}

        {/* Polygones scénarios */}
        {scenarioData.map((sc, si) => (
          <polygon key={si}
            points={sc.values.map((v, i) => point(i, R * v).join(',')).join(' ')}
            fill="none"
            stroke={COLORS[si]}
            strokeWidth={1}
            strokeDasharray={si === 0 ? '4 2' : undefined}
          />
        ))}

        {/* Légende */}
        {scenarioData.map((sc, si) => (
          <g key={si}>
            <line x1={160} y1={15 + si * 13} x2={172} y2={15 + si * 13} stroke={COLORS[si]} strokeWidth={1} />
            <text x={175} y={19 + si * 13} fontSize={6.5} fontFamily="IBM Plex Mono" fill={COLORS[si]}>{sc.name}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
