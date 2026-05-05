// Toiture 3D — terrasse plate ou toit incliné
import { useMemo } from 'react';
import * as THREE from 'three';
import { BlueprintMaterial } from './BlueprintMaterial';

interface Roof3DProps {
  width: number;
  depth: number;
  y: number;
  type?: string;
  thickness?: number;
}

export function Roof3D({ width, depth, y, type = 'flat_concrete', thickness = 0.35 }: Roof3DProps) {
  const isInclined = type === 'inclined_tiles';

  const flatGeo = useMemo(
    () => new THREE.BoxGeometry(width + 0.3, thickness, depth + 0.3),
    [width, depth, thickness],
  );

  const ridgeGeo = useMemo(() => {
    if (!isInclined) return null;
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2 - 0.15, 0);
    shape.lineTo(0, depth * 0.4);
    shape.lineTo(width / 2 + 0.15, 0);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: depth + 0.3, bevelEnabled: false });
  }, [width, depth, isInclined]);

  const geo = isInclined && ridgeGeo ? ridgeGeo : flatGeo;
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  const position: [number, number, number] = isInclined
    ? [0, y, -depth / 2 - 0.15]
    : [0, y + thickness / 2, 0];

  return (
    <group position={position}>
      <mesh geometry={geo}>
        <BlueprintMaterial pattern={isInclined ? 0 : 1} baseColor="#5C5852" lineColor="#1A1612" />
      </mesh>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#1A1612" />
      </lineSegments>
    </group>
  );
}
