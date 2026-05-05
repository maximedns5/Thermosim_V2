// ExplodedLayers — couches murales en vue éclatée animée
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BlueprintMaterial } from './BlueprintMaterial';
import { useBuildingStore } from '../../store/buildingStore';
import { useUIStore } from '../../store/uiStore';
import { MATERIALS_DB } from '../../engine/data/materials';

const PATTERN_MAP: Record<string, number> = {
  structure: 1, maconnerie: 2, isolant: 3, isolant_bio: 3,
  finition: 4, revêtement: 4, pare_vapeur: 0, verre: 5, metal: 6,
};

export function ExplodedLayers() {
  const { showExploded } = useUIStore();
  const { config } = useBuildingStore();
  const { wallLayers } = config;
  const groupRef = useRef<THREE.Group>(null!);

  // Animate explosion via spring
  const explodeRef = useRef(0);
  useFrame((_, dt) => {
    const target = showExploded ? 1 : 0;
    explodeRef.current += (target - explodeRef.current) * Math.min(dt * 5, 1);
    if (groupRef.current) {
      groupRef.current.visible = explodeRef.current > 0.01;
    }
  });

  const w = config.geometry.length;
  const h = config.geometry.floorHeight * config.geometry.nFloors;
  let offset = 0;

  return (
    <group ref={groupRef} position={[0, h / 2, 0]}>
      {wallLayers.map((layer, i) => {
        const mat = MATERIALS_DB[layer.material];
        const pattern = PATTERN_MAP[mat?.category ?? ''] ?? 0;
        const xOff = (i - wallLayers.length / 2) * 1.2;

        return (
          <group key={i}>
            <mesh
              position={[xOff * (showExploded ? 1 : 0), 0, -(config.geometry.width / 2)]}
            >
              <boxGeometry args={[layer.thickness, h, w]} />
              <BlueprintMaterial pattern={pattern} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
