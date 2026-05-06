// FacadeView — all 4 facades stacked vertically
import { useMemo } from 'react';
import { useBuildingStore } from '../../store/buildingStore';
import { useUIStore } from '../../store/uiStore';
import {
  HatchInsulation, HatchConcrete, HatchConcreteReinforced, HatchFoam,
  HatchPlaster, HatchRender, HatchGlass, HatchBrick, HatchWood, HATCH_BY_MATERIAL,
} from './patterns';
import { DimensionLine, NorthRose, ScaleBar, SvgArrowDefs } from './overlays';
import { MATERIALS_DB } from '../../engine/data/materials';

const SCALE = 40; // px / m
const MARGIN = 60;
const GAP_BETWEEN_FACADES = 64; // vertical gap between each facade block

const HATCH_COMPONENTS: Record<string, React.FC<{ id: string }>> = {
  concrete:              HatchConcrete,
  'concrete-reinforced': HatchConcreteReinforced,
  insulation:            HatchInsulation,
  foam:                  HatchFoam,
  plaster:               HatchPlaster,
  render:                HatchRender,
  glass:                 HatchGlass,
  brick:                 HatchBrick,
  wood:                  HatchWood,
};

interface FacadeConfig {
  name: string;
  widthM: number;       // facade width in metres
  windowRatio: number;
  offsetY: number;      // y offset in the combined SVG
}

interface DrawFacadeProps {
  fc: FacadeConfig;
  heightM: number;
  nFloors: number;
  floorHeightM: number;
  showDimensions: boolean;
  wallLayers: { material: string; thickness: number }[];
  hatchPrefix: string;
}

function DrawFacade({ fc, heightM, nFloors, floorHeightM, showDimensions, wallLayers, hatchPrefix }: DrawFacadeProps) {
  const W = fc.widthM * SCALE;
  const H = heightM * SCALE;
  const FH_px = floorHeightM * SCALE;

  const WIN_W_M = 1.4;
  const WIN_H_M = Math.min(floorHeightM * 0.55, 1.8);
  const nWin = Math.max(1, Math.round(fc.widthM * fc.windowRatio / WIN_W_M));
  const winW = WIN_W_M * SCALE;
  const winH = WIN_H_M * SCALE;

  const baseX = MARGIN;
  const baseY = fc.offsetY + MARGIN;

  return (
    <g>
      {/* Label */}
      <text x={baseX} y={fc.offsetY + 22} fontSize="11" fontWeight="700"
        fill="var(--color-ink)" fontFamily="var(--font-sans)">
        {fc.name.toUpperCase()}
      </text>
      <line x1={baseX} y1={fc.offsetY + 26} x2={baseX + W} y2={fc.offsetY + 26}
        stroke="var(--color-ink)" strokeWidth="0.8" />

      {/* Ground */}
      <rect x={baseX - 10} y={baseY + H} width={W + 20} height={4} fill="var(--color-ink)" />
      {Array.from({ length: Math.floor((W + 20) / 8) }).map((_, i) => (
        <line key={i}
          x1={baseX - 10 + i * 8} y1={baseY + H + 4}
          x2={baseX - 10 + i * 8 - 8} y2={baseY + H + 12}
          stroke="var(--color-ink-4)" strokeWidth="0.5" />
      ))}

      {/* Facade wall */}
      <rect x={baseX} y={baseY} width={W} height={H}
        fill="var(--color-paper-alt)"
        stroke="var(--color-ink)" strokeWidth="1.2" />

      {/* Floor lines */}
      {Array.from({ length: nFloors - 1 }).map((_, f) => {
        const fy = baseY + (nFloors - 1 - f) * FH_px;
        return (
          <line key={f} x1={baseX} y1={fy} x2={baseX + W} y2={fy}
            stroke="var(--color-ink-3)" strokeWidth="0.5" strokeDasharray="5 3" />
        );
      })}

      {/* Windows */}
      {Array.from({ length: nFloors }).map((_, f) =>
        Array.from({ length: nWin }).map((_, i) => {
          const spacing = W / (nWin + 1);
          const wx = baseX + spacing * (i + 1) - winW / 2;
          const wy = baseY + (nFloors - 1 - f) * FH_px + (FH_px - winH) / 2;
          return (
            <g key={`${f}-${i}`}>
              <rect x={wx} y={wy} width={winW} height={winH}
                fill={`url(#${hatchPrefix}glass)`}
                stroke="var(--color-ink)" strokeWidth="0.8" />
              <line x1={wx + winW / 2} y1={wy} x2={wx + winW / 2} y2={wy + winH}
                stroke="var(--color-ink-3)" strokeWidth="0.4" />
              <line x1={wx} y1={wy + winH / 2} x2={wx + winW} y2={wy + winH / 2}
                stroke="var(--color-ink-3)" strokeWidth="0.4" />
            </g>
          );
        })
      )}

      {/* Dimensions */}
      {showDimensions && (
        <>
          <DimensionLine
            x1={baseX} y1={baseY}
            x2={baseX + W} y2={baseY}
            label={`${fc.widthM.toFixed(1)} m`}
            offset={22}
          />
          <DimensionLine
            x1={baseX} y1={baseY}
            x2={baseX} y2={baseY + H}
            label={`${heightM.toFixed(2)} m`}
            offset={22}
            horizontal={false}
          />
        </>
      )}
    </g>
  );
}

