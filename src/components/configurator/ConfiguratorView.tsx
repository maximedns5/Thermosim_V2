// ConfiguratorView — scroll-driven split layout avec bâtiment SVG animé
import { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, useSpring, m, LazyMotion, domAnimation } from 'framer-motion';
import { BuildingIllustration } from './BuildingIllustration';
import { GeometryConfigSection } from './sections/GeometryConfigSection';
import { WindowConfigSection } from './sections/WindowConfigSection';
import { InsulationConfigSection } from './sections/InsulationConfigSection';
import { RoofConfigSection } from './sections/RoofConfigSection';
import { VentilationConfigSection } from './sections/VentilationConfigSection';
import { HvacClimateConfigSection } from './sections/HvacClimateConfigSection';
import { ResultConfigSection } from './sections/ResultConfigSection';

const SECTION_LABELS = [
  { num: '01', label: 'Géométrie',   accent: '#4A7FA8' },
  { num: '02', label: 'Vitrages',    accent: '#0B7A63' },
  { num: '03', label: 'Isolation',   accent: '#C1440E' },
  { num: '04', label: 'Toiture',     accent: '#8B4030' },
  { num: '05', label: 'Ventilation', accent: '#4A8A4A' },
  { num: '06', label: 'HVAC',        accent: '#7060A8' },
  { num: '07', label: 'Résultat',    accent: '#1A3550' },
];

export function ConfiguratorView() {
  const rightRef  = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  // Scroll progress de 0 à 1 sur le panneau droit
  const { scrollYProgress } = useScroll({ container: rightRef });

  // Spring smoothing pour le scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60, damping: 18, restDelta: 0.001,
  });

  // Active section based on scroll (7 sections)
  useEffect(() => {
    const unsub = scrollYProgress.on('change', v => {
      setActiveSection(Math.min(6, Math.floor(v * 7)));
    });
    return unsub;
  }, [scrollYProgress]);

  // Progression de construction (0→1 sur les 4 premières sections)
  const constructionPct = useTransform(smoothProgress, [0, 0.57], [0, 100]);
  const constructionInt = useSpring(constructionPct, { stiffness: 60, damping: 18 });

  // Background du panneau gauche réagit au scroll
  const bgOpacity = useTransform(smoothProgress, [0.84, 1], [0, 0.08]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex w-full h-full overflow-hidden">

        {/* ════ PANNEAU GAUCHE — sticky bâtiment ════════════════════════════ */}
        <div
          className="relative flex-shrink-0 flex flex-col"
          style={{ width: '50%', background: '#0A0D12' }}
        >
          {/* Scanlines subtiles */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)',
              zIndex: 1,
            }}
          />

          {/* Indicateur de section actif — navigation verticale */}
          <div
            className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10"
          >
            {SECTION_LABELS.map((s, i) => {
              const active = activeSection === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!rightRef.current) return;
                    const sectionH = rightRef.current.scrollHeight / 7;
                    rightRef.current.scrollTo({ top: sectionH * i + 1, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 cursor-pointer group"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                  title={s.label}
                >
                  <m.div
                    animate={{
                      width: active ? 20 : 6,
                      background: active ? s.accent : 'rgba(255,255,255,0.15)',
                      boxShadow: active ? `0 0 8px ${s.accent}` : 'none',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{ height: 2, borderRadius: 1 }}
                  />
                  <m.span
                    animate={{ opacity: active ? 1 : 0, x: active ? 0 : -4 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 8,
                      color: s.accent,
                      letterSpacing: '0.1em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.num} {s.label.toUpperCase()}
                  </m.span>
                </button>
              );
            })}
          </div>

          {/* Building SVG — occupe tout le panneau */}
          <div className="flex-1 flex items-center justify-center p-8 pl-20 relative z-0">
            <BuildingIllustration scrollProgress={smoothProgress} />
          </div>

          {/* Barre de progression construction */}
          <div className="absolute bottom-6 left-16 right-6 z-10">
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(232,228,218,0.35)', letterSpacing: '0.1em' }}>
                CONSTRUCTION
              </span>
              <m.span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(232,228,218,0.5)' }}>
                {useTransform(constructionInt, v => `${Math.round(v)}%`)}
              </m.span>
            </div>
            <div className="relative" style={{ height: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
              <m.div
                style={{
                  position: 'absolute', inset: 0,
                  width: useTransform(constructionInt, v => `${v}%`),
                  background: `linear-gradient(to right, #4A7FA8, #0B7A63)`,
                  boxShadow: '0 0 8px rgba(74,127,168,0.6)',
                  borderRadius: 1,
                }}
              />
            </div>
          </div>

          {/* Hint drag */}
          <m.div
            animate={{ opacity: activeSection === 0 ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-6 right-6 z-10 flex items-center gap-1.5"
          >
            <m.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                <rect x="3" y="0" width="6" height="10" rx="3" stroke="rgba(232,228,218,0.3)" strokeWidth="1"/>
                <line x1="6" y1="3" x2="6" y2="6" stroke="rgba(232,228,218,0.3)" strokeWidth="1" strokeLinecap="round"/>
                <path d="M6 13l-3 0M6 13l3 0M6 13l0 3" stroke="rgba(232,228,218,0.3)" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </m.div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(232,228,218,0.3)', letterSpacing: '0.1em' }}>
              SCROLL
            </span>
          </m.div>
        </div>

        {/* ════ PANNEAU DROIT — scroll + sections ═══════════════════════════ */}
        <div
          ref={rightRef}
          className="flex-1 overflow-y-auto"
          style={{
            background: 'var(--color-bg)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(26,53,80,0.2) transparent',
          }}
        >
          {/* Ligne de progression verticale */}
          <div className="fixed right-0 top-0 bottom-0 w-0.5 pointer-events-none" style={{ zIndex: 20, right: '50%' }}>
            <m.div
              style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: useTransform(smoothProgress, v => `${v * 100}%`),
                background: 'linear-gradient(to bottom, #4A7FA8, #0B7A63)',
                opacity: 0.4,
              }}
            />
          </div>

          <GeometryConfigSection />
          <WindowConfigSection />
          <InsulationConfigSection />
          <RoofConfigSection />
          <VentilationConfigSection />
          <HvacClimateConfigSection />
          <ResultConfigSection />

          {/* Padding bas */}
          <div style={{ height: 80 }} />
        </div>

      </div>
    </LazyMotion>
  );
}
