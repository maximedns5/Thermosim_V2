// Mur 3D avec matériau blueprint
import { useMemo } from 'react';
import * as THREE from 'three';
import { BlueprintMaterial } from './BlueprintMaterial';

interface Wall3DProps {
  width: number;       // longueur du mur
  height: number;      // hauteur
  thickness: number;   // épaisseur réelle
  position: [number, number, number];
  rotation?: [number, number, number];
  pattern?: number;    // 0-6 hachure
  showEdges?: boolean;
  color?: string;      // couleur de base override
}

export function Wall3D({
  width, height, thickness, position, rotation = [0, 0, 0], pattern = 1, showEdges = true, color,
}: Wall3DProps) {
  const geo = useMemo(() => new THREE.BoxGeometry(width, height, thickness), [width, height, thickness]);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo}>
        <BlueprintMaterial pattern={pattern} baseColor={color} />
      </mesh>
      {showEdges && (
        <lineSegments geometry={edgesGeo}>
          <lineBasicMaterial color="#1E1A16" linewidth={1} />
        </lineSegments>
      )}
    </group>
  );
}
