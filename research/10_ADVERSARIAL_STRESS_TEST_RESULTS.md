# 10 — Adversarial Stress-Test Results

*15 Nov 2026. Every scenario is a **hypothetical simulation** built to try to break BASELINE's temperature algorithm. None of it is astronaut data. None of it is clinical sensitivity, specificity or accuracy.*

Reproduce with:

```
ADV_DUMP=out.json npx vitest run src/engine/__tests__/adversarial.dump.test.ts
```

Code: `src/data/simulated/adversarial.ts` (scenarios), `src/engine/adversarialEval.ts` (evaluation). Regression tests: `src/engine/__tests__/adversarial.test.ts`.

## 1. Simulation set-up (all hypothetical)

| Item | Value | Why |
|---|---|---|
| Mission | 30 pre-flight days (L-30…L-1), in-flight FD1…FD120 | Long enough for the adaptation plateau and late drifts |
| Pre-flight mean | 36.75 °C | Same as the demo |
| Measurement noise | Gaussian, SD 0.10 °C, **not clamped** (G-noise2x: 0.20 °C) | The demo mission clamps noise to ±0.15 °C, which is unrealistically gentle |
| Research adaptation | +1.0 °C × min(day/75, 1) | Stahn et al. 2017 group mean (as in the app) |
| Seeds | 20 per scenario (seeds 1–20); results shown as mean (min–max) | Shows variability instead of one favourable run |
| Same data for every method | Yes: each method reads the identical simulated readings | Fairness |

## 2. Methods compared (identical data, all single-day decisions)

| Method | Rule |
|---|---|
| Earth only | Reading ≥ 38.0 °C |
| Pre-flight only | (reading − pre-flight mean) / pre-flight SD ≥ 2.0 |
| Last 14 days | (reading − mean of previous 14 in-flight days) / SD (floor 0.1) ≥ 2.0, needs ≥ 7 days |
| BASELINE | App status is "Keep an eye on it" or "Tell your medical officer". This includes Earth-line WATCH and the cool-down rule. |
| BASELINE w/o Earth line | Only flags from BASELINE's own personal model: expected-range z ≥ 2, the "can't tell" safeguard, or ACT. Shows how much BASELINE leans on the 38 °C line. |

## 3. Metric definitions (evaluation choices, not clinical)

| Metric | Definition |
|---|---|
| Problem day | Simulated non-adaptation change (physiological or sensor) **≥ 0.3 °C**, excluding sensor-spike days. Days between 0 and 0.3 °C are a grey zone, counted in neither group. |
| False-alert day | Flagged day with **zero** simulated change and no sensor spike |
| Caught | Share of problem days with data that were flagged |
| Late-phase caught | Share of the **last 10** problem days with data that were flagged. This is the absorption indicator: if a persistent problem stops being flagged late, it has been absorbed. |
| Detection delay | Days from the start of the change to the first flagged day on or after it |
| Never detected | Seeds (of 20) in which the change was never flagged |
| Missing data | Days without a reading are excluded from every method's numerator and denominator alike |

## 4. Before vs after the calibration fix (BASELINE column, 20 seeds, means)

"Before" is the personal calibration as first committed today (after the Earth-line rule change). "After" adds the safeguards in doc 09 §8.

