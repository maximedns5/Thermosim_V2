// TimeSeries24h — profil de température sur 24h (jour moyen)
import { useMemo } from 'react';
import { useSimulationStore } from '../../store/simulationStore';

const W = 360, H = 130, PAD = { top: 14, right: 10, bottom: 26, left: 38 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

function scaleY(v: number, min: number, max: number) {
  return PAD.top + IH - ((v - min) / (max - min)) * IH;
}

function niceTicks(min: number, max: number): number[] {
  const step = Math.pow(10, Math.floor(Math.log10(max - min))) * (max - min < 15 ? 2 : 5);
  const lo = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= max + 0.01; v += step) ticks.push(Math.round(v * 10) / 10);
  return ticks.slice(0, 6);
}

export function TimeSeries24h() {
  const { annualResult } = useSimulationStore();

  const { tempLine, pmvLine } = useMemo(() => {
    if (!annualResult?.T_zone) return { tempLine: '', pmvLine: '', tMin: 15, tMax: 25 };
    const T = annualResult.T_zone;
    const PMV = annualResult.pmv;

    // Moyenne par heure sur l'année
    const tAvg = Array.from({ length: 24 }, (_, h) => {
      let s = 0; for (let d = 0; d < 365; d++) s += T[d * 24 + h];
      return s / 365;
    });
    const pmvAvg = Array.from({ length: 24 }, (_, h) => {
      let s = 0; for (let d = 0; d < 365; d++) s += PMV[d * 24 + h];
      return s / 365;
    });

    const tMin = Math.min(...tAvg), tMax = Math.max(...tAvg);
    const pmvMin = -3, pmvMax = 3;

    const tp = tAvg.map((v, i) => {
      const x = PAD.left + (i / 23) * IW;
      const y = scaleY(v, tMin - 0.5, tMax + 0.5);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const pp = pmvAvg.map((v, i) => {
      const x = PAD.left + (i / 23) * IW;
      const y = scaleY(v, pmvMin, pmvMax);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return { tempLine: tp, pmvLine: pp, tMin, tMax };
  }, [annualResult]);

  const axisData = useMemo(() => {
    if (!annualResult?.T_zone) return { tMin: 15, tMax: 25 };
    const T = annualResult.T_zone;
    const tAvg = Array.from({ length: 24 }, (_, h) => { let s = 0; for (let d = 0; d < 365; d++) s += T[d * 24 + h]; return s / 365; });
    return { tMin: Math.min(...tAvg), tMax: Math.max(...tAvg) };
  }, [annualResult]);

  if (!annualResult) {
    return <div className="text-xs font-mono text-ink-4 h-20 flex items-center">Simulation required</div>;
  }

  const { tMin: axisTmin, tMax: axisTmax } = axisData;
  const yTicks = niceTicks(axisTmin - 0.5, axisTmax + 0.5);

  return (
    <div className="space-y-1">
      <p className="text-xs font-sans text-ink-3 uppercase tracking-wider">Average 24h profile — T zone &amp; PMV</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-rule bg-paper" role="img" aria-label="Profil 24h">
        {/* Axe Y */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + IH} stroke="#C8C5BE" strokeWidth={1} />
        <text x={2} y={PAD.top - 2} fontSize={8} fontFamily="IBM Plex Mono" fill="#6B6B6B" fontStyle="italic">°C</text>
        {yTicks.map((v) => {
          const y = scaleY(v, axisTmin - 0.5, axisTmax + 0.5);
          return (
            <g key={v}>
              <line x1={PAD.left - 3} y1={y} x2={PAD.left} y2={y} stroke="#C8C5BE" strokeWidth={0.8} />
              <line x1={PAD.left} y1={y} x2={PAD.left + IW} y2={y} stroke="#C8C5BE" strokeWidth={0.3} strokeDasharray="2 4" />
              <text x={PAD.left - 4} y={y + 3} textAnchor="end" fontSize={7} fontFamily="IBM Plex Mono" fill="#A0A0A0">{v}</text>
            </g>
          );
        })}
        {/* Axe X */}
        <line x1={PAD.left} y1={PAD.top + IH} x2={PAD.left + IW} y2={PAD.top + IH} stroke="#C8C5BE" strokeWidth={1} />
        {[0, 6, 12, 18, 23].map((h) => (
          <text key={h} x={PAD.left + (h / 23) * IW} y={H - 8} textAnchor="middle"
            fontSize={8} fontFamily="IBM Plex Mono" fill="#A0A0A0">{h}h</text>
        ))}

        {/* Zone confort PMV */}
        <rect x={PAD.left} y={scaleY(0.5, -3, 3)} width={IW} height={scaleY(-0.5, -3, 3) - scaleY(0.5, -3, 3)}
          fill="#E2DFD8" opacity={0.6} />

        {/* Courbe T_zone */}
        <path d={tempLine} fill="none" stroke="#2B2B2B" strokeWidth={1.5} />
        {/* Courbe PMV */}
        <path d={pmvLine} fill="none" stroke="#6B6B6B" strokeWidth={1} strokeDasharray="4 2" />

        {/* Légende */}
        <line x1={PAD.left + IW - 88} y1={PAD.top + 8} x2={PAD.left + IW - 73} y2={PAD.top + 8} stroke="#2B2B2B" strokeWidth={1.5} />
        <text x={PAD.left + IW - 70} y={PAD.top + 11} fontSize={7} fontFamily="IBM Plex Mono" fill="#2B2B2B">T zone (°C)</text>
        <line x1={PAD.left + IW - 88} y1={PAD.top + 19} x2={PAD.left + IW - 73} y2={PAD.top + 19} stroke="#6B6B6B" strokeWidth={1} strokeDasharray="3 2" />
        <text x={PAD.left + IW - 70} y={PAD.top + 22} fontSize={7} fontFamily="IBM Plex Mono" fill="#6B6B6B">PMV [-3…+3]</text>
      </svg>
    </div>
  );
}
