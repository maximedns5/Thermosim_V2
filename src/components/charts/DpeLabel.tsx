// Étiquette DPE — style officiel ADEME simplifié
import type { DpeLetter } from '../../engine/types';

const DPE_COLORS: Record<DpeLetter, string> = {
  A: '#009a44',
  B: '#51b84c',
  C: '#c3d300',
  D: '#f7d400',
  E: '#f7a600',
  F: '#f06a00',
  G: '#e2001a',
};

const DPE_WIDTH: Record<DpeLetter, number> = {
  A: 40, B: 50, C: 60, D: 70, E: 80, F: 90, G: 100,
};

interface DpeLabelProps {
  letter: DpeLetter;
  epValue?: number;
  co2Value?: number;
  compact?: boolean;
  dark?: boolean;
}

export function DpeLabel({ letter, epValue, co2Value, compact = false, dark = false }: DpeLabelProps) {
  if (compact) {
    return (
      <div
        className="inline-flex items-center justify-center font-mono font-bold text-white"
        style={{
          background: DPE_COLORS[letter],
          minWidth: dark ? 28 : 32,
          fontSize: dark ? 20 : undefined,
          padding: dark ? '2px 8px' : '4px 8px',
        }}
        aria-label={`DPE classe ${letter}`}
      >
        {letter}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 font-mono text-xs" aria-label={`Diagnostic de performance énergétique classe ${letter}`}>
      {(['A', 'B', 'C', 'D', 'E', 'F', 'G'] as DpeLetter[]).map((l) => (
        <div key={l} className="flex items-center gap-1">
          <div
            className="flex items-center justify-end pr-2 text-white font-bold text-xs"
            style={{
              background: DPE_COLORS[l],
              width: DPE_WIDTH[l],
              height: 18,
              clipPath: l === 'G' ? undefined : 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
            }}
          >
            {l}
          </div>
          {l === letter && epValue !== undefined && (
            <span className="text-ink-3">{Math.round(epValue)} kWhEP/(m²·an)</span>
          )}
        </div>
      ))}
      {co2Value !== undefined && (
        <p className="text-ink-4 mt-1">{co2Value.toFixed(1)} kgCO₂eq/(m²·an)</p>
      )}
    </div>
  );
}
