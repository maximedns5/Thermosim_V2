import { SectionCard } from '../SectionCard';
import { MetricPill } from '../MetricPill';
import { MaterialDropdown } from '../../config/controls/MaterialDropdown';
import { TechSlider } from '../../config/controls/TechSlider';
import { ToggleGroup } from '../../config/controls/ToggleGroup';
import { useBuildingStore } from '../../../store/buildingStore';
import { MATERIALS_DB } from '../../../engine/data/materials';
import { Wall } from '../../../engine/models/wall';
import type { Layer } from '../../../engine/types';
import { m } from 'framer-motion';

const STRUCT_OPTS = Object.entries(MATERIALS_DB)
  .filter(([, m]) => ['structure', 'maconnerie'].includes(m.category))
  .map(([id, m]) => ({ value: id, label: m.name }));

const INSUL_OPTS = Object.entries(MATERIALS_DB)
  .filter(([, m]) => ['isolant', 'isolant_bio'].includes(m.category))
  .map(([id, m]) => ({ value: id, label: m.name }));

// Couleurs des isolants pour visualisation
const INSUL_COLOR_MAP: Record<string, string> = {
  laine_de_verre_32: '#F0C040', laine_de_verre_35: '#EAB830',
  laine_roche_40: '#D4A030', polystyrene_expanse: '#F5F0E4',
  polystyrene_extrude: '#E8E4F0', polyurethane: '#F8E4A0',
  laine_bois: '#8BC48A', chanvre: '#A0C870', ouate_cellulose: '#B8C8A0',
};

export function InsulationConfigSection() {
  const config = useBuildingStore(s => s.config);
  const store  = useBuildingStore();
  const { wallLayers, insulationPosition } = config;

  const structIdx = wallLayers.findIndex(l => ['structure', 'maconnerie'].includes(MATERIALS_DB[l.material]?.category ?? ''));
  const insulIdx  = wallLayers.findIndex(l => ['isolant', 'isolant_bio'].includes(MATERIALS_DB[l.material]?.category ?? ''));

  const updateLayer = (idx: number, patch: Partial<Layer>) => {
    const next = wallLayers.map((l, i) => i === idx ? { ...l, ...patch } : l);
    store.setWallLayers(next);
  };

  const wall = new Wall(wallLayers, 1);
  const U = wall.U();
  const R = wall.Rtotal();
  const thick = wall.thickness() * 100;
  const insulMat = insulIdx >= 0 ? wallLayers[insulIdx].material : '';
  const insulColor = INSUL_COLOR_MAP[insulMat] ?? '#F0C040';

  return (
    <SectionCard
      index={3}
      title="Isolation"
      subtitle="Position, matériau et épaisseur de l'isolant"
      accent="#C1440E"
      metrics={
        <div className="flex gap-2 flex-wrap">
          <MetricPill label="U paroi" value={U} unit="W/(m²·K)" accent="#C1440E" critical={U > 0.5} />
          <MetricPill label="R paroi" value={R} unit="m²·K/W" accent="#1A3550" />
          <MetricPill label="Épaisseur" value={thick.toFixed(0)} unit="cm" accent="#6B6B6B" />
        </div>
      }
    >
      <ToggleGroup
        label="Position de l'isolation"
        value={insulationPosition}
        options={[
          { value: 'ITI', label: 'ITI — Intérieur' },
          { value: 'ITE', label: 'ITE — Extérieur' },
          { value: 'AUCUNE', label: 'Aucune' },
        ]}
        onChange={v => store.setConfig({ ...config, insulationPosition: v as 'ITI' | 'ITE' | 'AUCUNE' })}
      />
      {structIdx >= 0 && (
        <MaterialDropdown label="Matériau structurel" value={wallLayers[structIdx].material}
          options={STRUCT_OPTS} onChange={v => updateLayer(structIdx, { material: v })} />
      )}
      {insulIdx >= 0 && insulationPosition !== 'AUCUNE' && (
        <>
          {/* Swatch couleur isolant */}
          <div className="flex items-center gap-2 py-1">
            <m.div
              animate={{ background: insulColor }}
              transition={{ duration: 0.5 }}
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ border: '1px solid rgba(0,0,0,0.12)' }}
            />
            <MaterialDropdown label="Matériau isolant" value={wallLayers[insulIdx].material}
              options={INSUL_OPTS} onChange={v => updateLayer(insulIdx, { material: v })} />
          </div>
          <TechSlider label="Épaisseur isolant" value={wallLayers[insulIdx].thickness}
            min={0.02} max={0.40} step={0.005} unit="m" decimals={3}
            onChange={v => updateLayer(insulIdx, { thickness: v })} />
        </>
      )}
    </SectionCard>
  );
}
