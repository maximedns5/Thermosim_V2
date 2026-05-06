// BuildingIllustration — isometric 3D SVG, fully reactive to buildingStore
// Building always visible; scroll highlights the active section's component
import { useTransform, useSpring, motion, type MotionValue } from 'framer-motion';
import { useMemo } from 'react';
import { useBuildingStore } from '../../store/buildingStore';
import { MATERIALS_DB } from '../../engine/data/materials';

// ─── Material palettes ───────────────────────────────────────────────────────
// Each entry: [front face, right face, top face]
const STRUCT_COLORS: Record<string, [string, string, string]> = {
  beton_arme:       ['#C8C4BC', '#AEAAA4', '#D8D5CE'],
  brique_monomur:   ['#C4622D', '#A8502A', '#D47050'],
  brique_pleine:    ['#B85530', '#9A4428', '#CC6845'],
  brique_creuse:    ['#CB7040', '#AD5C32', '#D88055'],
  ossature_bois:    ['#C4A374', '#A88A60', '#D4B888'],
  bois_massif:      ['#BC9860', '#A08050', '#CCAC78'],
  acier:            ['#7090A8', '#567890', '#88A8C0'],
  enduit_platre:    ['#E0DDD6', '#C8C5BE', '#ECEAE4'],
  enduit_ciment:    ['#C8C4BC', '#B0ACA4', '#D8D5CE'],
  default:          ['#C8C4BC', '#AEAAA4', '#D8D5CE'],
};

const INSUL_COLORS: Record<string, string> = {
  laine_de_verre_32: '#F0C040',
  laine_de_verre_35: '#EAB830',
  laine_roche_40:    '#D4A030',
  polystyrene_expanse:'#EDE8D4',
  polystyrene_extrude:'#E0DCF0',
  polyurethane:      '#F0DC90',
  laine_bois:        '#8BC48A',
  chanvre:           '#A0C870',
  ouate_cellulose:   '#B8C8A0',
  default:           '#F0C040',
};

const ROOF_FILLS: Record<string, { top: string; front: string; right: string }> = {
  flat_concrete:  { top: '#A0A098', front: '#8A8882', right: '#787870' },
  green:          { top: '#4A8A4A', front: '#3A7A3A', right: '#2E6A2E' },
  inclined_tiles: { top: '#8B4030', front: '#7A3828', right: '#6A3020' },
  cool_roof:      { top: '#D8D8DC', front: '#C0C0C4', right: '#B0B0B4' },
};

const CITY_SKY: Record<string, string> = {
  paris: '#4870A0', strasbourg: '#3860A0', brest: '#4888B8',
  bordeaux: '#B08050', lyon: '#6888A8', marseille: '#D08050',
  clermont: '#607098', perpignan: '#C07838',
};

// ─── Isometric math ──────────────────────────────────────────────────────────
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;

const VB_W = 380;
const VB_H = 500;

function darken(hex: string, amt: number): string {
  const n = parseInt(hex.replace('#','').padEnd(6,'0'), 16);
  const r = Math.max(0, ((n>>16)&0xff) - Math.round(255*amt));
  const g = Math.max(0, ((n>>8) &0xff) - Math.round(255*amt));
  const b = Math.max(0,  (n     &0xff) - Math.round(255*amt));
  return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
}

