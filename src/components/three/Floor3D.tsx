// Plancher 3D
import { useMemo } from 'react';
import * as THREE from 'three';
import { BlueprintMaterial } from './BlueprintMaterial';

interface Floor3DProps {
  width: number;
  depth: number;
  y: number;
  thickness?: number;
  pattern?: number;
}

export function Floor3D({ width, depth, y, thickness = 0.25, pattern = 1 }: Floor3DProps) {
  const geo = useMemo(() => new THREE.BoxGeometry(width, thickness, depth), [width, thickness, depth]);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  return (
    <group position={[0, y, 0]}>
      <mesh geometry={geo}>
        <BlueprintMaterial pattern={pattern} baseColor="#8A8680" lineColor="#1E1A16" />
      </mesh>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#1E1A16" />
      </lineSegments>
    </group>
  );
}
