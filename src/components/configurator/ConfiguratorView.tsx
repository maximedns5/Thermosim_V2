// ConfiguratorView — scroll-driven split layout with animated SVG building
import { useRef, useState, useEffect, useCallback } from 'react';
import { useScroll, useTransform, useSpring, m, LazyMotion, domAnimation, motion } from 'framer-motion';
import { BuildingIllustration } from './BuildingIllustration';
import { GeometryConfigSection } from './sections/GeometryConfigSection';
import { WindowConfigSection } from './sections/WindowConfigSection';
import { InsulationConfigSection } from './sections/InsulationConfigSection';
import { RoofConfigSection } from './sections/RoofConfigSection';
import { VentilationConfigSection } from './sections/VentilationConfigSection';
import { HvacClimateConfigSection } from './sections/HvacClimateConfigSection';
import { ResultConfigSection } from './sections/ResultConfigSection';

const SECTION_LABELS = [
  { num: '01', label: 'Geometry',    accent: '#4A7FA8' },
  { num: '02', label: 'Glazing',     accent: '#0B7A63' },
  { num: '03', label: 'Insulation',  accent: '#C1440E' },
  { num: '04', label: 'Roof',        accent: '#8B4030' },
  { num: '05', label: 'Ventilation', accent: '#4A8A4A' },
  { num: '06', label: 'HVAC',        accent: '#7060A8' },
  { num: '07', label: 'Results',     accent: '#1A3550' },
];

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.15;

