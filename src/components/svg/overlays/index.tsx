// Annotations SVG — cotation, bulles, échelle, rose des vents

interface DimensionLineProps {
  x1: number; y1: number;
  x2: number; y2: number;
  label: string;
  offset?: number;
  horizontal?: boolean;
}

export function DimensionLine({ x1, y1, x2, y2, label, offset = 20, horizontal = true }: DimensionLineProps) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g className="dimension-line" style={{ color: 'var(--color-ink-3)' }}>
      {horizontal ? (
        <>
          <line x1={x1} y1={y1 - offset} x2={x2} y2={y2 - offset} stroke="currentColor" strokeWidth="0.5" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />
          <line x1={x1} y1={y1} x2={x1} y2={y1 - offset - 4} stroke="currentColor" strokeWidth="0.5" />
          <line x1={x2} y1={y2} x2={x2} y2={y2 - offset - 4} stroke="currentColor" strokeWidth="0.5" />
          <text x={mx} y={y1 - offset - 5} textAnchor="middle" fontSize="9" fill="currentColor" fontFamily="var(--font-mono)">{label}</text>
        </>
      ) : (
        <>
          <line x1={x1 - offset} y1={y1} x2={x2 - offset} y2={y2} stroke="currentColor" strokeWidth="0.5" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />
          <line x1={x1} y1={y1} x2={x1 - offset - 4} y2={y1} stroke="currentColor" strokeWidth="0.5" />
          <line x1={x2} y1={y2} x2={x2 - offset - 4} y2={y2} stroke="currentColor" strokeWidth="0.5" />
          <text x={x1 - offset - 5} y={my} textAnchor="middle" fontSize="9" fill="currentColor" fontFamily="var(--font-mono)" transform={`rotate(-90, ${x1 - offset - 5}, ${my})`}>{label}</text>
        </>
      )}
    </g>
  );
}

interface LeaderLineProps {
  x: number; y: number;
  targetX: number; targetY: number;
  label: string;
}

export function LeaderLine({ x, y, targetX, targetY, label }: LeaderLineProps) {
  return (
    <g>
      <line x1={targetX} y1={targetY} x2={x} y2={y} stroke="var(--color-ink-3)" strokeWidth="0.5" />
      <circle cx={targetX} cy={targetY} r="1.5" fill="var(--color-ink-3)" />
      <text x={x + 4} y={y + 3} fontSize="9" fill="var(--color-ink-2)" fontFamily="var(--font-mono)">{label}</text>
    </g>
  );
}

interface NumberedCalloutProps {
  x: number; y: number;
  n: number;
}

export function NumberedCallout({ x, y, n }: NumberedCalloutProps) {
  return (
    <g>
      <circle cx={x} cy={y} r="8" fill="var(--color-surface)" stroke="var(--color-ink-2)" strokeWidth="0.8" />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontWeight="600">{n}</text>
    </g>
  );
}

interface ScaleBarProps {
  x: number; y: number;
  pixelsPerMeter: number;
  maxMeters?: number;
}

export function ScaleBar({ x, y, pixelsPerMeter, maxMeters = 5 }: ScaleBarProps) {
  const width = Math.floor(maxMeters) * pixelsPerMeter;
  const label = `0         ${Math.floor(maxMeters)} m`;
  return (
    <g>
      <rect x={x} y={y} width={width} height="4" fill="var(--color-ink)" />
      <rect x={x + width / 2} y={y} width={width / 2} height="4" fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="0.5" />
      <text x={x} y={y + 12} fontSize="8" fill="var(--color-ink-3)" fontFamily="var(--font-mono)">{label}</text>
    </g>
  );
}

export function NorthRose({ x, y, size = 20 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <polygon points={`0,${-size} ${size * 0.3},0 0,${size * 0.3} ${-size * 0.3},0`} fill="var(--color-ink)" />
      <polygon points={`0,${size} ${size * 0.3},0 0,${-size * 0.3} ${-size * 0.3},0`} fill="var(--color-paper-alt)" stroke="var(--color-ink)" strokeWidth="0.5" />
      <text x="0" y={-size - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--color-ink)" fontFamily="var(--font-sans)">N</text>
    </g>
  );
}

interface CartoucheProps {
  x: number; y: number; width: number;
  title: string;
  subtitle?: string;
  scale?: string;
  date?: string;
}

export function Cartouche({ x, y, width, title, subtitle, scale, date }: CartoucheProps) {
  return (
    <g fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink)">
      <rect x={x} y={y} width={width} height={52} fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="0.8" />
      <line x1={x} y1={y + 18} x2={x + width} y2={y + 18} stroke="var(--color-rule)" strokeWidth="0.5" />
      <line x1={x} y1={y + 36} x2={x + width} y2={y + 36} stroke="var(--color-rule)" strokeWidth="0.5" />
      <text x={x + 6} y={y + 13} fontSize="11" fontWeight="700">{title}</text>
      {subtitle && <text x={x + 6} y={y + 29} fill="var(--color-ink-3)">{subtitle}</text>}
      {scale && <text x={x + 6} y={y + 47}>Éch. {scale}</text>}
      {date && <text x={x + width - 6} y={y + 47} textAnchor="end">{date}</text>}
    </g>
  );
}

export function SvgArrowDefs() {
  return (
    <defs>
      <marker id="arrow-start" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
        <path d="M0,3 L6,0 L6,6 Z" fill="var(--color-ink-3)" />
      </marker>
      <marker id="arrow-end" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-ink-3)" />
      </marker>
    </defs>
  );
}
