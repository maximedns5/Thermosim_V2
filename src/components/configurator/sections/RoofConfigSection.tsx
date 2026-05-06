import { SectionCard } from '../SectionCard';
import { MetricPill } from '../MetricPill';
import { MaterialDropdown } from '../../config/controls/MaterialDropdown';
import { TechSlider } from '../../config/controls/TechSlider';
import { useBuildingStore } from '../../../store/buildingStore';
import { MATERIALS_DB } from '../../../engine/data/materials';
import { m } from 'framer-motion';

const INSUL_OPTS = Object.entries(MATERIALS_DB)
  .filter(([, m]) => ['isolant', 'isolant_bio'].includes(m.category))
  .map(([id, m]) => ({ value: id, label: m.name }));

const ROOF_TYPES = [
  { value: 'flat_concrete',  label: 'Flat concrete',  icon: '▬', color: '#8A8680' },
  { value: 'green',          label: 'Green roof',      icon: '🌿', color: '#4A8A4A' },
  { value: 'inclined_tiles', label: 'Pitched tiles',   icon: '⛺', color: '#8B4030' },
  { value: 'cool_roof',      label: 'Cool roof',       icon: '✦', color: '#C0C0C8' },
] as const;

export function RoofConfigSection() {
  const config = useBuildingStore(s => s.config);
  const updateRoof = useBuildingStore(s => s.updateRoof);
  const store = useBuildingStore();
  const { roof } = config;

  const insulThick = roof.insulation?.thickness ?? 0.18;
  const insulMat   = roof.insulation?.material ?? 'polystyrene_expanse';
  const lambda     = MATERIALS_DB[insulMat]?.lambda ?? 0.032;
  const U_roof     = 1 / (0.10 + insulThick / lambda + 0.04);

  return (
    <SectionCard index={4} title="Roof" subtitle="Roof type and insulation at the top of the building" accent="#8B4030"
      metrics={
        <div className="flex gap-2 flex-wrap">
          <MetricPill label="Roof U-value" value={U_roof} unit="W/(m²·K)" accent="#8B4030" critical={U_roof > 0.5} />
          <MetricPill label="Thickness" value={(insulThick * 100).toFixed(0)} unit="cm" accent="#6B6B6B" />
        </div>
      }>
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-3)', marginBottom: 8 }}>
          Roof type
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ROOF_TYPES.map(rt => (
            <m.button key={rt.value} onClick={() => updateRoof({ type: rt.value })}
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="cursor-pointer p-3 text-left rounded-sm"
              style={{
                background: roof.type === rt.value ? `${rt.color}18` : 'rgba(0,0,0,0.03)',
                border: `1px solid ${roof.type === rt.value ? rt.color : 'var(--color-rule)'}`,
                transition: 'border-color 200ms, background 200ms',
              }}>
              <div className="text-lg mb-1">{rt.icon}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-ink)', fontWeight: roof.type === rt.value ? 600 : 400 }}>
                {rt.label}
              </div>
            </m.button>
          ))}
        </div>
      </div>
      <MaterialDropdown label="Roof insulation" value={insulMat} options={INSUL_OPTS}
        onChange={v => store.setConfig({ ...config, roof: { ...roof, insulation: { material: v, thickness: insulThick } } })} />
      <TechSlider label="Insulation thickness" value={insulThick} min={0.04} max={0.40} step={0.01} unit="m" decimals={3}
        onChange={v => store.setConfig({ ...config, roof: { ...roof, insulation: { material: insulMat, thickness: v } } })}
        critical={U_roof > 0.5} />
    </SectionCard>
  );
}
