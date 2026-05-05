// Indicateur Nord 3D
import * as THREE from 'three';
import { Text } from '@react-three/drei';

export function NorthIndicator3D({ position = [-10, 0, -10] as [number, number, number] }) {
  return (
    <group position={position}>
      {/* Flèche Nord */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0, 0.15, 1, 3]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.4}
        color="#0A0A0A"
        anchorX="center"
        anchorY="bottom"
      >
        N
      </Text>
    </group>
  );
}
