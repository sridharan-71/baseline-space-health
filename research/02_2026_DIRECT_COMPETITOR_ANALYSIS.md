# 02 — 2026 Direct Competitors (same challenge)

*15 Nov 2026. These are current-year competitors, kept separate from previous winners (doc 01).*

## How each entry was checked

- **Method:** each repository was cloned (shallow) and its code grepped for each claimed feature. Files were read where a mechanism mattered.
- **Not done:** no live demo was opened, because the sandbox blocks those hosts. Nothing was run, and no competitor's performance numbers were reproduced.

**Verification legend**

| Mark | Meaning |
|---|---|
| ✅ code | Verified in source code (logic located and read, or clearly present by grep) |
| 📄 doc | Documented in the README; files exist but logic not read |
| 💬 claim | A number or result stated by the team, not reproduced |
| ❔ | Unable to verify |
| — | Not found |

**Wider landscape.** ANCHOR's own survey of 243 public repositories (their `LANDSCAPE.md`, 10 Nov 2026) reports:
- personal baselines in about 40% of entries
- offline-first in about 40%
- radiation in about 52%
- statistical change detection in about 5%

That is their coding, not mine.

---

## Entries

### 1. ANCHOR — [github.com/AGCpr/nasa-space-apps-2026-anchor](https://github.com/AGCpr/nasa-space-apps-2026-anchor)

- **User:** the astronaut, as a daily companion.
- **Baseline:** Bayesian, anchored on pre-flight days. The astronaut can consent to a "new normal" (re-anchoring). ✅ code
- **Trends:** CUSUM with a stated false-alert budget. ✅ code
- **Safety lines:** two independently written kernels (Rust/WASM + TypeScript). 📄 doc; files exist
- **Validation:** on real LifeSnaps data (71 adults). 💬 claim, not reproduced
- **Other:**
  - privacy and disclosure contract
  - calm-language audit
  - offline PWA ✅ code (`sw.js`)
  - tests ✅
- **Space-specific model:** none. Adaptation is handled by manual consent, not a research curve.
- **Threat level: very high.** The most rigorous entry seen, and it validates on real human data.

### 2. Pulsar — [github.com/quantum-astronauts/pulsar](https://github.com/quantum-astronauts/pulsar)

- **Baseline:** rolling 10–45-day EWMA. ✅ code
- **Clinical lines:** fever ≥ 38.0 °C; BP; glucose. 📄 doc
- **Other:**
  - ECDSA-signed handover to Mission Control ✅ code
  - offline PWA ✅
  - environments (ISS/Moon/Mars) 📄
  - reaction-time test 📄
  - cartoon clickable astronaut 📄
- **Stahn 2017:** cited explicitly. Its README says personal baselines *handle* the in-flight temperature rise that a fixed 37.5 °C line would misread. 📄
- **Validation:** synthetic only, 50 seeded missions. 💬
- **Threat level: high.** It makes the same temperature argument we do, solved with a rolling baseline.

### 3. HELIOS — [github.com/WillBettleheim/Helios](https://github.com/WillBettleheim/Helios)

- **Baseline:** pre-flight, adapting with a 30-day half-life. 📄
- **Trends:** Mann–Kendall. 📄
- **SBAR "Ask the flight surgeon" message:** ✅ code (grep `sbar`)
- **Data-coverage gating:** ✅ code
- **Other:** FHIR. 📄
- **Validation:** real PMData alert-load test. 💬
- **Threat level: high** on medical-officer communication. SBAR is **not** our differentiator.

### 4. BioOrbit — [aniramanin.github.io/bioorbit](https://aniramanin.github.io/bioorbit/)

- **Baseline:** 3-day vs 18-day z-score drift. ✅ code (`engine.js`)
- **Pattern rules:**
  - sleep + reaction time → "fatigue"
  - fever + HR → "possible infection"

  These are diagnosis-like labels. 📄
- **Other:**
  - camera PPG pulse 📄
  - PVT
  - downlink report ✅ code
  - body map ✅ code
  - readiness score 📄
  - gamification 📄
- **Threat level: medium.** Broad and polished, but science-light.

### 5. Astronaut Health Intelligence Platform (AHI) — [github.com/lucaspalharesbarbosa/astronaut-health-intelligence-platform](https://github.com/lucaspalharesbarbosa/astronaut-health-intelligence-platform)

