// ResultConfigSection — section finale, bâtiment complet + métriques DPE
import { useRef } from 'react';
import { m, useInView } from 'framer-motion';
import { useDerivedMetrics } from '../../../hooks/useDerivedMetrics';
import { useBuildingStore } from '../../../store/buildingStore';
import { useUIStore } from '../../../store/uiStore';
import { useSimulation } from '../../../hooks/useSimulation';
import { DpeLabel } from '../../charts/DpeLabel';
import { FlipCounter } from '../../ui/FlipCounter';
import { SCENARIOS } from '../../../engine/data/scenarios';

const DPE_DESCRIPTIONS: Record<string, string> = {
  A: 'Bâtiment à énergie quasi-nulle — exemplaire',
  B: 'Très haute performance énergétique',
  C: 'Bonne performance — standard neuf',
  D: 'Performance moyenne — rénovation partielle',
  E: 'Consommation élevée — travaux nécessaires',
  F: 'Très énergivore — passoire thermique',
  G: 'Extrêmement énergivore — urgence rénovation',
};

const DPE_BORDER: Record<string, string> = {
  A: '#009a44', B: '#51b84c', C: '#c3d300',
  D: '#f7d400', E: '#f7a600', F: '#f06a00', G: '#e2001a',
};

interface KpiCardProps {
  label: string;
  value: number;
  unit: string;
  decimals?: number;
  critical?: boolean;
  delay?: number;
  inView: boolean;
}

function KpiCard({ label, value, unit, decimals = 0, critical, delay = 0, inView }: KpiCardProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col p-4 rounded-sm"
      style={{
        background: 'rgba(10,13,18,0.04)',
        border: '1px solid rgba(10,13,18,0.08)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: 'var(--color-ink-4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </span>
      <FlipCounter value={value} decimals={decimals} unit={unit} critical={critical} className="text-lg" />
    </m.div>
  );
}

export function ResultConfigSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-10% 0px -10% 0px' });
  const m_ = useDerivedMetrics();
  const { applyScenario } = useBuildingStore();
  const { runDynamic } = useSimulation();
  const { isSimRunning } = useUIStore();
  const critical = m_.dpe === 'F' || m_.dpe === 'G';
  const borderColor = DPE_BORDER[m_.dpe] ?? '#4A7FA8';

  return (
    <section
      ref={ref}
      className="min-h-screen flex flex-col justify-center px-10 py-16"
    >
      {/* Header section */}
      <m.div
        initial={{ opacity: 0, x: -24 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 mb-6"
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(74,127,168,0.6)', letterSpacing: '0.12em' }}>07</span>
        <div className="h-px flex-1" style={{ background: `${borderColor}33` }} />
        <m.span
          animate={{ boxShadow: inView ? `0 0 16px ${borderColor}` : '0 0 0px transparent' }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          className="w-2 h-2 rounded-full"
          style={{ background: borderColor }}
        />
      </m.div>

      <m.h2
        initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
        animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 28, filter: 'blur(8px)' }}
        transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: 6 }}
      >
        Résultat Final
      </m.h2>

      <m.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.5, delay: 0.16 }}
        style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-3)', marginBottom: 28 }}
      >
        Performance énergétique calculée selon la méthodologie RE2020
      </m.p>

      {/* DPE Hero */}
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.6, delay: 0.22, type: 'spring', stiffness: 160, damping: 20 }}
        className="flex items-center gap-5 p-5 rounded-sm mb-4"
        style={{
          background: `${borderColor}0D`,
          border: `1.5px solid ${borderColor}40`,
          boxShadow: `0 0 32px ${borderColor}15`,
        }}
      >
        <DpeLabel letter={m_.dpe} compact dark />
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--color-ink)', marginBottom: 2 }}>
            Classe {m_.dpe}
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-ink-3)' }}>
            {DPE_DESCRIPTIONS[m_.dpe]}
          </p>
        </div>
      </m.div>

      {/* KPIs grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <KpiCard label="EP primaire" value={m_.EP_m2} unit="kWhEP/(m²·an)" inView={inView} delay={0.3} critical={critical} />
        <KpiCard label="CO₂" value={m_.CO2_m2} decimals={1} unit="kgCO₂/(m²·an)" inView={inView} delay={0.36} critical={critical} />
        <KpiCard label="Déperditions" value={m_.Q_design_W / 1000} decimals={1} unit="kW" inView={inView} delay={0.42} />
        <KpiCard label="Coût annuel" value={m_.cost_eur} unit="€/an" inView={inView} delay={0.48} />
      </div>

      {/* U paroi résumé */}
      <m.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.55 }}
        className="flex gap-3 mb-6 flex-wrap"
      >
        {[
          { l: 'U paroi', v: `${m_.U_wall.toFixed(3)} W/(m²·K)` },
          { l: 'R paroi', v: `${m_.R_wall.toFixed(2)} m²·K/W` },
        ].map(({ l, v }) => (
          <div key={l} className="flex items-center gap-2 px-3 py-1.5 rounded-sm"
            style={{ background: 'rgba(26,53,80,0.07)', border: '1px solid rgba(26,53,80,0.12)' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-accent-primary)' }}>{v}</span>
          </div>
        ))}
      </m.div>

      {/* Bouton simulation */}
      <m.button
        onClick={() => { void runDynamic(); }}
        disabled={isSimRunning}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ delay: 0.62 }}
        whileHover={isSimRunning ? {} : { scale: 1.02, boxShadow: '0 0 24px rgba(26,53,80,0.35)' }}
        whileTap={isSimRunning ? {} : { scale: 0.97 }}
        className="w-full py-4 rounded-sm cursor-pointer mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'var(--color-accent-primary)', color: 'var(--color-ink-inv)',
          border: 'none',
          animation: isSimRunning ? 'simPulse 1.5s ease-in-out infinite' : 'none',
        }}
      >
        {isSimRunning ? 'Simulation en cours…' : '▷  Lancer simulation dynamique 8760h'}
      </m.button>

      {/* Scénarios rapides */}
      <m.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.7 }}
      >
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-4)', marginBottom: 8 }}>
          Comparer des scénarios
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {Object.values(SCENARIOS).slice(0, 4).map((s, i) => (
            <m.button
              key={s.id}
              onClick={() => applyScenario(s)}
              whileHover={{ x: 4, backgroundColor: 'rgba(26,53,80,0.07)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="text-left px-3 py-2 rounded-sm cursor-pointer"
              style={{ background: 'transparent', border: '1px solid var(--color-rule-soft)' }}
            >
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-ink)' }}>{s.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', marginTop: 1 }}>{s.hint}</div>
            </m.button>
          ))}
        </div>
      </m.div>
    </section>
  );
}
