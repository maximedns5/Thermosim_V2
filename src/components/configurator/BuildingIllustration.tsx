// BuildingIllustration — correct isometric 3D SVG, reactive to buildingStore
//
// Projection formula:
//   screen_x = OX + (x + z) * COS30   → x goes lower-right, z goes upper-right
//   screen_y = OY - y + (x - z) * SIN30 → depth (z) recedes upward
//
// This ensures south face (left) and east face (right) never overlap.

import { useTransform, useSpring, motion, type MotionValue } from 'framer-motion';
import { useMemo } from 'react';
import { useBuildingStore } from '../../store/buildingStore';
import { MATERIALS_DB } from '../../engine/data/materials';

// ─── Palettes ────────────────────────────────────────────────────────────────
const STRUCT_COLORS: Record<string, { front: string; right: string; top: string }> = {
  beton_arme:       { front: '#C8C4BC', right: '#AEA8A0', top: '#D8D4CC' },
  brique_monomur:   { front: '#C8623A', right: '#A84E2C', top: '#D87050' },
  brique_pleine:    { front: '#BC5530', right: '#9E4428', top: '#CC6848' },
  brique_creuse:    { front: '#CC7040', right: '#AA5C32', top: '#DC8058' },
  ossature_bois:    { front: '#C8A878', right: '#AA8C60', top: '#D8BC90' },
  bois_massif:      { front: '#BC9860', right: '#9E8050', top: '#CCAC78' },
  acier:            { front: '#7090A8', right: '#587890', top: '#8AA8C0' },
  enduit_platre:    { front: '#E4E0D8', right: '#CCC8C0', top: '#EEEAE4' },
  enduit_ciment:    { front: '#C8C4BC', right: '#B0ACA4', top: '#D8D4CC' },
  default:          { front: '#C8C4BC', right: '#AEA8A0', top: '#D8D4CC' },
};

const INSUL_COLORS: Record<string, string> = {
  laine_de_verre_32: '#F0C040',
  laine_de_verre_35: '#EAB830',
  laine_roche_40:    '#D4A030',
  polystyrene_expanse: '#EDE8D4',
  polystyrene_extrude: '#E0DCF0',
  polyurethane:      '#F0DC90',
  laine_bois:        '#8BC48A',
  chanvre:           '#A0C870',
  ouate_cellulose:   '#B8C8A0',
  default:           '#F0C040',
};

const ROOF_COLORS: Record<string, { top: string; front: string; right: string }> = {
  flat_concrete:  { top: '#9A9690', front: '#8A8682', right: '#787470' },
  green:          { top: '#4E9050', front: '#3C7840', right: '#2E6030' },
  inclined_tiles: { top: '#8C4232', front: '#7A3828', right: '#682E20' },
  cool_roof:      { top: '#D8D8DC', front: '#C8C8CC', right: '#B8B8BC' },
};

const CITY_SKY: Record<string, string> = {
  paris: '#3A6090', strasbourg: '#2C5488', brest: '#3878A8',
  bordeaux: '#A87040', lyon: '#5880A0', marseille: '#C06840',
  clermont: '#506080', perpignan: '#B86830',
};

// ─── Isometric constants ──────────────────────────────────────────────────────
const COS30 = Math.cos(Math.PI / 6); // 0.8660
const SIN30 = 0.5;

const VB_W = 380;
const VB_H = 500;
const PAD_X = 28;
const PAD_Y_TOP = 30;
const PAD_Y_BOT = 64;

