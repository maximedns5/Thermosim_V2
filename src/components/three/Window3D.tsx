// Window3D — verre transmission, châssis aluminium, interactions
import { useState, useMemo } from 'react';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';
import type { SelectedMesh } from '../../store/uiStore';

interface Window3DProps {
  width: number;
  height: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  frameThickness?: number;
  meshId: SelectedMesh;
}

const GLASS_COLOR    = new THREE.Color('#7EB8D4');
const FRAME_COLOR    = new THREE.Color('#2C2C2C');
const HOVER_EMISSIVE = new THREE.Color('#4A7FA8');
const SEL_EMISSIVE   = new THREE.Color('#1A3550');

export function Window3D({
  width, height, position, rotation = [0, 0, 0], frameThickness = 0.07, meshId,
}: Window3DProps) {
  const [hovered, setHovered] = useState(false);
  const { selectedMesh, setSelectedMesh, setHoveredMesh } = useUIStore();
  const selected = selectedMesh === meshId;

  const glassGeo = useMemo(
    () => new THREE.BoxGeometry(width - frameThickness * 2, height - frameThickness * 2, 0.012),
    [width, height, frameThickness],
  );

  const frames = useMemo(() => {
    const ft = frameThickness;
    return [
      { w: width, h: ft, x: 0, y: -height / 2 + ft / 2 },
      { w: width, h: ft, x: 0, y:  height / 2 - ft / 2 },
      { w: ft, h: height - ft * 2, x: -width / 2 + ft / 2, y: 0 },
      { w: ft, h: height - ft * 2, x:  width / 2 - ft / 2, y: 0 },
    ];
  }, [width, height, frameThickness]);

  const emissive    = selected ? SEL_EMISSIVE : hovered ? HOVER_EMISSIVE : new THREE.Color(0x000000);
  const emissiveInt = selected ? 0.4 : hovered ? 0.2 : 0;

  const handlers = {
    onPointerOver: (e: any) => { e.stopPropagation(); setHovered(true); setHoveredMesh(meshId ?? null); document.body.style.cursor = 'pointer'; },
    onPointerOut:  () => { setHovered(false); setHoveredMesh(null); document.body.style.cursor = 'auto'; },
    onClick:       (e: any) => { e.stopPropagation(); setSelectedMesh(selected ? null : meshId); },
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Vitrage — transmission physique */}
      <mesh geometry={glassGeo} position={[0, 0, -0.015]} {...handlers}>
        <meshPhysicalMaterial
          color={GLASS_COLOR}
          transmission={0.72}
          roughness={0.04}
          metalness={0.1}
          ior={1.5}
          thickness={0.012}
          transparent
          opacity={0.85}
          emissive={emissive}
          emissiveIntensity={emissiveInt * 0.6}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Reflet de vitre (plane légèrement en avant) */}
      <mesh position={[0, 0, -0.01]} {...handlers}>
        <planeGeometry args={[width - frameThickness * 2 - 0.01, height - frameThickness * 2 - 0.01]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transparent
          opacity={0.06}
          roughness={0}
          metalness={0}
        />
      </mesh>

      {/* Châssis aluminium */}
      {frames.map((f, i) => {
        const geo = new THREE.BoxGeometry(f.w, f.h, 0.085);
        return (
          <mesh key={i} geometry={geo} position={[f.x, f.y, 0]} castShadow {...handlers}>
            <meshPhysicalMaterial
              color={FRAME_COLOR}
              roughness={0.28}
              metalness={0.82}
              emissive={emissive}
              emissiveIntensity={emissiveInt}
              envMapIntensity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}
