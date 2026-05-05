// Vue Façade Sud — dessin technique SVG
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

export function FacadeView() {
  const config = useBuildingStore((s) => s.config);
  const { showDimensions } = useUIStore();

  const { geometry, wallLayers, windows } = config;
  const height = geometry.nFloors * geometry.floorHeight;
  const W = geometry.length * SCALE;   // largeur de la façade sud = longueur du bâtiment
  const H = height * SCALE;
  const FH_px = geometry.floorHeight * SCALE;
  const NF = geometry.nFloors;
  const wallThickness = wallLayers.reduce((s, l) => s + l.thickness, 0);

  // Panneau droit — détail composition paroi (viewBox fixe 260×210)
  const DETAIL_H = 80;
  // Cible 240px de large pour le mur complet dans le panneau de 260px
  const DETAIL_SCALE = Math.min(800, 240 / Math.max(wallThickness, 0.05));
  const detailTotalW = wallThickness * DETAIL_SCALE;

  const svgW = W + MARGIN * 2;
  const svgH = H + MARGIN * 2 + 28;  // titre + façade + barre échelle

  // Nombre et dimensions des fenêtres — cohérent avec BuildingModel 3D
  const WIN_W_M = 1.4;
  const WIN_H_M = Math.min(geometry.floorHeight * 0.55, 1.8);
  const nWin = Math.max(1, Math.round(geometry.length * windows.ratioSouth / WIN_W_M));
  const winW = WIN_W_M * SCALE;
  const winH = WIN_H_M * SCALE;

  const allHatches = useMemo(() => {
    const seen = new Set<string>();
    return wallLayers
      .map((l) => ({ layer: l, hatch: HATCH_BY_MATERIAL[l.material] ?? 'concrete' }))
      .filter(({ hatch }) => {
        if (seen.has(hatch)) return false;
        seen.add(hatch);
        return true;
      });
  }, [wallLayers]);

  return (
    <div className="flex w-full h-full overflow-auto bg-paper">
      {/* ─── Façade SVG ─── */}
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
          return Component ? <Component key={hatch} id={`hatch-${hatch}`} /> : null;
        })}
      </defs>

      {/* Titre */}
      <text x={MARGIN} y={24} fontSize="11" fontWeight="700" fill="var(--color-ink)" fontFamily="var(--font-sans)">
        FAÇADE SUD
      </text>
      <line x1={MARGIN} y1={28} x2={MARGIN + W} y2={28} stroke="var(--color-ink)" strokeWidth="0.8" />

      {/* Sol */}
      <rect x={MARGIN - 10} y={MARGIN + H} width={W + 20} height={4} fill="var(--color-ink)" />
      {/* Hachures sol */}
      {Array.from({ length: Math.floor((W + 20) / 8) }).map((_, i) => (
        <line key={i} x1={MARGIN - 10 + i * 8} y1={MARGIN + H + 4} x2={MARGIN - 10 + i * 8 - 8} y2={MARGIN + H + 12} stroke="var(--color-ink-4)" strokeWidth="0.5" />
      ))}

      {/* Façade principale */}
      <rect x={MARGIN} y={MARGIN} width={W} height={H}
        fill="var(--color-paper-alt)"
        stroke="var(--color-ink)"
        strokeWidth="1.2" />

      {/* Séparations inter-étages */}
      {Array.from({ length: NF - 1 }).map((_, f) => {
        const fy = MARGIN + (NF - 1 - f) * FH_px;
        return (
          <line key={f} x1={MARGIN} y1={fy} x2={MARGIN + W} y2={fy}
            stroke="var(--color-ink-3)" strokeWidth="0.5" strokeDasharray="5 3" />
        );
      })}

      {/* Fenêtres façade sud — tous les étages */}
      {Array.from({ length: NF }).map((_, f) =>
        Array.from({ length: nWin }).map((_, i) => {
          const spacing = W / (nWin + 1);
          const wx = MARGIN + spacing * (i + 1) - winW / 2;
          // f=0 = rez-de-chaussée (bas du SVG), NF-1 = dernier étage (haut)
          const wy = MARGIN + (NF - 1 - f) * FH_px + (FH_px - winH) / 2;
          return (
            <g key={`${f}-${i}`}>
              <rect x={wx} y={wy} width={winW} height={winH}
                fill="url(#hatch-glass)"
                stroke="var(--color-ink)"
                strokeWidth="0.8" />
              <line x1={wx + winW / 2} y1={wy} x2={wx + winW / 2} y2={wy + winH} stroke="var(--color-ink-3)" strokeWidth="0.4" />
              <line x1={wx} y1={wy + winH / 2} x2={wx + winW} y2={wy + winH / 2} stroke="var(--color-ink-3)" strokeWidth="0.4" />
            </g>
          );
        })
      )}

      {/* Cotes */}
      {showDimensions && (
        <>
          <DimensionLine
            x1={MARGIN} y1={MARGIN}
            x2={MARGIN + W} y2={MARGIN}
            label={`${geometry.width.toFixed(1)} m`}
            offset={22}
          />
          <DimensionLine
            x1={MARGIN} y1={MARGIN}
            x2={MARGIN} y2={MARGIN + H}
            label={`${height.toFixed(2)} m`}
            offset={22}
            horizontal={false}
          />
        </>
      )}

      {/* Rose des vents */}
      <NorthRose x={svgW - 28} y={42} size={16} />

      {/* Échelle */}
      <ScaleBar x={MARGIN} y={svgH - 12} pixelsPerMeter={SCALE} maxMeters={5} />
    </svg>
    </div>

      {/* ─── Panneau droit fixe — détail paroi + cartouche ─── */}
      <div
        className="w-72 shrink-0 border-l border-rule flex flex-col overflow-y-auto bg-paper-alt"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {/* Détail composition paroi — SVG viewport fixe */}
        <div className="p-3 border-b border-rule">
          <p className="text-2xs font-sans font-semibold uppercase tracking-wider text-ink mb-2">
            Détail composition paroi
          </p>
          <svg
            viewBox="0 0 260 210"
            className="w-full"
            style={{ background: 'var(--color-paper)' }}
          >
            <SvgArrowDefs />
            <defs>
              {allHatches.map(({ hatch }) => {
                const Component = HATCH_COMPONENTS[hatch];
                return Component ? <Component key={hatch} id={`dp-hatch-${hatch}`} /> : null;
              })}
            </defs>
            {/* Titre et ligne */}
            <text x={10} y={14} fontSize="8" fontWeight="700" fill="var(--color-ink)"
              fontFamily="var(--font-sans)">
              {(wallThickness * 100).toFixed(0)} cm — EXT → INT
            </text>
            <line x1={10} y1={17} x2={250} y2={17} stroke="var(--color-ink)" strokeWidth="0.6" />
            {/* EXT / INT */}
            <text x={8} y={68} textAnchor="end" fontSize="7" fill="var(--color-ink-3)"
              fontFamily="var(--font-mono)">EXT</text>
            <text x={10 + detailTotalW + 4} y={68} fontSize="7" fill="var(--color-ink-3)"
              fontFamily="var(--font-mono)">INT</text>
            {/* Couches */}
            {(() => {
              const detailY = 22;
              const nodes: React.ReactNode[] = [];
              let cx = 10;
              wallLayers.forEach((layer, i) => {
                const lW = layer.thickness * DETAIL_SCALE;
                const hatch = HATCH_BY_MATERIAL[layer.material] ?? 'concrete';
                const mat = MATERIALS_DB[layer.material];
                const midX = cx + lW / 2;
                nodes.push(
                  <rect key={`r${i}`} x={cx} y={detailY} width={lW} height={DETAIL_H}
                    fill={`url(#dp-hatch-${hatch})`}
                    stroke="var(--color-ink)" strokeWidth="0.8" />
                );
                // Numéro bulle
                nodes.push(
                  <circle key={`c${i}`} cx={midX} cy={detailY + DETAIL_H / 2} r={8}
                    fill="var(--color-surface)" stroke="var(--color-ink-2)" strokeWidth="0.7" />
                );
                nodes.push(
                  <text key={`n${i}`} x={midX} y={detailY + DETAIL_H / 2 + 3.5}
                    textAnchor="middle" fontSize="9" fontWeight="600"
                    fill="var(--color-ink-2)" fontFamily="var(--font-mono)">{i + 1}</text>
                );
                // Cotes dim : traits de renvoi + double flèche
                const labelY = detailY + DETAIL_H + 6;
                nodes.push(<line key={`la${i}`} x1={cx} y1={detailY + DETAIL_H} x2={cx} y2={labelY + 14} stroke="var(--color-ink-3)" strokeWidth="0.5" />);
                nodes.push(<line key={`lb${i}`} x1={cx + lW} y1={detailY + DETAIL_H} x2={cx + lW} y2={labelY + 14} stroke="var(--color-ink-3)" strokeWidth="0.5" />);
                nodes.push(<line key={`arr${i}`} x1={cx + 1} y1={labelY + 10} x2={cx + lW - 1} y2={labelY + 10}
                  stroke="var(--color-ink-3)" strokeWidth="0.5"
                  markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />);
                nodes.push(
                  <text key={`tc${i}`} x={midX} y={labelY + 22} textAnchor="middle"
                    fontSize="8" fontWeight="600" fill="var(--color-ink)" fontFamily="var(--font-mono)">
                    {(layer.thickness * 100).toFixed(0)} cm
                  </text>
                );
                // Nom matériau (abrégé si trop long)
                const name = mat?.name ?? layer.material;
                const fs = Math.max(5, Math.min(7.5, lW / name.length * 1.4));
                nodes.push(
                  <text key={`tn${i}`} x={midX} y={labelY + 32} textAnchor="middle"
                    fontSize={fs} fill="var(--color-ink-3)" fontFamily="var(--font-mono)">
                    {name}
                  </text>
                );
                if (mat?.lambda) {
                  nodes.push(
                    <text key={`tl${i}`} x={midX} y={labelY + 42} textAnchor="middle"
                      fontSize="5.5" fill="var(--color-ink-4)" fontFamily="var(--font-mono)">
                      λ {mat.lambda}
                    </text>
                  );
                }
                cx += lW;
              });
              return nodes;
            })()}
          </svg>
        </div>

        {/* Légende numérotée */}
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

        {/* Cartouche */}
        <div className="px-3 py-2 mt-auto border-t border-rule space-y-0.5">
          <p className="text-sm font-mono font-bold text-ink leading-tight">ThermoSim — Façade</p>
          <p className="text-xs font-mono text-ink-3">
            {geometry.length.toFixed(0)}×{geometry.width.toFixed(0)} m &bull; {geometry.nFloors} niv. × {geometry.floorHeight.toFixed(2)} m
          </p>
          <div className="flex justify-between pt-1 border-t border-rule mt-1">
            <span className="text-2xs font-mono text-ink-4">Éch. 1:50</span>
            <span className="text-2xs font-mono text-ink-4">{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
