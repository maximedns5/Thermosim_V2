// Plan masse — dessin technique SVG
import { useBuildingStore } from '../../store/buildingStore';
import { useUIStore } from '../../store/uiStore';
import { MATERIALS_DB } from '../../engine/data/materials';
import {
  HatchConcreteReinforced, HatchInsulation, HatchFoam,
  HatchPlaster, HatchRender, HatchConcrete, HATCH_BY_MATERIAL,
} from './patterns';
import { DimensionLine, NorthRose, ScaleBar, SvgArrowDefs } from './overlays';

const SCALE = 50;
const MARGIN = 70;

export function PlanView() {
  const config = useBuildingStore((s) => s.config);
  const { showDimensions } = useUIStore();
  const { geometry, wallLayers } = config;

  const wallThick = wallLayers.reduce((s, l) => s + l.thickness, 0);
  const extW = (geometry.width  + wallThick * 2) * SCALE;
  const extL = (geometry.length + wallThick * 2) * SCALE;
  const svgW = extL + MARGIN * 2 + 20;
  const svgH = extW + MARGIN * 2 + 60;
  const wtpx = wallThick * SCALE;

  return (
    <div className="flex w-full h-full overflow-auto bg-paper">
      {/* ─── Plan SVG scrollable ─── */}
      <div className="flex-1 min-w-0 overflow-auto p-4">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full"
        style={{
          minWidth: Math.round(svgW * 0.5),
          background: 'var(--color-paper)',
          fontFamily: 'var(--font-mono)',
        }}
      >
      <SvgArrowDefs />
      <defs>
        <HatchConcreteReinforced id="plan-conc" />
        <HatchInsulation id="plan-insul" />
        <HatchFoam id="plan-foam" />
        <HatchPlaster id="plan-plast" />
        <HatchRender id="plan-render" />
        <HatchConcrete id="plan-concrete" />
      </defs>

      <text x={MARGIN} y={24} fontSize="11" fontWeight="700" fill="var(--color-ink)" fontFamily="var(--font-sans)">
        PLAN — NIVEAU 0
      </text>
      <line x1={MARGIN} y1={28} x2={MARGIN + extL} y2={28} stroke="var(--color-ink)" strokeWidth="0.8" />

      {/* Murs extérieurs */}
      <rect x={MARGIN} y={MARGIN} width={extL} height={extW}
        fill="url(#plan-conc)" stroke="var(--color-ink)" strokeWidth="1.2" />

      {/* Espace intérieur */}
      <rect
        x={MARGIN + wtpx} y={MARGIN + wtpx}
        width={geometry.length * SCALE} height={geometry.width * SCALE}
        fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="0.8" />

      {/* Coupure de coupe A-A */}
      <line x1={MARGIN - 12} y1={MARGIN + extW / 2} x2={MARGIN + extL + 12} y2={MARGIN + extW / 2}
        stroke="var(--color-ink)" strokeWidth="0.6" strokeDasharray="6 3" />
      <text x={MARGIN - 14} y={MARGIN + extW / 2 - 4} fontSize="9" fill="var(--color-ink-3)">A</text>
      <text x={MARGIN + extL + 6} y={MARGIN + extW / 2 - 4} fontSize="9" fill="var(--color-ink-3)">A</text>

      {/* Ouvertures simplifiées sur façade sud */}
      {(() => {
        const numWin = Math.max(1, Math.round(geometry.length * config.windows.ratioSouth / 1.4));
        const winW = 1.2 * SCALE;
        const spacing = geometry.length * SCALE / (numWin + 1);
        return Array.from({ length: numWin }).map((_, i) => {
          const wx = MARGIN + wtpx + spacing * (i + 1) - winW / 2;
          const wy = MARGIN + extW - wtpx;
          return (
            <g key={i}>
              <rect x={wx} y={wy} width={winW} height={wtpx} fill="var(--color-surface)" stroke="none" />
              <line x1={wx} y1={wy} x2={wx + winW} y2={wy} stroke="var(--color-ink)" strokeWidth="0.8" />
              <line x1={wx} y1={wy + wtpx} x2={wx + winW} y2={wy + wtpx} stroke="var(--color-ink)" strokeWidth="0.8" />
            </g>
          );
        });
      })()}

      {/* Cotes */}
      {showDimensions && (
        <>
          <DimensionLine
            x1={MARGIN} y1={MARGIN}
            x2={MARGIN + extL} y2={MARGIN}
            label={`${(geometry.length + wallThick * 2).toFixed(2)} m`}
            offset={22}
          />
          <DimensionLine
            x1={MARGIN} y1={MARGIN}
            x2={MARGIN} y2={MARGIN + extW}
            label={`${(geometry.width + wallThick * 2).toFixed(2)} m`}
            offset={26}
            horizontal={false}
          />
        </>
      )}

      {/* Paroi Nord — couches individuelles avec cotes */}
      {(() => {
        const layers: React.ReactNode[] = [];
        let cumX = 0;
        wallLayers.forEach((layer, i) => {
          const lW = layer.thickness * SCALE;
          const hatch = HATCH_BY_MATERIAL[layer.material] ?? 'concrete';
          layers.push(
            <rect key={`n${i}`}
              x={MARGIN + cumX} y={MARGIN}
              width={lW} height={wtpx}
              fill={`url(#plan-${hatch === 'concrete-reinforced' ? 'conc' : hatch})`}
              stroke="var(--color-ink)" strokeWidth="0.4" />
          );
          if (lW > 6) {
            layers.push(
              <text key={`nl${i}`}
                x={MARGIN + cumX + lW / 2}
                y={MARGIN - 4}
                textAnchor="middle"
                fontSize={Math.max(7, Math.min(10, lW * 0.55))}
                fill="var(--color-ink-3)"
                fontFamily="var(--font-mono)">
                {(layer.thickness * 100).toFixed(0)} cm
              </text>
            );
          }
          cumX += lW;
        });
        return layers;
      })()}

      <NorthRose x={svgW - 32} y={50} size={18} />
      <ScaleBar x={MARGIN} y={svgH - 14} pixelsPerMeter={SCALE} maxMeters={5} />
    </svg>
    </div>

    {/* ─── Panneau droit fixe ─── */}
    <div className="w-72 shrink-0 border-l border-rule flex flex-col overflow-y-auto bg-paper-alt" style={{ fontFamily: 'var(--font-mono)' }}>

      {/* Infos surface */}
      <div className="px-3 pt-3 pb-2 border-b border-rule space-y-1">
        <p className="text-2xs font-sans font-semibold uppercase tracking-wider text-ink">Areas</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs font-mono">
          <span className="text-ink-4">Length</span>    <span className="text-ink">{geometry.length.toFixed(1)} m</span>
          <span className="text-ink-4">Depth</span>  <span className="text-ink">{geometry.width.toFixed(1)} m</span>
          <span className="text-ink-4">Floors</span>     <span className="text-ink">{geometry.nFloors}</span>
          <span className="text-ink-4">Floor area / fl.</span><span className="text-ink">{(geometry.length * geometry.width).toFixed(1)} m²</span>
          <span className="text-ink-4">Total area</span>   <span className="text-ink font-bold">{(geometry.length * geometry.width * geometry.nFloors).toFixed(1)} m²</span>
          <span className="text-ink-4">Orientation</span><span className="text-ink">{geometry.orientation}°</span>
        </div>
      </div>

      {/* Vitrages */}
      <div className="px-3 py-2 border-b border-rule space-y-0.5">
        <p className="text-2xs font-sans font-semibold uppercase tracking-wider text-ink">Glazing ratio</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs font-mono">
          <span className="text-ink-4">South</span> <span className="text-ink">{Math.round(config.windows.ratioSouth * 100)} %</span>
          <span className="text-ink-4">North</span> <span className="text-ink">{Math.round(config.windows.ratioNorth * 100)} %</span>
          <span className="text-ink-4">East</span>  <span className="text-ink">{Math.round(config.windows.ratioEast * 100)} %</span>
          <span className="text-ink-4">West</span>  <span className="text-ink">{Math.round(config.windows.ratioWest * 100)} %</span>
        </div>
      </div>

      {/* Composition paroi */}
      <div className="px-3 py-2 border-b border-rule space-y-1">
        <p className="text-2xs font-sans font-semibold uppercase tracking-wider text-ink">Wall composition</p>
        {wallLayers.map((layer, i) => {
          const mat = MATERIALS_DB[layer.material];
          return (
            <div key={i} className="flex items-baseline gap-1.5 text-xs font-mono leading-tight">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-rule text-ink-2 font-semibold text-[10px] shrink-0">{i + 1}</span>
              <span className="text-ink font-medium truncate">{mat?.name ?? layer.material}</span>
              <span className="text-ink-3 ml-auto shrink-0">{(layer.thickness * 100).toFixed(0)} cm</span>
            </div>
          );
        })}
      </div>

      {/* Cartouche */}
      <div className="px-3 py-2 mt-auto border-t border-rule space-y-0.5">
        <p className="text-sm font-mono font-bold text-ink leading-tight">ThermoSim — Plan</p>
        <p className="text-xs font-mono text-ink-3">{geometry.length.toFixed(0)}×{geometry.width.toFixed(0)} m &bull; {geometry.nFloors} fl.</p>
        <div className="flex justify-between pt-1 border-t border-rule mt-1">
          <span className="text-2xs font-mono text-ink-4">Scale 1:50</span>
          <span className="text-2xs font-mono text-ink-4">{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
    </div>
  );
}
