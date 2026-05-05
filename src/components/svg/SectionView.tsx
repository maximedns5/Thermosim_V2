// Coupe verticale — dessin technique SVG
import { useMemo } from 'react';
import { useBuildingStore } from '../../store/buildingStore';
import { useUIStore } from '../../store/uiStore';
import {
  HatchInsulation, HatchConcrete, HatchConcreteReinforced, HatchFoam,
  HatchPlaster, HatchRender, HatchGlass, HatchBrick, HatchWood, HATCH_BY_MATERIAL,
} from './patterns';
import { DimensionLine, LeaderLine, NumberedCallout, ScaleBar, Cartouche, SvgArrowDefs } from './overlays';
import { MATERIALS_DB } from '../../engine/data/materials';

const SCALE = 60; // px/m — coupe plus détaillée
const MARGIN = 70;

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

export function SectionView() {
  const config = useBuildingStore((s) => s.config);
  const { showDimensions } = useUIStore();
  const { geometry, wallLayers, roof, windows } = config;

  const wallThickness = wallLayers.reduce((s, l) => s + l.thickness, 0);
  const height = geometry.nFloors * geometry.floorHeight;
  const totalW = (geometry.length + wallThickness * 2) * SCALE;
  const totalH = height * SCALE;
  // Adapte la taille des annotations à la hauteur du bâtiment (lisibles quelle que soit l'échelle)
  const annotSize = Math.max(9, Math.round(totalH / 12));
  const svgW = totalW + MARGIN * 2 + 20;
  const svgH = totalH + MARGIN * 2 + annotSize * 4 + 20;

  const allHatches = useMemo(() => {
    const seen = new Set<string>();
    const sources = [...wallLayers];
    if (roof.insulation) sources.push(roof.insulation);
    return sources
      .map((l) => ({ layer: l, hatch: HATCH_BY_MATERIAL[l.material] ?? 'concrete' }))
      .filter(({ hatch }) => {
        if (seen.has(hatch)) return false;
        seen.add(hatch);
        return true;
      });
  }, [wallLayers, roof]);

  // Épaisseur toiture
  const roofThick = Math.max((roof.insulation?.thickness ?? 0.2) + 0.10, 0.30) * SCALE;

  return (
    <div className="flex w-full h-full overflow-auto bg-paper">
      {/* ─── Coupe SVG scrollable ─── */}
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
        {allHatches.map(({ hatch }) => {
          const Component = HATCH_COMPONENTS[hatch];
          return Component ? <Component key={hatch} id={`sc-hatch-${hatch}`} /> : null;
        })}
        <pattern id="sc-hatch-insulation-roof" x="0" y="0" width="16" height="8" patternUnits="userSpaceOnUse">
          <polyline points="0,4 2,1 4,4 6,1 8,4 10,1 12,4 14,1 16,4" fill="none" stroke="var(--color-ink-3)" strokeWidth="0.6" />
          <polyline points="0,7 2,4 4,7 6,4 8,7 10,4 12,7 14,4 16,7" fill="none" stroke="var(--color-ink-3)" strokeWidth="0.6" />
        </pattern>
      </defs>

      <text x={MARGIN} y={24} fontSize="11" fontWeight="700" fill="var(--color-ink)" fontFamily="var(--font-sans)">
        VERTICAL SECTION A-A
      </text>
      <line x1={MARGIN} y1={28} x2={MARGIN + totalW} y2={28} stroke="var(--color-ink)" strokeWidth="0.8" />

      {/* TOITURE */}
      <rect x={MARGIN} y={MARGIN - roofThick} width={totalW} height={roofThick}
        fill={`url(#sc-hatch-insulation-roof)`}
        stroke="var(--color-ink)" strokeWidth="1.0" />

      {/* ESPACE INTÉRIEUR */}
      <rect x={MARGIN + wallThickness * SCALE} y={MARGIN} width={geometry.length * SCALE} height={totalH}
        fill="var(--color-surface)" stroke="none" />

      {/* PAROIS (gauche + droite) */}
      {[0, geometry.length * SCALE + wallThickness * SCALE].map((xOff, side) => {
        let x = MARGIN + xOff;
        const items: React.ReactNode[] = [];
        const layers = side === 0 ? wallLayers : [...wallLayers].reverse();
        layers.forEach((layer, i) => {
          const lW = layer.thickness * SCALE;
          const hatch = HATCH_BY_MATERIAL[layer.material] ?? 'concrete';
          items.push(
            <rect key={i} x={x} y={MARGIN} width={lW} height={totalH}
              fill={`url(#sc-hatch-${hatch})`}
              stroke="var(--color-ink)" strokeWidth="0.6" />
          );
          x += lW;
        });
        return items;
      })}

      {/* PLANCHER */}
      <rect x={MARGIN} y={MARGIN + totalH} width={totalW} height={6}
        fill={`url(#sc-hatch-concrete-reinforced)`}
        stroke="var(--color-ink)" strokeWidth="0.8" />

      {/* Sol */}
      <rect x={MARGIN - 10} y={MARGIN + totalH + 6} width={totalW + 20} height={4} fill="var(--color-ink)" />
      {Array.from({ length: Math.floor((totalW + 20) / 8) }).map((_, i) => (
        <line key={i} x1={MARGIN - 10 + i * 8} y1={MARGIN + totalH + 10} x2={MARGIN - 10 + i * 8 - 8} y2={MARGIN + totalH + 18} stroke="var(--color-ink-4)" strokeWidth="0.5" />
      ))}

      {/* Fenêtre coupe */}
      {(() => {
        const winH = 1.4 * SCALE;
        const winW = 0.12 * SCALE;
        const wy = MARGIN + (totalH - winH) / 2;
        const wx = MARGIN + wallThickness * SCALE - winW / 2;
        return (
          <g>
            <rect x={wx} y={wy} width={winW} height={winH}
              fill={`url(#sc-hatch-glass)`}
              stroke="var(--color-ink)" strokeWidth="0.8" />
          </g>
        );
      })()}

      {/* Cotes */}
      {showDimensions && (
        <>
          <DimensionLine
            x1={MARGIN + wallThickness * SCALE} y1={MARGIN}
            x2={MARGIN + wallThickness * SCALE + geometry.length * SCALE} y2={MARGIN}
            label={`${geometry.length.toFixed(1)} m`}
            offset={22}
          />
          <DimensionLine
            x1={MARGIN} y1={MARGIN}
            x2={MARGIN} y2={MARGIN + totalH}
            label={`${height.toFixed(2)} m`}
            offset={22}
            horizontal={false}
          />
        </>
      )}

      {/* Numéros de couche — taille adaptative */}
      {wallLayers.map((layer, i) => {
        let x = MARGIN;
        for (let j = 0; j < i; j++) x += wallLayers[j].thickness * SCALE;
        x += layer.thickness * SCALE / 2;
        const r = annotSize * 0.9;
        return (
          <g key={i}>
            <line x1={x} y1={MARGIN + totalH + 6} x2={x} y2={MARGIN + totalH + annotSize * 0.6} stroke="var(--color-ink-3)" strokeWidth={0.6} />
            <circle cx={x} cy={MARGIN + totalH + annotSize * 0.6 + r} r={r}
              fill="var(--color-surface)" stroke="var(--color-ink-2)" strokeWidth={0.8} />
            <text x={x} y={MARGIN + totalH + annotSize * 0.6 + r + r * 0.38}
              textAnchor="middle" fontSize={annotSize * 0.9}
              fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontWeight="600">{i + 1}</text>
          </g>
        );
      })}

      <ScaleBar x={MARGIN} y={svgH - 14} pixelsPerMeter={SCALE} maxMeters={4} />
    </svg>
    </div>

    {/* ─── Panneau droit fixe ─── */}
    <div className="w-72 shrink-0 border-l border-rule flex flex-col overflow-y-auto bg-paper-alt" style={{ fontFamily: 'var(--font-mono)' }}>

      {/* Infos bâtiment */}
      <div className="px-3 pt-3 pb-2 border-b border-rule space-y-1">
        <p className="text-2xs font-sans font-semibold uppercase tracking-wider text-ink">Geometry</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs font-mono">
          <span className="text-ink-4">Length</span>  <span className="text-ink">{geometry.length.toFixed(1)} m</span>
          <span className="text-ink-4">Width</span>   <span className="text-ink">{geometry.width.toFixed(1)} m</span>
          <span className="text-ink-4">Total height</span><span className="text-ink">{height.toFixed(2)} m</span>
          <span className="text-ink-4">Floors</span>   <span className="text-ink">{geometry.nFloors} × {geometry.floorHeight.toFixed(2)} m</span>
          <span className="text-ink-4">Wall thick.</span><span className="text-ink">{(wallThickness * 100).toFixed(0)} cm</span>
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
        {wallLayers.map((layer, i) => {
          const mat = MATERIALS_DB[layer.material];
          return mat?.lambda ? (
            <div key={`l${i}`} className="pl-6 text-2xs font-mono text-ink-4 leading-tight">
              λ = {mat.lambda} W/(m·K)
            </div>
          ) : null;
        })}
      </div>

      {/* Toiture */}
      <div className="px-3 py-2 border-b border-rule space-y-1">
        <p className="text-2xs font-sans font-semibold uppercase tracking-wider text-ink">Roof</p>
        <div className="text-xs font-mono text-ink-3">
          {roof.type === 'flat_concrete' ? 'Concrete flat roof' : roof.type}
        </div>
        {roof.insulation && (
          <div className="text-xs font-mono text-ink-3">
            Insulation: {MATERIALS_DB[roof.insulation.material]?.name ?? roof.insulation.material} — {(roof.insulation.thickness * 100).toFixed(0)} cm
          </div>
        )}
      </div>

      {/* Cartouche */}
      <div className="px-3 py-2 mt-auto border-t border-rule space-y-0.5">
        <p className="text-sm font-mono font-bold text-ink leading-tight">ThermoSim — Section</p>
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
