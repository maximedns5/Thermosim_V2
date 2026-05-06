// Header — onglets de navigation + SIM button
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useSimulationStore } from '../../store/simulationStore';
import { useSimulation } from '../../hooks/useSimulation';
import type { ViewMode } from '../../store/uiStore';

const VIEWS: Array<{ id: ViewMode; label: string; shortcut: string }> = [
  { id: 'configure', label: 'CONFIGURE', shortcut: '1' },
  { id: 'facade',    label: 'FACADE',    shortcut: '2' },
  { id: 'analyse',   label: 'ANALYSIS',  shortcut: '3' },
  { id: 'charts',    label: 'CHARTS',    shortcut: '4' },
];

export function Header() {
  const { activeView, setActiveView, isSimRunning, toggleConfigDrawer } = useUIStore();
  const { progress } = useSimulationStore();
  const { runDynamic } = useSimulation();

  return (
    <LazyMotion features={domAnimation}>
      <header className="flex items-stretch select-none"
        style={{ height: 52, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-rule)' }}>

        {/* Logo */}
        <div className="flex items-center px-4 gap-2" style={{ borderRight: '1px solid var(--color-rule)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '0.15em', color: 'var(--color-ink)', textTransform: 'uppercase', lineHeight: 1 }}>
            THERMOSIM
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', letterSpacing: '0.05em', alignSelf: 'flex-end', paddingBottom: 2 }}>
            v2.0.0
          </span>
        </div>

        {/* Onglets */}
        <div className="flex">
          {VIEWS.map(v => {
            const active = activeView === v.id;
            return (
              <button key={v.id} onClick={() => setActiveView(v.id)}
                className="relative px-5 h-full cursor-pointer transition-colors"
                style={{
                  fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.12em',
                  fontWeight: active ? 500 : 400, textTransform: 'uppercase',
                  color: active ? 'var(--color-accent-primary)' : 'var(--color-ink-3)',
                  background: 'transparent', border: 'none',
                  borderRight: '1px solid var(--color-rule)',
                }}
                title={`${v.label} (${v.shortcut})`}
              >
                {v.label}
                {active && (
                  <m.span layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0"
                    style={{ height: 2, background: 'var(--color-accent-primary)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Progress + SIM button */}
        <div className="flex items-center px-4 gap-3" style={{ borderLeft: '1px solid var(--color-rule)' }}>
          <AnimatePresence>
            {isSimRunning && (
              <m.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                className="flex items-center gap-2">
                <div className="relative overflow-hidden" style={{ width: 96, height: 1, background: 'var(--color-rule)' }}>
                  <div className="absolute inset-y-0 left-0 transition-[width] duration-200"
                    style={{ width: `${progress * 100}%`, background: 'var(--color-accent-primary)' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)' }}>
                  {Math.round(progress * 100)} %
                </span>
              </m.div>
            )}
          </AnimatePresence>

          <m.button onClick={() => { void runDynamic(); }} disabled={isSimRunning}
            whileHover={isSimRunning ? {} : { scale: 1.02 }}
            whileTap={isSimRunning ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex items-center gap-2 px-4 py-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 11,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-ink-inv)', background: 'var(--color-accent-primary)',
              border: 'none', borderRadius: 3,
              animation: isSimRunning ? 'simPulse 1.5s ease-in-out infinite' : 'none',
            }}
            title="Simulation dynamique 8760h (⌘↵)">
            <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor">
              <path d="M0 0l9 5.5L0 11V0z" />
            </svg>
            SIM 8760h
          </m.button>

          <m.button onClick={toggleConfigDrawer}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex items-center gap-1.5 px-3 py-2 cursor-pointer"
            style={{
              fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.08em',
              color: 'var(--color-ink-3)', background: 'transparent',
              border: '1px solid var(--color-rule)', borderRadius: 3,
            }}
            title="Configuration avancée">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="6" cy="6" r="1.5" />
              <path d="M6 1v1.5M6 9.5V11M1 6h1.5M9.5 6H11" />
            </svg>
            Config
          </m.button>
        </div>
      </header>

      <style>{`
        @keyframes simPulse {
          0%   { box-shadow: 0 0 0 0 rgba(26,53,80,0.3); }
          70%  { box-shadow: 0 0 0 8px rgba(26,53,80,0); }
          100% { box-shadow: 0 0 0 0 rgba(26,53,80,0); }
        }
      `}</style>
    </LazyMotion>
  );
}
