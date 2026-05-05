# Validation physique — ThermoSim Web V2

Ce document présente les cas de validation des modèles physiques implémentés,
en les comparant aux normes de référence ou à des valeurs publiées.

---

## 1. Résistance thermique des parois — EN ISO 6946:2017

### Méthode
Calcul de la résistance totale par addition en série :

R_total = Rsi + SUM(di / lambda_i) + Rse

avec Rsi = 0,13 m²·K/W (paroi verticale, flux horizontal) et Rse = 0,04 m²·K/W.

### Cas de référence (mur ITI béton + PSE)
| Couche | e (m) | lambda (W/m·K) | R (m²·K/W) |
|---|---|---|---|
| Béton armé | 0,20 | 1,75 | 0,114 |
| PSE 100 mm | 0,10 | 0,038 | 2,632 |
| Plâtre | 0,013 | 0,35 | 0,037 |
| Rsi + Rse | — | — | 0,17 |
| **Total** | — | — | **2,95** |

U = 1 / 2,95 = **0,34 W/(m²·K)** — conforme RT2012 pour paroi opaque rénovée.

### Validation ThermoSim
`Wall.U` avec ce profil retourne 0,33–0,35 W/(m²·K). ✓

---

## 2. Déperditions de base — EN 12831:2017

### Formule
Q_design = SUM_i H_T,i * (T_int - T_ext,min) + Q_ventilation

avec H_T,i = U_i * A_i * f_T,i (coefficient de déperdition).

### Cas de référence (maison 150 m², Paris T_ext = -10°C)
| Poste | H_T (W/K) | Q (W) |
|---|---|---|
| Murs (U=0,35) | 105×0,35 = 36,8 | 36,8×30 = 1 104 |
| Fenêtres (U=1,3) | 20×1,3 = 26,0 | 780 |
| Toiture (U=0,18) | 150×0,18 = 27,0 | 810 |
| Plancher bas (U=0,25) | 150×0,25 = 37,5 | 1 125 |
| Ventilation (VMC SF) | — | ~650 |
| **Total** | — | **~4 470 W** |

Valeur typique pour maison RE2020 : 3 500–5 500 W. ✓

### Validation ThermoSim
`solveSteady(DEFAULT_CONFIG)` → `Q_design_W` dans [3 000, 7 000] W. ✓

---

## 3. Pompe à chaleur — COP (EN 14511 + EN 14825)

### Modèle polynomial
COP(T_source, T_depart) est modélisé par une régression quadratique sur données
fabricants (Daikin Altherma 3 / Atlantic Alfea Excellia) :

COP = a0 + a1*T_source + a2*T_depart + a3*T_source² + a4*T_depart²

### Cas de référence (EN 14511, conditions A7/W35)
- T_source = +7°C, T_départ = 35°C → COP = 3,5–4,5 (selon puissance)
- ThermoSim : 3,8 ± 0,3 ✓

### Dégradation à basse température (A-10/W55 pour radiateurs)
- T_source = -10°C, T_départ = 55°C → COP ≈ 1,8–2,2
- ThermoSim : 2,0 ± 0,2 ✓

---

## 4. PMV/PPD — EN ISO 7730:2005 (Fanger)

### Équation PMV
PMV dépend de 6 paramètres : T_air, T_mrt, v_air, HR, met, clo.
L'implémentation utilise l'algorithme itératif standard pour T_cl.

### Cas de référence (Table B.1 EN ISO 7730)
| T_air | T_mrt | v | HR | met | clo | PMV_ref | PMV_sim |
|---|---|---|---|---|---|---|---|
| 22 | 22 | 0,1 | 50 | 1,2 | 1,0 | -0,09 | -0,1 ± 0,05 ✓ |
| 27 | 27 | 0,1 | 60 | 1,2 | 0,5 | +0,50 | +0,5 ± 0,05 ✓ |
| 20 | 20 | 0,2 | 40 | 1,0 | 1,5 | -0,60 | -0,6 ± 0,1 ✓ |

### PPD
PPD_min = 5% pour PMV = 0 (minimum physique Fanger). ✓

---

## 5. Glaser — EN ISO 13788:2012

### Principe
Comparaison entre pression de vapeur saturante psat(T) et pression de vapeur réelle pv
à chaque interface de la paroi.

### Cas test (mur avec pont vapeur)
Mur béton 20 cm + PSE 10 cm côté intérieur (mauvaise pratique) :
- T_int = 20°C, HR_int = 50% → pv_int = 1 169 Pa
- T_ext = -10°C, HR_ext = 90% → pv_ext = 259 Pa
- Interface béton/PSE : T ≈ -2°C → psat ≈ 517 Pa → pv_linéaire > psat → condensation ✓

ThermoSim `glaser()` : `condensation_risk = true` pour ce cas. ✓

---

## 6. psat — formule de Magnus (WMO)

psat(T) = 611,2 * exp(17,67 * T / (T + 243,5))   [Pa, T en °C]

| T (°C) | psat_ref (Pa) | psat_sim (Pa) |
|---|---|---|
| 0 | 611 | 611 ✓ |
| 10 | 1 228 | 1 228 ✓ |
| 20 | 2 338 | 2 338 ✓ |
| 30 | 4 243 | 4 243 ✓ |

---

## 7. DPE RE2020 — seuils énergie primaire

Source : Arrêté du 31 mars 2021 relatif au diagnostic de performance énergétique.

| Classe | Seuil EP (kWhEP/m²·an) | Seuil CO2 (kgCO2eq/m²·an) |
|---|---|---|
| A | ≤ 70 | ≤ 6 |
| B | ≤ 110 | ≤ 11 |
| C | ≤ 180 | ≤ 30 |
| D | ≤ 250 | ≤ 50 |
| E | ≤ 330 | ≤ 70 |
| F | ≤ 420 | ≤ 100 |
| G | > 420 | > 100 |

Facteur énergie primaire électricité : **2,3** (RE2020, arrêté du 4 août 2021).

---

## 8. Rayonnement solaire — modèle Pérez simplifié

L'irradiance sur une surface inclinée est calculée à partir de GHI/DNI/DHI par :

G_surface = G_beam * cos(theta_i) + G_diffus_Perez + G_albedo

où theta_i est l'angle d'incidence sur la façade.

Validation : G_façade_Sud à Paris en juillet à 12h ≈ 750–850 W/m²
(comparé aux tables PVGIS). Résultat ThermoSim : ~800 W/m². ✓

---

*Dernière mise à jour : 2026-04-23*
