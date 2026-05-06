import { SectionCard } from '../SectionCard';
import { MetricPill } from '../MetricPill';
import { MaterialDropdown } from '../../config/controls/MaterialDropdown';
import { TechSlider } from '../../config/controls/TechSlider';
import { ToggleGroup } from '../../config/controls/ToggleGroup';
import { useBuildingStore } from '../../../store/buildingStore';
import { HEATING_SYSTEMS, COOLING_SYSTEMS, ECS_SYSTEMS } from '../../../engine/data/hvac';
import { m } from 'framer-motion';

const HEAT_OPTS = Object.values(HEATING_SYSTEMS).map(h => ({ value: h.id, label: h.name }));
const COOL_OPTS = [{ value: '', label: 'None' }, ...Object.values(COOLING_SYSTEMS).filter(c => c.id !== 'aucune').map(c => ({ value: c.id, label: c.name }))];
const ECS_OPTS  = Object.values(ECS_SYSTEMS).map(e => ({ value: e.id, label: e.name }));

const CITIES = [
  { value: 'paris',       label: 'Paris',       emoji: '🗼' },
  { value: 'marseille',   label: 'Marseille',   emoji: '⛵' },
  { value: 'lyon',        label: 'Lyon',        emoji: '🦁' },
  { value: 'bordeaux',    label: 'Bordeaux',    emoji: '🍷' },
  { value: 'strasbourg',  label: 'Strasbourg',  emoji: '🥨' },
  { value: 'brest',       label: 'Brest',       emoji: '🌊' },
  { value: 'perpignan',   label: 'Perpignan',   emoji: '☀' },
  { value: 'clermont',    label: 'Clermont',    emoji: '🌋' },
];

const TERRAIN_OPTS = [
  { value: 'campagne',     label: 'Rural' },
  { value: 'suburbain',    label: 'Suburban' },
  { value: 'urbain',       label: 'Urban' },
  { value: 'centre_ville', label: 'City centre' },
] as const;

export function HvacClimateConfigSection() {
  const config = useBuildingStore(s => s.config);
  const updateHvac = useBuildingStore(s => s.updateHvac);
  const updateTerrain = useBuildingStore(s => s.updateTerrain);
  const { hvac, terrain } = config;
  const heatSys = HEATING_SYSTEMS[hvac.heatingId];

  return (
    <SectionCard index={6} title="HVAC & Climate" subtitle="Heating, cooling systems and climate zone" accent="#7060A8"
      metrics={
        <div className="flex gap-2 flex-wrap">
          <MetricPill label="Heating" value={heatSys?.name?.split(' ').slice(0, 2).join(' ') ?? '—'} accent="#7060A8" />
          {heatSys?.COP_nominal && <MetricPill label="COP" value={heatSys.COP_nominal} accent="#0B7A63" />}
          <MetricPill label="Heat setpoint" value={hvac.T_set_heat} unit="°C" accent="#C1440E" />
        </div>
      }>
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-3)', marginBottom: 8 }}>
          Climate zone
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {CITIES.map(c => (
            <m.button key={c.value} onClick={() => updateTerrain({ climateCity: c.value })}
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="cursor-pointer p-2 rounded-sm text-center"
              style={{
                background: terrain.climateCity === c.value ? 'rgba(112,96,168,0.15)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${terrain.climateCity === c.value ? '#7060A8' : 'var(--color-rule)'}`,
                transition: 'all 200ms',
              }}>
              <div style={{ fontSize: 16 }}>{c.emoji}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--color-ink-3)', marginTop: 2 }}>
                {c.label}
              </div>
            </m.button>
          ))}
        </div>
      </div>
      <ToggleGroup label="Site context" value={terrain.terrain}
        options={TERRAIN_OPTS as unknown as Array<{ value: string; label: string }>}
        onChange={v => updateTerrain({ terrain: v as typeof terrain.terrain })} />
      <MaterialDropdown label="Heating system" value={hvac.heatingId} options={HEAT_OPTS}
        onChange={v => updateHvac({ heatingId: v })}
        hint={heatSys ? `${heatSys.energy_vector} · η=${(heatSys.eta_generation * 100).toFixed(0)}%${heatSys.COP_nominal ? ` · COP=${heatSys.COP_nominal}` : ''}` : undefined} />
      <MaterialDropdown label="Cooling" value={hvac.coolingId ?? ''} options={COOL_OPTS}
        onChange={v => updateHvac({ coolingId: v || null })} />
      <MaterialDropdown label="Hot water (DHW)" value={hvac.ecsId} options={ECS_OPTS}
        onChange={v => updateHvac({ ecsId: v })} />
      <div className="grid grid-cols-2 gap-3">
        <TechSlider label="Heating setpoint" value={hvac.T_set_heat} min={15} max={24} step={0.5} unit="°C" decimals={1}
          onChange={v => updateHvac({ T_set_heat: v })} />
        <TechSlider label="Cooling setpoint" value={hvac.T_set_cool ?? 26} min={22} max={30} step={0.5} unit="°C" decimals={1}
          onChange={v => updateHvac({ T_set_cool: v })} />
      </div>
    </SectionCard>
  );
}
