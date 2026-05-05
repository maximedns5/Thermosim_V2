# ThermoSim Web V2

Simulation thermique du bâtiment, entièrement dans le navigateur.  
Interface "blueprint sur papier calque" — aucun framework UI externe.

---

## Stack technique

| Couche | Lib |
|---|---|
| Framework | React 18 + TypeScript 5.3 strict |
| Build | Vite 5 |
| 3D | Three.js 0.162 + @react-three/fiber 8 + @react-three/drei 9 |
| Style | Tailwind CSS 3.4 (tokens custom, zéro couleur par défaut) |
| État global | Zustand 4.5 + Immer |
| Animations | Framer-motion 11 |
| Worker | Web Worker ESM + Comlink 4.4 |
| Polices | IBM Plex Mono / Sans / Serif (@fontsource) |
| Tests | Vitest 2 |

---

## Commandes

```bash
# Développement
npm run dev

# Tests unitaires
npx vitest run

# Tests en mode watch
npx vitest

# Build production
npm run build

# Vérification TypeScript
npx tsc --noEmit
```

---

## Architecture

```
src/
├── engine/               # Moteur physique (zéro React)
│   ├── types.ts          # Toutes les interfaces TypeScript
│   ├── data/             # BDD matériaux, vitrages, HVAC, énergie, ponts, …
│   ├── models/           # Wall, Window, HeatPump, Ventilation
│   ├── physics/          # wind, sky, solar, humidity, comfort
│   ├── energy/           # DPE RE2020
│   ├── solver/           # steady.ts (régime permanent), dynamic.ts (8 760 h)
│   └── index.ts          # API publique
├── store/                # Zustand : buildingStore, uiStore, simulationStore
├── hooks/                # useSimulation, useDerivedMetrics, useKeyboardShortcuts
├── worker/               # simulation.worker.ts + api.ts (Comlink)
├── components/
│   ├── svg/              # FacadeView, SectionView, PlanView (SVG 2D)
│   ├── three/            # BuildingScene, BuildingModel, shaders GLSL, …
│   ├── charts/           # DpeLabel, HeatLossHeatmap, Sankey, TimeSeries, …
│   ├── config/           # ConfigPanel + 7 sections + 5 contrôles
│   ├── layout/           # Header, MetricsBar, Folio
│   └── ui/               # FlipCounter
├── styles/
│   ├── tokens.css        # Variables CSS (palette, typographie, espacement)
│   └── base.css          # Reset + classes utilitaires globales
└── tests/                # Tests unitaires Vitest
```

---

## Moteur physique

### Régime permanent (solver/steady.ts)
Calcul des déperditions par composant selon EN 12831 :

Q_design = SUM_i U_i * A_i * (T_int - T_ext_min) + Q_ventilation

Sorties : U_wall, R_total, Q_design_W, décomposition par poste, EP_m2, CO2_m2, lettre DPE.

### Dynamique (solver/dynamic.ts)
Simulation horaire sur 8 760 h (1 an TMY) via Web Worker :

- Capacité thermique de la paroi (méthode des 5R1C simplifié)
- Apports solaires horaires (modèle Pérez)
- Gains internes (occupants + éclairage + équipements)
- COP variable de la PAC selon température source (courbe polynomiale)
- PMV/PPD Fanger (EN ISO 7730) pour chaque heure

### Confort hygrothermique
Diagramme de Glaser simplifié (EN ISO 13788) pour le risque de condensation interstielle.

---

## Charte graphique

| Rôle | Token | Valeur |
|---|---|---|
| Fond papier | --paper | #F4F2ED |
| Surface blanche | --surface | #FFFFFF |
| Encre principale | --ink | #0A0A0A |
| Filet de plan | --rule | #C8C5BE |
| Accent critique | --accent | #C1440E |

L'accent UNIQUEMENT pour DPE F/G et dépassements de seuils critiques.
Pas d'emoji, pas de dégradé, pas de glassmorphisme, border-radius <= 4 px.

---

## Raccourcis clavier

| Touche | Action |
|---|---|
| 1 | Vue 3D isométrique |
| 2 | Vue façade Sud (SVG) |
| 3 | Vue coupe (SVG) |
| 4 | Plan masse (SVG) |
| Space | Lancer simulation 8 760 h |
| E | Activer/désactiver vue éclatée |
| S | Activer/désactiver coupe |

---

## DPE RE2020

Seuils énergie primaire (kWhEP/m²·an) :

| Lettre | Seuil max |
|---|---|
| A | 70 |
| B | 110 |
| C | 180 |
| D | 250 |
| E | 330 |
| F | 420 |
| G | > 420 |

Facteur énergie primaire électricité : 2,3 (RE2020).

---

## Tests

```bash
npx vitest run
```

Fichiers de tests (src/tests/) :
- wall.test.ts — Modèle de paroi (U, R, profil de température)
- heatPump.test.ts — COP PAC (variation T source/départ)
- dpe.test.ts — Lettres DPE, facteurs EP, CO2
- solver.test.ts — Solveur régime permanent
- ventilation.test.ts — Débits, pertes, ventilateur
- humidity.test.ts — psat, point de rosée, Glaser
- comfort.test.ts — PMV/PPD Fanger, catégories EN 7730

---

## Licence

MIT — 2026
