// Palette de couleurs — "rotring sur papier calque"
// Accent #C1440E UNIQUEMENT pour DPE F/G et dépassements critiques

export const PALETTE = {
  paper:  '#F4F2ED',   // fond principal
  ink:    '#0A0A0A',   // texte, traits
  accent: '#C1440E',   // DPE F/G, seuil critique UNIQUEMENT
  muted:  '#6B6560',   // texte secondaire
  subtle: '#D9D7D2',   // séparateurs, fonds hover
  white:  '#FFFFFF',
} as const;

/** Couleurs DPE (fond + texte) */
export const DPE_COLORS: Record<string, { bg: string; fg: string }> = {
  A: { bg: '#005F4B', fg: '#FFFFFF' },
  B: { bg: '#00A06A', fg: '#FFFFFF' },
  C: { bg: '#78C83C', fg: '#0A0A0A' },
  D: { bg: '#F5D400', fg: '#0A0A0A' },
  E: { bg: '#F5A800', fg: '#0A0A0A' },
  F: { bg: '#C1440E', fg: '#FFFFFF' },  // accent
  G: { bg: '#8B0000', fg: '#FFFFFF' },  // accent
};

/**
 * Renvoie la couleur associée à un label DPE.
 * Les labels F et G utilisent la couleur accent.
 */
export function dpeColor(label: string): { bg: string; fg: string } {
  return DPE_COLORS[label] ?? { bg: PALETTE.muted, fg: PALETTE.white };
}

/**
 * Échelle continue pour les cartes de chaleur thermiques.
 * Interpolation linéaire entre bleu froid et rouge chaud,
 * sans passer par le vert pour rester austère.
 */
export function heatmapColor(t: number): string {
  const t2 = Math.max(0, Math.min(1, t));
  // Bleu froid → gris neutre → rouge chaud
  const r = Math.round(10 + 193 * t2);
  const g = Math.round(20 + 45  * (1 - Math.abs(t2 - 0.5) * 2));
  const b = Math.round(200 - 186 * t2);
  return `rgb(${r},${g},${b})`;
}

/**
 * Couleur d'opacité variable sur fond papier.
 * Utile pour les overlays de hatching.
 */
export function inkAlpha(alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#0A0A0A${a}`;
}
