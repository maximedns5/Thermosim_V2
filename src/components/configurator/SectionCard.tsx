// SectionCard — carte glassmorphism avec reveal scroll, Space Grotesk
import { useRef } from 'react';
import { m, useInView } from 'framer-motion';

interface SectionCardProps {
  index: number;           // 01, 02…
  title: string;
  subtitle: string;
  accent?: string;         // couleur de l'accent (hex)
  children: React.ReactNode;
  metrics?: React.ReactNode; // bloc métriques temps réel
}

const ACCENTS = [
  '#4A7FA8', '#0B7A63', '#C1440E', '#8B4030',
  '#4A8A4A', '#7060A8', '#1A3550',
];

export function SectionCard({ index, title, subtitle, accent, children, metrics }: SectionCardProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-15% 0px -15% 0px' });
  const color = accent ?? ACCENTS[(index - 1) % ACCENTS.length];

  return (
    <section
      ref={ref}
      className="min-h-screen flex flex-col justify-center px-10 py-16"
    >
      {/* Numéro de section */}
      <m.div
        initial={{ opacity: 0, x: -24 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 mb-6"
      >
        <span
          className="font-mono text-xs tracking-widest"
          style={{ color: `${color}99` }}
        >
          {String(index).padStart(2, '0')}
        </span>
        <div className="h-px flex-1" style={{ background: `${color}33` }} />
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </m.div>

      {/* Titre */}
      <m.h2
        initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
        animate={inView
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: 28, filter: 'blur(8px)' }}
        transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="mb-2 leading-none"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(2rem, 4vw, 3.2rem)',
          color: 'var(--color-ink)',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </m.h2>

      {/* Sous-titre */}
      <m.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--color-ink-3)',
          letterSpacing: '0.02em',
        }}
      >
        {subtitle}
      </m.p>

      {/* Carte contrôles */}
      <m.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={inView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 32, scale: 0.97 }}
        transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-sm p-6 space-y-4"
        style={{
          background: 'rgba(242,239,232,0.7)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${color}22`,
          boxShadow: `0 0 0 1px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)`,
        }}
      >
        {children}
      </m.div>

      {/* Métriques temps réel */}
      {metrics && (
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.45, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4"
        >
          {metrics}
        </m.div>
      )}
    </section>
  );
}
