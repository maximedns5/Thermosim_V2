// HeatLossHeatmap — pertes par heure (24×365 pixels)
import { useMemo, useRef, useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore';

export function HeatLossHeatmap() {
  const { annualResult } = useSimulationStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const data = annualResult?.Q_heat;

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const H = 24, D = 365;
    canvas.width = D; canvas.height = H;

    const max = Math.max(...Array.from(data));
    const img = ctx.createImageData(D, H);

    for (let d = 0; d < D; d++) {
      for (let h = 0; h < H; h++) {
        const idx = d * 24 + h;
        const v = (data[idx] ?? 0) / max;
        const i4 = (h * D + d) * 4;
        // Palette : blanc → bleu marine
        img.data[i4]     = Math.round(244 - v * 180);
        img.data[i4 + 1] = Math.round(242 - v * 200);
        img.data[i4 + 2] = Math.round(237 - v * 30);
        img.data[i4 + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [data]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-32 text-xs font-mono text-ink-4">
        Run the 8760h simulation to display the heatmap
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-sans text-ink-3 uppercase tracking-wider">Hourly heat losses — 8760h</p>
      <canvas
        ref={canvasRef}
        className="w-full border border-rule"
        style={{ imageRendering: 'pixelated', height: 80 }}
        aria-label="Hourly heat loss heatmap"
      />
      <div className="flex justify-between text-xs font-mono text-ink-4">
        <span>Jan.</span><span>Apr.</span><span>Jul.</span><span>Oct.</span><span>Dec.</span>
      </div>
    </div>
  );
}
