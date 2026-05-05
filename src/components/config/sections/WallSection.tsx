import { useBuildingStore } from '../../../store/buildingStore';
import { MaterialDropdown } from '../controls/MaterialDropdown';
import { TechSlider } from '../controls/TechSlider';
import { ToggleGroup } from '../controls/ToggleGroup';
import { MetricSummary } from '../controls/MetricSummary';
import { MATERIALS_DB, MATERIAL_CATEGORIES } from '../../../engine/data/materials';
import { Wall } from '../../../engine/models/wall';
import type { Layer } from '../../../engine/types';

const STRUCT_OPTIONS = Object.entries(MATERIALS_DB)
  .filter(([, m]) => ['structure', 'maconnerie'].includes(m.category))
  .map(([id, m]) => ({ value: id, label: m.name }));

const INSUL_OPTIONS = Object.entries(MATERIALS_DB)
  .filter(([, m]) => ['isolant', 'isolant_bio'].includes(m.category))
  .map(([id, m]) => ({ value: id, label: m.name }));

export function WallSection() {
  const config = useBuildingStore((s) => s.config);
  const updateInsulPos = useBuildingStore((s) => s.updateGeometry);
  const setWallLayers = useBuildingStore((s) => s.setWallLayers);
  const store = useBuildingStore();
  const { wallLayers, insulationPosition } = config;

  // Identify structure and insulation layers
  const structIdx = wallLayers.findIndex((l) => ['structure', 'maconnerie'].includes(MATERIALS_DB[l.material]?.category ?? ''));
  const insulIdx  = wallLayers.findIndex((l) => ['isolant', 'isolant_bio'].includes(MATERIALS_DB[l.material]?.category ?? ''));

  const updateLayer = (idx: number, patch: Partial<Layer>) => {
    const next = wallLayers.map((l, i) => i === idx ? { ...l, ...patch } : l);
    setWallLayers(next);
  };

  const wall = new Wall(wallLayers, 1);
  const U = wall.U();
  const R = wall.Rtotal();
  const thick_cm = wall.thickness() * 100;

  return (
    <div className="space-y-3">
      <ToggleGroup
        label="Insulation position"
        value={insulationPosition}
        options={[
          { value: 'ITI', label: 'ITI' },
          { value: 'ITE', label: 'ITE' },
          { value: 'AUCUNE', label: 'None' },
        ]}
        onChange={(v) => store.setConfig({ ...config, insulationPosition: v as 'ITI' | 'ITE' | 'AUCUNE' })}
      />

      {structIdx >= 0 && (
        <MaterialDropdown
          label="Structural material"
          value={wallLayers[structIdx].material}
          options={STRUCT_OPTIONS}
          onChange={(v) => updateLayer(structIdx, { material: v })}
        />
      )}

      {insulIdx >= 0 && (
        <>
          <MaterialDropdown
            label="Insulation material"
            value={wallLayers[insulIdx].material}
            options={INSUL_OPTIONS}
            onChange={(v) => updateLayer(insulIdx, { material: v })}
          />
          <TechSlider
            label="Insulation thickness"
            value={wallLayers[insulIdx].thickness}
            min={0.02} max={0.40} step={0.005} unit="m" decimals={3}
            onChange={(v) => updateLayer(insulIdx, { thickness: v })}
          />
        </>
      )}

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rule-soft">
        <MetricSummary label="U" value={U} unit="W/(m²·K)" critical={U > 1.5} />
        <MetricSummary label="R" value={R} unit="m²·K/W" />
        <MetricSummary label="Thk." value={thick_cm} unit="cm" />
      </div>
    </div>
  );
}


