// ComfortMap — carte de confort PMV annuelle (scatter-like heatmap)
import { useRef, useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore';

export function ComfortMap() {
  const { annualResult } = useSimulationStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !annualResult?.pmv) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 365, H = 24;
    canvas.width = W; canvas.height = H;
    const img = ctx.createImageData(W, H);

    for (let d = 0; d < 365; d++) {
      for (let h = 0; h < 24; h++) {
        const pmv = annualResult.pmv[d * 24 + h];
        // -3..+3 → couleur : bleu (froid) / blanc (neutre) / rouge (chaud)
        const t = (pmv + 3) / 6;
        const i4 = (h * W + d) * 4;
        // Froid = #4B6CB7, Confort = #F4F2ED, Chaud = #C1440E
        if (t < 0.5) {
          const s = t * 2;
          img.data[i4]     = Math.round(75 + s * (244 - 75));
          img.data[i4 + 1] = Math.round(108 + s * (242 - 108));
          img.data[i4 + 2] = Math.round(183 + s * (237 - 183));
        } else {
          const s = (t - 0.5) * 2;
          img.data[i4]     = Math.round(244 + s * (193 - 244));
          img.data[i4 + 1] = Math.round(242 + s * (68 - 242));
          img.data[i4 + 2] = Math.round(237 + s * (14 - 237));
        }
        img.data[i4 + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [annualResult?.pmv]);

  if (!annualResult) {
    return <div className="text-xs font-mono text-ink-4 h-20 flex items-center">Simulation required</div>;
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-sans text-ink-3 uppercase tracking-wider">PMV comfort map — 8760h</p>
      <canvas
        ref={canvasRef}
        className="w-full border border-rule"
        style={{ imageRendering: 'pixelated', height: 64 }}
        aria-label="Annual PMV comfort map"
      />
      <div className="flex justify-between text-xs font-mono text-ink-4">
        <span className="text-blue-500">Cold (PMV&lt;-0.5)</span>
        <span>Comfort</span>
        <span className="text-accent">Hot (PMV&gt;+0.5)</span>
      </div>
    </div>
  );
}
