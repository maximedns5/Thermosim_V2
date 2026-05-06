// ContextualEditor — panel flottant cliquable sur le bâtiment 3D
// Slide-in depuis la droite, spring physics, tous les paramètres
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { WallSection } from '../config/sections/WallSection';
import { WindowSection } from '../config/sections/WindowSection';
import { RoofSection } from '../config/sections/RoofSection';
import { GeometrySection } from '../config/sections/GeometrySection';
import { VentilationSection } from '../config/sections/VentilationSection';
import { HvacSection } from '../config/sections/HvacSection';
import type { SelectedMesh } from '../../store/uiStore';

const LABELS: Record<NonNullable<SelectedMesh>, { icon: string; title: string; subtitle: string }> = {
  wall:          { icon: '🧱', title: 'Paroi',        subtitle: 'Composition · Isolation' },
  window_south:  { icon: '🪟', title: 'Vitrage Sud',  subtitle: 'Type · Ratio · Performance' },
  window_north:  { icon: '🪟', title: 'Vitrage Nord',  subtitle: 'Type · Ratio · Performance' },
  window_east:   { icon: '🪟', title: 'Vitrage Est',   subtitle: 'Type · Ratio · Performance' },
  window_west:   { icon: '🪟', title: 'Vitrage Ouest', subtitle: 'Type · Ratio · Performance' },
  roof:          { icon: '🏠', title: 'Toiture',       subtitle: 'Type · Isolation' },
  floor:         { icon: '📐', title: 'Géométrie',     subtitle: 'Dimensions · Étages · Orientation' },
  geometry:      { icon: '📐', title: 'Géométrie',     subtitle: 'Dimensions · Étages · Orientation' },
};

function SectionContent({ selected }: { selected: NonNullable<SelectedMesh> }) {
  switch (selected) {
    case 'wall':          return <WallSection />;
    case 'window_south':
    case 'window_north':
    case 'window_east':
    case 'window_west':   return <WindowSection />;
    case 'roof':          return <RoofSection />;
    case 'floor':
    case 'geometry':      return <GeometrySection />;
    default:              return null;
  }
}

// Tab pill pour les sections supplémentaires (HVAC/Ventil) depuis le panel mur
function ExtraTabs({ selected }: { selected: NonNullable<SelectedMesh> }) {
  if (selected !== 'wall') return null;
  return (
    <div className="space-y-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'rgba(232,228,218,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Systèmes associés
      </p>
      <VentilationSection />
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, marginTop: 8 }}>
        <HvacSection />
      </div>
    </div>
  );
}

export function ContextualEditor() {
  const { selectedMesh, setSelectedMesh } = useUIStore();
  const meta = selectedMesh ? LABELS[selectedMesh] : null;

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {selectedMesh && meta && (
          <m.div
            key={selectedMesh}
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.8 }}
            className="absolute right-0 top-0 bottom-0 z-20 flex flex-col overflow-hidden"
            style={{
              width: 320,
              background: 'rgba(10, 13, 18, 0.92)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '-12px 0 48px rgba(0,0,0,0.5)',
            }}
          >
            {/* En-tête */}
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start justify-between px-5 pt-5 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <span style={{ fontSize: 18 }}>{meta.icon}</span>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: '0.06em',
                    color: '#E8E4DA',
                    textTransform: 'uppercase',
                  }}>
                    {meta.title}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: 'rgba(232,228,218,0.4)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  {meta.subtitle}
                </p>
              </div>

              <m.button
                onClick={() => setSelectedMesh(null)}
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="cursor-pointer flex items-center justify-center"
                style={{
                  width: 28, height: 28,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 2,
                  color: 'rgba(232,228,218,0.7)',
                  fontSize: 16,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
                aria-label="Fermer"
              >
                ×
              </m.button>
            </m.div>

            {/* Contenu scrollable */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.4 }}
              className="flex-1 overflow-y-auto px-5 py-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
            >
              {/* Adapter les couleurs des contrôles pour fond sombre */}
              <div className="dark-panel">
                <SectionContent selected={selectedMesh} />
                <ExtraTabs selected={selectedMesh} />
              </div>
            </m.div>

            {/* Barre de confirmation — hint */}
            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.3 }}
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#0B7A63',
                display: 'inline-block',
                boxShadow: '0 0 6px #0B7A63',
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'rgba(232,228,218,0.35)',
                letterSpacing: '0.08em',
              }}>
                Modifications appliquées en temps réel
              </span>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
