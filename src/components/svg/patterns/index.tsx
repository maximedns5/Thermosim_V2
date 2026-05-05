// Hachures SVG — style dessin technique / coupe architecturale

interface HatchProps {
  id: string;
  className?: string;
}

export function HatchConcrete({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <line x1="0" y1="8" x2="8" y2="0" stroke="var(--color-ink-3)" strokeWidth="0.5" />
    </pattern>
  );
}

export function HatchConcreteReinforced({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <line x1="0" y1="8" x2="8" y2="0" stroke="var(--color-ink-3)" strokeWidth="0.5" />
      <line x1="0" y1="0" x2="8" y2="8" stroke="var(--color-ink-3)" strokeWidth="0.5" />
    </pattern>
  );
}

export function HatchBrick({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="12" height="6" patternUnits="userSpaceOnUse">
      <rect width="12" height="6" fill="none" stroke="var(--color-ink-3)" strokeWidth="0.5" />
      <line x1="6" y1="0" x2="6" y2="3" stroke="var(--color-ink-3)" strokeWidth="0.5" />
      <line x1="0" y1="3" x2="12" y2="3" stroke="var(--color-ink-3)" strokeWidth="0.5" />
    </pattern>
  );
}

export function HatchWood({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="4" y2="0" stroke="var(--color-ink-3)" strokeWidth="0.5" />
      <line x1="0" y1="2" x2="4" y2="2" stroke="var(--color-ink-4)" strokeWidth="0.3" />
    </pattern>
  );
}

export function HatchInsulation({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="16" height="8" patternUnits="userSpaceOnUse">
      {/* Laine : zigzag */}
      <polyline
        points="0,4 2,1 4,4 6,1 8,4 10,1 12,4 14,1 16,4"
        fill="none"
        stroke="var(--color-ink-3)"
        strokeWidth="0.6"
      />
      <polyline
        points="0,7 2,4 4,7 6,4 8,7 10,4 12,7 14,4 16,7"
        fill="none"
        stroke="var(--color-ink-3)"
        strokeWidth="0.6"
      />
    </pattern>
  );
}

export function HatchFoam({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="none" stroke="var(--color-ink-3)" strokeWidth="0.4" />
      <circle cx="4" cy="4" r="1" fill="none" stroke="var(--color-ink-3)" strokeWidth="0.4" />
    </pattern>
  );
}

export function HatchPlaster({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="4" y2="4" stroke="var(--color-ink-4)" strokeWidth="0.3" />
    </pattern>
  );
}

export function HatchRender({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="0.4" fill="var(--color-ink-4)" />
    </pattern>
  );
}

export function HatchGlass({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="8" y2="8" stroke="var(--color-ink-4)" strokeWidth="0.4" />
    </pattern>
  );
}

export function HatchMetal({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="4" y2="4" stroke="var(--color-ink-3)" strokeWidth="0.8" />
      <line x1="0" y1="4" x2="4" y2="0" stroke="var(--color-ink-3)" strokeWidth="0.8" />
    </pattern>
  );
}

export function HatchAir({ id }: HatchProps) {
  return (
    <pattern id={id} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.5" fill="none" stroke="var(--color-ink-4)" strokeWidth="0.4" />
    </pattern>
  );
}

// Mapping matériau → composant hachure
export const HATCH_BY_MATERIAL: Record<string, string> = {
  beton_arme:          'concrete-reinforced',
  beton_arme_200:      'concrete-reinforced',
  beton_cellulaire:    'concrete',
  brique_pleine:       'brick',
  brique_creuse:       'brick',
  laine_de_verre_32:   'insulation',
  laine_de_verre_35:   'insulation',
  laine_de_roche_34:   'insulation',
  laine_de_roche_40:   'insulation',
  laine_de_roche_45:   'insulation',
  ouate_de_cellulose:  'insulation',
  laine_de_bois:       'insulation',
  paille:              'insulation',
  polystyrene_expanse: 'foam',
  polystyrene_extrude: 'foam',
  polyurethane:        'foam',
  aerogel:             'foam',
  enduit_platre:       'plaster',
  plaque_platre_ba13:  'plaster',
  enduit_ciment:       'render',
  bardage_bois:        'wood',
  OSB:                 'wood',
  CLT:                 'wood',
  bois_sapin:          'wood',
};
