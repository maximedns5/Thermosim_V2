// OrbitCameraRig — contrôles caméra + parallax souris + presets
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';

type CameraPreset = 'isometric' | 'south_facade' | 'section' | 'top';

const PRESETS: Record<CameraPreset, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  isometric:    { position: new THREE.Vector3(20, 16, 20), target: new THREE.Vector3(0, 4, 0) },
  south_facade: { position: new THREE.Vector3(0, 6, 25),  target: new THREE.Vector3(0, 4, 0) },
  section:      { position: new THREE.Vector3(25, 6, 0),  target: new THREE.Vector3(0, 4, 0) },
  top:          { position: new THREE.Vector3(0, 30, 0),  target: new THREE.Vector3(0, 0, 0) },
};

// Groupe proxy pour la rotation parallax souris
const _parallaxGroup = new THREE.Group();

export function OrbitCameraRig() {
  const { camera, scene } = useThree();
  const controlsRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { activeView } = useUIStore();

  const applyPreset = (p: CameraPreset) => {
    const { position, target } = PRESETS[p];
    camera.position.copy(position);
    if (controlsRef.current) {
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    if (activeView === '3d') applyPreset('isometric');
  }, [activeView]);

  // Parallax souris — rotation additive douce du groupe de scène
  useFrame(({ mouse }) => {
    if (!groupRef.current) return;
    const targetX = mouse.x * 0.15;
    const targetY = -mouse.y * 0.08;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, targetX, 0.04
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, targetY, 0.04
    );
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.07}
        minDistance={3}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2}
        target={[0, 4, 0]}
      />
      {/* Invisible group used for parallax — children injected via context in BuildingModel */}
      <group ref={groupRef} />
    </>
  );
}
