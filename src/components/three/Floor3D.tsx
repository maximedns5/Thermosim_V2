// Floor3D — dalle béton physique, cliquable pour géométrie
import { useState, useMemo } from 'react';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';

const SLAB_COLOR     = new THREE.Color('#B0ACA4');
const HOVER_EMISSIVE = new THREE.Color('#4A7FA8');
const SEL_EMISSIVE   = new THREE.Color('#1A3550');

export function Floor3D({ width, depth, y, thickness = 0.25 }: {
  width: number; depth: number; y: number; thickness?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const { selectedMesh, setSelectedMesh, setHoveredMesh } = useUIStore();
  const selected = selectedMesh === 'floor';

  const geo     = useMemo(() => new THREE.BoxGeometry(width, thickness, depth), [width, thickness, depth]);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  const emissive    = selected ? SEL_EMISSIVE : hovered ? HOVER_EMISSIVE : new THREE.Color(0x000000);
  const emissiveInt = selected ? 0.3 : hovered ? 0.15 : 0;

  const handlers = {
    onPointerOver: (e: any) => { e.stopPropagation(); setHovered(true); setHoveredMesh('floor'); document.body.style.cursor = 'pointer'; },
    onPointerOut:  () => { setHovered(false); setHoveredMesh(null); document.body.style.cursor = 'auto'; },
    onClick:       (e: any) => { e.stopPropagation(); setSelectedMesh(selected ? null : 'floor'); },
  };

  return (
    <group position={[0, y, 0]}>
      <mesh geometry={geo} castShadow receiveShadow {...handlers}>
        <meshPhysicalMaterial
          color={SLAB_COLOR}
          roughness={0.75}
          metalness={0.03}
          emissive={emissive}
          emissiveIntensity={emissiveInt}
          envMapIntensity={0.4}
        />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={selected ? '#4A7FA8' : '#1E1C1A'} transparent opacity={selected ? 0.8 : 0.3} />
      </lineSegments>
    </group>
  );
}
