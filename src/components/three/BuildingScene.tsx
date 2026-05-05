// BuildingScene — rendu cinématique architectural, post-processing subtil
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { AdaptiveDpr, AdaptiveEvents, Stats } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { OrbitCameraRig } from './OrbitCameraRig';
import { GroundGrid } from './GroundGrid';
import { BuildingModel } from './BuildingModel';
import { ExplodedLayers } from './ExplodedLayers';
import { SectionCutPlane } from './SectionCutPlane';
import { NorthIndicator3D } from './NorthIndicator3D';
import { Cartouche3D } from './Cartouche3D';

export function BuildingScene() {
  return (
    <div className="w-full h-full" style={{ background: '#1A1F28' }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [20, 16, 20], fov: 40, near: 0.1, far: 300 }}
        gl={{
          antialias: true,
          localClippingEnabled: true,
          toneMapping: 4, // ACESFilmicToneMapping — rendu cinématique
          toneMappingExposure: 1.1,
        }}
        style={{ background: '#1A1F28' }}
      >
        <Suspense fallback={null}>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />

          {/* Éclairage cinématique architectural */}
          <ambientLight intensity={0.4} color="#FFF5E4" />

          {/* Lumière principale 45° — ombres douces */}
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-radius={8}
            shadow-bias={-0.0005}
            color="#FFF8F0"
          />

          {/* Contre-jour bleuté froid */}
          <pointLight
            position={[-8, 12, -6]}
            intensity={0.6}
            color="#B0C8E8"
          />

          {/* Lumière de remplissage */}
          <directionalLight position={[-10, 10, -10]} intensity={0.2} color="#D4E8F0" />

          {/* Hemisphere — ciel/sol */}
          <hemisphereLight
            args={['#D4E8F0', '#C8C2B8', 0.5]}
          />

          <SectionCutPlane />
          <OrbitCameraRig />
          <GroundGrid size={60} divisions={60} />
          <BuildingModel />
          <ExplodedLayers />
          <NorthIndicator3D position={[-12, 0, -12]} />
          <Cartouche3D />

          {/* Post-processing subtil */}
          <EffectComposer>
            <Bloom
              threshold={0.85}
              strength={0.15}
              radius={0.4}
            />
            <Vignette
              eskil={false}
              offset={0.1}
              darkness={0.4}
            />
          </EffectComposer>

          {import.meta.env.DEV && <Stats />}
        </Suspense>
      </Canvas>
    </div>
  );
}
