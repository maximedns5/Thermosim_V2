// TimeSeriesAnnual — T_zone et énergie hebdomadaire
import { useMemo } from 'react';
import { useSimulationStore } from '../../store/simulationStore';

const W = 360, H = 130, PAD = { top: 14, right: 10, bottom: 26, left: 38 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

export function TimeSeriesAnnual() {
  const { annualResult } = useSimulationStore();

  const { tempPath, heatPath, tMin = 10, tMax = 25 } = useMemo(() => {
    if (!annualResult?.T_zone) return { tempPath: '', heatPath: '', tMin: 10, tMax: 25, qMax: 0 };
    const T = annualResult.T_zone;
    const Q = annualResult.Q_heat;

    // Sous-échantillonnage : 1 point / 72h
    const step = 72;
    const n = Math.floor(8760 / step);
    const temps: number[] = [], heats: number[] = [];
    for (let i = 0; i < n; i++) {
      let t = 0, q = 0;
      for (let j = 0; j < step; j++) { t += T[i * step + j]; q += Q[i * step + j]; }
      temps.push(t / step);
      heats.push(q / step);
    }

    const tMin = Math.min(...temps), tMax = Math.max(...temps);
    const qMax = Math.max(...heats);

    const tp = temps.map((v, i) => {
      const x = PAD.left + (i / (n - 1)) * IW;
      const y = PAD.top + IH - ((v - tMin) / (tMax - tMin + 0.1)) * IH;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const hp = heats.map((v, i) => {
      const x = PAD.left + (i / (n - 1)) * IW;
      const y = PAD.top + IH - (v / (qMax + 0.1)) * IH;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return { tempPath: tp, heatPath: hp, tMin, tMax, qMax };
  }, [annualResult]);

  if (!annualResult) {
    return <div className="text-xs font-mono text-ink-4 h-20 flex items-center">Simulation required</div>;
  }

  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const tPad = Math.max((tMax - tMin) * 0.05, 0.5);
  function syT(v: number) { return PAD.top + IH - ((v - (tMin - tPad)) / (tMax - tMin + 2 * tPad)) * IH; }
  const step = Math.ceil((tMax - tMin) / 4 / 5) * 5 || 5;
  const tLo = Math.floor(tMin / step) * step;
  const yTicks: number[] = [];
  for (let v = tLo; v <= tMax + tPad; v += step) yTicks.push(v);

  return (
    <div className="space-y-1">
      <p className="text-xs font-sans text-ink-3 uppercase tracking-wider">Température zone &amp; chauffage — année</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-rule bg-paper" role="img">
        {/* Axe Y */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + IH} stroke="#C8C5BE" strokeWidth={1} />
        <text x={2} y={PAD.top - 2} fontSize={8} fontFamily="IBM Plex Mono" fill="#6B6B6B" fontStyle="italic">°C</text>
        {yTicks.map((v) => {
          const y = syT(v);
          if (y < PAD.top - 2 || y > PAD.top + IH + 2) return null;
          return (
            <g key={v}>
              <line x1={PAD.left - 3} y1={y} x2={PAD.left} y2={y} stroke="#C8C5BE" strokeWidth={0.8} />
              <line x1={PAD.left} y1={y} x2={PAD.left + IW} y2={y} stroke="#C8C5BE" strokeWidth={0.3} strokeDasharray="2 4" />
              <text x={PAD.left - 4} y={y + 3} textAnchor="end" fontSize={7} fontFamily="IBM Plex Mono" fill="#A0A0A0">{v}</text>
            </g>
          );
        })}
        {/* Axe X */}
        <line x1={PAD.left} y1={PAD.top + IH} x2={PAD.left + IW} y2={PAD.top + IH} stroke="#C8C5BE" />
        {months.map((m, i) => (
          <text key={i} x={PAD.left + (i / 11) * IW} y={H - 8}
            textAnchor="middle" fontSize={7} fontFamily="IBM Plex Mono" fill="#A0A0A0">{m}</text>
        ))}
        {/* Q chauffage (fond) */}
        <path d={heatPath} fill="none" stroke="#C8C5BE" strokeWidth={1} strokeDasharray="3 2" />
        {/* T zone */}
        <path d={tempPath} fill="none" stroke="#2B2B2B" strokeWidth={1.5} />
        {/* Légende */}
        <line x1={PAD.left + 4} y1={PAD.top + 8} x2={PAD.left + 18} y2={PAD.top + 8} stroke="#2B2B2B" strokeWidth={1.5} />
        <text x={PAD.left + 21} y={PAD.top + 11} fontSize={7} fontFamily="IBM Plex Mono" fill="#2B2B2B">T zone (°C)</text>
        <line x1={PAD.left + 4} y1={PAD.top + 19} x2={PAD.left + 18} y2={PAD.top + 19} stroke="#C8C5BE" strokeWidth={1} strokeDasharray="3 2" />
        <text x={PAD.left + 21} y={PAD.top + 22} fontSize={7} fontFamily="IBM Plex Mono" fill="#A0A0A0">Q heating</text>
      </svg>
    </div>
  );
}
