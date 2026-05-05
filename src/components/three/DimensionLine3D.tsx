// Cote dimensionnelle 3D (line + texte)
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

interface DimensionLine3DProps {
  start: [number, number, number];
  end:   [number, number, number];
  label: string;
  offset?: number;
  axis?: 'x' | 'y' | 'z';
}

export function DimensionLine3D({ start, end, label, offset = 0.5, axis = 'x' }: DimensionLine3DProps) {
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + (axis === 'y' ? 0 : offset),
    (start[2] + end[2]) / 2,
  ];

  const color = '#6B6B6B';

  return (
    <group>
      <Line points={[start, end]} color={color} lineWidth={1} />
      <Text
        position={mid}
        fontSize={0.25}
        color={color}
        anchorX="center"
        anchorY="bottom"
      >
        {label}
      </Text>
    </group>
  );
}
