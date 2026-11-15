# 08 — Source Register

Source types: **P** = peer-reviewed paper · **O** = official agency or organisation page · **C** = competitor repository (checked by code grep) · **S** = secondary.

| # | Source | Type | Date | What it supports |
|---|---|---|---|---|
| 1 | [Stahn et al., *Increased core body temperature in astronauts during long-duration space missions*, Sci Rep 7:16180](https://pmc.ncbi.nlm.nih.gov/articles/PMC5701078) | P | 2017 | +1.01 °C resting core-temperature rise, plateau after ~75 days; n = 11; forehead heat-flux Double Sensor; time points |
| 2 | [Norsk et al., *Fluid shifts, vasodilatation and ambulatory blood pressure reduction…*, J Physiol 593:573](https://pmc.ncbi.nlm.nih.gov/articles/4324706/) | P | 2015 | 24-h ambulatory BP 8–10 mmHg lower at 3–6 months; n = 8 men (not used in the model) |
| 3 | [Tank & Jordan commentary, J Physiol](https://pmc.ncbi.nlm.nih.gov/articles/PMC4324697) | P | 2015 | Confirms Norsk's sample: 8 middle-aged male astronauts |
| 4 | [Barger et al. 2014, *Lancet Neurol* 13:904 — summary](https://sleepreviewmag.com/sleep-health/parameters/quantity/astronaut-sleep-hypnotics/) · [abstract](https://www.omicsdi.org/dataset/biostudies-literature/S-EPMC4188436) | P (via S) | 2014 | ISS sleep about 6.09 h; pre-flight training under 6.5 h; context only |
| 5 | [CDC fever definition, via NCMIC summary](https://www.ncmic.com/practice-resources/practice-matters/checking-patients-for-fever-whats-too-high/) | S | — | 38.0 °C measured (oral). **Check the primary CDC page before quoting it.** |
| 6 | [Mayo Clinic, *Heart rate: what's normal?* (cites AHA)](https://mayoclinic.org/health/heart-rate/AN01906/) | S | 2025 | Resting HR 60–100 bpm |
| 7 | [ACC/AHA 2017 BP guideline, *Guidelines Made Simple*](https://www.acc.org/%7E/media/Non-Clinical/Files-PDFs-Excel-MS-Word-etc/Guidelines/2017/Guidelines_Made_Simple_2017_HBP.pdf) | O | 2017 | Hypertensive crisis above 180/120 (not used) |
| 8 | [NASA Spaceflight Standard Measures](https://www.nasa.gov/reference/standard-measures/) | O | — | What NASA collects; research only, not a crew tool |
| 9 | [TRISH HERMES](https://www.bcm.edu/academic-centers/space-medicine/translational-research-institute/research/hermes) | O | — | Health-data platform (infrastructure), not interpretation |
| 10 | [Space Apps 2026 home — submission deadline](https://www.spaceappschallenge.org/2026/) | O | 2026 | Submission closes 15 Nov, 11:59 PM local time |
| 11 | [Space Apps Judging & Awards Guide](https://www.spaceappschallenge.org/resources/judging-awards-guide) | O | — | Award definitions; presentation is a criterion |
| 12 | [NASA: 2025 Space Apps Global Winners](https://www.nasa.gov/learning-resources/stem-engagement-at-nasa/nasa-announces-2025-international-space-apps-challenge-global-winners/) | O | Dec 2025 | 2025 winners and their descriptions |
| 13 | [NASA: 2024 Space Apps Global Winners](https://www.nasa.gov/?p=802172) | O | Jan 2025 | 2024 Best Use of Science (WMPGang) |
| 14 | [Space Apps 2025 Global Winners page](https://www.spaceappschallenge.org/2025/awards/global-winners/) | O | 2025 | Executive judges choose 10 winners from the finalists |
| 15 | [ANCHOR](https://github.com/AGCpr/nasa-space-apps-2026-anchor) | C | 14 Nov 2026 | Competitor features; the 243-repo landscape survey (their analysis) |
| 16 | [Pulsar](https://github.com/quantum-astronauts/pulsar) | C | 15 Nov 2026 | Rolling EWMA baseline; cites Stahn 2017 |
| 17 | [HELIOS](https://github.com/WillBettleheim/Helios) | C | 5 Nov 2026 | SBAR message, coverage gating |
| 18 | [BioOrbit](https://github.com/aniramanin/bioorbit) | C | 14 Nov 2026 | z-score drift, pattern rules, body map |
| 19 | [AHI](https://github.com/lucaspalharesbarbosa/astronaut-health-intelligence-platform) | C | 14 Nov 2026 | 3D anatomy, OSDR panels |
| 20 | [Sol Health](https://github.com/AbdulrahmanHeshamEg/sol-health) | C | 14 Nov 2026 | CUSUM + Isolation Forest, real PMData / MSL RAD |
| 21 | ["Baseline" (other team)](https://github.com/obsidianprimeofficial-alt/baseline) | C | 13 Nov 2026 | Name collision; rolling ≤ 30-day range |
| 22 | [AstroHealth](https://github.com/Ridwanulkarim/nasa-challenge-Create-Health-Monitoring-Software-for-Astronauts-on-Space-Missions) | C | 23 Sep 2026 | Rolling 14-day baseline (`baselineService.js`) |
| 23 | [Mission Health Command Center](https://github.com/Shahjalal-Dip/Mission-Health-Command-Center) | C | 14 Nov 2026 | Real OSDR Inspiration4 data; 20% / 35% deviation flags |
| 24 | [OSDR OSD-569](https://osdr.nasa.gov/bio/repo/data/studies/OSD-569) · [OSD-575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575) | O | — | Real Inspiration4 blood data, used by MHCC and AHI (not by BASELINE) |
| 25 | Challenge brief, mirrored in Sol Health's `docs/CHALLENGE.md` | S | Nov 2026 | Brief requirements (clickable figure, per-indicator explanation). **Re-read the official page.** |

**Not verified:** the competitors' live demos, their performance claims, and the 2025 winners' code or demos (the sandbox blocked those sites).