function pts(...coords: [number,number][]): string {
  return coords.map(([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

// ─── Main component ──────────────────────────────────────────────────────────
interface Props { scrollProgress: MotionValue<number> }

export function BuildingIllustration({ scrollProgress }: Props) {
  const { config } = useBuildingStore();
  const { geometry, wallLayers, windows, roof, insulationPosition, terrain } = config;

  // ── Material colors from store ──
  const structLayer = wallLayers.find(l =>
    ['structure','maconnerie'].includes(MATERIALS_DB[l.material]?.category ?? ''));
  const insulLayer = wallLayers.find(l =>
    ['isolant','isolant_bio'].includes(MATERIALS_DB[l.material]?.category ?? ''));

  const [frontCol, rightCol, topCol] =
    STRUCT_COLORS[structLayer?.material ?? ''] ?? STRUCT_COLORS.default;
  const insulColor = INSUL_COLORS[insulLayer?.material ?? ''] ?? INSUL_COLORS.default;
  const roofFill   = ROOF_FILLS[roof.type] ?? ROOF_FILLS.flat_concrete;
  const hasInsul   = insulationPosition !== 'AUCUNE';
  const skyColor   = CITY_SKY[terrain.climateCity] ?? '#4870A0';

  // ── Compute scale from building dimensions ──
  const bW  = geometry.length;
  const bD  = geometry.width;
  const bH  = geometry.nFloors * geometry.floorHeight;
  const bFH = geometry.floorHeight;
  const NF  = geometry.nFloors;

  const PAD = 36;
  const availW = VB_W - PAD * 2;
  const availH = VB_H - PAD * 2 - 60; // leave room for labels

  const scaleW = availW / ((bW + bD) * COS30);
  const scaleH = availH / (bH + (bW + bD) * SIN30);
  const scale  = Math.min(scaleW, scaleH) * 0.88;

  const W  = bW  * scale;
  const D  = bD  * scale;
  const H  = bH  * scale;
  const FH = bFH * scale;

  const insulThickPx = hasInsul
    ? Math.max(5, (insulLayer?.thickness ?? 0.1) * scale * 1.8)
    : 0;

  // ── Origin: bottom-front-left corner ──
  const screenW = (W + D) * COS30;
  const screenH = H + (W + D) * SIN30;
  const OX = PAD + D * COS30 + (availW - screenW) / 2;
  const OY = PAD + H + (availH - screenH) / 2 + (W + D) * SIN30;

  function iso(x: number, y: number, z: number): [number, number] {
    return [OX + (x - z) * COS30, OY - y + (x + z) * SIN30];
  }

  // ── Windows ──
  const WIN_W_M = 1.4;
  const WIN_H_M = Math.min(bFH * 0.55, 1.8);
  const winW = WIN_W_M * scale;
  const winH = WIN_H_M * scale;

  const nWinFront = Math.max(1, Math.round(bW * (windows.ratioSouth ?? 0.4) / WIN_W_M));
  const nWinRight = Math.max(1, Math.round(bD * (windows.ratioEast  ?? 0.15) / WIN_W_M));

  const frontWins = useMemo(() => {
    const sp = W / (nWinFront + 1);
    return Array.from({ length: NF }, (_, f) =>
      Array.from({ length: nWinFront }, (_, i) => ({
        x: sp * (i + 1) - winW / 2,
        y: f * FH + (FH - winH) * 0.4,
      }))
    ).flat();
  }, [W, FH, NF, nWinFront, winW, winH]);

  const rightWins = useMemo(() => {
    const sp = D / (nWinRight + 1);
    return Array.from({ length: NF }, (_, f) =>
      Array.from({ length: nWinRight }, (_, i) => ({
        z: sp * (i + 1) - winW / 2,
        y: f * FH + (FH - winH) * 0.4,
      }))
    ).flat();
  }, [D, FH, NF, nWinRight, winW, winH]);

  // ── Scroll → which section is active (0-6) ──
  // Section 0=Geometry, 1=Glazing, 2=Insulation, 3=Roof, 4=Ventilation, 5=HVAC, 6=Results
  const activeSection = useTransform(scrollProgress, v => Math.min(6, Math.floor(v * 7)));

  // Glow highlight per component (1 = highlighted, 0 = normal)
  const spGlow = { stiffness: 80, damping: 18 };

  const wallGlow    = useSpring(useTransform(activeSection, (v): number => v === 0 ? 1 : 0.4), spGlow);
  const winGlow     = useSpring(useTransform(activeSection, (v): number => v === 1 ? 1 : 0.4), spGlow);
  const insulGlow   = useSpring(useTransform(activeSection, (v): number => v === 2 ? 1 : 0.4), spGlow);
  const roofGlow    = useSpring(useTransform(activeSection, (v): number => v === 3 ? 1 : 0.4), spGlow);
  const systemsGlow = useSpring(useTransform(activeSection, (v): number => v === 4 || v === 5 ? 1 : 0.4), spGlow);

  // Glow stroke opacity (only for active section)
  const wallGlowStroke    = useTransform(activeSection, v => v === 0 ? 0.9 : 0);
  const winGlowStroke     = useTransform(activeSection, v => v === 1 ? 0.9 : 0);
  const insulGlowStroke   = useTransform(activeSection, v => v === 2 ? 0.9 : 0);
  const roofGlowStroke    = useTransform(activeSection, v => v === 3 ? 0.9 : 0);

  // ── Dimension lines ──
  const [dimBL]  = [iso(0,0,0)];
  const [dimBR]  = [iso(W,0,0)];
  const [dimBRD] = [iso(W,0,D)];
  const [dimTL]  = [iso(0,H,0)];

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%"
      style={{ overflow: 'visible' }} aria-label="Isometric building illustration">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={skyColor} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="rgba(180,220,255,0.25)" />
          <stop offset="50%"  stopColor="rgba(100,180,230,0.6)" />
          <stop offset="100%" stopColor="rgba(180,220,255,0.15)" />
        </linearGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="softGlow" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#skyGrad)" />

      {/* Ground shadow */}
      <ellipse
        cx={OX + (W - D) * COS30 / 2}
        cy={OY + (W + D) * SIN30 * 0.55}
        rx={(W + D) * COS30 * 0.5}
        ry={(W + D) * SIN30 * 0.25}
        fill="rgba(0,0,0,0.18)"
      />

      {/* Ground plane */}
      <polygon
        points={pts(iso(0,0,0), iso(W,0,0), iso(W,0,D), iso(0,0,D))}
        fill="#1A2030" stroke="#2A3040" strokeWidth="0.6"
      />

      {/* ── WALLS ── */}
      <motion.g style={{ opacity: wallGlow }}>
        {/* Right face (East) */}
        <polygon
          points={pts(iso(W,0,0), iso(W,0,D), iso(W,H,D), iso(W,H,0))}
          fill={rightCol} stroke="#0A0D12" strokeWidth="0.8"
        />
        {/* Front face (South) */}
        <polygon
          points={pts(iso(0,0,0), iso(W,0,0), iso(W,H,0), iso(0,H,0))}
          fill={frontCol} stroke="#0A0D12" strokeWidth="0.8"
        />

        {/* Floor lines — front */}
        {Array.from({ length: NF - 1 }, (_, f) => {
          const fy = (f + 1) * FH;
          return (
            <line key={`ff${f}`}
              x1={iso(0,fy,0)[0]} y1={iso(0,fy,0)[1]}
              x2={iso(W,fy,0)[0]} y2={iso(W,fy,0)[1]}
              stroke={darken(frontCol, 0.15)} strokeWidth="0.8" strokeDasharray="3 2"
            />
          );
        })}
        {/* Floor lines — right */}
        {Array.from({ length: NF - 1 }, (_, f) => {
          const fy = (f + 1) * FH;
          return (
            <line key={`rf${f}`}
              x1={iso(W,fy,0)[0]} y1={iso(W,fy,0)[1]}
              x2={iso(W,fy,D)[0]} y2={iso(W,fy,D)[1]}
              stroke={darken(rightCol, 0.12)} strokeWidth="0.8" strokeDasharray="3 2"
            />
          );
        })}

        {/* Edge highlights */}
        <line x1={iso(0,0,0)[0]} y1={iso(0,0,0)[1]} x2={iso(0,H,0)[0]} y2={iso(0,H,0)[1]}
          stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
        <line x1={iso(0,H,0)[0]} y1={iso(0,H,0)[1]} x2={iso(W,H,0)[0]} y2={iso(W,H,0)[1]}
          stroke="rgba(255,255,255,0.14)" strokeWidth="1" />

        {/* Active glow outline for geometry section */}
        <motion.polygon
          points={pts(iso(0,0,0), iso(W,0,0), iso(W,H,0), iso(0,H,0))}
          fill="none" stroke="#4A7FA8" strokeWidth="2"
          filter="url(#glow)"
          style={{ opacity: wallGlowStroke }}
        />
        <motion.polygon
          points={pts(iso(W,0,0), iso(W,0,D), iso(W,H,D), iso(W,H,0))}
          fill="none" stroke="#4A7FA8" strokeWidth="2"
          filter="url(#glow)"
          style={{ opacity: wallGlowStroke }}
        />
      </motion.g>

      {/* ── INSULATION ── */}
      {hasInsul && (
        <motion.g style={{ opacity: insulGlow }}>
          {insulationPosition === 'ITE' ? (
            <>
              {/* Exterior insulation — left strip on front */}
              <polygon
                points={pts(
                  iso(-insulThickPx/scale, 0, 0),
                  iso(0, 0, 0),
                  iso(0, H, 0),
                  iso(-insulThickPx/scale, H, 0)
                )}
                fill={insulColor}
                stroke={darken(insulColor, 0.1)}
                strokeWidth="0.6"
              />
              {/* Exterior insulation — right strip on right face */}
              <polygon
                points={pts(
                  iso(W, 0, D),
                  iso(W, 0, D + insulThickPx/scale),
                  iso(W, H, D + insulThickPx/scale),
                  iso(W, H, D)
                )}
                fill={darken(insulColor, 0.08)}
                stroke={darken(insulColor, 0.15)}
                strokeWidth="0.6"
              />
              <text
                x={iso(-insulThickPx/scale - 3, H * 0.6, 0)[0]}
                y={iso(-insulThickPx/scale - 3, H * 0.6, 0)[1]}
                fontSize="7" fill={insulColor} textAnchor="end"
                fontFamily="var(--font-mono)" fontWeight="600">
                ITE
              </text>
            </>
          ) : (
            <polygon
              points={pts(
                iso(0, 0, 0),
                iso(insulThickPx/scale, 0, 0),
                iso(insulThickPx/scale, H, 0),
                iso(0, H, 0)
              )}
              fill={insulColor}
              stroke={darken(insulColor, 0.1)}
              strokeWidth="0.6"
              opacity="0.9"
            />
          )}
          {/* Insulation glow */}
          <motion.polygon
            points={hasInsul && insulationPosition === 'ITE'
              ? pts(iso(-insulThickPx/scale,0,0), iso(0,0,0), iso(0,H,0), iso(-insulThickPx/scale,H,0))
              : pts(iso(0,0,0), iso(insulThickPx/scale,0,0), iso(insulThickPx/scale,H,0), iso(0,H,0))
            }
            fill="none" stroke={insulColor} strokeWidth="2"
            filter="url(#softGlow)"
            style={{ opacity: insulGlowStroke }}
          />
        </motion.g>
      )}

      {/* ── WINDOWS — Front face ── */}
      <motion.g style={{ opacity: winGlow }}>
        {frontWins.map((w, i) => {
          const [x0,y0] = iso(w.x,        w.y,       0);
          const [x1,y1] = iso(w.x + winW, w.y,       0);
          const [x2,y2] = iso(w.x + winW, w.y + winH,0);
          const [x3,y3] = iso(w.x,        w.y + winH,0);
          const mx = (x0+x1+x2+x3)/4, my = (y0+y1+y2+y3)/4;
          return (
            <g key={`fw${i}`}>
              <polygon points={pts([x0,y0],[x1,y1],[x2,y2],[x3,y3])}
                fill="#252A35" stroke="#0A0D12" strokeWidth="0.8" />
              <polygon points={pts([x0+2,y0+1],[x1-2,y1+1],[x2-2,y2-1],[x3+2,y3-1])}
                fill="url(#glassGrad)" />
              <line x1={x0+3} y1={y0+2} x2={mx-3} y2={my}
                stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          );
        })}
        {/* Window glow overlay when glazing section is active */}
        {frontWins.map((w, i) => {
          const [x0,y0] = iso(w.x,        w.y,       0);
          const [x1,y1] = iso(w.x + winW, w.y,       0);
          const [x2,y2] = iso(w.x + winW, w.y + winH,0);
          const [x3,y3] = iso(w.x,        w.y + winH,0);
          return (
            <motion.polygon key={`fwg${i}`}
              points={pts([x0,y0],[x1,y1],[x2,y2],[x3,y3])}
              fill="none" stroke="#0B7A63" strokeWidth="2"
              filter="url(#softGlow)"
              style={{ opacity: winGlowStroke }}
            />
          );
        })}
      </motion.g>

      {/* ── WINDOWS — Right face ── */}
      <motion.g style={{ opacity: winGlow }}>
        {rightWins.map((w, i) => {
          const [x0,y0] = iso(W, w.y,       w.z);
          const [x1,y1] = iso(W, w.y,       w.z + winW);
          const [x2,y2] = iso(W, w.y + winH,w.z + winW);
          const [x3,y3] = iso(W, w.y + winH,w.z);
          return (
            <g key={`rw${i}`}>
              <polygon points={pts([x0,y0],[x1,y1],[x2,y2],[x3,y3])}
                fill="#252A35" stroke="#0A0D12" strokeWidth="0.8" />
              <polygon points={pts([x0-1,y0+1],[x1+1,y1+1],[x2+1,y2-1],[x3-1,y3-1])}
                fill="url(#glassGrad)" />
            </g>
          );
        })}
      </motion.g>

      {/* ── ROOF ── */}
      <motion.g style={{ opacity: roofGlow }}>
        {roof.type === 'inclined_tiles' ? (
          <>
            <polygon
              points={pts(iso(0,H,0), iso(W,H,0), iso(W/2, H + D*0.4, D/2))}
              fill={roofFill.front} stroke="#0A0D12" strokeWidth="0.8" />
            <polygon
              points={pts(iso(W,H,0), iso(W,H,D), iso(W/2, H + D*0.4, D/2))}
              fill={roofFill.right} stroke="#0A0D12" strokeWidth="0.8" />
          </>
        ) : roof.type === 'green' ? (
          <>
            <polygon
              points={pts(iso(0,H,0), iso(W,H,0), iso(W,H,D), iso(0,H,D))}
              fill={roofFill.top} stroke="#0A0D12" strokeWidth="0.8" />
            {Array.from({ length: 5 }, (_, i) => {
              const [ex, ey] = iso((i + 0.5) * W / 5, H + 0.4, D * 0.4);
              return <ellipse key={i} cx={ex} cy={ey}
                rx={W * 0.055} ry={W * 0.03}
                fill="#5AB05A" opacity="0.88" />;
            })}
            {/* Green parapet */}
            <polygon
              points={pts(iso(0,H,0), iso(W,H,0), iso(W,H+0.25,0), iso(0,H+0.25,0))}
              fill={roofFill.front} stroke="#0A0D12" strokeWidth="0.8" />
          </>
        ) : (
          <>
            {/* Flat roof — top face */}
            <polygon
              points={pts(iso(0,H,0), iso(W,H,0), iso(W,H,D), iso(0,H,D))}
              fill={roof.type === 'cool_roof' ? '#D0D8E0' : topCol}
              stroke="#0A0D12" strokeWidth="0.8" />
            {/* Cool roof sheen */}
            {roof.type === 'cool_roof' && (
              <polygon
                points={pts(iso(0,H,0), iso(W,H,0), iso(W,H,D), iso(0,H,D))}
                fill="rgba(200,220,255,0.4)" />
            )}
            {/* Parapet front */}
            <polygon
              points={pts(iso(0,H,0), iso(W,H,0), iso(W,H+0.2,0), iso(0,H+0.2,0))}
              fill={darken(frontCol, 0.04)} stroke="#0A0D12" strokeWidth="0.8" />
            {/* Parapet right */}
            <polygon
              points={pts(iso(W,H,0), iso(W,H,D), iso(W,H+0.2,D), iso(W,H+0.2,0))}
              fill={darken(rightCol, 0.04)} stroke="#0A0D12" strokeWidth="0.8" />
          </>
        )}
        {/* Roof glow */}
        <motion.polygon
          points={pts(iso(0,H,0), iso(W,H,0), iso(W,H,D), iso(0,H,D))}
          fill="none" stroke="#8B4030" strokeWidth="2"
          filter="url(#softGlow)"
          style={{ opacity: roofGlowStroke }}
        />
      </motion.g>

      {/* ── VENTILATION airflow (sections 4+5) ── */}
      <motion.g style={{ opacity: systemsGlow }}>
        {[0.28, 0.58].map((pct, i) => {
          const [ax, ay] = iso(W * pct, H * 0.55, 0);
          return (
            <motion.path key={i}
              d={`M ${ax} ${ay-8} C ${ax+7} ${ay-4} ${ax+7} ${ay+4} ${ax} ${ay+8}`}
              stroke="#0B7A63" strokeWidth="1.2" fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 1.2, delay: i * 0.4, ease: 'easeInOut',
                repeat: Infinity, repeatDelay: 2, repeatType: 'loop' }}
            />
          );
        })}
      </motion.g>

      {/* ── DIMENSION LABELS ── */}
      <g fill="none">
        {/* Width label (front bottom) */}
        <line x1={dimBL[0]} y1={dimBL[1]+8} x2={dimBR[0]} y2={dimBR[1]+8}
          stroke="#4A7FA8" strokeWidth="0.6" strokeDasharray="2 2" />
        <line x1={dimBL[0]} y1={dimBL[1]+5} x2={dimBL[0]} y2={dimBL[1]+11}
          stroke="#4A7FA8" strokeWidth="0.6" />
        <line x1={dimBR[0]} y1={dimBR[1]+5} x2={dimBR[0]} y2={dimBR[1]+11}
          stroke="#4A7FA8" strokeWidth="0.6" />
        <text x={(dimBL[0]+dimBR[0])/2} y={(dimBL[1]+dimBR[1])/2+18}
          fontSize="8" fill="#4A7FA8" textAnchor="middle" fontFamily="var(--font-mono)">
          {bW.toFixed(1)}m
        </text>

        {/* Depth label (right bottom) */}
        <line x1={dimBR[0]+5} y1={dimBR[1]} x2={dimBRD[0]+5} y2={dimBRD[1]}
          stroke="#4A7FA8" strokeWidth="0.6" strokeDasharray="2 2" />
        <text x={(dimBR[0]+dimBRD[0])/2+12} y={(dimBR[1]+dimBRD[1])/2+3}
          fontSize="8" fill="#4A7FA8" textAnchor="start" fontFamily="var(--font-mono)">
          {bD.toFixed(1)}m
        </text>

        {/* Height label (left edge) */}
        <line x1={dimBL[0]-8} y1={dimBL[1]} x2={dimTL[0]-8} y2={dimTL[1]}
          stroke="#4A7FA8" strokeWidth="0.6" strokeDasharray="2 2" />
        <text
          x={dimTL[0]-15} y={(dimBL[1]+dimTL[1])/2}
          fontSize="8" fill="#4A7FA8" textAnchor="middle" fontFamily="var(--font-mono)"
          transform={`rotate(-90,${dimTL[0]-15},${(dimBL[1]+dimTL[1])/2})`}>
          {bH.toFixed(1)}m
        </text>
      </g>
    </svg>
  );
}
