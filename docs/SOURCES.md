# Sources et références — ThermoSim Web V2

---

## Normes et réglementations

### Thermique du bâtiment
- **EN ISO 6946:2017** — Composants et parutions de bâtiments — Résistance et transmittance thermiques — Méthodes de calcul
- **EN ISO 10456:2007** — Matériaux et produits pour le bâtiment — Propriétés hygrothermiques — Valeurs tabulées de conception
- **EN 12831:2017** — Systèmes de chauffage dans les bâtiments — Méthode de calcul de la charge thermique de conception
- **EN ISO 13788:2012** — Performance hygrothermique des parois et composants de bâtiments — Méthode de calcul Glaser
- **EN ISO 7730:2005** — Ergonomie des ambiances thermiques — Détermination analytique et interprétation du confort thermique (PMV/PPD)

### Réglementation française
- **RE2020** — Réglementation environnementale 2020 (entrée en vigueur 1er janvier 2022)
- **Arrêté du 4 août 2021** — Définition des coefficients de transformation énergie primaire (électricité : 2,3)
- **Arrêté du 31 mars 2021** — Méthodes et procédures applicables au diagnostic de performance énergétique (DPE)
- **ADEME** — Guide méthodologique DPE 2021 — Seuils des classes A–G

---

## Données climatiques

### Format TMY (Typical Meteorological Year)
- **ISO 15927-4:2005** — Données climatiques de calcul des charges thermiques — Années météorologiques de référence
- **EnergyPlus Weather Data** — Base de données EPW (format de référence utilisé pour la structure des fichiers JSON)
- **PVGIS (EU Commission JRC)** — Irradiance solaire de référence pour validation (https://re.jrc.ec.europa.eu/pvg_tools/)
- **Météo-France** — Données climatiques de référence pour la France (stations synoptiques)

### Constantes solaires et atmosphériques
- Constante solaire : **1 361 W/m²** (ASTM E490)
- Albédo du sol standard : **0,2** (pelouse, EN ISO 9060)
- Modèle de diffus Pérez 1990 : R. Perez et al., "Modeling daylight availability and irradiance components from direct and global irradiance", Solar Energy, vol. 44, pp. 271-289, 1990

---

## Matériaux — propriétés thermiques

Source principale : **EN ISO 10456:2007** Tableau A.1 à A.10

| Matériau | lambda (W/m·K) | Source |
|---|---|---|
| Béton armé (2 400 kg/m³) | 2,50 | EN ISO 10456 T.B.9 |
| Brique terre cuite pleine | 0,60–0,80 | EN ISO 10456 T.B.7 |
| Laine de verre (12–16 kg/m³) | 0,032–0,040 | EN ISO 10456 T.B.5 |
| Laine de roche (30–50 kg/m³) | 0,035–0,040 | EN ISO 10456 T.B.5 |
| Polystyrène expansé (EPS) | 0,032–0,040 | EN ISO 10456 T.B.5 |
| Polystyrène extrudé (XPS) | 0,029–0,038 | EN ISO 10456 T.B.5 |
| Polyuréthane rigide | 0,022–0,028 | EN ISO 10456 T.B.5 |
| Ouate de cellulose | 0,038–0,042 | EN ISO 10456 T.B.5 |
| Plâtre | 0,35 | EN ISO 10456 T.B.8 |
| Bois résineux | 0,12 | EN ISO 10456 T.B.3 |

---

## Vitrages — propriétés optiques et thermiques

- **EN 673:2011** — Verre dans la construction — Détermination du coefficient U
- **EN 410:2011** — Verre dans la construction — Détermination des caractéristiques lumineuses et solaires

Valeurs de référence :

| Type de vitrage | Uw (W/m²·K) | g |
|---|---|---|
| Simple vitrage | 5,8 | 0,87 |
| Double vitrage 4-12-4 argon | 1,5 | 0,62 |
| Double vitrage à couche basse-émissivité | 1,1 | 0,60 |
| Triple vitrage à couche | 0,7 | 0,50 |

---

## Ponts thermiques

- **EN ISO 14683:2017** — Ponts thermiques dans les bâtiments — Coefficient de transmission linéique
- **Catalogue de ponts thermiques CSTB** — Valeurs forfaitaires admises par la RE2020

Valeurs psi forfaitaires (W/m·K) :

| Liaison | psi_ref |
|---|---|
| Refend plancher intermédiaire (ITE) | 0,05 |
| Refend plancher intermédiaire (ITI) | 0,20 |
| Jonction façade/toiture | 0,10 |
| Menuiserie (tableau seul) | 0,15 |

---

## Systèmes HVAC

### Pompes à chaleur
- **EN 14511:2018** — Pompes à chaleur à compression de vapeur — Conditions d'essai
- **EN 14825:2018** — Pompes à chaleur à compression de vapeur — Essais à charge partielle (SCOP/SEER)
- Courbes fabricants de référence : Daikin Altherma 3, Atlantic Alfea Excellia, Mitsubishi Ecodan

### Ventilation
- **EN 15665:2009** — Ventilation des bâtiments — Établissement des critères de performances pour les systèmes de ventilation résidentielle
- **NF DTU 68.3:2013** — VMC simple flux et double flux

### Efficacité saisonnière
- Valeurs SCOP de référence RE2020 :
  - PAC air/eau classe A+++ : SCOP ≥ 4,5
  - Chaudière gaz à condensation : eta_s = 0,92
  - Chaudière fioul : eta_s = 0,86

---

## Confort thermique

- **ASHRAE 55-2020** — Thermal Environmental Conditions for Human Occupancy
- **EN ISO 7730:2005** — Méthode analytique PMV/PPD
- Fanger, P.O., *Thermal Comfort*, Danish Technical Press, 1970
- **Catégories de confort** (EN ISO 7730 Annexe A) :
  - Catégorie I : -0,2 < PMV < +0,2 (PPD < 6%)
  - Catégorie II : -0,5 < PMV < +0,5 (PPD < 10%)
  - Catégorie III : -0,7 < PMV < +0,7 (PPD < 15%)

---

## Énergie et environnement

- **Facteurs de conversion énergie primaire** — Arrêté du 4 août 2021 (RE2020) :
  - Électricité : 2,3
  - Gaz naturel : 1,0
  - Fioul : 1,0
  - Bois granulés : 1,0
  - Réseau chaleur (moyen national) : 0,6
- **Facteurs d'émission CO₂** — Base Carbone ADEME 2024 :
  - Électricité France : 0,060 kgCO₂eq/kWh (mix annuel 2022)
  - Gaz naturel : 0,234 kgCO₂eq/kWh
  - Fioul domestique : 0,324 kgCO₂eq/kWh
  - Bois granulés : 0,030 kgCO₂eq/kWh

---

## Implémentation

### Physique atmosphérique
- Magnus-Tetens (WMO Note 8, 2018) — formule de pression de vapeur saturante
- ASHRAE Fundamentals Handbook 2021 — point de rosée

### Rayonnement solaire
- Spencer, J.W. (1971) — déclinaison solaire
- Duffie & Beckman, *Solar Engineering of Thermal Processes*, 4e éd. (2013) — angle d'incidence
- Perez et al. (1990) — modèle de rayonnement diffus sur surfaces inclinées

---

*Dernière mise à jour : 2026-04-23*
