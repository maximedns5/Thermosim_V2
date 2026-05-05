// Cartouche 3D — bloc titre affiché dans la scène Three.js
// Positionné en bas à droite du sol, plan horizontal
import React from 'react';
import { Text, Line } from '@react-three/drei';
import { useUIStore } from '../../store/uiStore';
import { useBuildingStore } from '../../store/buildingStore';

export function Cartouche3D() {
  const activeView = useUIStore((s) => s.activeView);
  const config = useBuildingStore((s) => s.config);

  if (activeView !== '3d') return null;

  const W = config.geometry.width;
  const L = config.geometry.length;
  // Positionner à l'extérieur du coin SE du bâtiment, sur le sol (y = 0.01)
  const cx = W / 2 + 1.5;
  const cz = L / 2 + 1.5;
  const y = 0.01;

  // Boîte cartouche : 4×2 m
  const bW = 4;
  const bH = 2;
  const points: [number, number, number][] = [
    [cx,       y, cz],
    [cx + bW,  y, cz],
    [cx + bW,  y, cz + bH],
    [cx,       y, cz + bH],
    [cx,       y, cz],
  ];
  // Ligne de séparation interne (titre / info)
  const sepPoints: [number, number, number][] = [
    [cx,      y, cz + 0.65],
    [cx + bW, y, cz + 0.65],
  ];

  const date = new Date().toISOString().slice(0, 10);

  return (
    <group>
      {/* Bordure */}
      <Line points={points} color="#C8C5BE" lineWidth={1} />
      <Line points={sepPoints} color="#C8C5BE" lineWidth={0.5} />

      {/* Titre projet */}
      <Text
        position={[cx + bW / 2, y, cz + 0.9]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.22}
        color="#0A0A0A"
        anchorX="center"
        anchorY="middle"
      >
        THERMOSIM
      </Text>

      {/* Info ligne 1 */}
      <Text
        position={[cx + 0.15, y, cz + 0.48]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.13}
        color="#6B6B6B"
        anchorX="left"
        anchorY="middle"
      >
        {`${L.toFixed(1)}m × ${W.toFixed(1)}m — ${config.geometry.nFloors} niv.`}
      </Text>

      {/* Date */}
      <Text
        position={[cx + bW - 0.15, y, cz + 0.48]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.13}
        color="#6B6B6B"
        anchorX="right"
        anchorY="middle"
      >
        {date}
      </Text>

      {/* Info ligne 2 */}
      <Text
        position={[cx + 0.15, y, cz + 0.28]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.11}
        color="#A0A0A0"
        anchorX="left"
        anchorY="middle"
      >
        Simulation thermique — ThermoSim Web V2
      </Text>

      {/* Folio */}
      <Text
        position={[cx + bW - 0.15, y, cz + 0.28]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.11}
        color="#A0A0A0"
        anchorX="right"
        anchorY="middle"
      >
        Folio 1/1
      </Text>
    </group>
  );
}
