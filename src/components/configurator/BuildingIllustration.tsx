// BuildingIllustration — SVG animé scroll-driven, matériaux réalistes
import { useTransform, useSpring, motion, type MotionValue } from 'framer-motion';
import { useMemo } from 'react';
import { useBuildingStore } from '../../store/buildingStore';
import { MATERIALS_DB } from '../../engine/data/materials';

// ─── Palette matériaux réaliste ──────────────────────────────────────────────
const STRUCTURE_COLORS: Record<string, string> = {
  beton_arme:       '#B8B5AE',
  brique_monomur:   '#C4622D',
  brique_pleine:    '#B85530',
  brique_creuse:    '#CB7040',
  ossature_bois:    '#C4A374',
  bois_massif:      '#BC9860',
  acier:            '#6B8FA8',
  enduit_platre:    '#E0DDD6',
  enduit_ciment:    '#C8C4BC',
  default:          '#B8B5AE',
};

const INSUL_COLORS: Record<string, string> = {
  laine_de_verre_32:  '#F0C040',
  laine_de_verre_35:  '#EAB830',
  laine_roche_40:     '#D4A030',
  polystyrene_expanse:'#F5F0E4',
  polystyrene_extrude:'#E8E4F0',
  polyurethane:       '#F8E4A0',
  laine_bois:         '#8BC48A',
  chanvre:            '#A0C870',
  ouate_cellulose:    '#B8C8A0',
  default:            '#F0C040',
};

const ROOF_COLORS: Record<string, { fill: string; accent: string }> = {
  flat_concrete:  { fill: '#8A8680', accent: '#9A9690' },
  green:          { fill: '#4A8A4A', accent: '#5CA05C' },
  inclined_tiles: { fill: '#8B4030', accent: '#A05040' },
  cool_roof:      { fill: '#E0E0E0', accent: '#ECECEC' },
};

