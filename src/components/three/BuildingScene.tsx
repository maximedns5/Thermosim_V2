// BuildingScene — rendu cinématique + ContextualEditor overlay
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { AdaptiveDpr, AdaptiveEvents, Stats, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { OrbitCameraRig } from './OrbitCameraRig';
import { GroundGrid } from './GroundGrid';
import { BuildingModel } from './BuildingModel';
import { ExplodedLayers } from './ExplodedLayers';
import { SectionCutPlane } from './SectionCutPlane';
import { NorthIndicator3D } from './NorthIndicator3D';
import { Cartouche3D } from './Cartouche3D';
import { ContextualEditor } from './ContextualEditor';
import { useUIStore } from '../../store/uiStore';

// Hint overlay quand rien n'est sélectionné
function InteractionHint() {
  const { selectedMesh, hoveredMesh } = useUIStore();
  if (selectedMesh || hoveredMesh) return null;
  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: 'rgba(232,228,218,0.3)',
        background: 'rgba(10,13,18,0.5)',
        backdropFilter: 'blur(8px)',
        padding: '6px 14px',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      CLIQUER UN ÉLÉMENT POUR MODIFIER · DRAG POUR PIVOTER
    </div>
  );
}

export function BuildingScene() {
  return (
    <div className="relative w-full h-full" style={{ background: '#1A1F28' }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [20, 16, 20], fov: 40, near: 0.1, far: 300 }}
        gl={{
          antialias: true,
          localClippingEnabled: true,
          toneMapping: 4,
          toneMappingExposure: 1.1,
        }}
        style={{ background: '#1A1F28' }}
      >
        <Suspense fallback={null}>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />

          {/* Environment map pour les reflets physiques */}
          <Environment preset="city" />

          {/* Éclairage cinématique architectural */}
          <ambientLight intensity={0.35} color="#FFF5E4" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-radius={10}
            shadow-bias={-0.0005}
            color="#FFF8F0"
          />
          <pointLight position={[-8, 12, -6]} intensity={0.7} color="#B0C8E8" />
          <directionalLight position={[-10, 8, -10]} intensity={0.25} color="#D4E8F0" />
          <hemisphereLight args={['#C8D8E8', '#B8B4A8', 0.45]} />

          <SectionCutPlane />
          <OrbitCameraRig />
          <GroundGrid size={60} divisions={60} />
          <BuildingModel />
          <ExplodedLayers />
          <NorthIndicator3D position={[-12, 0, -12]} />
          <Cartouche3D />

          <EffectComposer>
            <Bloom threshold={0.82} strength={0.18} radius={0.45} />
            <Vignette eskil={false} offset={0.12} darkness={0.45} />
          </EffectComposer>

          {import.meta.env.DEV && <Stats />}
        </Suspense>
      </Canvas>

      {/* Overlays CSS au-dessus du canvas */}
      <ContextualEditor />
      <InteractionHint />
    </div>
  );
}
