// Wall3D — MeshPhysicalMaterial béton, hover glow, click selection
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';
import type { SelectedMesh } from '../../store/uiStore';

interface Wall3DProps {
  width: number;
  height: number;
  thickness: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  meshId: SelectedMesh;
  showEdges?: boolean;
}

const CONCRETE_COLOR   = new THREE.Color('#C8C4BC');
const HOVER_EMISSIVE   = new THREE.Color('#4A7FA8');
const SELECT_EMISSIVE  = new THREE.Color('#1A3550');

export function Wall3D({
  width, height, thickness, position, rotation = [0, 0, 0], meshId, showEdges = true,
}: Wall3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedMesh, setSelectedMesh, setHoveredMesh } = useUIStore();
  const selected = selectedMesh === meshId;

  const geo  = useMemo(() => new THREE.BoxGeometry(width, height, thickness), [width, height, thickness]);
  const edge = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  const emissive   = selected ? SELECT_EMISSIVE : hovered ? HOVER_EMISSIVE : new THREE.Color(0x000000);
  const emissiveInt = selected ? 0.35 : hovered ? 0.18 : 0;

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        geometry={geo}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); setHoveredMesh(meshId ?? null); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); setHoveredMesh(null); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); setSelectedMesh(selected ? null : meshId); }}
      >
        <meshPhysicalMaterial
          color={CONCRETE_COLOR}
          roughness={0.82}
          metalness={0.04}
          emissive={emissive}
          emissiveIntensity={emissiveInt}
          envMapIntensity={0.6}
        />
      </mesh>
      {showEdges && (
        <lineSegments geometry={edge}>
          <lineBasicMaterial color={selected ? '#4A7FA8' : '#2A2826'} transparent opacity={selected ? 0.9 : 0.4} />
        </lineSegments>
      )}
    </group>
  );
}