export function FacadeView() {
  const config = useBuildingStore((s) => s.config);
  const { showDimensions } = useUIStore();
  const { geometry, wallLayers, windows } = config;

  const height = geometry.nFloors * geometry.floorHeight;
  const H_px = height * SCALE;
  const blockH = MARGIN + H_px + 28; // margin-top + facade + ground hatch space

  // 4 facades in order
  const facades: FacadeConfig[] = [
    { name: 'South Facade', widthM: geometry.length, windowRatio: windows.ratioSouth ?? 0.40, offsetY: 0 },
    { name: 'North Facade', widthM: geometry.length, windowRatio: windows.ratioNorth ?? 0.15, offsetY: blockH + GAP_BETWEEN_FACADES },
    { name: 'East Facade',  widthM: geometry.width,  windowRatio: windows.ratioEast  ?? 0.15, offsetY: (blockH + GAP_BETWEEN_FACADES) * 2 },
    { name: 'West Facade',  widthM: geometry.width,  windowRatio: windows.ratioWest  ?? 0.15, offsetY: (blockH + GAP_BETWEEN_FACADES) * 3 },
  ];

  const maxW = Math.max(geometry.length, geometry.width) * SCALE;
  const svgW = maxW + MARGIN * 2;
  const svgH = facades[3].offsetY + blockH + 20; // bottom of last facade + padding

  const allHatches = useMemo(() => {
    const seen = new Set<string>();
    return wallLayers
      .map((l) => ({ layer: l, hatch: HATCH_BY_MATERIAL[l.material] ?? 'concrete' }))
      .filter(({ hatch }) => { if (seen.has(hatch)) return false; seen.add(hatch); return true; });
  }, [wallLayers]);

  const wallThickness = wallLayers.reduce((s, l) => s + l.thickness, 0);
  const DETAIL_H = 80;
  const DETAIL_SCALE = Math.min(800, 240 / Math.max(wallThickness, 0.05));

  return (
    <div className="flex w-full h-full overflow-auto bg-paper">
      {/* ── All facades SVG ── */}
      <div className="flex-1 min-w-0 overflow-auto p-4">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full"
          style={{ minWidth: Math.round(svgW * 0.5), background: 'var(--color-paper)', fontFamily: 'var(--font-mono)' }}
        >
          <SvgArrowDefs />
          <defs>
            {allHatches.map(({ hatch }) => {
              const Component = HATCH_COMPONENTS[hatch];
              return Component ? <Component key={hatch} id={`hatch-${hatch}`} /> : null;
            })}
          </defs>

          {/* North rose — top right, fixed */}
          <NorthRose x={svgW - 28} y={42} size={16} />

          {/* Scale bar — after last facade */}
          <ScaleBar x={MARGIN} y={svgH - 12} pixelsPerMeter={SCALE} maxMeters={5} />

          {/* Draw all 4 facades */}
          {facades.map(fc => (
            <DrawFacade
              key={fc.name}
              fc={fc}
              heightM={height}
              nFloors={geometry.nFloors}
              floorHeightM={geometry.floorHeight}
              showDimensions={showDimensions}
              wallLayers={wallLayers}
              hatchPrefix="hatch-"
            />
          ))}
        </svg>
      </div>

      {/* ── Right panel — wall detail + legend + cartouche ── */}
      <div className="w-72 shrink-0 border-l border-rule flex flex-col overflow-y-auto bg-paper-alt"
        style={{ fontFamily: 'var(--font-mono)' }}>

        {/* Wall composition detail */}
        <div className="p-3 border-b border-rule">
          <p className="text-2xs font-sans font-semibold uppercase tracking-wider text-ink mb-2">
            Wall composition
          </p>
          <svg viewBox="0 0 260 210" className="w-full" style={{ background: 'var(--color-paper)' }}>
            <SvgArrowDefs />
            <defs>
              {allHatches.map(({ hatch }) => {
                const Component = HATCH_COMPONENTS[hatch];
                return Component ? <Component key={hatch} id={`dp-hatch-${hatch}`} /> : null;
              })}
            </defs>
            <text x={10} y={14} fontSize="8" fontWeight="700" fill="var(--color-ink)" fontFamily="var(--font-sans)">
              {(wallThickness * 100).toFixed(0)} cm — EXT → INT
            </text>
            <line x1={10} y1={17} x2={250} y2={17} stroke="var(--color-ink)" strokeWidth="0.6" />
            <text x={8} y={68} textAnchor="end" fontSize="7" fill="var(--color-ink-3)" fontFamily="var(--font-mono)">EXT</text>
            <text x={10 + wallThickness * DETAIL_SCALE + 4} y={68} fontSize="7" fill="var(--color-ink-3)" fontFamily="var(--font-mono)">INT</text>
            {(() => {
              const detailY = 22;
              const nodes: React.ReactNode[] = [];
              let cx = 10;
              wallLayers.forEach((layer, i) => {
                const lW = layer.thickness * DETAIL_SCALE;
                const hatch = HATCH_BY_MATERIAL[layer.material] ?? 'concrete';
                const mat = MATERIALS_DB[layer.material];
                const midX = cx + lW / 2;
                nodes.push(<rect key={`r${i}`} x={cx} y={detailY} width={lW} height={DETAIL_H} fill={`url(#dp-hatch-${hatch})`} stroke="var(--color-ink)" strokeWidth="0.8" />);
                nodes.push(<circle key={`c${i}`} cx={midX} cy={detailY + DETAIL_H / 2} r={8} fill="var(--color-surface)" stroke="var(--color-ink-2)" strokeWidth="0.7" />);
                nodes.push(<text key={`n${i}`} x={midX} y={detailY + DETAIL_H / 2 + 3.5} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--color-ink-2)" fontFamily="var(--font-mono)">{i + 1}</text>);
                const labelY = detailY + DETAIL_H + 6;
                nodes.push(<line key={`la${i}`} x1={cx} y1={detailY + DETAIL_H} x2={cx} y2={labelY + 14} stroke="var(--color-ink-3)" strokeWidth="0.5" />);
                nodes.push(<line key={`lb${i}`} x1={cx + lW} y1={detailY + DETAIL_H} x2={cx + lW} y2={labelY + 14} stroke="var(--color-ink-3)" strokeWidth="0.5" />);
                nodes.push(<line key={`arr${i}`} x1={cx + 1} y1={labelY + 10} x2={cx + lW - 1} y2={labelY + 10} stroke="var(--color-ink-3)" strokeWidth="0.5" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />);
                nodes.push(<text key={`tc${i}`} x={midX} y={labelY + 22} textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--color-ink)" fontFamily="var(--font-mono)">{(layer.thickness * 100).toFixed(0)} cm</text>);
                const name = mat?.name ?? layer.material;
                const fs = Math.max(5, Math.min(7.5, lW / name.length * 1.4));
                nodes.push(<text key={`tn${i}`} x={midX} y={labelY + 32} textAnchor="middle" fontSize={fs} fill="var(--color-ink-3)" fontFamily="var(--font-mono)">{name}</text>);
                if (mat?.lambda) nodes.push(<text key={`tl${i}`} x={midX} y={labelY + 42} textAnchor="middle" fontSize="5.5" fill="var(--color-ink-4)" fontFamily="var(--font-mono)">λ {mat.lambda}</text>);
                cx += lW;
              });
              return nodes;
            })()}
          </svg>
        </div>

        {/* Legend */}
        <div className="px-3 py-2 border-b border-rule space-y-1">
          {wallLayers.map((layer, i) => {
            const mat = MATERIALS_DB[layer.material];
            return (
              <div key={i} className="flex items-baseline gap-1.5 text-xs font-mono leading-tight">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-rule text-ink-2 font-semibold text-[10px] shrink-0">{i + 1}</span>
                <span className="text-ink font-medium">{mat?.name ?? layer.material}</span>
                <span className="text-ink-3 ml-auto shrink-0">{(layer.thickness * 100).toFixed(0)} cm</span>
              </div>
            );
          })}
        </div>

        {/* Window ratios summary */}
        <div className="px-3 py-2 border-b border-rule space-y-1">
          <p className="text-2xs font-sans font-semibold uppercase tracking-wider text-ink mb-1">Glazed ratios</p>
          {[
            { label: 'South', ratio: windows.ratioSouth ?? 0.40 },
            { label: 'North', ratio: windows.ratioNorth ?? 0.15 },
            { label: 'East',  ratio: windows.ratioEast  ?? 0.15 },
            { label: 'West',  ratio: windows.ratioWest  ?? 0.15 },
          ].map(({ label, ratio }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-2xs font-mono text-ink-3 w-10">{label}</span>
              <div className="flex-1 h-1 bg-rule-soft rounded-sm overflow-hidden">
                <div className="h-full bg-ink-3 rounded-sm" style={{ width: `${ratio * 100}%` }} />
              </div>
              <span className="text-2xs font-mono text-ink">{Math.round(ratio * 100)}%</span>
            </div>
          ))}
        </div>

        {/* Cartouche */}
        <div className="px-3 py-2 mt-auto border-t border-rule space-y-0.5">
          <p className="text-sm font-mono font-bold text-ink leading-tight">ThermoSim — Facades</p>
          <p className="text-xs font-mono text-ink-3">
            {geometry.length.toFixed(0)}×{geometry.width.toFixed(0)} m · {geometry.nFloors} fl. × {geometry.floorHeight.toFixed(2)} m
          </p>
          <div className="flex justify-between pt-1 border-t border-rule mt-1">
            <span className="text-2xs font-mono text-ink-4">Scale 1:50</span>
            <span className="text-2xs font-mono text-ink-4">{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