| Scenario | False alerts before → after | Caught before → after | Late-phase caught before → after | Never detected before → after | “Can't tell” days after |
|---|---|---|---|---|---|
| N1 | 0.3 → 1.1 | — → — | — → — | 0 → 0 | 0.3 |
| N2 | 0.0 → 0.0 | — → — | — → — | 0 → 0 | 0.0 |
| A-30-0.3 | 0.0 → 0.0 | 60% → 77% | 67% → 76% | 0 → 0 | 47.0 |
| A-30-0.6 | 0.0 → 0.0 | 91% → 97% | 100% → 100% | 0 → 0 | 56.4 |
| A-50-0.3 | 0.1 → 0.1 | 69% → 86% | 67% → 95% | 0 → 0 | 33.8 |
| A-50-0.6 | 0.1 → 0.1 | 95% → 99% | 100% → 100% | 0 → 0 | 43.8 |
| A-70-0.3 | 0.1 → 0.2 | 70% → 87% | 67% → 91% | 0 → 0 | 12.6 |
| A-70-0.6 | 0.1 → 0.2 | 98% → 100% | 100% → 100% | 0 → 0 | 18.8 |
| B-30-0.5 | 0.0 → 0.0 | 87% → 97% | 99% → 99% | 0 → 0 | 58.0 |
| B-20-0.8-slow | 0.0 → 0.0 | 85% → 96% | 100% → 100% | 0 → 0 | 56.7 |
| B-small-drift | 0.0 → 0.0 | 1% → 46% | 0% → 25% | 9 → 0 | 31.6 |
| B-none-drift | 0.0 → 0.0 | 0% → 78% | 0% → 100% | 15 → 0 | 51.3 |
| B-small-latedrift | 0.0 → 0.1 | 42% → 94% | 31% → 100% | 0 → 0 | 7.8 |
| C-60-0.6x5 | 2.2 → 3.0 | 100% → 100% | 100% → 100% | 0 → 0 | 0.3 |
| C-60-0.6x20 | 0.5 → 9.6 | 100% → 100% | 100% → 100% | 0 → 0 | 7.8 |
| C-60-0.6-persist | 0.1 → 0.1 | 100% → 100% | 100% → 100% | 0 → 0 | 37.5 |
| D-repeat | 4.5 → 6.7 | 100% → 100% | 100% → 100% | 0 → 0 | 0.3 |
| E-3 | 2.1 → 3.0 | 99% → 99% | 99% → 99% | 0 → 0 | 0.3 |
| E-10 | 2.2 → 3.0 | 100% → 100% | 100% → 100% | 0 → 0 | 0.3 |
| E-17 | 2.2 → 3.0 | 100% → 100% | 100% → 100% | 0 → 0 | 0.3 |
| E-drift-5 | 0.0 → 0.0 | 79% → 96% | 99% → 99% | 0 → 0 | 82.0 |
| F-fast | 20.4 → 38.1 | 100% → 100% | 100% → 100% | 0 → 0 | 18.4 |
| F-slow | 1.9 → 7.6 | 99% → 100% | 99% → 100% | 0 → 0 | 0.0 |
| F-none | 1.2 → 1.9 | 91% → 99% | 91% → 99% | 0 → 0 | 0.0 |
| F-delayed | 8.8 → 46.5 | 100% → 100% | 100% → 100% | 0 → 0 | 48.4 |
| F-large | 53.8 → 69.5 | 100% → 100% | 100% → 100% | 0 → 0 | 63.6 |
| F-small | 1.6 → 2.0 | 95% → 99% | 95% → 99% | 0 → 0 | 0.0 |
| G-missing30 | 1.9 → 2.4 | 100% → 100% | 100% → 100% | 0 → 0 | 0.1 |
| G-gap | 2.1 → 2.8 | 100% → 100% | 100% → 100% | 0 → 0 | 0.2 |
| G-noise2x | 6.6 → 7.8 | 97% → 97% | 97% → 97% | 0 → 0 | 1.2 |
| G-outliers | 2.4 → 3.4 | 100% → 100% | 100% → 100% | 0 → 0 | 0.3 |
| G-sensorstep | 0.1 → 0.1 | 86% → 98% | 95% → 100% | 0 → 0 | 54.0 |
| G-sensordrift | 0.0 → 0.1 | 93% → 96% | 100% → 100% | 0 → 0 | 43.5 |
| G-everyother | 1.9 → 2.3 | 100% → 100% | 100% → 100% | 0 → 0 | 0.1 |

**Reading the table**

- **The critical cases are B-none-drift and B-small-drift.** These are drifts that stay below 38 °C. "Never detected" falls from 15/20 and 9/20 seeds to 0/20.
- **Most drift detections are "can't tell" (Keep an eye on it, Low confidence), not "Tell your medical officer".** That is deliberate: temperature alone cannot prove the cause.
- **The costs are in F-fast, F-delayed and F-large.** Honest uncertainty, and the tighter band, mean more alerts for astronauts whose adaptation differs from the research timing.
- False "tell your medical officer" days, after the fix (20-seed means):
  - F-delayed: 19.2
  - F-fast: 9.5
  - F-slow: 1.1
  - F-large: 0.2
  - every other scenario: 0

## 5. Full results after the fix (all methods, 20 seeds)

### Controls


**N1** — Research-average adapter, nothing abnormal. Problem days with data: 0.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.3 (0.0–1.0) | — | — | — | — |
| Pre-flight only | 104.3 (99.0–110.0) | — | — | — | — |
| Last 14 days | 9.2 (6.0–13.0) | — | — | — | — |
| BASELINE | 1.1 (0.0–4.0) | — | — | — | — |
| BASELINE w/o Earth line | 1.1 (0.0–4.0) | — | — | — | — |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 0.0; “can't tell” days (Low confidence): 0.3 (0.0–2.0); final personal size: 1.00 (0.96–1.04)×; in-flight days with data: 120.

**N2** — Non-adapter, nothing abnormal. Problem days with data: 0.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | — | — | — | — |
| Pre-flight only | 2.8 (1.0–7.0) | — | — | — | — |
| Last 14 days | 3.2 (1.0–5.0) | — | — | — | — |
| BASELINE | 0.0 | — | — | — | — |
| BASELINE w/o Earth line | 0.0 | — | — | — | — |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 0.0; “can't tell” days (Low confidence): 0.0; final personal size: 0.07 (0.03–0.12)×; in-flight days with data: 120.