- **Baseline:** median/MAD bands. 📄
- **Other:**
  - 3D anatomy, three.js ✅ code
  - imports real OSDR panels OSD-569/575 as reference ✅ code
  - ground and crew views 📄
  - documentation site ✅
- **Threat level: medium-high** on visual impact.

### 6. Sol Health — [github.com/AbdulrahmanHeshamEg/sol-health](https://github.com/AbdulrahmanHeshamEg/sol-health)

- **Detectors:** robust baseline + bounded CUSUM + Isolation Forest ✅ code
- **Validation:** tuned on real PMData; reports 1.00 false alarm per person-month 💬
- **Data:** real MSL RAD and OSDR cabin data ✅ code
- **Tests:** 114 Python tests ✅
- **Threat level: high** on data science.

### 7. "Baseline" (another team) — [github.com/obsidianprimeofficial-alt/baseline](https://github.com/obsidianprimeofficial-alt/baseline)

- **Baseline:** own ≤ 30-day rolling range 📄
- **Other:**
  - NASA study cards 📄
  - "Queue for flight surgeon" ✅ code
  - real MSL RAD and NOAA GOES data ✅ code
- **Name collision with us.** Judges may confuse the two.

### 8. AstroHealth — [github.com/Ridwanulkarim/nasa-challenge-…](https://github.com/Ridwanulkarim/nasa-challenge-Create-Health-Monitoring-Software-for-Astronauts-on-Space-Missions)

- **Baseline:** **rolling 14-day personal baseline**, needing at least 3 days ✅ code (`backend/src/services/baselineService.js`)
- **Rules:** deterministic rule engine 📄
- **Stack:** Node/Express + MySQL + auth ✅ code
- **Other:** Mission Control role 📄
- **Offline:** "offline onboard" is claimed, but the app needs a server and database. ❔ unlikely as built
- **Threat level: low-medium.** A conventional full-stack app.

### 9. Mission Health Command Center (MHCC) — [github.com/Shahjalal-Dip/Mission-Health-Command-Center](https://github.com/Shahjalal-Dip/Mission-Health-Command-Center)

- **Real data:** **NASA OSDR Inspiration4 measurements (OSD-569, OSD-575)** — 4 subjects × 7 timepoints × 7 biomarkers. ✅ code (`etl/build_readings.py`, `src/data/readings.real.js`)
- **Flagging:** % deviation from each subject's pre-flight mean — watch ≥ 20%, flag ≥ 35%. ✅ code (`src/lib/flagging.js`)
- **Lab ranges:** uses the real per-sample lab reference ranges. ✅ code
- **Data honesty:** documents a data artefact and excludes it from the baseline. ✅ code
- **Users:** flight surgeons, not astronauts. Analysis is post-flight, not daily monitoring.
- **Threat level: high for "Best Use of Data / Science".** It is the only entry seen that uses **only real NASA astronaut data**.

---

## Same-challenge feature matrix

| Capability | BASELINE | ANCHOR | Pulsar | HELIOS | BioOrbit | AHI | Sol | AstroHealth | MHCC |
|---|---|---|---|---|---|---|---|---|---|
| Personal baseline | ✅ pre-flight | ✅ | ✅ rolling | 📄 | ✅ | 📄 | ✅ | ✅ rolling 14 d | ✅ pre-flight |
| **Explicit research-shaped expected in-flight change** | ✅ (Stahn) | — | — (rolling absorbs it) | — | — | — | — | — | — |
| **Personal calibration of that change** | ✅ (new today) | ~ manual "new normal" | — | ~ adapting baseline | — | — | — | — | — |
| **Self-stress-test vs other methods, shown in app** | ✅ (new today) | ~ validation docs | ✅ validation page (synthetic) | 📄 | — | — | 📄 notebooks | — | — |
| Real NASA / human data | — | ✅ LifeSnaps 💬 | — | 📄 PMData | — | ✅ OSDR | ✅ | — | ✅ OSDR I4 |
| SBAR / handover | ✅ | ✅ | ✅ signed | ✅ SBAR | ✅ | 📄 | 📄 | 📄 | — |
| Offline | ~ static site, no service worker | ✅ PWA | ✅ PWA | 📄 | 📄 | — | — | ❔ | — |
| Clickable body | ✅ 2D | — | ✅ | — | ✅ | ✅ 3D | 📄 | — | — |

"Explicit research-shaped expected change" was checked by grepping all 9 repositories for adaptation-curve terms. There were 0 relevant hits outside BASELINE. That is **evidence of absence in 9 repositories**, not proof that no other team does it.
