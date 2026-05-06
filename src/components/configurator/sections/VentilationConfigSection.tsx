import { SectionCard } from '../SectionCard';
import { MetricPill } from '../MetricPill';
import { MaterialDropdown } from '../../config/controls/MaterialDropdown';
import { TechSlider } from '../../config/controls/TechSlider';
import { useBuildingStore } from '../../../store/buildingStore';
import { VMC_TYPES } from '../../../engine/data/hvac';
import { AIRTIGHTNESS_LEVELS } from '../../../engine/data/airtightness';

const VMC_OPTS = Object.values(VMC_TYPES).map(v => ({ value: v.id, label: v.name }));
const AIR_OPTS = Object.values(AIRTIGHTNESS_LEVELS).map(a => ({ value: a.id, label: `${a.name} — n50=${a.n50}` }));

export function VentilationConfigSection() {
  const config = useBuildingStore(s => s.config);
  const updateVentilation = useBuildingStore(s => s.updateVentilation);
  const { ventilation } = config;
  const selectedVmc = VMC_TYPES[ventilation.vmcId];
  const recup = selectedVmc ? `${(selectedVmc.recup * 100).toFixed(0)}%` : '—';
  const selectedAirtight = Object.values(AIRTIGHTNESS_LEVELS).find(a => Math.abs(a.n50 - ventilation.n50) < 0.1);

  return (
    <SectionCard
      index={5}
      title="Ventilation"
      subtitle="Système VMC, étanchéité à l'air et débits hygieniques"
      accent="#4A8A4A"
      metrics={
        <div className="flex gap-2 flex-wrap">
          <MetricPill label="n50" value={ventilation.n50} unit="vol/h" accent="#4A8A4A" critical={ventilation.n50 > 7} />
          <MetricPill label="Récup. chaleur" value={recup} accent="#0B7A63" />
          <MetricPill label="Débit" value={ventilation.q_v_hygienique} unit="m³/h" accent="#4A7FA8" />
        </div>
      }
    >
      <MaterialDropdown label="Type VMC" value={ventilation.vmcId} options={VMC_OPTS}
        onChange={v => updateVentilation({ vmcId: v })}
        hint={selectedVmc ? `Récupération ${recup} · ${selectedVmc.conso_W_m3h} W/(m³/h)` : undefined} />
      <MaterialDropdown label="Étanchéité à l'air" value={selectedAirtight?.id ?? 'standard'} options={AIR_OPTS}
        onChange={v => { const a = AIRTIGHTNESS_LEVELS[v]; if (a) updateVentilation({ n50: a.n50 }); }} />
      <TechSlider label="n50 (test Blower Door)" value={ventilation.n50} min={0.3} max={20} step={0.1} unit="vol/h" decimals={1}
        onChange={v => updateVentilation({ n50: v })} critical={ventilation.n50 > 7} />
      <TechSlider label="Débit hygiénique" value={ventilation.q_v_hygienique} min={0} max={1000} step={10} unit="m³/h" decimals={0}
        onChange={v => updateVentilation({ q_v_hygienique: v })} />
    </SectionCard>
  );
}