const GLASS_COLOR = 'rgba(100, 185, 230, 0.55)';
const GLASS_SHIMMER = 'rgba(200, 230, 255, 0.25)';
const CITY_COLORS: Record<string, string> = {
  paris: '#6080A8', strasbourg: '#4870A0', brest: '#5890B8',
  bordeaux: '#C09050', lyon: '#8098B0', marseille: '#E09050',
  clermont: '#7090A8', perpignan: '#D08040',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStructureColor(wallLayers: { material: string }[]): string {
  const structLayer = wallLayers.find(l =>
    MATERIALS_DB[l.material]?.category === 'structure' ||
    MATERIALS_DB[l.material]?.category === 'maconnerie'
  );
  return STRUCTURE_COLORS[structLayer?.material ?? ''] ?? STRUCTURE_COLORS.default;
}

function getInsulColor(wallLayers: { material: string }[]): string {
  const insulLayer = wallLayers.find(l =>
    ['isolant', 'isolant_bio'].includes(MATERIALS_DB[l.material]?.category ?? '')
  );
  return INSUL_COLORS[insulLayer?.material ?? ''] ?? INSUL_COLORS.default;
}

// ─── Paramètres SVG ───────────────────────────────────────────────────────────
const VB_W = 380;
const VB_H = 500;
const BLD_X = 60;       // left edge du bâtiment
const BLD_W = 260;      // width totale du bâtiment
const GROUND_Y = 440;   // y du sol
const MAX_H = 360;      // hauteur max du bâtiment en px
const MIN_FLOOR_H = 28;
const MAX_FLOOR_H = 72;

// ─── Composant principal ──────────────────────────────────────────────────────
interface Props { scrollProgress: MotionValue<number> }

export function BuildingIllustration({ scrollProgress }: Props) {
  const { config } = useBuildingStore();
  const { geometry, wallLayers, windows, roof, insulationPosition, terrain } = config;
  const { nFloors } = geometry;

  // Couleurs dynamiques
  const structColor = getStructureColor(wallLayers);
  const insulColor  = getInsulColor(wallLayers);
  const roofStyle   = ROOF_COLORS[roof.type] ?? ROOF_COLORS.flat_concrete;
  const skyColor    = CITY_COLORS[terrain.climateCity] ?? '#6080A8';
  const hasInsul    = insulationPosition !== 'AUCUNE';

  // Dimensions SVG du bâtiment
  const floorH = Math.min(MAX_FLOOR_H, Math.max(MIN_FLOOR_H, MAX_H / nFloors));
  const bldH   = floorH * nFloors;
  const bldY   = GROUND_Y - bldH;
  const insulW = hasInsul ? 10 : 0;

  // Springs pour les couleurs (smooth transitions)
  const sp = { stiffness: 80, damping: 20 };

  // Scroll → opacity de chaque section (7 phases)
  const phase = (a: number, b: number) =>
    useTransform(scrollProgress, [a, a + 0.04, b - 0.04, b], [0, 1, 1, 0]);

  const wallOpacity   = useSpring(useTransform(scrollProgress, [0,   0.05], [0, 1]), sp);
  const winOpacity    = useSpring(useTransform(scrollProgress, [0.12, 0.18], [0, 1]), sp);
  const insulOpacity  = useSpring(useTransform(scrollProgress, [0.26, 0.32], [0, 1]), sp);
  const roofOpacity   = useSpring(useTransform(scrollProgress, [0.40, 0.46], [0, 1]), sp);
  const ventilOpacity = useSpring(useTransform(scrollProgress, [0.54, 0.60], [0, 1]), sp);
  const hvacOpacity   = useSpring(useTransform(scrollProgress, [0.68, 0.74], [0, 1]), sp);
  const glowOpacity   = useSpring(useTransform(scrollProgress, [0.84, 0.92], [0, 1]), sp);

  // Insulation scaleX (enveloppe les murs)
  const insulScale = useSpring(
    useTransform(scrollProgress, [0.26, 0.36], [0, 1]),
    { stiffness: 100, damping: 22 }
  );

  // Roof translateY (tombe du ciel)
  const roofY = useSpring(
    useTransform(scrollProgress, [0.40, 0.50], [-60, 0]),
    { stiffness: 140, damping: 18, restDelta: 0.01 }
  );

  // Foundation opacity
  const foundOpacity = useSpring(
    useTransform(scrollProgress, [0, 0.03], [0, 1]),
    { stiffness: 120, damping: 18 }
  );

  // Window positions (simplified)
  const winCount = Math.max(1, Math.round(BLD_W * (windows.ratioSouth ?? 0.4) / 40));
  const winW = 28;
  const winH = Math.min(floorH * 0.6, 40);
  const winPositions = useMemo(() => {
    const spacing = BLD_W / (winCount + 1);
    return Array.from({ length: nFloors }, (_, f) =>
      Array.from({ length: winCount }, (_, w) => ({
        x: BLD_X + spacing * (w + 1) - winW / 2,
        y: bldY + f * floorH + (floorH - winH) * 0.4,
      }))
    ).flat();
  }, [winCount, nFloors, floorH, bldY]);

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      height="100%"
      style={{ overflow: 'visible' }}
      aria-label="Building illustration"
    >
      <defs>
        {/* Gradient fond de ciel */}
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={skyColor} stopOpacity="0" />
        </linearGradient>

        {/* Gradient mur */}
        <linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={structColor} stopOpacity="1" />
          <stop offset="100%" stopColor={structColor} stopOpacity="0.85" />
        </linearGradient>

        {/* Gradient isolant */}
        <linearGradient id="insulGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={insulColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={insulColor} stopOpacity="0.7" />
        </linearGradient>

        {/* Gradient verre */}
        <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GLASS_SHIMMER} />
          <stop offset="50%" stopColor={GLASS_COLOR} />
          <stop offset="100%" stopColor={GLASS_SHIMMER} />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="subtleGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Clip pour isolant gauche */}
        <clipPath id="insulLeft">
          <rect x={BLD_X - insulW - 2} y={bldY} width={insulW + 2} height={bldH} />
        </clipPath>
        {/* Clip pour isolant droite */}
        <clipPath id="insulRight">
          <rect x={BLD_X + BLD_W} y={bldY} width={insulW + 2} height={bldH} />
        </clipPath>
      </defs>

      {/* ── Fond ciel dégradé (lié au climat) ── */}
      <rect x="0" y="0" width={VB_W} height={GROUND_Y} fill="url(#skyGrad)" />

      {/* ── Sol ── */}
      <motion.rect
        x="0" y={GROUND_Y} width={VB_W} height={VB_H - GROUND_Y}
        fill="#1A1F28"
        style={{ opacity: foundOpacity }}
      />
      <motion.line
        x1="0" y1={GROUND_Y} x2={VB_W} y2={GROUND_Y}
        stroke="#2A4060" strokeWidth="1"
        style={{ opacity: foundOpacity }}
      />

      {/* ── Foundation ── */}
      <motion.rect
        x={BLD_X - 8} y={GROUND_Y - 10} width={BLD_W + 16} height={12}
        fill="#2A2826"
        rx="1"
        style={{ opacity: foundOpacity }}
      />

      {/* ── MURS — par étage (stagger) ── */}
      <motion.g style={{ opacity: wallOpacity }}>
        {Array.from({ length: nFloors }, (_, f) => {
          const fy = bldY + f * floorH;
          const delayOffset = (nFloors - 1 - f) * 0.06; // bottom→top
          return (
            <motion.g
              key={f}
              initial={{ scaleY: 0, originY: GROUND_Y }}
              animate={{ scaleY: 1 }}
              transition={{ delay: delayOffset, type: 'spring', stiffness: 160, damping: 20 }}
              style={{ transformOrigin: `${BLD_X + BLD_W / 2}px ${GROUND_Y}px` }}
            >
              {/* Corps du mur */}
              <rect
                x={BLD_X} y={fy}
                width={BLD_W} height={floorH}
                fill="url(#wallGrad)"
              />
              {/* Reflet subtil haut du mur */}
              <rect
                x={BLD_X} y={fy}
                width={BLD_W} height={3}
                fill="rgba(255,255,255,0.12)"
              />
              {/* Séparation inter-étage */}
              {f > 0 && (
                <line
                  x1={BLD_X} y1={fy} x2={BLD_X + BLD_W} y2={fy}
                  stroke="rgba(0,0,0,0.25)" strokeWidth="1.5"
                />
              )}
            </motion.g>
          );
        })}
        {/* Contour général du bâtiment */}
        <rect
          x={BLD_X} y={bldY}
          width={BLD_W} height={bldH}
          fill="none"
          stroke="#1A1F28" strokeWidth="1.5"
        />
        {/* Coins brillants — effet architectural */}
        <line x1={BLD_X} y1={bldY} x2={BLD_X} y2={GROUND_Y}
          stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1={BLD_X + BLD_W} y1={bldY} x2={BLD_X + BLD_W} y2={GROUND_Y}
          stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      </motion.g>

      {/* ── ISOLATION ── */}
      {hasInsul && (
        <motion.g style={{ opacity: insulOpacity }}>
          {insulationPosition === 'ITE' ? (
            <>
              {/* ITE : couche extérieure */}
              <motion.rect
                x={BLD_X - insulW} y={bldY}
                width={insulW} height={bldH}
                fill="url(#insulGrad)"
                style={{ scaleX: insulScale, transformOrigin: `${BLD_X}px center` }}
              />
              <motion.rect
                x={BLD_X + BLD_W} y={bldY}
                width={insulW} height={bldH}
                fill="url(#insulGrad)"
                style={{ scaleX: insulScale, transformOrigin: `${BLD_X + BLD_W}px center` }}
              />
            </>
          ) : (
            <>
              {/* ITI : couche intérieure */}
              <motion.rect
                x={BLD_X + 2} y={bldY + 2}
                width={insulW - 2} height={bldH - 4}
                fill="url(#insulGrad)"
                style={{ scaleX: insulScale, transformOrigin: `${BLD_X + 2}px center` }}
              />
              <motion.rect
                x={BLD_X + BLD_W - insulW} y={bldY + 2}
                width={insulW - 2} height={bldH - 4}
                fill="url(#insulGrad)"
                style={{ scaleX: insulScale, transformOrigin: `${BLD_X + BLD_W}px center` }}
              />
            </>
          )}
          {/* Label isolant */}
          <motion.text
            x={insulationPosition === 'ITE' ? BLD_X - insulW - 4 : BLD_X + 4}
            y={bldY + bldH / 2}
            fontSize="7"
            fill={insulColor}
            textAnchor="end"
            dominantBaseline="middle"
            fontFamily="var(--font-mono)"
            letterSpacing="0.05em"
            style={{ opacity: insulOpacity }}
          >
            {insulationPosition}
          </motion.text>
        </motion.g>
      )}

      {/* ── FENÊTRES ── */}
      <motion.g style={{ opacity: winOpacity }}>
        {winPositions.map((w, i) => (
          <motion.g
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 24 }}
            style={{ transformOrigin: `${w.x + winW / 2}px ${w.y + winH / 2}px` }}
          >
            {/* Cadre aluminium */}
            <rect x={w.x - 1} y={w.y - 1} width={winW + 2} height={winH + 2}
              fill="#2C3040" rx="1" />
            {/* Vitrage */}
            <rect x={w.x} y={w.y} width={winW} height={winH}
              fill="url(#glassGrad)" />
            {/* Reflet diagonal */}
            <line
              x1={w.x + 4} y1={w.y + 3}
              x2={w.x + winW * 0.45} y2={w.y + winH * 0.6}
              stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"
            />
            {/* Meneau central */}
            <line
              x1={w.x + winW / 2} y1={w.y}
              x2={w.x + winW / 2} y2={w.y + winH}
              stroke="rgba(40,50,65,0.8)" strokeWidth="1"
            />
          </motion.g>
        ))}
      </motion.g>

      {/* ── TOITURE ── */}
      <motion.g style={{ opacity: roofOpacity, y: roofY }}>
        {roof.type === 'inclined_tiles' ? (
          <>
            <polygon
              points={`${BLD_X - 8},${bldY} ${BLD_X + BLD_W / 2},${bldY - 55} ${BLD_X + BLD_W + 8},${bldY}`}
              fill={roofStyle.fill}
            />
            <polygon
              points={`${BLD_X - 8},${bldY} ${BLD_X + BLD_W / 2},${bldY - 55} ${BLD_X + BLD_W + 8},${bldY}`}
              fill="none"
              stroke="#1A1F28" strokeWidth="1.5"
            />
            {/* Tuiles */}
            {Array.from({ length: 6 }, (_, i) => (
              <line key={i}
                x1={BLD_X - 8 + (BLD_W + 16) * i / 6}
                y1={bldY}
                x2={BLD_X + BLD_W / 2}
                y2={bldY - 55}
                stroke={roofStyle.accent} strokeWidth="1" strokeOpacity="0.5"
              />
            ))}
          </>
        ) : roof.type === 'green' ? (
          <>
            <rect x={BLD_X - 6} y={bldY - 16} width={BLD_W + 12} height={16}
              fill={roofStyle.fill} rx="2" />
            <rect x={BLD_X - 6} y={bldY - 22} width={BLD_W + 12} height={6}
              fill={roofStyle.accent} rx="1" />
            {/* Végétation stylisée */}
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i}
                cx={BLD_X + 16 + i * 32}
                cy={bldY - 22}
                rx={10} ry={6}
                fill="#3A7A3A" opacity="0.8"
              />
            ))}
          </>
        ) : (
          <>
            {/* Toiture plate */}
            <rect x={BLD_X - 6} y={bldY - 12} width={BLD_W + 12} height={14}
              fill={roofStyle.fill} />
            <rect x={BLD_X - 6} y={bldY - 14} width={BLD_W + 12} height={4}
              fill={roofStyle.accent} />
            <rect x={BLD_X - 6} y={bldY - 14} width={BLD_W + 12} height={14}
              fill="none" stroke="#1A1F28" strokeWidth="1.2" />
            {/* Détail acrotère */}
            <rect x={BLD_X - 8} y={bldY - 18} width={6} height={8}
              fill={roofStyle.fill} stroke="#1A1F28" strokeWidth="1" />
            <rect x={BLD_X + BLD_W + 2} y={bldY - 18} width={6} height={8}
              fill={roofStyle.fill} stroke="#1A1F28" strokeWidth="1" />
          </>
        )}
      </motion.g>

      {/* ── VENTILATION — lignes d'airflow ── */}
      <motion.g style={{ opacity: ventilOpacity }}>
        {[0.25, 0.5, 0.75].map((pct, i) => (
          <motion.path
            key={i}
            d={`M ${BLD_X + BLD_W * pct} ${bldY + 20 + i * 30}
                C ${BLD_X + BLD_W * pct + 20} ${bldY + 30 + i * 30}
                  ${BLD_X + BLD_W * pct + 20} ${bldY + 50 + i * 30}
                  ${BLD_X + BLD_W * pct} ${bldY + 60 + i * 30}`}
            stroke="#0B7A63"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ delay: 0.1 * i, duration: 1.2, ease: 'easeInOut' }}
          />
        ))}
        {/* Flèches de ventilation */}
        <motion.text x={BLD_X + BLD_W / 2 - 25} y={bldY + bldH / 2}
          fontSize="8" fill="#0B7A63" fontFamily="var(--font-mono)"
          style={{ opacity: ventilOpacity }}>
          HRV ↕
        </motion.text>
      </motion.g>

      {/* ── HVAC overlay ── */}
      <motion.g style={{ opacity: hvacOpacity }}>
        {/* Unité extérieure PAC */}
        <rect x={BLD_X + BLD_W + 16} y={GROUND_Y - 32}
          width={28} height={30} fill="#3A4050" rx="3"
          stroke="#4A7FA8" strokeWidth="1" />
        <text x={BLD_X + BLD_W + 30} y={GROUND_Y - 16}
          fontSize="7" fill="#4A7FA8" textAnchor="middle"
          fontFamily="var(--font-mono)">HP</text>
        {/* Liaison frigorifique */}
        <motion.path
          d={`M ${BLD_X + BLD_W} ${bldY + bldH * 0.7} L ${BLD_X + BLD_W + 16} ${GROUND_Y - 18}`}
          stroke="#4A7FA8" strokeWidth="1" strokeDasharray="3 2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />
      </motion.g>

      {/* ── GLOW FINAL — résultat ── */}
      <motion.g style={{ opacity: glowOpacity }}>
        <rect
          x={BLD_X - insulW} y={bldY - 20}
          width={BLD_W + insulW * 2} height={bldH + 20}
          fill="none"
          stroke="#4A7FA8"
          strokeWidth="2"
          filter="url(#glow)"
          rx="2"
        />
      </motion.g>

      {/* ── DIMENSIONS — lignes de cote ── */}
      <motion.g style={{ opacity: wallOpacity }} fill="none">
        {/* Cote hauteur */}
        <line x1={BLD_X - 22} y1={bldY} x2={BLD_X - 22} y2={GROUND_Y}
          stroke="#4A7FA8" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1={BLD_X - 26} y1={bldY} x2={BLD_X - 18} y2={bldY}
          stroke="#4A7FA8" strokeWidth="0.8" />
        <line x1={BLD_X - 26} y1={GROUND_Y} x2={BLD_X - 18} y2={GROUND_Y}
          stroke="#4A7FA8" strokeWidth="0.8" />
        <text x={BLD_X - 36} y={bldY + bldH / 2}
          fontSize="7" fill="#4A7FA8" textAnchor="middle"
          fontFamily="var(--font-mono)"
          transform={`rotate(-90, ${BLD_X - 36}, ${bldY + bldH / 2})`}>
          {(geometry.nFloors * geometry.floorHeight).toFixed(1)}m
        </text>

        {/* Cote largeur */}
        <line x1={BLD_X} y1={GROUND_Y + 20} x2={BLD_X + BLD_W} y2={GROUND_Y + 20}
          stroke="#4A7FA8" strokeWidth="0.8" strokeDasharray="2 2" />
        <text x={BLD_X + BLD_W / 2} y={GROUND_Y + 32}
          fontSize="7" fill="#4A7FA8" textAnchor="middle"
          fontFamily="var(--font-mono)">
          {geometry.length.toFixed(1)}m × {geometry.width.toFixed(1)}m
        </text>
      </motion.g>
    </svg>
  );
}
