import { useBuildingStore } from '../../../store/buildingStore';
import { MaterialDropdown } from '../controls/MaterialDropdown';
import { TechSlider } from '../controls/TechSlider';
import { MetricSummary } from '../controls/MetricSummary';
import { VMC_TYPES } from '../../../engine/data/hvac';
import { AIRTIGHTNESS_LEVELS } from '../../../engine/data/airtightness';

const VMC_OPTS = Object.values(VMC_TYPES).map((v) => ({ value: v.id, label: v.name }));
const AIR_OPTS = Object.values(AIRTIGHTNESS_LEVELS).map((a) => ({ value: a.id, label: `${a.name} — n50=${a.n50}` }));

export function VentilationSection() {
  const config = useBuildingStore((s) => s.config);
  const updateVentilation = useBuildingStore((s) => s.updateVentilation);
  const store = useBuildingStore();
  const { ventilation } = config;

  const selectedAirtight = Object.values(AIRTIGHTNESS_LEVELS).find((a) => Math.abs(a.n50 - ventilation.n50) < 0.1);
  const selectedVmc = VMC_TYPES[ventilation.vmcId];

  return (
    <div className="space-y-3">
      <MaterialDropdown
        label="Ventilation type"
        value={ventilation.vmcId}
        options={VMC_OPTS}
        onChange={(v) => updateVentilation({ vmcId: v })}
        hint={selectedVmc ? `Heat recovery ${(selectedVmc.recup * 100).toFixed(0)} %  •  ${selectedVmc.conso_W_m3h} W/(m³/h)` : undefined}
      />

      <MaterialDropdown
        label="Airtightness"
        value={selectedAirtight?.id ?? 'standard'}
        options={AIR_OPTS}
        onChange={(v) => {
          const a = AIRTIGHTNESS_LEVELS[v];
          if (a) updateVentilation({ n50: a.n50 });
        }}
      />

      <TechSlider
        label="n50 (blower-door test)"
        value={ventilation.n50}
        min={0.3} max={20} step={0.1} unit="vol/h" decimals={1}
        onChange={(v) => updateVentilation({ n50: v })}
        critical={ventilation.n50 > 7}
      />

      <TechSlider
        label="Hygienic airflow"
        value={ventilation.q_v_hygienique}
        min={0} max={1000} step={10} unit="m³/h" decimals={0}
        onChange={(v) => updateVentilation({ q_v_hygienique: v })}
      />

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rule-soft">
        <MetricSummary label="n50" value={ventilation.n50} unit="vol/h" critical={ventilation.n50 > 7} />
        <MetricSummary label="Flow" value={ventilation.q_v_hygienique} unit="m³/h" />
      </div>
    </div>
  );
}
