// Onglet Analyse — tous les graphiques en grand + explications
import { useState } from 'react';
import { SankeyEnergy } from '../charts/SankeyEnergy';
import { HeatLossHeatmap } from '../charts/HeatLossHeatmap';
import { TimeSeries24h } from '../charts/TimeSeries24h';
import { TimeSeriesAnnual } from '../charts/TimeSeriesAnnual';
import { GlaserDiagram } from '../charts/GlaserDiagram';
import { HvacPerformance } from '../charts/HvacPerformance';
import { ScenarioRadar } from '../charts/ScenarioRadar';
import { useDerivedMetrics } from '../../hooks/useDerivedMetrics';
import { useBuildingStore } from '../../store/buildingStore';
import { useUIStore } from '../../store/uiStore';
import { HEATING_SYSTEMS } from '../../engine/data/hvac';

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, explain, children }: {
  title: string;
  explain: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-rule bg-paper rounded-sm overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-rule bg-paper-alt">
        <p className="text-xs font-sans font-semibold uppercase tracking-widest text-ink">{title}</p>
        <p className="mt-1 text-xs font-sans text-ink-3 leading-relaxed">{explain}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Bloc KPI ─────────────────────────────────────────────────────────────────
function Kpi({ label, value, unit, sub }: { label: string; value: string; unit: string; sub?: string }) {
  return (
    <div className="flex flex-col border border-rule px-4 py-3 bg-paper-alt rounded-sm">
      <span className="text-2xs font-sans uppercase tracking-wider text-ink-4">{label}</span>
      <span className="text-xl font-mono font-bold text-ink leading-tight">
        {value} <span className="text-sm font-normal text-ink-3">{unit}</span>
      </span>
      {sub && <span className="text-xs font-mono text-ink-4">{sub}</span>}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function AnalyseView() {
  const m = useDerivedMetrics();
  const config = useBuildingStore((s) => s.config);
  const { aptSizeM2, setAptSizeM2 } = useUIStore();
  const heatingSys = HEATING_SYSTEMS[config.hvac?.heatingId ?? ''] as { name: string } | undefined;
  const A_floor = config.geometry.length * config.geometry.width;
  const A_total = A_floor * config.geometry.nFloors;

  // Dérivations par appartement
  const nAptPerFloor = Math.max(1, Math.floor(A_floor / aptSizeM2));
  const nAptTotal = nAptPerFloor * config.geometry.nFloors;
  const costPerApt = nAptTotal > 0 ? m.cost_eur / nAptTotal : 0;
  const costPerM2Apt = aptSizeM2 > 0 ? costPerApt / aptSizeM2 : 0;

  // Local input for apt size editor
  const [aptInput, setAptInput] = useState(String(aptSizeM2));

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-8">

        {/* ── Header ── */}
        <div className="border-b border-rule pb-4">
          <h1 className="text-base font-mono font-bold text-ink uppercase tracking-widest">
            Building thermal analysis
          </h1>
          <p className="mt-1 text-xs font-sans text-ink-3">
            Steady-state + dynamic 8760h simulation results.
            Click "SIM 8760h" to enable dynamic charts.
          </p>
        </div>

        {/* ── KPIs summary ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Kpi label="Wall U" value={m.U_wall.toFixed(3)} unit="W/(m²·K)"
            sub={`R = ${m.R_wall.toFixed(2)} m²·K/W`} />
          <Kpi label="Design Q" value={(m.Q_design_W / 1000).toFixed(1)} unit="kW"
            sub="peak winter load" />
          <Kpi label="Primary EP" value={m.EP_m2.toFixed(0)} unit="kWhEP/(m²·yr)"
            sub={`EPC: ${m.dpe}`} />
          <Kpi label="CO₂" value={m.CO2_m2.toFixed(1)} unit="kgCO₂/(m²·yr)" />
          <Kpi label="Total cost/yr" value={m.cost_eur.toFixed(0)} unit="€/yr"
            sub={`${heatingSys?.name ?? '—'}`} />
          <Kpi label="Total area" value={A_total.toFixed(0)} unit="m²"
            sub={`${config.geometry.nFloors} floor(s)`} />
        </div>

        {/* ── Cost per apartment calculator ── */}
        <div className="border border-rule bg-paper rounded-sm overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-rule bg-paper-alt">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-ink">Cost per apartment</p>
            <p className="mt-1 text-xs font-sans text-ink-3 leading-relaxed">
              Enter a typical apartment area to estimate the annual heating + DHW cost per unit.
            </p>
          </div>
          <div className="p-4 space-y-4">
            {/* Apt size input */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-mono text-ink-3 shrink-0">Apartment area</label>
              <input
                type="number"
                min={10}
                max={500}
                step={5}
                value={aptInput}
                onChange={(e) => setAptInput(e.target.value)}
                onBlur={() => {
                  const v = parseFloat(aptInput);
                  if (!isNaN(v) && v >= 10) { setAptSizeM2(v); setAptInput(String(v)); }
                  else setAptInput(String(aptSizeM2));
                }}
                className="w-24 border border-rule bg-paper px-2 py-1 text-sm font-mono text-ink focus:outline-none focus:border-ink"
              />
              <span className="text-xs font-mono text-ink-4">m²</span>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Kpi label="Apts / floor" value={String(nAptPerFloor)} unit=""
                sub={`${A_floor.toFixed(0)} m² ÷ ${aptSizeM2} m²`} />
              <Kpi label="Total apts" value={String(nAptTotal)} unit=""
                sub={`${config.geometry.nFloors} fl.`} />
              <Kpi label="Cost / apt / yr" value={costPerApt.toFixed(0)} unit="€/yr"
                sub={`${heatingSys?.name ?? '—'}`} />
              <Kpi label="Cost / m² apt" value={costPerM2Apt.toFixed(1)} unit="€/(m²·yr)"
                sub="heating + DHW" />
            </div>

            <p className="text-xs font-sans text-ink-4 leading-relaxed">
              <strong>Method:</strong> apartments per floor are calculated as
              {' '}<em>floor(S_floor ÷ S_apt)</em> — circulation areas not deducted.
              The total annual cost is split equally across all apartments.
              This cost covers heating and domestic hot water only.
            </p>
          </div>
        </div>

        {/* ── Annual cost explanation ── */}
        <div className="p-4 bg-paper-alt border border-rule text-xs font-sans text-ink-3 leading-relaxed space-y-1">
          <p className="font-semibold text-ink">How is the annual cost calculated?</p>
          <p>
            1. <strong>Heating demand</strong> (kWh/yr) is computed via unified degree-days (HDD 2500 by default)
            from the design heat loss Q_design and the building envelope.
          </p>
          <p>
            2. Divided by the <strong>efficiency</strong> of the chosen heating system (heat pump COP, boiler η…)
            to obtain final energy consumed (kWh FE).
          </p>
          <p>
            3. A <strong>DHW</strong> estimate is added (domestic hot water, EN 15316: ≈ 35 kWh/m²/yr
            divided by DHW system efficiency).
          </p>
          <p>
            4. Final energy is multiplied by the <strong>unit price</strong> of the energy carrier
            (e.g. electricity ≈ 0.228 €/kWh, gas ≈ 0.119 €/kWh).
            <em> This cost covers heating + DHW only, not other electrical uses.</em>
          </p>
        </div>

        {/* ── Heat loss flow ── */}
        <Section
          title="Thermal heat loss flow — steady state"
          explain={
            <>
              This diagram shows how the building's <strong>total heat losses</strong> (in W, for the winter
              design day) are distributed across five components: walls, windows, roof, ground floor
              and ventilation. Each band width is proportional to its share of losses.
              <br />
              <strong>How to read it:</strong> the left node (square) represents the total power the heating
              system must supply. Bands branching to the right represent heat escape paths.
              The wider a band, the more that component contributes to heat loss.
            </>
          }
        >
          <div className="max-w-lg"><SankeyEnergy /></div>
        </Section>

        {/* ── Heatmap ── */}
        <Section
          title="Heating demand heatmap — 8760h"
          explain={
            <>
              Each pixel represents <strong>1 hour</strong> of the year.
              <strong> Horizontal axis</strong> = 365 days (January on left, December on right).
              <strong> Vertical axis</strong> = 24 hours of the day (0h top, 23h bottom).
              <strong> Color</strong> = required heating power: white ≈ 0 W (no heating needed),
              dark blue = high demand.
              <br />
              White areas in summer indicate no heating demand. Dark bands in January/February correspond
              to cold nights. Isolated dark columns indicate cold snaps.
            </>
          }
        >
          <HeatLossHeatmap />
        </Section>

        {/* ── 24h profile + PMV ── */}
        <Section
          title="Average daily profile — temperature & comfort"
          explain={
            <>
              Hourly average over the full year. The <strong>solid line</strong> is the indoor temperature
              T_zone (°C) — it shows whether the heating system maintains the setpoint.
              The <strong>dashed line</strong> is the PMV (Predicted Mean Vote, ISO 7730):
              0 = neutral comfort, −3 = cold, +3 = hot. Target −0.5 to +0.5 for a comfortable building.
            </>
          }
        >
          <div className="max-w-lg"><TimeSeries24h /></div>
        </Section>

        {/* ── Annual series ── */}
        <Section
          title="Annual evolution — temperature & heating"
          explain={
            <>
              8760h time series. The <strong>solid line (°C)</strong> is the indoor temperature T_zone
              throughout the year. The <strong>dashed line (kW)</strong> is the heating power Q_heat:
              it rises in winter and drops to zero in summer. Peaks correspond to the coldest nights.
              This view helps verify the building does not overheat in summer (T_zone should not exceed
              26–28 °C for extended periods).
            </>
          }
        >
          <div className="max-w-lg"><TimeSeriesAnnual /></div>
        </Section>

        {/* ── Glaser diagram ── */}
        <Section
          title="Glaser diagram — condensation risk"
          explain={
            <>
              This diagram analyses the risk of <strong>condensation within the wall</strong> under steady-state
              winter conditions (assumptions: T_ext = −5 °C, RH_ext = 80 %, T_int = 20 °C, RH_int = 50 %).
              <br />
              <strong>X axis</strong>: wall thickness from exterior (EXT) to interior (INT).
              <br />
              <strong>p_sat curve (solid)</strong>: saturation vapour pressure — follows the temperature profile
              in the wall. As temperature drops toward the exterior, p_sat also drops.
              <br />
              <strong>p_v curve (dashed)</strong>: actual vapour pressure calculated by the Glaser method.
              <br />
              <strong>Risk</strong>: if p_v &gt; p_sat at any point, vapour condenses in the wall
              → risk of mould and insulation degradation. Ensure p_v stays below p_sat throughout.
            </>
          }
        >
          <div className="max-w-sm"><GlaserDiagram /></div>
        </Section>

        {/* ── Heat pump COP ── */}
        <Section
          title="Heat pump performance — COP vs. source temperature"
          explain={
            <>
              COP (Coefficient of Performance) curve of the heat pump as a function of the
              <strong> cold source temperature</strong> (T_ext for an air-to-air or air-to-water HP).
              A COP of 3 means the HP delivers 3 kWh of heat per 1 kWh of electricity consumed.
              <br />
              The colder the outdoor temperature, the lower the COP — which is why heat pumps perform
              less efficiently in very cold weather. The shaded area indicates the typical temperature range
              for the selected climate site.
            </>
          }
        >
          <div className="max-w-sm"><HvacPerformance /></div>
        </Section>

        {/* ── Multi-criteria radar ── */}
        <Section
          title="Multi-criteria radar"
          explain={
            <>
              Star chart across 6 normalised criteria (0 = poor, 1 = excellent):
              thermal insulation, glazing performance, HVAC system efficiency, airtightness,
              thermal mass and EPC rating. Quickly compare the building's strengths and weaknesses
              and identify the highest-priority areas for improvement.
            </>
          }
        >
          <div className="max-w-xs"><ScenarioRadar /></div>
        </Section>

        {/* ── Section & Plan explanation ── */}
        <div className="p-4 bg-paper-alt border border-rule text-xs font-sans text-ink-3 leading-relaxed space-y-3">
          <p className="font-semibold text-ink text-sm">What are the Section and Plan tabs for?</p>
          <p>
            <strong>SECTION</strong> — Vertical cross-section of the building. Shows, from floor to roof,
            the stacking of external wall layers (concrete, insulation, render…) with their thicknesses and
            thermal conductivities (λ). Useful for visually verifying wall composition and estimating total thickness.
          </p>
          <p>
            <strong>PLAN</strong> — Horizontal floor plan (as if cutting the building at mid-height and looking down).
            Shows the building geometry, orientation, and north wall layer composition. Useful for checking
            glazing area ratios and solar orientation.
          </p>
        </div>

      </div>
    </div>
  );
}
