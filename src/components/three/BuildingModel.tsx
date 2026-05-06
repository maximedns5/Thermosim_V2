// BuildingModel — assemblage 3D avec meshId pour sélection contextuelle
import { useMemo } from 'react';
import { Wall3D } from './Wall3D';
import { Floor3D } from './Floor3D';
import { Window3D } from './Window3D';
import { Roof3D } from './Roof3D';
import { DimensionLine3D } from './DimensionLine3D';
import { useBuildingStore } from '../../store/buildingStore';
import { useUIStore } from '../../store/uiStore';
import { Wall as WallModel } from '../../engine/models/wall';

function calcWinPositions(ratio: number, wallLen: number, WIN_W: number, NF: number, FH: number) {
  if (ratio < 0.01) return [] as { u: number; y: number }[];
  const n = Math.max(1, Math.round(wallLen * ratio / WIN_W));
  const spacing = wallLen / (n + 1);
  const positions: { u: number; y: number }[] = [];
  for (let f = 0; f < NF; f++) {
    const yCenter = f * FH + FH * 0.55;
    for (let i = 0; i < n; i++) {
      positions.push({ u: -wallLen / 2 + spacing * (i + 1), y: yCenter });
    }
  }
  return positions;
}

// Clic sur le vide du canvas → désélectionne
function DeselectOnBackground() {
  const { setSelectedMesh } = useUIStore();
  return (
    <mesh
      position={[0, -0.5, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={() => setSelectedMesh(null)}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export function BuildingModel() {
  const { config } = useBuildingStore();
  const { showDimensions } = useUIStore();
  const { geometry, windows, roof, wallLayers } = config;

  const { length: W, width: D, floorHeight: FH, nFloors: NF } = geometry;
  const wallThick = new WallModel(wallLayers, 1).thickness();
  const totalH = FH * NF;

  const walls = useMemo(() => [
    { id: 'wall' as const, width: W + wallThick * 2, height: totalH, thickness: wallThick, position: [0, totalH / 2, -D / 2] as [number,number,number], rotation: [0, 0, 0] as [number,number,number] },
    { id: 'wall' as const, width: W + wallThick * 2, height: totalH, thickness: wallThick, position: [0, totalH / 2,  D / 2] as [number,number,number], rotation: [0, 0, 0] as [number,number,number] },
    { id: 'wall' as const, width: D, height: totalH, thickness: wallThick, position: [ W / 2, totalH / 2, 0] as [number,number,number], rotation: [0, Math.PI / 2, 0] as [number,number,number] },
    { id: 'wall' as const, width: D, height: totalH, thickness: wallThick, position: [-W / 2, totalH / 2, 0] as [number,number,number], rotation: [0, Math.PI / 2, 0] as [number,number,number] },
  ], [W, D, totalH, wallThick]);

  const winH = Math.min(FH * 0.55, 1.8);
  const WIN_W = 1.4;

  const southWins = useMemo(() => calcWinPositions(windows.ratioSouth ?? 0.4, W, WIN_W, NF, FH), [W, FH, NF, windows.ratioSouth]);
  const northWins = useMemo(() => calcWinPositions(windows.ratioNorth ?? 0.15, W, WIN_W, NF, FH), [W, FH, NF, windows.ratioNorth]);
  const eastWins  = useMemo(() => calcWinPositions(windows.ratioEast  ?? 0.15, D, WIN_W, NF, FH), [D, FH, NF, windows.ratioEast]);
  const westWins  = useMemo(() => calcWinPositions(windows.ratioWest  ?? 0.15, D, WIN_W, NF, FH), [D, FH, NF, windows.ratioWest]);

  const floors = useMemo(
    () => Array.from({ length: NF + 1 }, (_, i) => ({ y: i * FH })),
    [NF, FH],
  );

  return (
    <group>
      <DeselectOnBackground />

      {/* Murs — tous avec meshId='wall' */}
      {walls.map((wall, i) => (
        <Wall3D key={i} {...wall} meshId={wall.id} showEdges />
      ))}

      {/* Planchers */}
      {floors.map((f, i) => (
        <Floor3D key={i} width={W} depth={D} y={f.y} thickness={0.22} />
      ))}

      {/* Fenêtres Sud */}
      {southWins.map((sw, i) => (
        <Window3D key={`s${i}`} width={WIN_W} height={winH}
          position={[sw.u, sw.y, -D / 2 - wallThick / 2]}
          meshId="window_south" />
      ))}

      {/* Fenêtres Nord */}
      {northWins.map((nw, i) => (
        <Window3D key={`n${i}`} width={WIN_W} height={winH}
          position={[nw.u, nw.y, D / 2 + wallThick / 2]}
          rotation={[0, Math.PI, 0]}
          meshId="window_north" />
      ))}

      {/* Fenêtres Est */}
      {eastWins.map((ew, i) => (
        <Window3D key={`e${i}`} width={WIN_W} height={winH}
          position={[W / 2 + wallThick / 2, ew.y, ew.u]}
          rotation={[0, -Math.PI / 2, 0]}
          meshId="window_east" />
      ))}

      {/* Fenêtres Ouest */}
      {westWins.map((ww, i) => (
        <Window3D key={`w${i}`} width={WIN_W} height={winH}
          position={[-W / 2 - wallThick / 2, ww.y, ww.u]}
          rotation={[0, Math.PI / 2, 0]}
          meshId="window_west" />
      ))}

      {/* Toiture */}
      <Roof3D width={W} depth={D} y={totalH} type={roof.type} />

      {/* Cotes */}
      {showDimensions && (
        <>
          <DimensionLine3D
            start={[-W / 2, -0.5, -D / 2 - 2]} end={[W / 2, -0.5, -D / 2 - 2]}
            label={`${W.toFixed(1)} m`} axis="x"
          />
          <DimensionLine3D
            start={[W / 2 + 2, -0.5, -D / 2]} end={[W / 2 + 2, -0.5, D / 2]}
            label={`${D.toFixed(1)} m`} axis="z"
          />
          <DimensionLine3D
            start={[-W / 2 - 2, 0, 0]} end={[-W / 2 - 2, totalH, 0]}
            label={`${totalH.toFixed(1)} m`} axis="y"
          />
        </>
      )}
    </group>
  );
}
