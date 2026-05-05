import { useBuildingStore } from '../../../store/buildingStore';
import { MaterialDropdown } from '../controls/MaterialDropdown';
import { TechSlider } from '../controls/TechSlider';
import { ToggleGroup } from '../controls/ToggleGroup';
import { MATERIALS_DB } from '../../../engine/data/materials';

const INSUL_OPTS = Object.entries(MATERIALS_DB)
  .filter(([, m]) => ['isolant', 'isolant_bio'].includes(m.category))
  .map(([id, m]) => ({ value: id, label: m.name }));

const ROOF_TYPE_OPTS = [
  { value: 'flat_concrete',   label: 'Concrete flat roof' },
  { value: 'green',           label: 'Green roof' },
  { value: 'inclined_tiles',  label: 'Pitched roof (tiles)' },
  { value: 'cool_roof',       label: 'Cool roof (reflective)' },
] as const;

export function RoofSection() {
  const config = useBuildingStore((s) => s.config);
  const updateRoof = useBuildingStore((s) => s.updateRoof);
  const store = useBuildingStore();
  const { roof } = config;

  const insulThick = roof.insulation?.thickness ?? 0.18;
  const insulMat = roof.insulation?.material ?? 'polystyrene_expanse';
  const lambdaInsul = MATERIALS_DB[insulMat]?.lambda ?? 0.032;
  const U_roof = 1 / (0.10 + insulThick / lambdaInsul + 0.04);

  return (
    <div className="space-y-3">
      <ToggleGroup
        label="Roof type"
        value={roof.type}
        options={ROOF_TYPE_OPTS as unknown as Array<{ value: string; label: string }>}
        onChange={(v) => updateRoof({ type: v as typeof roof.type })}
      />

      <MaterialDropdown
        label="Roof insulation"
        value={insulMat}
        options={INSUL_OPTS}
        onChange={(v) => store.setConfig({
          ...config,
          roof: { ...roof, insulation: { material: v, thickness: insulThick } },
        })}
      />

      <TechSlider
        label="Insulation thickness"
        value={insulThick}
        min={0.04} max={0.40} step={0.01} unit="m" decimals={3}
        onChange={(v) => store.setConfig({
          ...config,
          roof: { ...roof, insulation: { material: insulMat, thickness: v } },
        })}
        critical={U_roof > 0.5}
      />

      <div className="flex justify-between text-xs font-mono mt-1">
        <span className="text-ink-3">Roof U-value</span>
        <span className={U_roof > 0.5 ? 'text-accent' : 'text-ink'}>
          {U_roof.toFixed(3)} W/(m²·K)
        </span>
      </div>
    </div>
  );
}