### A — Gradual unexplained drift


**A-30-0.3** — Gradual drift +0.3 °C over 30 days from FD30, then persists. Problem days with data: 62.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 60% (45–74) | 67% (40–90) | 33.2 (26.0–41.0) | 0 |
| Pre-flight only | 13.6 (9.0–19.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 2.8 (1.0–5.0) | 5% (2–8) | 1% (0–10) | 3.4 (0.0–8.0) | 0 |
| BASELINE | 0.0 | 77% (58–89) | 76% (40–100) | 17.6 (6.0–27.0) | 0 |
| BASELINE w/o Earth line | 0.0 | 76% (58–89) | 75% (40–100) | 17.6 (6.0–27.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 0.1 (0.0–1.0); “can't tell” days (Low confidence): 47.0 (34.0–60.0); final personal size: 1.28 (1.23–1.32)×; in-flight days with data: 120.

**A-30-0.6** — Gradual drift +0.6 °C over 30 days from FD30, then persists. Problem days with data: 77.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 86% (81–88) | 100% | 22.8 (16.0–26.0) | 0 |
| Pre-flight only | 13.6 (9.0–19.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 2.8 (1.0–5.0) | 8% (4–13) | 1% (0–10) | 2.5 (0.0–6.0) | 0 |
| BASELINE | 0.0 | 97% (92–100) | 100% | 12.1 (6.0–17.0) | 0 |
| BASELINE w/o Earth line | 0.0 | 96% (92–99) | 100% | 12.1 (6.0–17.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 11.2 (5.0–19.0); “can't tell” days (Low confidence): 56.4 (51.0–65.0); final personal size: 1.55 (1.51–1.59)×; in-flight days with data: 120.

**A-50-0.3** — Gradual drift +0.3 °C over 30 days from FD50, then persists. Problem days with data: 42.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 69% (55–86) | 67% (40–90) | 21.4 (16.0–30.0) | 0 |
| Pre-flight only | 33.4 (28.0–39.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 5.0 (2.0–7.0) | 3% (0–7) | 1% (0–10) | 5.5 (0.0–14.0) | 0 |
| BASELINE | 0.1 (0.0–1.0) | 86% (64–100) | 95% (70–100) | 14.8 (6.0–30.0) | 0 |
| BASELINE w/o Earth line | 0.1 (0.0–1.0) | 85% (64–98) | 95% (70–100) | 14.8 (6.0–30.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 1.1 (0.0–5.0); “can't tell” days (Low confidence): 33.8 (25.0–43.0); final personal size: 1.21 (1.17–1.25)×; in-flight days with data: 120.

**A-50-0.6** — Gradual drift +0.6 °C over 30 days from FD50, then persists. Problem days with data: 57.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 94% (91–100) | 100% | 15.1 (10.0–19.0) | 0 |
| Pre-flight only | 33.4 (28.0–39.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 5.0 (2.0–7.0) | 8% (5–11) | 1% (0–10) | 4.0 (0.0–13.0) | 0 |
| BASELINE | 0.1 (0.0–1.0) | 99% (95–100) | 100% | 9.6 (5.0–15.0) | 0 |
| BASELINE w/o Earth line | 0.1 (0.0–1.0) | 98% (93–100) | 100% | 9.6 (5.0–15.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 24.8 (7.0–39.0); “can't tell” days (Low confidence): 43.8 (40.0–51.0); final personal size: 1.42 (1.38–1.46)×; in-flight days with data: 120.

**A-70-0.3** — Gradual drift +0.3 °C over 30 days from FD70, then persists. Problem days with data: 22.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 70% (50–86) | 67% (40–90) | 13.1 (0.0–22.0) | 0 |
| Pre-flight only | 53.4 (48.0–59.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 7.2 (3.0–12.0) | 4% (0–9) | 1% (0–10) | 4.5 (0.0–19.0) | 0 |
| BASELINE | 0.2 (0.0–1.0) | 87% (55–100) | 91% (50–100) | 11.6 (0.0–22.0) | 0 |
| BASELINE w/o Earth line | 0.2 (0.0–1.0) | 83% (50–100) | 89% (50–100) | 11.7 (0.0–22.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 3.5 (0.0–8.0); “can't tell” days (Low confidence): 12.6 (4.0–21.0); final personal size: 1.13 (1.09–1.17)×; in-flight days with data: 120.

**A-70-0.6** — Gradual drift +0.6 °C over 30 days from FD70, then persists. Problem days with data: 37.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 98% (95–100) | 100% | 7.8 (0.0–12.0) | 0 |
| Pre-flight only | 53.4 (48.0–59.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 7.2 (3.0–12.0) | 9% (3–16) | 1% (0–10) | 2.8 (0.0–9.0) | 0 |
| BASELINE | 0.2 (0.0–1.0) | 100% (97–100) | 100% | 7.2 (0.0–12.0) | 0 |
| BASELINE w/o Earth line | 0.2 (0.0–1.0) | 98% (95–100) | 100% | 7.5 (0.0–12.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 30.4 (21.0–36.0); “can't tell” days (Low confidence): 18.8 (14.0–24.0); final personal size: 1.20 (1.13–1.27)×; in-flight days with data: 120.

### B — Persistent drift (incl. cases the Earth line cannot see)


**B-30-0.5** — Drift +0.5 °C from FD30 over 30 days, persists to FD120. Problem days with data: 74.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 84% (80–86) | 99% (90–100) | 24.8 (17.0–28.0) | 0 |
| Pre-flight only | 13.6 (9.0–19.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 2.8 (1.0–5.0) | 8% (3–11) | 1% (0–10) | 3.1 (0.0–8.0) | 0 |
| BASELINE | 0.0 | 97% (91–100) | 99% (90–100) | 13.2 (6.0–19.0) | 0 |
| BASELINE w/o Earth line | 0.0 | 96% (88–100) | 99% (90–100) | 13.2 (6.0–19.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 5.5 (1.0–12.0); “can't tell” days (Low confidence): 58.0 (54.0–63.0); final personal size: 1.46 (1.42–1.50)×; in-flight days with data: 120.

**B-20-0.8-slow** — Slow drift +0.8 °C from FD20 over 60 days, persists. Problem days with data: 79.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 82% (77–85) | 100% | 32.8 (26.0–37.0) | 0 |
| Pre-flight only | 5.0 (1.0–9.0) | 100% | 100% | 0.2 (0.0–1.0) | 0 |
| Last 14 days | 1.7 (0.0–3.0) | 11% (6–13) | 1% (0–10) | 4.5 (0.0–15.0) | 0 |
| BASELINE | 0.0 | 96% (90–100) | 100% | 17.1 (11.0–27.0) | 0 |
| BASELINE w/o Earth line | 0.0 | 95% (90–97) | 100% | 17.1 (11.0–27.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 12.0 (4.0–22.0); “can't tell” days (Low confidence): 56.7 (52.0–69.0); final personal size: 1.68 (1.64–1.72)×; in-flight days with data: 120.

**B-small-drift** — Small adapter (+0.5 °C) + drift +0.5 °C from FD30 over 30 days, persists (ends below 38 °C). Problem days with data: 74.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 0% (0–1) | 0% | 49.8 (40.0–57.0) | 14 |
| Pre-flight only | 4.8 (1.0–10.0) | 100% | 100% | 1.0 (0.0–5.0) | 0 |
| Last 14 days | 1.8 (0.0–3.0) | 6% (3–9) | 1% (0–10) | 3.5 (1.0–8.0) | 0 |
| BASELINE | 0.0 | 46% (32–62) | 25% (0–60) | 28.4 (16.0–39.0) | 0 |
| BASELINE w/o Earth line | 0.0 | 45% (32–59) | 25% (0–60) | 28.4 (16.0–39.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 0.1 (0.0–1.0); “can't tell” days (Low confidence): 31.6 (24.0–39.0); final personal size: 1.00 (0.95–1.04)×; in-flight days with data: 120.

**B-none-drift** — Non-adapter + drift +0.6 °C from FD40 over 30 days, persists (ends below 38 °C). Problem days with data: 67.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 0% | 0% | — | 20 |
| Pre-flight only | 1.1 (0.0–2.0) | 99% (97–100) | 100% | 5.7 (0.0–11.0) | 0 |
| Last 14 days | 1.4 (0.0–3.0) | 6% (3–10) | 1% (0–10) | 7.2 (0.0–15.0) | 0 |
| BASELINE | 0.0 | 78% (73–82) | 100% | 27.6 (20.0–32.0) | 0 |
| BASELINE w/o Earth line | 0.0 | 78% (73–82) | 100% | 27.6 (20.0–32.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 0.2 (0.0–1.0); “can't tell” days (Low confidence): 51.3 (46.0–52.0); final personal size: 0.57 (0.52–0.61)×; in-flight days with data: 120.

**B-small-latedrift** — Small adapter (+0.5 °C) + drift +0.5 °C from FD80 over 20 days, persists. Problem days with data: 30.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 0% | 0% | — | 20 |
| Pre-flight only | 47.6 (30.0–56.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 4.5 (2.0–7.0) | 8% (0–17) | 1% (0–10) | 4.3 (1.0–14.0) | 0 |
| BASELINE | 0.1 (0.0–1.0) | 94% (83–100) | 100% | 8.6 (4.0–16.0) | 0 |
| BASELINE w/o Earth line | 0.1 (0.0–1.0) | 88% (73–97) | 96% (80–100) | 8.6 (4.0–16.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 19.0 (9.0–25.0); “can't tell” days (Low confidence): 7.8 (5.0–12.0); final personal size: 0.68 (0.62–0.75)×; in-flight days with data: 120.

### C — Sudden episodes


**C-60-0.6x5** — Sudden +0.6 °C for 5 days at FD60. Problem days with data: 5.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.3 (0.0–1.0) | 97% (40–100) | 97% (40–100) | 0.1 (0.0–3.0) | 0 |
| Pre-flight only | 99.3 (94.0–105.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 7.2 (4.0–11.0) | 64% (40–100) | 64% (40–100) | 0.0 | 0 |
| BASELINE | 3.0 (2.0–5.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 0.8 (0.0–3.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 4.0; “can't tell” days (Low confidence): 0.3 (0.0–2.0); final personal size: 1.00 (0.96–1.04)×; in-flight days with data: 120.

**C-60-0.6x20** — Sudden +0.6 °C for 20 days at FD60. Problem days with data: 20.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.1 (0.0–1.0) | 99% (85–100) | 100% | 0.1 (0.0–3.0) | 0 |
| Pre-flight only | 84.3 (79.0–90.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 6.8 (3.0–11.0) | 18% (10–25) | 4% (0–20) | 0.0 | 0 |
| BASELINE | 9.6 (3.0–22.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 7.9 (2.0–22.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 18.6 (16.0–19.0); “can't tell” days (Low confidence): 7.8 (1.0–23.0); final personal size: 1.03 (0.99–1.09)×; in-flight days with data: 120.

**C-60-0.6-persist** — Sudden +0.6 °C at FD60 that never resolves. Problem days with data: 61.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 100% (95–100) | 100% | 0.1 (0.0–3.0) | 0 |
| Pre-flight only | 43.4 (38.0–49.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 6.2 (3.0–10.0) | 8% (5–11) | 1% (0–10) | 0.0 | 0 |
| BASELINE | 0.1 (0.0–1.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 0.1 (0.0–1.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 33.0 (18.0–40.0); “can't tell” days (Low confidence): 37.5 (34.0–42.0); final personal size: 1.46 (1.42–1.50)×; in-flight days with data: 120.

### D — Repeated episodes


**D-repeat** — Three 7-day +0.6 °C episodes at FD40, FD65, FD90. Problem days with data: 21.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.2 (0.0–1.0) | 73% (67–86) | 100% | 8.8 (0.0–25.0) | 0 |
| Pre-flight only | 83.3 (78.0–89.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 5.0 (3.0–7.0) | 42% (33–52) | 28% (20–40) | 0.0 | 0 |
| BASELINE | 6.7 (6.0–9.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 0.6 (0.0–3.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 17.8 (16.0–18.0); “can't tell” days (Low confidence): 0.3 (0.0–2.0); final personal size: 1.03 (0.97–1.08)×; in-flight days with data: 120.

### E — Early-mission abnormality


**E-3** — Sudden +0.6 °C for 7 days starting FD3. Problem days with data: 7.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.3 (0.0–1.0) | 0% | 0% | — | 20 |
| Pre-flight only | 103.6 (99.0–108.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 7.2 (4.0–11.0) | 41% (29–71) | 41% (29–71) | 0.0 | 0 |
| BASELINE | 3.0 (2.0–6.0) | 99% (86–100) | 99% (86–100) | 0.1 (0.0–1.0) | 0 |
| BASELINE w/o Earth line | 1.1 (0.0–4.0) | 99% (86–100) | 99% (86–100) | 0.1 (0.0–1.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 5.3 (4.0–6.0); “can't tell” days (Low confidence): 0.3 (0.0–2.0); final personal size: 1.00 (0.96–1.04)×; in-flight days with data: 120.

**E-10** — Sudden +0.6 °C for 7 days starting FD10. Problem days with data: 7.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.3 (0.0–1.0) | 0% | 0% | — | 20 |
| Pre-flight only | 102.0 (99.0–105.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 7.0 (4.0–11.0) | 45% (29–71) | 45% (29–71) | 0.0 | 0 |
| BASELINE | 3.0 (1.0–6.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 1.0 (0.0–4.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 5.7 (4.0–6.0); “can't tell” days (Low confidence): 0.3 (0.0–2.0); final personal size: 1.00 (0.96–1.04)×; in-flight days with data: 120.

**E-17** — Sudden +0.6 °C for 7 days starting FD17. Problem days with data: 7.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.3 (0.0–1.0) | 0% | 0% | — | 20 |
| Pre-flight only | 99.3 (96.0–105.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 6.5 (3.0–11.0) | 43% (29–71) | 43% (29–71) | 0.0 | 0 |
| BASELINE | 3.0 (1.0–5.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 1.0 (0.0–3.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 5.8 (5.0–6.0); “can't tell” days (Low confidence): 0.3 (0.0–2.0); final personal size: 1.00 (0.96–1.04)×; in-flight days with data: 120.

**E-drift-5** — Drift +0.5 °C over 20 days from FD5, persists. Problem days with data: 105.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 62% (59–68) | 99% (90–100) | 41.8 (31.0–50.0) | 0 |
| Pre-flight only | 0.1 (0.0–1.0) | 100% | 100% | 2.4 (0.0–5.0) | 0 |
| Last 14 days | 0.1 (0.0–1.0) | 8% (5–10) | 1% (0–10) | 3.1 (0.0–11.0) | 0 |
| BASELINE | 0.0 | 96% (86–99) | 99% (90–100) | 10.7 (6.0–16.0) | 0 |
| BASELINE w/o Earth line | 0.0 | 95% (83–98) | 99% (90–100) | 10.7 (6.0–16.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 8.4 (4.0–14.0); “can't tell” days (Low confidence): 82.0 (76.0–87.0); final personal size: 1.54 (1.49–1.59)×; in-flight days with data: 120.

### F — Different adaptation patterns (each + FD90 5-day episode)


**F-fast** — Fast adapter (plateau FD30) + 5-day +0.6 °C episode at FD90. Problem days with data: 5.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.9 (0.0–3.0) | 100% | 100% | 0.0 | 0 |
| Pre-flight only | 109.2 (106.0–113.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 8.0 (5.0–11.0) | 54% (40–80) | 54% (40–80) | 0.0 | 0 |
| BASELINE | 38.1 (30.0–44.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 35.5 (28.0–40.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 9.5 (4.0–12.0); on problem days: 2.7 (1.0–4.0); “can't tell” days (Low confidence): 18.4 (12.0–24.0); final personal size: 1.16 (1.10–1.21)×; in-flight days with data: 120.

**F-slow** — Slow adapter (plateau FD150) + 5-day +0.6 °C episode at FD90. Problem days with data: 5.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 37% (0–80) | 37% (0–80) | 1.2 (0.0–4.0) | 3 |
| Pre-flight only | 83.7 (66.0–92.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 5.9 (3.0–8.0) | 58% (40–80) | 58% (40–80) | 0.0 | 0 |
| BASELINE | 7.6 (2.0–17.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 4.7 (0.0–10.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 1.1 (0.0–5.0); on problem days: 4.0 (4.0–5.0); “can't tell” days (Low confidence): 0.0; final personal size: 0.61 (0.57–0.66)×; in-flight days with data: 120.

**F-none** — Non-adapter + 5-day +0.6 °C episode at FD90. Problem days with data: 5.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 0% | 0% | — | 20 |
| Pre-flight only | 2.8 (1.0–7.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 2.8 (0.0–4.0) | 54% (40–80) | 54% (40–80) | 0.0 | 0 |
| BASELINE | 1.9 (1.0–2.0) | 99% (80–100) | 99% (80–100) | 0.1 (0.0–1.0) | 0 |
| BASELINE w/o Earth line | 0.0 | 99% (80–100) | 99% (80–100) | 0.1 (0.0–1.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 3.7 (2.0–4.0); “can't tell” days (Low confidence): 0.0; final personal size: 0.09 (0.04–0.14)×; in-flight days with data: 120.

**F-delayed** — Delayed adapter (starts FD30, plateau FD105) + 5-day +0.6 °C episode at FD90. Problem days with data: 5.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 96% (80–100) | 96% (80–100) | 0.1 (0.0–1.0) | 0 |
| Pre-flight only | 70.4 (61.0–74.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 7.2 (4.0–11.0) | 59% (40–80) | 59% (40–80) | 0.0 | 0 |
| BASELINE | 46.5 (43.0–48.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 45.9 (41.0–48.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 19.2 (11.0–24.0); on problem days: 4.6 (4.0–5.0); “can't tell” days (Low confidence): 48.4 (39.0–52.0); final personal size: 0.66 (0.60–0.73)×; in-flight days with data: 120.

**F-large** — Large adapter (+1.5 °C) + 5-day +0.6 °C episode at FD90. Problem days with data: 5.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 52.9 (50.0–56.0) | 100% | 100% | 0.0 | 0 |
| Pre-flight only | 105.0 (100.0–108.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 12.4 (10.0–15.0) | 54% (40–80) | 54% (40–80) | 0.0 | 0 |
| BASELINE | 69.5 (57.0–76.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 69.2 (54.0–76.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.2 (0.0–1.0); on problem days: 4.1 (4.0–5.0); “can't tell” days (Low confidence): 63.6 (48.0–72.0); final personal size: 1.47 (1.42–1.52)×; in-flight days with data: 120.

**F-small** — Small adapter (+0.5 °C) + 5-day +0.6 °C episode at FD90. Problem days with data: 5.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 2% (0–20) | 2% (0–20) | 2.0 | 18 |
| Pre-flight only | 83.7 (66.0–92.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 5.0 (2.0–8.0) | 54% (40–80) | 54% (40–80) | 0.0 | 0 |
| BASELINE | 2.0 (2.0–3.0) | 99% (80–100) | 99% (80–100) | 0.1 (0.0–1.0) | 0 |
| BASELINE w/o Earth line | 0.1 (0.0–1.0) | 99% (80–100) | 99% (80–100) | 0.1 (0.0–1.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 4.0 (3.0–4.0); “can't tell” days (Low confidence): 0.0; final personal size: 0.55 (0.50–0.60)×; in-flight days with data: 120.

### G — Noisy, incomplete and faulty data


**G-missing30** — 30% of days randomly missing + FD90 episode. Problem days with data: 3 (1–5).

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.2 (0.0–1.0) | 100% | 100% | 0.5 (0.0–2.0) | 0 |
| Pre-flight only | 68.5 (60.0–79.0) | 100% | 100% | 0.5 (0.0–2.0) | 0 |
| Last 14 days | 5.8 (3.0–9.0) | 53% (0–100) | 53% (0–100) | 0.5 (0.0–2.0) | 2 |
| BASELINE | 2.4 (1.0–3.0) | 100% | 100% | 0.5 (0.0–2.0) | 0 |
| BASELINE w/o Earth line | 0.5 (0.0–2.0) | 100% | 100% | 0.5 (0.0–2.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 2.2 (0.0–4.0); “can't tell” days (Low confidence): 0.1 (0.0–1.0); final personal size: 1.01 (0.96–1.05)×; in-flight days with data: 82 (74–93).

**G-gap** — 6 consecutive missing days FD84–89, then FD90 episode. Problem days with data: 5.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.2 (0.0–1.0) | 100% | 100% | 0.0 | 0 |
| Pre-flight only | 93.3 (88.0–99.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 8.4 (5.0–13.0) | 34% (20–60) | 34% (20–60) | 0.0 | 0 |
| BASELINE | 2.8 (2.0–5.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 0.8 (0.0–3.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 4.0; “can't tell” days (Low confidence): 0.2 (0.0–1.0); final personal size: 1.01 (0.95–1.06)×; in-flight days with data: 114.

**G-noise2x** — Double measurement noise (SD 0.2 °C) + FD90 episode. Problem days with data: 5.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 5.4 (2.0–11.0) | 95% (80–100) | 95% (80–100) | 0.1 (0.0–1.0) | 0 |
| Pre-flight only | 84.5 (66.0–92.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 7.2 (4.0–10.0) | 43% (20–60) | 43% (20–60) | 0.1 (0.0–2.0) | 0 |
| BASELINE | 7.8 (4.0–17.0) | 97% (80–100) | 97% (80–100) | 0.1 (0.0–1.0) | 0 |
| BASELINE w/o Earth line | 2.9 (0.0–14.0) | 79% (60–100) | 79% (60–100) | 0.1 (0.0–1.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 2.3 (0.0–4.0); “can't tell” days (Low confidence): 1.2 (0.0–12.0); final personal size: 1.03 (0.93–1.13)×; in-flight days with data: 120.

**G-outliers** — 5% one-day sensor spikes of +1.0 °C + FD90 episode. Problem days with data: 5 (3–5).

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.3 (0.0–1.0) | 100% | 100% | 0.0 | 0 |
| Pre-flight only | 95.0 (88.0–101.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 4.3 (0.0–12.0) | 30% (0–60) | 30% (0–60) | 0.1 (0.0–2.0) | 6 |
| BASELINE | 3.4 (2.0–7.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 0.9 (0.0–3.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 3.6 (2.0–4.0); “can't tell” days (Low confidence): 0.3 (0.0–2.0); final personal size: 1.01 (0.96–1.06)×; in-flight days with data: 120.
Outlier (sensor-spike) days flagged — BASELINE: 5.6 (2.0–11.0), pre-flight: 5.6 (2.0–11.0).

**G-sensorstep** — Sensor replaced at FD50 reading +0.4 °C high (not physiological). Problem days with data: 71.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 76% (70–83) | 95% (80–100) | 6.8 (2.0–15.0) | 0 |
| Pre-flight only | 33.4 (28.0–39.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 5.0 (2.0–7.0) | 9% (6–11) | 1% (0–10) | 0.1 (0.0–1.0) | 0 |
| BASELINE | 0.1 (0.0–1.0) | 98% (92–100) | 100% | 0.3 (0.0–2.0) | 0 |
| BASELINE w/o Earth line | 0.1 (0.0–1.0) | 97% (86–100) | 100% | 0.3 (0.0–2.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 9.0 (4.0–16.0); “can't tell” days (Low confidence): 54.0 (49.0–62.0); final personal size: 1.35 (1.31–1.39)×; in-flight days with data: 120.

**G-sensordrift** — Sensor drifts +0.01 °C/day from FD40 (not physiological). Problem days with data: 52.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.0 | 93% (90–98) | 100% | 26.9 (20.0–32.0) | 0 |
| Pre-flight only | 23.4 (18.0–29.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 4.2 (2.0–6.0) | 10% (6–15) | 6% (0–20) | 4.7 (0.0–12.0) | 0 |
| BASELINE | 0.1 (0.0–1.0) | 96% (90–100) | 100% | 15.9 (6.0–31.0) | 0 |
| BASELINE w/o Earth line | 0.1 (0.0–1.0) | 95% (87–98) | 100% | 15.9 (6.0–31.0) | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 24.5 (15.0–36.0); “can't tell” days (Low confidence): 43.5 (32.0–50.0); final personal size: 1.38 (1.32–1.43)×; in-flight days with data: 120.

**G-everyother** — Readings only every other day from FD40 + FD90 episode. Problem days with data: 3.

| Method | False-alert days | Problem days caught | Late-phase caught | Detection delay (days) | Never detected (of 20) |
|---|---|---|---|---|---|
| Earth only | 0.1 (0.0–1.0) | 100% | 100% | 0.0 | 0 |
| Pre-flight only | 61.4 (56.0–67.0) | 100% | 100% | 0.0 | 0 |
| Last 14 days | 7.2 (4.0–11.0) | 48% (33–67) | 48% (33–67) | 0.0 | 0 |
| BASELINE | 2.3 (2.0–4.0) | 100% | 100% | 0.0 | 0 |
| BASELINE w/o Earth line | 0.3 (0.0–2.0) | 100% | 100% | 0.0 | 0 |

BASELINE extras — “tell your medical officer” on problem-free days: 0.0; on problem days: 2.0; “can't tell” days (Low confidence): 0.1 (0.0–1.0); final personal size: 1.01 (0.94–1.06)×; in-flight days with data: 80.

## 6. Original in-app stress test — audit findings

The app's single-seed table (`src/engine/stressTest.ts`) was audited against the checks in your brief.

| Check | Finding | Action |
|---|---|---|
| Same data for every method | ✅ Yes | — |
| Rules documented | ✅ In code and the README. But BASELINE's count includes Earth-line WATCH and cool-down WATCH, while the other methods are single rules. | The adversarial harness adds a "BASELINE w/o Earth line" column |
| Persistence treated consistently | ✅ All methods count single-day flags. BASELINE's ACT adds persistence on top but doesn't change the "flagged" count. | — |
| Noise realistic | ❌ The demo noise is clamped to ±0.15 °C, which flatters every method | Adversarial harness uses unclamped noise + 20 seeds |
| Drift scenario windows | ⚠️ Problem days 90–99 were hand-picked "deep into the drift", and drift days 67–89 were excluded, so detection delay was hidden | Harness reports delay and the late phase |
| **Claim "BASELINE is the only method that catches the slow drift without false alerts"** | ❌ **Wrong.** The Earth-only method also caught 9/9 with 0 false alerts, because that drift crossed 38 °C | Corrected in the app, README and doc 04. A non-adapter + drift row (Earth line never fires) was added to the in-app table. |
| Non-adapter "0 / 2 of 3" | ✅ The arithmetic was correct: 0 false alerts, 2 of 3 problem days caught. The missed day was FD96: reading 37.20 °C vs expected 36.86 °C (personal size 0.13×), z = 1.88 < 2.0. Cause: the ±0.15 °C model uncertainty still widened her band after her data showed she wasn't adapting. | Fixed by shrinking the model uncertainty as her own evidence grows. Now 3/3. |
| Denominators | ✅ FD98 (no reading) is excluded from every method alike | — |
| Scenario design favouring BASELINE | ⚠️ "Average adapter" is generated from the exact curve BASELINE expects | Disclosed on screen; harness adds 36 scenarios not tied to the curve |

## 7. Limitations of these results

- Every number comes from simulated data generated by our own assumptions. A method designed by the same team that wrote the simulator can look better than it would on real data.
- Individual adaptation sizes and timings, drift shapes, noise levels and sensor faults are not taken from research.
- Results depend on design thresholds (z = 2.0 / 2.5; rise limit 0.25×; trim 2.5 SD; prior weight 5).
- No real astronaut or human wearable data was used.