export function ConfiguratorView() {
  const rightRef  = useRef<HTMLDivElement>(null);
  const leftRef   = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  // Zoom & pan state for the building illustration
  const [zoom, setZoom]       = useState(1);
  const [panX, setPanX]       = useState(0);
  const [panY, setPanY]       = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  // Scroll tracking for section highlights
  const { scrollYProgress } = useScroll({ container: rightRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 18, restDelta: 0.001 });

  useEffect(() => {
    const unsub = scrollYProgress.on('change', v => {
      setActiveSection(Math.min(6, Math.floor(v * 7)));
    });
    return unsub;
  }, [scrollYProgress]);

  // Forward wheel events on left panel → scroll right panel
  useEffect(() => {
    const leftEl  = leftRef.current;
    const rightEl = rightRef.current;
    if (!leftEl || !rightEl) return;

    const handleWheel = (e: WheelEvent) => {
      // If Ctrl/Meta held, handle zoom; otherwise forward scroll
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z - e.deltaY * 0.01)));
      } else {
        e.preventDefault();
        rightEl.scrollTop += e.deltaY;
      }
    };
    leftEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => leftEl.removeEventListener('wheel', handleWheel);
  }, []);

  // Zoom via buttons
  const zoomIn  = () => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const zoomReset = () => { setZoom(1); setPanX(0); setPanY(0); };

  // Drag to pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: panX, py: panY };
    e.preventDefault();
  }, [panX, panY]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    setPanX(dragStart.current.px + (e.clientX - dragStart.current.x));
    setPanY(dragStart.current.py + (e.clientY - dragStart.current.y));
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  const constructionPct = useTransform(smoothProgress, [0, 0.57], [0, 100]);
  const constructionInt = useSpring(constructionPct, { stiffness: 60, damping: 18 });

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex w-full h-full overflow-hidden">

        {/* ── LEFT PANEL — sticky building illustration ───────────────────── */}
        <div
          ref={leftRef}
          className="relative flex-shrink-0 flex flex-col"
          style={{ width: '50%', background: '#0A0D12', cursor: dragging ? 'grabbing' : 'grab' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.007) 3px, rgba(255,255,255,0.007) 4px)',
            zIndex: 1,
          }} />

          {/* Section navigation dots */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10 pointer-events-auto">
            {SECTION_LABELS.map((s, i) => {
              const active = activeSection === i;
              return (
                <button key={i} onClick={() => {
                  if (!rightRef.current) return;
                  const h = rightRef.current.scrollHeight / 7;
                  rightRef.current.scrollTo({ top: h * i + 1, behavior: 'smooth' });
                }}
                  className="flex items-center gap-2 cursor-pointer"
                  style={{ background: 'none', border: 'none', padding: 0 }} title={s.label}>
                  <m.div animate={{
                    width: active ? 20 : 6,
                    background: active ? s.accent : 'rgba(255,255,255,0.15)',
                    boxShadow: active ? `0 0 8px ${s.accent}` : 'none',
                  }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{ height: 2, borderRadius: 1 }} />
                  <m.span animate={{ opacity: active ? 1 : 0, x: active ? 0 : -4 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: s.accent, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                    {s.num} {s.label.toUpperCase()}
                  </m.span>
                </button>
              );
            })}
          </div>

          {/* Zoom controls */}
          <div className="absolute right-4 top-4 flex flex-col gap-1 z-10 pointer-events-auto">
            {[
              { label: '+', fn: zoomIn,   title: 'Zoom in' },
              { label: '−', fn: zoomOut,  title: 'Zoom out' },
              { label: '⊡', fn: zoomReset,title: 'Reset view' },
            ].map(({ label, fn, title }) => (
              <button key={label} onClick={fn} title={title}
                className="cursor-pointer flex items-center justify-center"
                style={{
                  width: 24, height: 24,
                  fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: 1,
                  color: 'rgba(232,228,218,0.6)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                }}>
                {label}
              </button>
            ))}
            {/* Zoom level */}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 7,
              color: 'rgba(232,228,218,0.3)', textAlign: 'center',
              letterSpacing: '0.05em',
            }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Building SVG with zoom/pan transform */}
          <div className="flex-1 flex items-center justify-center p-8 pl-20 relative z-0 overflow-hidden">
            <div style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: dragging ? 'none' : 'transform 0.1s ease',
              width: '100%',
              height: '100%',
            }}>
              <BuildingIllustration scrollProgress={smoothProgress} />
            </div>
          </div>

          {/* Build progress bar */}
          <div className="absolute bottom-6 left-16 right-14 z-10 pointer-events-none">
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(232,228,218,0.35)', letterSpacing: '0.1em' }}>
                BUILD
              </span>
              <m.span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(232,228,218,0.5)' }}>
                {useTransform(constructionInt, v => `${Math.round(v)}%`)}
              </m.span>
            </div>
            <div className="relative" style={{ height: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
              <m.div style={{
                position: 'absolute', inset: 0,
                width: useTransform(constructionInt, v => `${v}%`),
                background: 'linear-gradient(to right, #4A7FA8, #0B7A63)',
                boxShadow: '0 0 6px rgba(74,127,168,0.5)',
                borderRadius: 1,
              }} />
            </div>
          </div>

          {/* Scroll + drag hint */}
          <m.div animate={{ opacity: activeSection === 0 ? 1 : 0 }} transition={{ duration: 0.4 }}
            className="absolute bottom-6 right-4 z-10 flex items-center gap-1.5 pointer-events-none">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(232,228,218,0.25)', letterSpacing: '0.08em', textAlign: 'right', lineHeight: 1.6 }}>
              SCROLL → navigate<br/>DRAG → pan<br/>CTRL+SCROLL → zoom
            </span>
          </m.div>
        </div>

        {/* ── RIGHT PANEL — scrollable config sections ────────────────────── */}
        <div ref={rightRef} className="flex-1 overflow-y-auto"
          style={{ background: 'var(--color-bg)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(26,53,80,0.2) transparent' }}>

          {/* Vertical scroll progress line */}
          <div className="fixed top-0 bottom-0 w-0.5 pointer-events-none" style={{ zIndex: 20, right: '50%' }}>
            <m.div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: useTransform(smoothProgress, v => `${v * 100}%`),
              background: 'linear-gradient(to bottom, #4A7FA8, #0B7A63)',
              opacity: 0.4,
            }} />
          </div>

          <GeometryConfigSection />
          <WindowConfigSection />
          <InsulationConfigSection />
          <RoofConfigSection />
          <VentilationConfigSection />
          <HvacClimateConfigSection />
          <ResultConfigSection />
          <div style={{ height: 80 }} />
        </div>

      </div>
    </LazyMotion>
  );
}