function darken(hex: string, amt: number): string {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0'), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - Math.round(255 * amt));
  const g = Math.max(0, ((n >> 8)  & 0xff) - Math.round(255 * amt));
  const b = Math.max(0,  (n        & 0xff) - Math.round(255 * amt));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function pts(...coords: [number, number][]): string {
  return coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

// ─── Component ───────────────────────────────────────────────────────────────
interface Props { scrollProgress: MotionValue<number> }

export function BuildingIllustration({ scrollProgress }: Props) {
  const { config } = useBuildingStore();
  const { geometry, wallLayers, windows, roof, insulationPosition, terrain } = config;

  // ── Material colours ──
  const structLayer = wallLayers.find(l =>
    ['structure', 'maconnerie'].includes(MATERIALS_DB[l.material]?.category ?? ''));
  const insulLayer = wallLayers.find(l =>
    ['isolant', 'isolant_bio'].includes(MATERIALS_DB[l.material]?.category ?? ''));

  const mats = STRUCT_COLORS[structLayer?.material ?? ''] ?? STRUCT_COLORS.default;
  const insulColor = INSUL_COLORS[insulLayer?.material ?? ''] ?? INSUL_COLORS.default;
  const roofC = ROOF_COLORS[roof.type] ?? ROOF_COLORS.flat_concrete;
  const hasInsul = insulationPosition !== 'AUCUNE';
  const skyColor = CITY_SKY[terrain.climateCity] ?? '#3A6090';

  // ── Compute scale to fill panel ──
  const bW  = geometry.length;
  const bD  = geometry.width;
  const bH  = geometry.nFloors * geometry.floorHeight;
  const bFH = geometry.floorHeight;
  const NF  = geometry.nFloors;

  const availW = VB_W - PAD_X * 2;
  const availH = VB_H - PAD_Y_TOP - PAD_Y_BOT;
  const screenW = (bW + bD) * COS30;
  const screenH = bH + (bW + bD) * SIN30;
  const scaleW = availW / screenW;
  const scaleH = availH / screenH;
  const scale  = Math.min(scaleW, scaleH) * 0.88;

  const W  = bW  * scale;   // building width (south face) in px
  const D  = bD  * scale;   // building depth in px
  const H  = bH  * scale;   // building height in px
  const FH = bFH * scale;   // floor height in px

  const insulPx = hasInsul
    ? Math.max(6, (insulLayer?.thickness ?? 0.1) * scale * 2)
    : 0;

  // ── Origin: bottom-south-west corner ──
  // screen_x = OX + (x+z)*COS30  →  leftmost at x=0,z=0 → OX
  // screen_y = OY - y + (x-z)*SIN30  →  lowest at x=W,y=0,z=0 → OY + W*SIN30
  const OX = PAD_X + (availW - (W + D) * COS30) / 2;
  // Centre vertically: highest point is iso(0,H,D) = OY-H-D*SIN30
  const OY = PAD_Y_TOP + (availH - screenH) / 2 + H + D * SIN30;

  // ─── Projection ───────────────────────────────────────────────────────────
  function iso(x: number, y: number, z: number): [number, number] {
    return [
      OX + (x + z) * COS30,
      OY - y + (x - z) * SIN30,
    ];
  }

  // ── Windows ──
  const WIN_W_M = 1.4;
  const WIN_H_M = Math.min(bFH * 0.58, 1.85);
  const winW = WIN_W_M * scale;
  const winH = WIN_H_M * scale;

  const nWinSouth = Math.max(1, Math.round(bW * (windows.ratioSouth ?? 0.40) / WIN_W_M));
  const nWinEast  = Math.max(1, Math.round(bD * (windows.ratioEast  ?? 0.15) / WIN_W_M));

  const southWins = useMemo(() => {
    const sp = W / (nWinSouth + 1);
    return Array.from({ length: NF }, (_, f) =>
      Array.from({ length: nWinSouth }, (_, i) => ({
        x: sp * (i + 1) - winW / 2,
        y: f * FH + (FH - winH) * 0.38,
      }))
    ).flat();
  }, [W, FH, NF, nWinSouth, winW, winH]);

  const eastWins = useMemo(() => {
    const sp = D / (nWinEast + 1);
    return Array.from({ length: NF }, (_, f) =>
      Array.from({ length: nWinEast }, (_, i) => ({
        z: sp * (i + 1) - winW / 2,
        y: f * FH + (FH - winH) * 0.38,
      }))
    ).flat();
  }, [D, FH, NF, nWinEast, winW, winH]);

  // ── Scroll → section highlight (building always fully visible) ──
  const spG = { stiffness: 80, damping: 20 };
  const activeSection = useTransform(scrollProgress, v => Math.min(6, Math.floor(v * 7)));

  const wallGlow    = useSpring(useTransform(activeSection, (v): number => v === 0 ? 1.0 : 0.7), spG);
  const winGlow     = useSpring(useTransform(activeSection, (v): number => v === 1 ? 1.0 : 0.7), spG);
  const insulGlow   = useSpring(useTransform(activeSection, (v): number => v === 2 ? 1.0 : 0.5), spG);
  const roofGlow    = useSpring(useTransform(activeSection, (v): number => v === 3 ? 1.0 : 0.7), spG);
  const sysGlow     = useSpring(useTransform(activeSection, (v): number => v === 4 || v === 5 ? 1.0 : 0.5), spG);

  const wallStroke   = useTransform(activeSection, (v): number => v === 0 ? 0.85 : 0);
  const winStroke    = useTransform(activeSection, (v): number => v === 1 ? 0.85 : 0);
  const insulStroke  = useTransform(activeSection, (v): number => v === 2 ? 0.9  : 0);
  const roofStroke   = useTransform(activeSection, (v): number => v === 3 ? 0.85 : 0);

  // Dimension references
  const [dBL, dBR, dBRD, dTL] = [iso(0,0,0), iso(W,0,0), iso(W,0,D), iso(0,H,0)];

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%"
      style={{ overflow: 'visible' }} aria-label="Isometric building illustration">
      <defs>
        {/* Sky */}
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={skyColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={skyColor} stopOpacity="0" />
        </linearGradient>
        {/* Glass */}
        <linearGradient id="glassF" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="rgba(160,210,255,0.3)" />
          <stop offset="50%"  stopColor="rgba(80,170,230,0.6)" />
          <stop offset="100%" stopColor="rgba(160,210,255,0.2)" />
        </linearGradient>
        <linearGradient id="glassR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="rgba(100,170,210,0.25)" />
          <stop offset="100%" stopColor="rgba(60,140,200,0.5)" />
        </linearGradient>
        {/* Glow filters */}
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glowSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── SKY ── */}
      <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#skyGrad)" />

      {/* ── GROUND SHADOW ── */}
      <ellipse
        cx={OX + (W + D) * COS30 / 2}
        cy={OY + (W - D) * SIN30 / 2 + 10}
        rx={(W + D) * COS30 * 0.52}
        ry={(W + D) * SIN30 * 0.22}
        fill="rgba(0,0,0,0.25)"
      />

      {/* ── GROUND PLANE ── */}
      <polygon
        points={pts(iso(0,0,0), iso(W,0,0), iso(W,0,D), iso(0,0,D))}
        fill="#16202E" stroke="#2A3448" strokeWidth="0.8"
      />

      {/* ── EAST FACE (drawn first — on the right) ── */}
      <motion.g style={{ opacity: wallGlow }}>
        <polygon
          points={pts(iso(W,0,0), iso(W,0,D), iso(W,H,D), iso(W,H,0))}
          fill={mats.right} stroke="#0A0D12" strokeWidth="0.8"
        />
        {/* Floor divisions — east */}
        {Array.from({ length: NF - 1 }, (_, f) => {
          const fy = (f + 1) * FH;
          return (
            <line key={f}
              x1={iso(W,fy,0)[0]} y1={iso(W,fy,0)[1]}
              x2={iso(W,fy,D)[0]} y2={iso(W,fy,D)[1]}
              stroke={darken(mats.right, 0.12)} strokeWidth="0.8" strokeDasharray="3 2" />
          );
        })}
        {/* Glow — geometry section */}
        <motion.polygon
          points={pts(iso(W,0,0), iso(W,0,D), iso(W,H,D), iso(W,H,0))}
          fill="none" stroke="#4A7FA8" strokeWidth="2"
          filter="url(#glow)" style={{ opacity: wallStroke }} />
      </motion.g>

      {/* ── SOUTH FACE (front — drawn over east at shared edge) ── */}
      <motion.g style={{ opacity: wallGlow }}>
        <polygon
          points={pts(iso(0,0,0), iso(W,0,0), iso(W,H,0), iso(0,H,0))}
          fill={mats.front} stroke="#0A0D12" strokeWidth="0.8"
        />
        {/* Floor divisions — south */}
        {Array.from({ length: NF - 1 }, (_, f) => {
          const fy = (f + 1) * FH;
          return (
            <line key={f}
              x1={iso(0,fy,0)[0]} y1={iso(0,fy,0)[1]}
              x2={iso(W,fy,0)[0]} y2={iso(W,fy,0)[1]}
              stroke={darken(mats.front, 0.14)} strokeWidth="0.8" strokeDasharray="3 2" />
          );
        })}
        {/* Left-edge highlight */}
        <line x1={iso(0,0,0)[0]} y1={iso(0,0,0)[1]}
          x2={iso(0,H,0)[0]} y2={iso(0,H,0)[1]}
          stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
        {/* Glow — geometry section */}
        <motion.polygon
          points={pts(iso(0,0,0), iso(W,0,0), iso(W,H,0), iso(0,H,0))}
          fill="none" stroke="#4A7FA8" strokeWidth="2"
          filter="url(#glow)" style={{ opacity: wallStroke }} />
      </motion.g>

      {/* ── INSULATION ── */}
      {hasInsul && (
        <motion.g style={{ opacity: insulGlow }}>
          {insulationPosition === 'ITE' ? (
            <>
              {/* ITE south face — exterior strip to the left of the south face */}
              <polygon
                points={pts(
                  [iso(0,0,0)[0] - insulPx * COS30, iso(0,0,0)[1] - insulPx * SIN30],
                  iso(0,0,0),
                  iso(0,H,0),
                  [iso(0,H,0)[0] - insulPx * COS30, iso(0,H,0)[1] - insulPx * SIN30],
                )}
                fill={insulColor} stroke={darken(insulColor, 0.08)} strokeWidth="0.6"
              />
              {/* ITE east face — exterior strip beyond the east face */}
              <polygon
                points={pts(
                  iso(W,0,D),
                  [iso(W,0,D)[0] + insulPx * COS30, iso(W,0,D)[1] + insulPx * SIN30],
                  [iso(W,H,D)[0] + insulPx * COS30, iso(W,H,D)[1] + insulPx * SIN30],
                  iso(W,H,D),
                )}
                fill={darken(insulColor, 0.06)} stroke={darken(insulColor, 0.12)} strokeWidth="0.6"
              />
              <text
                x={iso(0,H*0.55,0)[0] - insulPx * COS30 - 5}
                y={iso(0,H*0.55,0)[1] - insulPx * SIN30}
                fontSize="7" fill={insulColor} textAnchor="end"
                fontFamily="var(--font-mono)" fontWeight="600">ITE</text>
            </>
          ) : (
            <>
              {/* ITI — interior strip inside the south face's left edge */}
              <polygon
                points={pts(
                  iso(0,0,0),
                  iso(insulPx / scale, 0, 0),
                  iso(insulPx / scale, H, 0),
                  iso(0, H, 0),
                )}
                fill={insulColor} stroke={darken(insulColor, 0.08)} strokeWidth="0.6" opacity="0.92"
              />
              <text
                x={iso(insulPx / scale + 1, H * 0.55, 0)[0] + 3}
                y={iso(insulPx / scale + 1, H * 0.55, 0)[1]}
                fontSize="7" fill={darken(insulColor, 0.15)} textAnchor="start"
                fontFamily="var(--font-mono)" fontWeight="600">ITI</text>
            </>
          )}
          {/* Section glow */}
          <motion.polygon
            points={pts(iso(0,0,0), iso(W,0,0), iso(W,H,0), iso(0,H,0))}
            fill="none" stroke={insulColor} strokeWidth="2.5"
            filter="url(#glowSoft)" style={{ opacity: insulStroke }} />
        </motion.g>
      )}

      {/* ── WINDOWS — South face ── */}
      <motion.g style={{ opacity: winGlow }}>
        {southWins.map((w, i) => {
          const [x0,y0] = iso(w.x,        w.y,       0);
          const [x1,y1] = iso(w.x + winW, w.y,       0);
          const [x2,y2] = iso(w.x + winW, w.y + winH,0);
          const [x3,y3] = iso(w.x,        w.y + winH,0);
          const mx = (x0+x1+x2+x3)/4, my = (y0+y1+y2+y3)/4;
          return (
            <g key={`sw${i}`}>
              <polygon points={pts([x0,y0],[x1,y1],[x2,y2],[x3,y3])}
                fill="#222830" stroke="#0A0D12" strokeWidth="0.8" />
              <polygon points={pts([x0+2,y0+1],[x1-2,y1+1],[x2-2,y2-1],[x3+2,y3-1])}
                fill="url(#glassF)" />
              {/* Reflection streak */}
              <line x1={x0+3} y1={y0+2} x2={mx-3} y2={my}
                stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" strokeLinecap="round" />
              {/* Glow when glazing section active */}
              <motion.polygon points={pts([x0,y0],[x1,y1],[x2,y2],[x3,y3])}
                fill="none" stroke="#0B7A63" strokeWidth="1.5"
                filter="url(#glowSoft)" style={{ opacity: winStroke }} />
            </g>
          );
        })}
      </motion.g>

      {/* ── WINDOWS — East face ── */}
      <motion.g style={{ opacity: winGlow }}>
        {eastWins.map((w, i) => {
          const [x0,y0] = iso(W, w.y,        w.z);
          const [x1,y1] = iso(W, w.y,        w.z + winW);
          const [x2,y2] = iso(W, w.y + winH, w.z + winW);
          const [x3,y3] = iso(W, w.y + winH, w.z);
          return (
            <g key={`ew${i}`}>
              <polygon points={pts([x0,y0],[x1,y1],[x2,y2],[x3,y3])}
                fill="#222830" stroke="#0A0D12" strokeWidth="0.8" />
              <polygon points={pts([x0-1,y0+1],[x1+1,y1+1],[x2+1,y2-1],[x3-1,y3-1])}
                fill="url(#glassR)" />
            </g>
          );
        })}
      </motion.g>

      {/* ── ROOF ── */}
      <motion.g style={{ opacity: roofGlow }}>
        {roof.type === 'inclined_tiles' ? (
          <>
            {/* Front triangle (south face of pitched roof) */}
            <polygon
              points={pts(iso(0,H,0), iso(W,H,0), iso(W/2,H+D*0.4,D/2))}
              fill={roofC.front} stroke="#0A0D12" strokeWidth="0.8" />
            {/* Right triangle (east face of pitched roof) */}
            <polygon
              points={pts(iso(W,H,0), iso(W,H,D), iso(W/2,H+D*0.4,D/2))}
              fill={roofC.right} stroke="#0A0D12" strokeWidth="0.8" />
            {/* Back triangle */}
            <polygon
              points={pts(iso(0,H,D), iso(W,H,D), iso(W/2,H+D*0.4,D/2))}
              fill={darken(roofC.top, 0.08)} stroke="#0A0D12" strokeWidth="0.8" />
            {/* Left triangle */}
            <polygon
              points={pts(iso(0,H,0), iso(0,H,D), iso(W/2,H+D*0.4,D/2))}
              fill={roofC.top} stroke="#0A0D12" strokeWidth="0.8" />
          </>
        ) : roof.type === 'green' ? (
          <>
            <polygon
              points={pts(iso(0,H,0), iso(W,H,0), iso(W,H,D), iso(0,H,D))}
              fill={roofC.top} stroke="#0A0D12" strokeWidth="0.8" />
            {Array.from({ length: 6 }, (_, i) => {
              const [ex, ey] = iso((i + 0.5) * W / 6, H + 0.45, D * 0.42);
              return <ellipse key={i} cx={ex} cy={ey}
                rx={W * 0.05} ry={W * 0.025}
                fill="#5AB85A" opacity="0.9" />;
            })}
            <polygon
              points={pts(iso(0,H,0), iso(W,H,0), iso(W,H+0.22,0), iso(0,H+0.22,0))}
              fill={roofC.front} stroke="#0A0D12" strokeWidth="0.8" />
            <polygon
              points={pts(iso(W,H,0), iso(W,H,D), iso(W,H+0.22,D), iso(W,H+0.22,0))}
              fill={roofC.right} stroke="#0A0D12" strokeWidth="0.8" />
          </>
        ) : (
          <>
            {/* TOP face */}
            <polygon
              points={pts(iso(0,H,0), iso(W,H,0), iso(W,H,D), iso(0,H,D))}
              fill={roof.type === 'cool_roof' ? '#D4D8E0' : roofC.top}
              stroke="#0A0D12" strokeWidth="0.8" />
            {/* Cool roof sheen */}
            {roof.type === 'cool_roof' && (
              <polygon points={pts(iso(0,H,0), iso(W,H,0), iso(W,H,D), iso(0,H,D))}
                fill="rgba(200,220,255,0.38)" />
            )}
            {/* Parapet south */}
            <polygon
              points={pts(iso(0,H,0), iso(W,H,0), iso(W,H+0.18,0), iso(0,H+0.18,0))}
              fill={darken(mats.front, 0.03)} stroke="#0A0D12" strokeWidth="0.8" />
            {/* Parapet east */}
            <polygon
              points={pts(iso(W,H,0), iso(W,H,D), iso(W,H+0.18,D), iso(W,H+0.18,0))}
              fill={darken(mats.right, 0.03)} stroke="#0A0D12" strokeWidth="0.8" />
          </>
        )}
        {/* Roof glow */}
        <motion.polygon
          points={pts(iso(0,H,0), iso(W,H,0), iso(W,H,D), iso(0,H,D))}
          fill="none" stroke="#8B4030" strokeWidth="2"
          filter="url(#glowSoft)" style={{ opacity: roofStroke }} />
      </motion.g>

      {/* ── VENTILATION ARROWS ── */}
      <motion.g style={{ opacity: sysGlow }}>
        {[0.25, 0.60].map((pct, i) => {
          const [ax, ay] = iso(W * pct, H * 0.6, 0);
          return (
            <motion.path key={i}
              d={`M ${ax} ${ay - 9} C ${ax + 8} ${ay - 4} ${ax + 8} ${ay + 4} ${ax} ${ay + 9}`}
              stroke="#0B7A63" strokeWidth="1.3" fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.75 }}
              transition={{ duration: 1.2, delay: i * 0.35, ease: 'easeInOut',
                repeat: Infinity, repeatDelay: 2, repeatType: 'loop' }}
            />
          );
        })}
      </motion.g>

      {/* ── DIMENSION LABELS ── */}
      <g>
        {/* Width label — south face bottom */}
        <line x1={dBL[0]} y1={dBL[1]+9} x2={dBR[0]} y2={dBR[1]+9}
          stroke="#4A7FA8" strokeWidth="0.7" strokeDasharray="2 2" />
        <line x1={dBL[0]} y1={dBL[1]+6} x2={dBL[0]} y2={dBL[1]+12}
          stroke="#4A7FA8" strokeWidth="0.7" />
        <line x1={dBR[0]} y1={dBR[1]+6} x2={dBR[0]} y2={dBR[1]+12}
          stroke="#4A7FA8" strokeWidth="0.7" />
        <text x={(dBL[0]+dBR[0])/2} y={(dBL[1]+dBR[1])/2+20}
          fontSize="8" fill="#4A7FA8" textAnchor="middle" fontFamily="var(--font-mono)">
          {bW.toFixed(1)}m
        </text>

        {/* Depth label — east face bottom */}
        <line x1={dBR[0]+5} y1={dBR[1]} x2={dBRD[0]+5} y2={dBRD[1]}
          stroke="#4A7FA8" strokeWidth="0.7" strokeDasharray="2 2" />
        <text x={(dBR[0]+dBRD[0])/2+13} y={(dBR[1]+dBRD[1])/2+3}
          fontSize="8" fill="#4A7FA8" textAnchor="start" fontFamily="var(--font-mono)">
          {bD.toFixed(1)}m
        </text>

        {/* Height label — left edge */}
        <line x1={dBL[0]-8} y1={dBL[1]} x2={dTL[0]-8} y2={dTL[1]}
          stroke="#4A7FA8" strokeWidth="0.7" strokeDasharray="2 2" />
        <text x={dTL[0]-16} y={(dBL[1]+dTL[1])/2}
          fontSize="8" fill="#4A7FA8" textAnchor="middle" fontFamily="var(--font-mono)"
          transform={`rotate(-90,${dTL[0]-16},${(dBL[1]+dTL[1])/2})`}>
          {bH.toFixed(1)}m
        </text>
      </g>
    </svg>
  );
}
