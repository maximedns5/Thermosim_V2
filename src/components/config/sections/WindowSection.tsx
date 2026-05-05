import { useBuildingStore } from '../../../store/buildingStore';
import { MaterialDropdown } from '../controls/MaterialDropdown';
import { TechSlider } from '../controls/TechSlider';
import { MetricSummary } from '../controls/MetricSummary';
import { GLAZING_DB, FRAME_DB } from '../../../engine/data/glazings';
import { SHADING_DEVICES } from '../../../engine/data/airtightness';
import { Window as WinModel } from '../../../engine/models/window';

const GLAZING_OPTS = Object.values(GLAZING_DB).map((g) => ({ value: g.id, label: `${g.name} — Ug=${g.Ug} W/(m²K)` }));
const FRAME_OPTS   = Object.values(FRAME_DB).map((f) => ({ value: f.id, label: `${f.name} — Uf=${f.Uf}` }));
const SHADING_OPTS = Object.values(SHADING_DEVICES).map((s) => ({ value: s.id, label: s.name }));

export function WindowSection() {
  const config = useBuildingStore((s) => s.config);
  const updateWindows = useBuildingStore((s) => s.updateWindows);
  const { windows } = config;

  const win = new WinModel(windows.glazingId, windows.frameId, 1);
  const Uw = win.Uw();
  const g = GLAZING_DB[windows.glazingId]?.g ?? 0;

  return (
    <div className="space-y-3">
      <MaterialDropdown label="Glazing" value={windows.glazingId} options={GLAZING_OPTS}
        onChange={(v) => updateWindows({ glazingId: v })} />
      <MaterialDropdown label="Frame" value={windows.frameId} options={FRAME_OPTS}
        onChange={(v) => updateWindows({ frameId: v })} />
      <MaterialDropdown label="Solar shading" value={windows.shadingId} options={SHADING_OPTS}
        onChange={(v) => updateWindows({ shadingId: v })} />

      <div className="section-rule" />
      <p className="text-xs font-sans text-ink-3 uppercase tracking-wide">Glazed surface ratio</p>
      {(['North', 'South', 'East', 'West'] as const).map((dir) => {
        const key = `ratio${dir}` as keyof typeof windows;
        return (
          <TechSlider key={dir}
            label={`Facade ${dir}`}
            value={windows[key] as number}
            min={0.05} max={0.80} step={0.01} unit="m/m" decimals={2}
            onChange={(v) => updateWindows({ [key]: v })}
          />
        );
      })}

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rule-soft">
        <MetricSummary label="Eff. Uw" value={Uw} unit="W/(m²·K)" critical={Uw > 2.5} />
        <MetricSummary label="g glazing" value={g} unit="" />
      </div>
    </div>
  );
}
