// Modèle bâtiment 3D — assemblage murs/planchers/fenêtres/toiture
import { useMemo } from 'react';
import { Wall3D } from './Wall3D';
import { Floor3D } from './Floor3D';
import { Window3D } from './Window3D';
import { Roof3D } from './Roof3D';
import { DimensionLine3D } from './DimensionLine3D';
import { useBuildingStore } from '../../store/buildingStore';
import { useUIStore } from '../../store/uiStore';
import { Wall as WallModel } from '../../engine/models/wall';

// Génère les positions centrées de fenêtres le long d'un mur
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

export function BuildingModel() {
  const { config } = useBuildingStore();
  const { showDimensions } = useUIStore();
  const { geometry, windows, roof, wallLayers } = config;

  const { length: W, width: D, floorHeight: FH, nFloors: NF } = geometry;
  const wallThick = new WallModel(wallLayers, 1).thickness();
  const totalH = FH * NF;

  // Positions murs: centre = 0
  const walls = useMemo(() => [
    // Façade Sud (z = -D/2)
    { width: W + wallThick * 2, height: totalH, thickness: wallThick, position: [0, totalH / 2, -D / 2] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    // Façade Nord (z = +D/2)
    { width: W + wallThick * 2, height: totalH, thickness: wallThick, position: [0, totalH / 2,  D / 2] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    // Pignon Est (x = +W/2)
    { width: D, height: totalH, thickness: wallThick, position: [ W / 2, totalH / 2, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
    // Pignon Ouest (x = -W/2)
    { width: D, height: totalH, thickness: wallThick, position: [-W / 2, totalH / 2, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
  ], [W, D, totalH, wallThick]);

  // Fenêtres sur toutes les façades
  const winH = Math.min(FH * 0.55, 1.8);
  const WIN_W = 1.4;

  // Sud (façade principale, z = -D/2 outer face)
  const southWins = useMemo(() => calcWinPositions(windows.ratioSouth ?? 0.4, W, WIN_W, NF, FH), [W, FH, NF, windows.ratioSouth]);
  // Nord (z = +D/2 outer face)
  const northWins = useMemo(() => calcWinPositions(windows.ratioNorth ?? 0.15, W, WIN_W, NF, FH), [W, FH, NF, windows.ratioNorth]);
  // Est (x = +W/2 outer face, u le long de D)
  const eastWins = useMemo(() => calcWinPositions(windows.ratioEast ?? 0.15, D, WIN_W, NF, FH), [D, FH, NF, windows.ratioEast]);
  // Ouest (x = -W/2 outer face, u le long de D)
  const westWins = useMemo(() => calcWinPositions(windows.ratioWest ?? 0.15, D, WIN_W, NF, FH), [D, FH, NF, windows.ratioWest]);

  // Planchers
  const floors = useMemo(() =>
    Array.from({ length: NF + 1 }, (_, i) => ({ y: i * FH })),
    [NF, FH],
  );

  return (
    <group>
      {/* Murs */}
      {walls.map((wall, i) => (
        <Wall3D key={i} {...wall} pattern={1} showEdges />
      ))}

      {/* Planchers */}
      {floors.map((f, i) => (
        <Floor3D key={i} width={W} depth={D} y={f.y} thickness={0.22} />
      ))}

      {/* Fenêtres Sud — rotation 0 (face vers -Z) */}
      {southWins.map((sw, i) => (
        <Window3D key={`s${i}`}
          width={WIN_W} height={winH}
          position={[sw.u, sw.y, -D / 2 - wallThick / 2]}
        />
      ))}

      {/* Fenêtres Nord — rotation π sur Y (face vers +Z) */}
      {northWins.map((nw, i) => (
        <Window3D key={`n${i}`}
          width={WIN_W} height={winH}
          position={[nw.u, nw.y, D / 2 + wallThick / 2]}
          rotation={[0, Math.PI, 0]}
        />
      ))}

      {/* Fenêtres Est — rotation -π/2 sur Y (face vers +X), u le long de Z */}
      {eastWins.map((ew, i) => (
        <Window3D key={`e${i}`}
          width={WIN_W} height={winH}
          position={[W / 2 + wallThick / 2, ew.y, ew.u]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      ))}

      {/* Fenêtres Ouest — rotation +π/2 sur Y (face vers -X), u le long de Z */}
      {westWins.map((ww, i) => (
        <Window3D key={`w${i}`}
          width={WIN_W} height={winH}
          position={[-W / 2 - wallThick / 2, ww.y, ww.u]}
          rotation={[0, Math.PI / 2, 0]}
        />
      ))}

      {/* Toiture */}
      <Roof3D width={W} depth={D} y={totalH} type={roof.type} />

      {/* Cotes */}
      {showDimensions && (
        <>
          <DimensionLine3D
            start={[-W / 2, -0.5, -D / 2 - 2]}
            end={[W / 2, -0.5, -D / 2 - 2]}
            label={`${W.toFixed(1)} m`}
            axis="x"
          />
          <DimensionLine3D
            start={[W / 2 + 2, -0.5, -D / 2]}
            end={[W / 2 + 2, -0.5,  D / 2]}
            label={`${D.toFixed(1)} m`}
            axis="z"
          />
          <DimensionLine3D
            start={[-W / 2 - 2, 0, 0]}
            end={[-W / 2 - 2, totalH, 0]}
            label={`${totalH.toFixed(1)} m`}
            axis="y"
          />
        </>
      )}
    </group>
  );
}
