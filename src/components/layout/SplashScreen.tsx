// SplashScreen — entry screen
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const exitVariant = {
  opacity: 0, scale: 0.97, filter: 'blur(4px)',
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export function SplashScreen() {
  const setAppUnlocked = useUIStore(s => s.setAppUnlocked);
  return (
    <LazyMotion features={domAnimation}>
      <m.div className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
        style={{ backgroundColor: '#0A0D12' }} exit={exitVariant}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 2px, transparent 2px)',
          backgroundSize: '40px 40px',
        }} />
        <m.div className="relative flex flex-col items-center gap-0" variants={container} initial="hidden" animate="show">
          <m.h1 variants={item} style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 700, letterSpacing: '0.18em', color: '#E8E4DA', lineHeight: 1,
          }}>
            THERMOSIM
          </m.h1>
          <m.div variants={item} className="relative flex items-center justify-center mt-5 mb-4" style={{ width: 120 }}>
            <div style={{ height: 1, width: '100%', background: 'rgba(232,228,218,0.15)' }} />
            <div className="absolute" style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(232,228,218,0.35)' }} />
          </m.div>
          <m.p variants={item} style={{
            fontFamily: 'var(--font-display)', fontWeight: 400,
            fontSize: 'clamp(0.9rem, 1.5vw, 1.15rem)',
            color: 'rgba(232,228,218,0.55)', textAlign: 'center', maxWidth: '38ch', lineHeight: 1.5,
          }}>
            Building energy performance,<br />simulated with real-world precision.
          </m.p>
          <m.button variants={item} onClick={() => setAppUnlocked(true)}
            whileHover={{ backgroundColor: 'rgba(232,228,218,0.08)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="mt-10 px-8 py-3 cursor-pointer"
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.75rem',
              letterSpacing: '0.2em', color: '#E8E4DA',
              border: '1px solid rgba(232,228,218,0.25)', borderRadius: 3, background: 'transparent',
            }}>
            ENTER
          </m.button>
        </m.div>
        <div className="absolute" style={{
          bottom: 24, fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: '0.08em', color: 'rgba(232,228,218,0.2)',
        }}>
          THERMOSIM · v2.0.0 · RE2020
        </div>
      </m.div>
    </LazyMotion>
  );
}
