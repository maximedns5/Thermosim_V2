// GlaserDiagram — diagramme de condensation (méthode Glaser)
import { useMemo } from 'react';
import { glaser } from '../../engine/physics/humidity';
import { MATERIALS_DB } from '../../engine/data/materials';
import { useBuildingStore } from '../../store/buildingStore';

const W = 360, H = 130, PAD = { top: 14, right: 50, bottom: 26, left: 44 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

export function GlaserDiagram() {
  const { config } = useBuildingStore();

  const layers = useMemo(() => {
    return config.wallLayers
      .map((l) => {
        const m = MATERIALS_DB[l.material];
        if (!m) return null;
        return { name: m.name, thickness: l.thickness, lambda: m.lambda, mu: m.mu };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
  }, [config.wallLayers]);

  const result = useMemo(() => {
    if (layers.length === 0) return null;
    try {
      return glaser(layers, 20, config.climate?.design?.T_ext_min ?? -10, 50, 80);
    } catch { return null; }
  }, [layers, config.climate?.design?.T_ext_min]);

  if (!result || result.length === 0) return null;

  // Construire les tableaux de points à partir des interfaces de couches
  // result[i].T_in = température interface i, result[last].T_out = interface finale
  const temperatures = [result[0].T_in, ...result.map((l) => l.T_out)];
  const psat_values  = [result[0].psat_in, ...result.map((l) => l.psat_out)];
  const pv_values    = [result[0].pv_in, ...result.map((l) => l.pv_out)];
  const condensation_risk = result.some((l) => l.condensation);

  const N = temperatures.length;
  const positions = temperatures.map((_, i) => PAD.left + (i / (N - 1)) * IW);
  const psatMax = Math.max(...psat_values, 1);

  const tPath = temperatures.map((t, i) => {
    const y = PAD.top + IH - ((t + 10) / 35) * IH;
    return `${i === 0 ? 'M' : 'L'}${positions[i].toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const psatPath = psat_values.map((p, i) => {
    const y = PAD.top + IH - (p / psatMax) * IH;
    return `${i === 0 ? 'M' : 'L'}${positions[i].toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const pvPath = pv_values.map((p, i) => {
    const y = PAD.top + IH - (p / psatMax) * IH;
    return `${i === 0 ? 'M' : 'L'}${positions[i].toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-sans text-ink-3 uppercase tracking-wider">Diagramme de Glaser</p>
        {condensation_risk && (
          <span className="text-xs font-mono text-accent">Risque condensation</span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-rule bg-paper" role="img">
        {/* Axe Y gauche — pression en Pa */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + IH} stroke="#C8C5BE" strokeWidth={1} />
        <text x={2} y={PAD.top - 2} fontSize={7} fontFamily="IBM Plex Mono" fill="#6B6B6B" fontStyle="italic">Pa</text>
        {[0, 0.25, 0.5, 0.75, 1.0].map((f) => {
          const v = Math.round(f * psatMax);
          const y = PAD.top + IH - f * IH;
          return (
            <g key={f}>
              <line x1={PAD.left - 3} y1={y} x2={PAD.left} y2={y} stroke="#C8C5BE" strokeWidth={0.8} />
              <line x1={PAD.left} y1={y} x2={PAD.left + IW} y2={y} stroke="#C8C5BE" strokeWidth={0.3} strokeDasharray="2 4" />
              <text x={PAD.left - 4} y={y + 3} textAnchor="end" fontSize={6} fontFamily="IBM Plex Mono" fill="#A0A0A0">{v}</text>
            </g>
          );
        })}
        {/* Axe Y droit — température °C */}
        <line x1={PAD.left + IW} y1={PAD.top} x2={PAD.left + IW} y2={PAD.top + IH} stroke="#C8C5BE" strokeWidth={0.8} />
        <text x={W - 2} y={PAD.top - 2} textAnchor="end" fontSize={7} fontFamily="IBM Plex Mono" fill="#6B6B6B" fontStyle="italic">°C</text>
        {[-10, 0, 10, 20].map((t) => {
          const y = PAD.top + IH - ((t + 10) / 35) * IH;
          return (
            <g key={t}>
              <line x1={PAD.left + IW} y1={y} x2={PAD.left + IW + 3} y2={y} stroke="#C8C5BE" strokeWidth={0.8} />
              <text x={PAD.left + IW + 4} y={y + 3} fontSize={6} fontFamily="IBM Plex Mono" fill="#A0A0A0">{t}</text>
            </g>
          );
        })}
        {/* Axe X */}
        <line x1={PAD.left} y1={PAD.top + IH} x2={PAD.left + IW} y2={PAD.top + IH} stroke="#C8C5BE" />
        <text x={PAD.left + IW / 2} y={H - 8} textAnchor="middle" fontSize={7} fontFamily="IBM Plex Mono" fill="#6B6B6B" fontStyle="italic">Wall Ext→Int</text>
        {/* Courbes */}
        <path d={psatPath} fill="none" stroke="#2B2B2B" strokeWidth={1.5} />
        <path d={pvPath} fill="none" stroke="#6B6B6B" strokeWidth={1} strokeDasharray="4 2" />
        <path d={tPath} fill="none" stroke="#A0A0A0" strokeWidth={1} />
        {/* Légende */}
        <line x1={PAD.left + 4} y1={PAD.top + 8} x2={PAD.left + 16} y2={PAD.top + 8} stroke="#2B2B2B" strokeWidth={1.5} />
        <text x={PAD.left + 19} y={PAD.top + 11} fontSize={7} fontFamily="IBM Plex Mono" fill="#2B2B2B">psat (Pa)</text>
        <line x1={PAD.left + 4} y1={PAD.top + 19} x2={PAD.left + 16} y2={PAD.top + 19} stroke="#6B6B6B" strokeWidth={1} strokeDasharray="3 2" />
        <text x={PAD.left + 19} y={PAD.top + 22} fontSize={7} fontFamily="IBM Plex Mono" fill="#6B6B6B">pv (Pa)</text>
        <line x1={PAD.left + 4} y1={PAD.top + 30} x2={PAD.left + 16} y2={PAD.top + 30} stroke="#A0A0A0" strokeWidth={1} />
        <text x={PAD.left + 19} y={PAD.top + 33} fontSize={7} fontFamily="IBM Plex Mono" fill="#A0A0A0">T (°C)</text>
      </svg>
    </div>
  );
}
