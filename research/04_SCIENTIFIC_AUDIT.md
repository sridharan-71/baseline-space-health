# 04 — Scientific Audit of BASELINE

Everything here was checked against the actual code (`src/engine`, `src/evidence`, `src/data/simulated`) and the original papers.

---

## 1. Core temperature — Stahn et al. 2017

**Verified facts** ([PMC5701078](https://pmc.ncbi.nlm.nih.gov/articles/PMC5701078)):

| Item | Finding |
|---|---|
| Sample | 11 ISS astronauts (7 men, 4 women) |
| Sensor | Non-invasive forehead "Double Sensor" (skin temperature + heat flux) estimating core body temperature — **not** an oral, ear or skin thermometer |
| Time points | Pre-flight L-90; in-flight FD15, 45, 75, 105, 135, 165; post-flight R+1, 10, 30 |
| Result | Resting core temperature about **+1.01 °C** above baseline, developing gradually and **plateauing after about 75 days** |
| Authors' limits | Only 4 women, so sex not modelled; the cause is speculative; conclusions "within the limits of a spaceflight experiment" |

**Audit of how BASELINE uses it**

| Question | Finding | Verdict |
|---|---|---|
| Is a gradual trajectory reasonable? | The paper reports a gradual rise to a plateau. Our linear ramp to FD75 is an **interpolation** between six sparse time points. | OK, labelled as a design assumption |
| Is a group mean valid for one person? | **No.** It's an average of 11 people, and individual spread isn't used in our model. | **Fixed today** — see §5 |
| Are the readings comparable? | Only if the reading comes from the same kind of sensor. The app labels the measure "core temperature estimate (simulated heat-flux wearable)". | OK, provided we never feed it oral or forehead-IR readings |
| Is the Earth 38.0 °C line comparable? | No. The CDC definition is typically an oral measurement; our sensor estimates core temperature. | **Rule changed today:** crossing the line raises WATCH only and never escalates to ACT on its own |
| Uncertainty to show | n = 11, single pre-flight session, sparse points, ISS-only (~6 months) | Shown on the Evidence page |

---

## 2. Other measures

| Measure / rule | Status | Source | Verdict |
|---|---|---|---|
| Resting HR — no adaptation model | Correct to have none | No HR curve used | Falls back to pre-flight normal. OK. |
| HR Earth line, 100 bpm | Clinical reference | AHA via [Mayo Clinic](https://mayoclinic.org/health/heart-rate/AN01906/) | Context only. OK. |
| Sleep — no adaptation model | Correct | [Barger et al. 2014](https://sleepreviewmag.com/sleep-health/parameters/quantity/astronaut-sleep-hypnotics/) gives *population* averages (~6.1 h on ISS), not an individual shift | OK, shown as context only |
| Mood, 1–5 self-rating | Design assumption | — | **Weak.** On an integer 1–5 scale with SD floor 0.5, a single 1-point drop is about 2 SD, which already means WATCH. The scale is too coarse for SD maths. Keep it, but don't make claims about it. |
| Blood pressure (Norsk 2015, 8–10 mmHg lower, n = 8 men) | **Not implemented** (P1 skipped) | [PMC4324706](https://pmc.ncbi.nlm.nih.gov/articles/4324706/) | Fine to leave out: weak evidence, and 24-h ambulatory ≠ spot BP |
| Pre-flight baseline: 30 days, sample SD, per-measure SD floor | Design assumption | — | Reasonable. SD floors stop tiny noise from looking big. |
| WATCH z ≥ 2.0; ACT z ≥ 2.5 with 2 of the last 3 days | Design assumption | — | Not clinically validated. Labelled. |
| UNKNOWN for missing data; lower confidence when the window has a gap | Design assumption | — | Good practice. Tested. |
| Earth crossings ≥ 2 → ACT | **Removed today** | — | It produced 33 "tell your doctor" days for a large adapter on a sensor the line wasn't made for |

---

## 3. The "83 vs 3" claim, reproduced

**Reproduction** (actual engine, seed 2026, FD1–FD99):
- pre-flight-only lens: **83** flagged days out of 98 in-flight days with data
- BASELINE: **3**
- Earth lens: **3**

These match the app.

**How each number is calculated**
- *Pre-flight-only:* `(value − pre-flight mean) / pre-flight SD ≥ 2.0`, single day.
- *BASELINE:* status is WATCH or ACT. That includes a single-day `z ≥ 2.0` against the **expected** value.

Same threshold, same single-day basis, so the comparison is mechanically fair.

**The problem: it's circular.**
- The simulator (`mission.ts`) generates temperature as `36.75 + 1.0 × min(day/75, 1) + noise`. That is **exactly** the curve the engine expects.
- So "BASELINE: 0 false alerts on normal days" is guaranteed by construction. It proves the code is consistent, not that the method works.

**The planted episode** (+0.45 to +0.65 °C for 4 days, with HR, sleep and mood changes) is plausible as an illustration. But it was chosen by us, not drawn from real data.

**Missing data.** The FD98 gap correctly gives UNKNOWN and lowers the next day's confidence (tested). It doesn't change the counts, which only use days with a reading.

---

## 4. Stress test: does the conclusion survive different assumptions?

The same engine was re-run on hypothetical astronauts. Individual adaptation sizes and timings are **not** taken from research; they are "what if" cases. Code: `src/data/simulated/scenarios.ts`, `src/engine/stressTest.ts`; the table is shown live in the app.

**Before personal calibration** (group curve used as-is):

| Hypothetical astronaut | BASELINE false alerts (FD1–95) | Planted episode caught |
|---|---|---|
| Average adapter (+1.0 °C) | 0 | 3/3 |
| **Small adapter (+0.5 °C)** | 0 | **0/3 — real problem hidden inside the "expected" band** |
| **Large adapter (+1.5 °C)** | **48** | 3/3 |
| Fast adapter (plateau FD30) | 36 | 3/3 |
| **Non-adapter** | 0 | **0/3** |

**Conclusion:** the original differentiator was **unsafe** for small or non-adapters and **noisy** for large or fast adapters. The headline claim was misleading.

---

## 5. Correction implemented: research shape, personal size

**Method.** `expected offset = scale × research curve`, where:

```
scale = (Σ x·g + w0) / (Σ g² + w0)
```

- `x` = her reading − her pre-flight mean
- `g` = research offset for that day
- the sums run over her own in-flight days up to **7 days ago**, so a new problem can't "calibrate itself away"
- `w0 = 5`: the research average counts as 5 days of evidence
- scale is limited to 0–2×

This is a one-parameter shrinkage estimate: simple, explainable and testable. All constants are labelled design assumptions in `engine/config.ts` and on the Evidence page.

**After the correction** (live in the app), counting false alerts / problem days caught:

| Hypothetical astronaut | Earth only | Pre-flight only | Last 14 days (rolling) | **BASELINE** |
|---|---|---|---|---|
| Average adapter | 0 / 3 of 3 | 80 / 3 of 3 | 10 / 3 of 3 | **0 / 3 of 3** |
| Small adapter | 0 / **0 of 3** | 71 / 3 of 3 | 3 / 3 of 3 | **0 / 3 of 3** |
| Large adapter | 33 / 3 of 3 | 84 / 3 of 3 | 12 / 3 of 3 | 33 (all WATCH from the Earth line; **0 sent to doctor**) / 3 of 3 |
| Fast adapter | 0 / 3 of 3 | 88 / 3 of 3 | 8 / 3 of 3 | **22 (10 sent to doctor)** / 3 of 3 — known weakness |
| Non-adapter | 0 / **0 of 3** | 0 / 3 of 3 | 0 / 3 of 3 | 0 / 2 of 3 |
| Slow unexplained drift (+0.6 °C over FD66–96) | 0 / 9 of 9 | 51 / 9 of 9 | 9 / **0 of 9** | **0 / 9 of 9** |

**Correction (later the same day):** an earlier version of this section said BASELINE was the only method that caught the slow drift with zero false alerts. **That was wrong.** The Earth-only method also caught 9/9 with 0 false alerts, because that drift crossed 38 °C. A further audit (docs 09 and 10) also found that this version of the calibration **silently absorbed** slow drifts that stay below 38 °C (non-adapter + drift: 0% caught). It has since been fixed.

**What we can honestly say**
- A rolling "last 14 days" baseline adapts to a slow drift, so it misses it.
- After the fix, BASELINE flags slow drifts in the scenarios we tested, including ones below 38 °C, mostly as "can't tell" rather than as reassurance.
- BASELINE's weakness is astronauts who adapt much faster than the research curve, because it personalises the *size* of the change but not its *timing*.

**What we must NOT say**
- Any accuracy, sensitivity or false-alarm rate for real astronauts.
- That the scenarios reflect real individual variation.

---

## 6. Remaining scientific risks

1. Only one measure has an adaptation model. Others are plain personal-baseline monitoring.
2. No real astronaut or human data is used for validation. Public wearable sets (PMData, LifeSnaps) could test false-alarm rates but **not** the space adaptation.
3. The persistence rule is basic compared with CUSUM or EWMA.
4. Personal calibration needs in-flight data. In the first ~2 weeks the research curve dominates.
5. Cause is never inferred. BASELINE flags *unexplained change*, never what it is. Keep it that way.
