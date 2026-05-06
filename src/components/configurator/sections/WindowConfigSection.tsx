import { SectionCard } from '../SectionCard';
import { MetricPill } from '../MetricPill';
import { MaterialDropdown } from '../../config/controls/MaterialDropdown';
import { TechSlider } from '../../config/controls/TechSlider';
import { useBuildingStore } from '../../../store/buildingStore';
import { GLAZING_DB, FRAME_DB } from '../../../engine/data/glazings';
import { SHADING_DEVICES } from '../../../engine/data/airtightness';
import { Window as WinModel } from '../../../engine/models/window';

const GLAZING_OPTS = Object.values(GLAZING_DB).map(g => ({ value: g.id, label: g.name }));
const FRAME_OPTS   = Object.values(FRAME_DB).map(f => ({ value: f.id, label: f.name }));
const SHADING_OPTS = Object.values(SHADING_DEVICES).map(s => ({ value: s.id, label: s.name }));

const FACADES = [
  { key: 'ratioSouth' as const, label: 'South ☀', accent: '#C1440E' },
  { key: 'ratioNorth' as const, label: 'North',    accent: '#4A7FA8' },
  { key: 'ratioEast'  as const, label: 'East →',   accent: '#0B7A63' },
  { key: 'ratioWest'  as const, label: '← West',   accent: '#7060A8' },
];

export function WindowConfigSection() {
  const config = useBuildingStore(s => s.config);
  const updateWindows = useBuildingStore(s => s.updateWindows);
  const { windows } = config;
  const win = new WinModel(windows.glazingId, windows.frameId, 1);
  const Uw = win.Uw();
  const g  = GLAZING_DB[windows.glazingId]?.g ?? 0;

  return (
    <SectionCard index={2} title="Glazing" subtitle="Type, performance and glazed ratio per facade" accent="#0B7A63"
      metrics={
        <div className="flex gap-2 flex-wrap">
          <MetricPill label="Effective Uw" value={Uw} unit="W/(m²·K)" accent="#0B7A63" critical={Uw > 2.5} />
          <MetricPill label="Solar factor g" value={g} accent="#0B7A63" />
        </div>
      }>
      <MaterialDropdown label="Glazing type" value={windows.glazingId} options={GLAZING_OPTS}
        onChange={v => updateWindows({ glazingId: v })} />
      <MaterialDropdown label="Frame" value={windows.frameId} options={FRAME_OPTS}
        onChange={v => updateWindows({ frameId: v })} />
      <MaterialDropdown label="Solar shading" value={windows.shadingId} options={SHADING_OPTS}
        onChange={v => updateWindows({ shadingId: v })} />
      <div style={{ borderTop: '1px solid var(--color-rule-soft)', paddingTop: 12, marginTop: 4 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-3)', marginBottom: 8 }}>
          Glazed surface ratio per facade
        </p>
        <div className="space-y-1">
          {FACADES.map(({ key, label, accent }) => (
            <div key={key} className="flex items-center gap-3">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accent, width: 56, flexShrink: 0 }}>{label}</span>
              <div className="flex-1">
                <TechSlider label="" value={windows[key] as number} min={0.05} max={0.80} step={0.01} unit="" decimals={0}
                  onChange={v => updateWindows({ [key]: v })} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent, width: 32, textAlign: 'right' }}>
                {Math.round((windows[key] as number) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
