// ConfigPanel — drawer latéral depuis la droite, slide-in Framer Motion
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useBuildingStore } from '../../store/buildingStore';
import { SCENARIOS } from '../../engine/data/scenarios';
import {
  GeometrySection, WallSection, WindowSection, RoofSection,
  VentilationSection, HvacSection, ClimateSection,
} from './sections';
import type { ActivePanel } from '../../store/uiStore';

const PANELS: Array<{ id: ActivePanel; label: string }> = [
  { id: 'geometry',    label: 'Geom.' },
  { id: 'wall',        label: 'Walls' },
  { id: 'windows',     label: 'Windows' },
  { id: 'roof',        label: 'Roof' },
  { id: 'ventilation', label: 'Ventil.' },
  { id: 'hvac',        label: 'HVAC' },
  { id: 'climate',     label: 'Climate' },
  { id: 'scenarios',   label: 'Scenarios' },
];

const SECTION_COMPONENTS: Record<ActivePanel, React.FC | null> = {
  geometry:    GeometrySection,
  wall:        WallSection,
  windows:     WindowSection,
  roof:        RoofSection,
  ventilation: VentilationSection,
  hvac:        HvacSection,
  climate:     ClimateSection,
  scenarios:   null,
};

export function ConfigPanel() {
  const { activePanel, setActivePanel, configDrawerOpen, setConfigDrawerOpen } = useUIStore();
  const { applyScenario } = useBuildingStore();
  const Section = SECTION_COMPONENTS[activePanel];

  return (
    <LazyMotion features={domAnimation}>
      {/* Backdrop */}
      <AnimatePresence>
        {configDrawerOpen && (
          <m.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30"
            style={{ background: 'rgba(10,13,18,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setConfigDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {configDrawerOpen && (
          <m.aside
            key="drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="absolute right-0 top-0 bottom-0 z-40 flex flex-col overflow-hidden"
            style={{
              width: 320,
              background: 'var(--color-surface-panel)',
              borderLeft: '1px solid var(--color-rule)',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
            }}
          >
            {/* Header de drawer */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-rule)' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink)',
                }}
              >
                Config avancée
              </span>
              <button
                onClick={() => setConfigDrawerOpen(false)}
                className="cursor-pointer"
                style={{
                  color: 'var(--color-ink-3)',
                  background: 'transparent',
                  border: 'none',
                  fontSize: 16,
                  lineHeight: 1,
                }}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {/* Onglets horizontaux */}
            <div
              className="flex overflow-x-auto"
              style={{
                borderBottom: '1px solid var(--color-rule)',
                scrollbarWidth: 'none',
              }}
            >
              {PANELS.map((p) => {
                const active = activePanel === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePanel(p.id)}
                    className="flex-shrink-0 px-3 py-2 cursor-pointer transition-colors"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: active ? 'var(--color-accent-primary)' : 'var(--color-ink-3)',
                      background: active ? 'var(--color-accent-glow)' : 'transparent',
                      border: 'none',
                      borderBottom: active ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Contenu section */}
            <div className="flex-1 overflow-y-auto p-4">
              {activePanel === 'scenarios' ? (
                <div className="space-y-2">
                  <p
                    className="mb-3"
                    style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-ink-3)' }}
                  >
                    Sélectionner un scénario préconfigured :
                  </p>
                  {Object.values(SCENARIOS).map((s) => (
                    <m.button
                      key={s.id}
                      onClick={() => applyScenario(s)}
                      whileHover={{ borderColor: 'var(--color-accent-primary)', background: 'var(--color-accent-glow)' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-full text-left px-3 py-2.5 cursor-pointer transition-colors"
                      style={{
                        border: '1px solid var(--color-rule)',
                        borderRadius: 2,
                        background: 'transparent',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 12,
                          color: 'var(--color-ink)',
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--color-ink-4)',
                          marginTop: 2,
                        }}
                      >
                        {s.hint}
                      </div>
                    </m.button>
                  ))}
                </div>
              ) : Section ? (
                <Section />
              ) : null}
            </div>
          </m.aside>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
