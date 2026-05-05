// Fenêtre 3D (cadre + vitrage)
import { useMemo } from 'react';
import * as THREE from 'three';
import { BlueprintMaterial } from './BlueprintMaterial';

interface Window3DProps {
  width: number;
  height: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  frameThickness?: number;
}

export function Window3D({
  width, height, position, rotation = [0, 0, 0], frameThickness = 0.07,
}: Window3DProps) {
  // Cadre (4 rectangles)
  const frames = useMemo(() => {
    const ft = frameThickness;
    return [
      { w: width, h: ft, x: 0, y: -height / 2 + ft / 2 },       // bas
      { w: width, h: ft, x: 0, y:  height / 2 - ft / 2 },       // haut
      { w: ft, h: height - ft * 2, x: -width / 2 + ft / 2, y: 0 }, // gauche
      { w: ft, h: height - ft * 2, x:  width / 2 - ft / 2, y: 0 }, // droite
    ];
  }, [width, height, frameThickness]);

  const glassGeo = useMemo(
    () => new THREE.BoxGeometry(width - frameThickness * 2, height - frameThickness * 2, 0.01),
    [width, height, frameThickness],
  );

  return (
    <group position={position} rotation={rotation}>
      {/* Vitrage — légèrement en avant de la face du mur */}
      <mesh geometry={glassGeo} position={[0, 0, -0.02]}>
        <BlueprintMaterial pattern={5} baseColor="#8DBDD4" lineColor="#4A7F9E" opacity={0.55} />
      </mesh>

      {/* Cadres */}
      {frames.map((f, i) => {
        const geo = new THREE.BoxGeometry(f.w, f.h, 0.09);
        const edges = new THREE.EdgesGeometry(geo);
        return (
          <group key={i} position={[f.x, f.y, 0]}>
            <mesh geometry={geo}>
              <BlueprintMaterial pattern={0} baseColor="#E2DDD5" />
            </mesh>
            <lineSegments geometry={edges}>
              <lineBasicMaterial color="#0A0A0A" />
            </lineSegments>
          </group>
        );
      })}
    </group>
  );
}
