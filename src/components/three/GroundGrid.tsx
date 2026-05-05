// GroundGrid — grille luminescente fine sur fond sombre
interface GroundGridProps {
  size?: number;
  divisions?: number;
}

export function GroundGrid({ size = 60, divisions = 60 }: GroundGridProps) {
  return (
    <group>
      <gridHelper
        args={[size, divisions, '#2A4060', '#1A2A40']}
        position={[0, -0.01, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#141820" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
