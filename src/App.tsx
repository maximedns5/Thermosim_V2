import { Suspense, lazy } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence, MotionConfig } from 'framer-motion';
import { Header } from './components/layout/Header';
import { MetricsBar } from './components/layout/MetricsBar';
import { Folio } from './components/layout/Folio';
import { SplashScreen } from './components/layout/SplashScreen';
import { ConfigPanel } from './components/config/ConfigPanel';
import { ConfiguratorView } from './components/configurator/ConfiguratorView';
import { useUIStore } from './store/uiStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { HeatLossHeatmap } from './components/charts/HeatLossHeatmap';
import { SankeyEnergy } from './components/charts/SankeyEnergy';
import { TimeSeries24h } from './components/charts/TimeSeries24h';
import { TimeSeriesAnnual } from './components/charts/TimeSeriesAnnual';
import { GlaserDiagram } from './components/charts/GlaserDiagram';
import { HvacPerformance } from './components/charts/HvacPerformance';
import { ScenarioRadar } from './components/charts/ScenarioRadar';

const FacadeView  = lazy(() => import('./components/svg/FacadeView').then(m => ({ default: m.FacadeView })));
const SectionView = lazy(() => import('./components/svg/SectionView').then(m => ({ default: m.SectionView })));
const PlanView    = lazy(() => import('./components/svg/PlanView').then(m => ({ default: m.PlanView })));
const AnalyseView = lazy(() => import('./components/views/AnalyseView').then(m => ({ default: m.AnalyseView })));

const viewTransition = {
  initial:    { opacity: 0, filter: 'blur(3px)', scale: 0.996 },
  animate:    { opacity: 1, filter: 'blur(0px)', scale: 1 },
  exit:       { opacity: 0, filter: 'blur(3px)', scale: 1.004 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

function ChartsView() {
  const charts = [
    { key: 'sankey',   label: 'Energy Flow',         el: <SankeyEnergy /> },
    { key: 'heatmap',  label: 'Heat Loss Map',        el: <HeatLossHeatmap /> },
    { key: 'ts24',     label: '24h Temperature',      el: <TimeSeries24h /> },
    { key: 'tsannual', label: 'Annual Temperature',   el: <TimeSeriesAnnual /> },
    { key: 'glaser',   label: 'Glaser Diagram',       el: <GlaserDiagram /> },
    { key: 'hvac',     label: 'HVAC Performance',     el: <HvacPerformance /> },
    { key: 'radar',    label: 'Scenario Radar',       el: <ScenarioRadar /> },
  ];
  return (
    <div className="w-full h-full overflow-auto p-4" style={{ background: '#0A0D12' }}>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {charts.map((c, idx) => (
          <m.div key={c.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: 16 }}
          >
            <p className="mb-3 uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 11, color: 'rgba(232,228,218,0.7)' }}>
              {c.label}
            </p>
            {c.el}
          </m.div>
        ))}
      </div>
    </div>
  );
}

function ViewPane() {
  const { activeView } = useUIStore();
  return (
    <div className="flex-1 min-h-0 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {activeView === 'configure' && (
          <m.div key="configure" {...viewTransition} className="absolute inset-0">
            <ConfiguratorView />
          </m.div>
        )}
        {activeView === 'facade' && (
          <m.div key="facade" {...viewTransition} className="absolute inset-0 overflow-auto p-4 bg-paper">
            <Suspense fallback={null}><FacadeView /></Suspense>
          </m.div>
        )}
        {activeView === 'coupe' && (
          <m.div key="coupe" {...viewTransition} className="absolute inset-0 overflow-auto p-4 bg-paper">
            <Suspense fallback={null}><SectionView /></Suspense>
          </m.div>
        )}
        {activeView === 'plan' && (
          <m.div key="plan" {...viewTransition} className="absolute inset-0 overflow-auto p-4 bg-paper">
            <Suspense fallback={null}><PlanView /></Suspense>
          </m.div>
        )}
        {activeView === 'analyse' && (
          <m.div key="analyse" {...viewTransition} className="absolute inset-0">
            <Suspense fallback={null}><AnalyseView /></Suspense>
          </m.div>
        )}
        {activeView === 'charts' && (
          <m.div key="charts" {...viewTransition} className="absolute inset-0">
            <ChartsView />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  useKeyboardShortcuts();
  const { appUnlocked } = useUIStore();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">
          {!appUnlocked && <SplashScreen key="splash" />}
        </AnimatePresence>

        {appUnlocked && (
          <div className="flex flex-col h-screen overflow-hidden bg-paper font-sans">
            <Header />
            <MetricsBar />
            <div className="flex flex-1 min-h-0 overflow-hidden relative">
              <ViewPane />
              <ConfigPanel />
            </div>
            <Folio />
          </div>
        )}
      </MotionConfig>
    </LazyMotion>
  );
}
