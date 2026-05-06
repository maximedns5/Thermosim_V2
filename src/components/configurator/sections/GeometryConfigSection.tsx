import { SectionCard } from '../SectionCard';
import { MetricPill } from '../MetricPill';
import { TechSlider } from '../../config/controls/TechSlider';
import { NumberField } from '../../config/controls/NumberField';
import { useBuildingStore } from '../../../store/buildingStore';
import { m } from 'framer-motion';

export function GeometryConfigSection() {
  const config = useBuildingStore(s => s.config);
  const updateGeometry = useBuildingStore(s => s.updateGeometry);
  const { geometry } = config;
  const surface = geometry.length * geometry.width * geometry.nFloors;
  const volume  = surface * geometry.floorHeight;

  return (
    <SectionCard index={1} title="Geometry" subtitle="Define the building footprint and height" accent="#4A7FA8"
      metrics={
        <div className="flex gap-2 flex-wrap">
          <MetricPill label="Total floor area" value={surface.toFixed(0)} unit="m²" accent="#4A7FA8" />
          <MetricPill label="Volume" value={volume.toFixed(0)} unit="m³" accent="#4A7FA8" />
          <MetricPill label="Height" value={(geometry.nFloors * geometry.floorHeight).toFixed(1)} unit="m" accent="#4A7FA8" />
        </div>
      }>
      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Length" value={geometry.length} min={5} max={60} step={0.5} unit="m" decimals={1}
          onChange={v => updateGeometry({ length: v })} />
        <NumberField label="Width" value={geometry.width} min={4} max={30} step={0.5} unit="m" decimals={1}
          onChange={v => updateGeometry({ width: v })} />
      </div>
      <TechSlider label="Floor-to-ceiling height" value={geometry.floorHeight} min={2.4} max={3.5} step={0.05} unit="m" decimals={2}
        onChange={v => updateGeometry({ floorHeight: v })} />
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-3)', marginBottom: 8 }}>
          Number of floors
        </p>
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5,6,8,10].map(n => (
            <m.button key={n} onClick={() => updateGeometry({ nFloors: n })}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-sm"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 12,
                fontWeight: geometry.nFloors === n ? 600 : 400,
                background: geometry.nFloors === n ? '#1A3550' : 'rgba(26,53,80,0.07)',
                color: geometry.nFloors === n ? '#E8E4DA' : 'var(--color-ink-3)',
                border: geometry.nFloors === n ? 'none' : '1px solid var(--color-rule)',
                transition: 'background 200ms, color 200ms',
              }}>
              {n}
            </m.button>
          ))}
        </div>
      </div>
      <TechSlider label="Main facade orientation" value={geometry.orientation} min={0} max={360} step={5} unit="°" decimals={0}
        onChange={v => updateGeometry({ orientation: v })} />
    </SectionCard>
  );
}
