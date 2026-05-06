// Roof3D — matériaux physiques selon type, cliquable
import { useState, useMemo } from 'react';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';

const ROOF_COLORS: Record<string, string> = {
  flat_concrete:  '#8A8682',
  green:          '#4A6741',
  inclined_tiles: '#7A4030',
  cool_roof:      '#C8C8C8',
};

const ROOF_ROUGHNESS: Record<string, number> = {
  flat_concrete: 0.88,
  green:         0.95,
  inclined_tiles:0.80,
  cool_roof:     0.25,
};

const ROOF_METALNESS: Record<string, number> = {
  flat_concrete: 0.02,
  green:         0.01,
  inclined_tiles:0.05,
  cool_roof:     0.35,
};

const HOVER_EMISSIVE  = new THREE.Color('#4A7FA8');
const SELECT_EMISSIVE = new THREE.Color('#1A3550');

export function Roof3D({ width, depth, y, type = 'flat_concrete', thickness = 0.35 }: {
  width: number; depth: number; y: number; type?: string; thickness?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const { selectedMesh, setSelectedMesh, setHoveredMesh } = useUIStore();
  const selected = selectedMesh === 'roof';
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
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const position: [number, number, number] = isInclined
    ? [0, y, -depth / 2 - 0.15]
    : [0, y + thickness / 2, 0];

  const emissive    = selected ? SELECT_EMISSIVE : hovered ? HOVER_EMISSIVE : new THREE.Color(0x000000);
  const emissiveInt = selected ? 0.35 : hovered ? 0.18 : 0;

  const handlers = {
    onPointerOver: (e: any) => { e.stopPropagation(); setHovered(true); setHoveredMesh('roof'); document.body.style.cursor = 'pointer'; },
    onPointerOut:  () => { setHovered(false); setHoveredMesh(null); document.body.style.cursor = 'auto'; },
    onClick:       (e: any) => { e.stopPropagation(); setSelectedMesh(selected ? null : 'roof'); },
  };

  return (
    <group position={position}>
      <mesh geometry={geo} castShadow receiveShadow {...handlers}>
        <meshPhysicalMaterial
          color={ROOF_COLORS[type] ?? '#8A8682'}
          roughness={ROOF_ROUGHNESS[type] ?? 0.85}
          metalness={ROOF_METALNESS[type] ?? 0.02}
          emissive={emissive}
          emissiveIntensity={emissiveInt}
          envMapIntensity={0.5}
        />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={selected ? '#4A7FA8' : '#1A1814'} transparent opacity={selected ? 0.8 : 0.35} />
      </lineSegments>
    </group>
  );
}
