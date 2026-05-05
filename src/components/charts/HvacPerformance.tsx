// HvacPerformance — COP / EER en fonction de la température
import { useMemo } from 'react';
import { HeatPump } from '../../engine/models/heatPump';
import { useBuildingStore } from '../../store/buildingStore';
import { HEATING_SYSTEMS } from '../../engine/data/hvac';

const W = 360, H = 130, PAD = { top: 14, right: 10, bottom: 26, left: 38 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

export function HvacPerformance() {
  const { config } = useBuildingStore();
  const heatSys = HEATING_SYSTEMS[config.hvac.heatingId];

  const copPath = useMemo(() => {
    if (!heatSys?.COP_nominal) return '';
    const pac = new HeatPump(
      heatSys.COP_nominal,
      heatSys.T_source_nominale ?? 7,
      heatSys.T_depart_nominale ?? 35,
      heatSys.T_bivalence ?? -7,
      heatSys.inverter ?? true,
    );
    const temps = Array.from({ length: 25 }, (_, i) => -10 + i * 2);
    const cops = temps.map((t) => pac.copAtConditions(t, heatSys.T_depart_nominale ?? 45));

    const copMax = Math.max(...cops);
    return temps.map((_, i) => {
      const x = PAD.left + (i / (temps.length - 1)) * IW;
      const y = PAD.top + IH - (cops[i] / (copMax + 0.5)) * IH;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [heatSys]);

  const copMax = useMemo(() => {
    if (!heatSys?.COP_nominal) return 5;
    const pac = new HeatPump(
      heatSys.COP_nominal,
      heatSys.T_source_nominale ?? 7,
      heatSys.T_depart_nominale ?? 35,
      heatSys.T_bivalence ?? -7,
      heatSys.inverter ?? true,
    );
    const temps = Array.from({ length: 25 }, (_, i) => -10 + i * 2);
    return Math.max(...temps.map((t) => pac.copAtConditions(t, heatSys.T_depart_nominale ?? 45)));
  }, [heatSys]);

  if (!heatSys?.COP_nominal) {
    return (
      <div className="text-xs font-mono text-ink-4 h-20 flex items-center">
        Système à combustion — pas de courbe COP
      </div>
    );
  }

  const labelTemps = [-10, -5, 0, 5, 10, 15, 20];
  const copTicks = Array.from({ length: Math.ceil(copMax) + 1 }, (_, i) => i).filter((v) => v >= 1);

  return (
    <div className="space-y-1">
      <p className="text-xs font-sans text-ink-3 uppercase tracking-wider">Performance PAC — COP(T_source)</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-rule bg-paper" role="img">
        {/* Axe Y */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + IH} stroke="#C8C5BE" strokeWidth={1} />
        <text x={2} y={PAD.top - 2} fontSize={7} fontFamily="IBM Plex Mono" fill="#6B6B6B" fontStyle="italic">COP</text>
        {copTicks.map((v) => {
          const y = PAD.top + IH - (v / (copMax + 0.5)) * IH;
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
        <text x={PAD.left + IW / 2} y={H - 4} textAnchor="middle" fontSize={7} fontFamily="IBM Plex Mono" fill="#6B6B6B" fontStyle="italic">T source (°C)</text>
        {labelTemps.map((t, i) => {
          const x = PAD.left + ((t + 10) / 48) * IW;
          return (
            <text key={i} x={x} y={H - 12} textAnchor="middle"
              fontSize={7} fontFamily="IBM Plex Mono" fill="#A0A0A0">{t}°C</text>
          );
        })}
        {/* Courbe COP */}
        <path d={copPath} fill="none" stroke="#2B2B2B" strokeWidth={1.5} />
        <text x={PAD.left + 4} y={PAD.top + 11} fontSize={7} fontFamily="IBM Plex Mono" fill="#2B2B2B">
          COP nominal = {heatSys.COP_nominal}
        </text>
      </svg>
    </div>
  );
}
