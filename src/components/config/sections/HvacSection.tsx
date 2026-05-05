import { useBuildingStore } from '../../../store/buildingStore';
import { MaterialDropdown } from '../controls/MaterialDropdown';
import { TechSlider } from '../controls/TechSlider';
import { HEATING_SYSTEMS, COOLING_SYSTEMS, ECS_SYSTEMS } from '../../../engine/data/hvac';

const HEAT_OPTS  = Object.values(HEATING_SYSTEMS).map((h) => ({ value: h.id, label: h.name }));
const COOL_OPTS  = [{ value: '', label: 'None' }, ...Object.values(COOLING_SYSTEMS).filter((c) => c.id !== 'aucune').map((c) => ({ value: c.id, label: c.name }))];
const ECS_OPTS   = Object.values(ECS_SYSTEMS).map((e) => ({ value: e.id, label: e.name }));

export function HvacSection() {
  const config = useBuildingStore((s) => s.config);
  const updateHvac = useBuildingStore((s) => s.updateHvac);
  const { hvac } = config;

  const heatSys = HEATING_SYSTEMS[hvac.heatingId];

  return (
    <div className="space-y-3">
      <MaterialDropdown
        label="Heating system"
        value={hvac.heatingId}
        options={HEAT_OPTS}
        onChange={(v) => updateHvac({ heatingId: v })}
        hint={heatSys ? `${heatSys.energy_vector}  •  η=${(heatSys.eta_generation * 100).toFixed(0)} %${heatSys.COP_nominal ? `  •  COP=${heatSys.COP_nominal}` : ''}` : undefined}
      />

      <MaterialDropdown
        label="Cooling"
        value={hvac.coolingId ?? ''}
        options={COOL_OPTS}
        onChange={(v) => updateHvac({ coolingId: v || null })}
      />

      <MaterialDropdown
        label="ECS"
        value={hvac.ecsId}
        options={ECS_OPTS}
        onChange={(v) => updateHvac({ ecsId: v })}
      />

      <TechSlider label="Heating setpoint" value={hvac.T_set_heat} min={15} max={24} step={0.5} unit="°C" decimals={1}
        onChange={(v) => updateHvac({ T_set_heat: v })} />
      <TechSlider label="Cooling setpoint" value={hvac.T_set_cool ?? 26} min={22} max={30} step={0.5} unit="°C" decimals={1}
        onChange={(v) => updateHvac({ T_set_cool: v })} />
    </div>
  );
}
