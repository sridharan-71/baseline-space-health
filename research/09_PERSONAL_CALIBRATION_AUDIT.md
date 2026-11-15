# 09 — Critical Audit of BASELINE's Personal Calibration

*15 Nov 2026. A reviewer's audit of the temperature-adaptation calibration added earlier today.*

**Ground rules**
- All scenarios are **hypothetical simulations**. Detailed results are in doc 10.
- Nothing here is clinical performance.

---

## 1. How the algorithm works: reading → status

This was traced in the code, not the docs.

1. **Pre-flight baseline** (`engine/baseline.ts`): mean and sample SD of up to 30 pre-flight readings, with an SD floor of 0.1 °C.
2. **Research curve** (`evidence/adaptation.ts`): `g(day) = 1.0 × min(day/75, 1)` °C, from the Stahn et al. 2017 group mean.
3. **Personal calibration** (`engine/personalize.ts`): estimates a size factor `scale` from her own in-flight readings up to 7 days ago (§2).
4. **Expected value** (`engine/assess.ts`): `mean + scale × g(day)`. Band: `± 2 × combined SD`, where `combined SD = √(pre-flight SD² + u²)`.
5. **Five layers:** data quality, personal deviation, expected adaptation, persistence (2 of the last 3 available days), Earth reference.
6. **Status:**
   - ACT: z ≥ 2.5 and persistence ≥ 2
   - WATCH: z ≥ 2.0, or Earth line crossed, or cool-down, **or the new "can't tell" safeguard**
   - otherwise OK
   - UNKNOWN when the reading is missing or invalid
7. **The chart band** (`engine/lenses.ts`) now uses the same expected value and the same uncertainty as the assessment (regression-tested).

## 2. Verified mathematical formulation

**As first implemented (verified in code — it matched the description):**

```
x_t = reading_t − pre-flight mean
g_t = research offset on day t
over in-flight days 1 … (day − 7) with a reading and g_t > 0:

scale = clamp( (Σ x_t·g_t + w0) / (Σ g_t² + w0), 0, 2 ),   w0 = 5
u     = 0.15 °C (fixed)
```

This is a ridge-type least-squares estimate of a single multiplier, shrunk toward 1 (the research mean).

- `Σ g²` is the evidence carried by her data.
- `w0 = 5` is equivalent to 5 days at the full plateau.

**As now implemented** (changes in §8):

```
pass 1 (robust):  k₀ = median of x_t/g_t over days with g_t ≥ 0.3   (fallback: plain fit if < 5 such days)
trim:             drop days with x_t − k₀·g_t ≥ 2.5 × combined SD   (one-sided: only unusually HIGH days)
pass 2:           scale = clamp((Σx·g + w0)/(Σg² + w0), 0, 2) on the kept days
uncertainty:      u = 0.15 × √(w0 / (w0 + Σg²))          (shrinks as her own evidence grows)
consistency:      k_recent = Σx·g/Σg² over the last 30 kept days
                  k_early  = lowest such estimate over earlier, non-overlapping 30-day blocks (each needing Σg² ≥ 2)
"can't tell":     (a) scale > 1 AND the reading is flagged against the research curve AND not against the calibrated one, or
                  (b) k_recent − k_early ≥ 0.25
                  → status can never be OK: at least WATCH, confidence Low, explicit message
```

## 3. Failure modes discovered

| # | Failure | Evidence (20 seeds) | Severity |
|---|---|---|---|
| F1 | **Silent absorption of a slow drift that stays below 38 °C.** For a non-adapter, the prior (pulling toward 1×) and her flat early data (pulling down) cancel against the drift. The estimate sits at ~0.4–0.6×, so the drift fills the "expected" band. | B-none-drift: **0% caught, never detected in 15/20 seeds, no uncertainty shown** | **Critical** |
| F2 | Same for a small adapter whose drift starts in the first weeks | B-small-drift: 1% caught, never detected in 9/20 | **Critical** |
| F3 | Drift on an average adapter is absorbed into a growing personal size (1.28× for +0.3 °C). The only detection came from the Earth 38 °C line. | A-30-0.3: BASELINE caught exactly the same days as "Earth only" (60%) | High |
| F4 | A sensor that reads 0.4 °C high after replacement is absorbed (size → 1.35×) | G-sensorstep | High |
| F5 | A 20-day episode inflates the estimate | C-60-0.6x20: size 1.16× | Medium |
| F6 | The model uncertainty (±0.15 °C) kept the band wide even after her data showed she doesn't adapt, so it missed the first day of an episode | Non-adapter FD96: z = 1.88 | Medium |
| F7 | The chart band used a different uncertainty from the decision once it became adaptive (introduced during this audit, caught by a new test) | `adversarial.test.ts` "chart band and assessment agree" | Medium (display) |
| F8 | My earlier claim "BASELINE is the only method that catches the slow drift" was false: Earth-only also caught it | In-app table | Communication error |

## 4. Adversarial scenario results (summary; full tables in doc 10)

| Group | What was tested | After fix: BASELINE | Remaining weakness |
|---|---|---|---|
| A — gradual drift (FD30/50/70; +0.3/+0.6 °C) | Does calibration grow and hide it? | 77–100% caught; late phase 76–100%; flagged mostly as "can't tell" | A +0.3 °C drift is near the band width: detected late (mean delay 12–18 days) |
| B — persistent drift | Is it eventually treated as normal? | No silent absorption in any seed; non-adapter drift late phase **100%** | **Small adapter + drift from FD30: late phase only 25%** (unidentifiable, §9) |
| C — sudden episode | Detected immediately? Later absorbed? | Detected on day 0 in every seed; a never-resolving step stays flagged (100% late) | — |
| D — repeated episodes | Do early episodes hide later ones? | 100% of all three episodes caught; final size ≤ 1.1× | ~6.7 false-alert days (post-episode cool-down) |
| E — early mission (FD3/10/17; drift from FD5) | Can it tell early problems from adaptation? | Episodes 99–100% on day 0; early drift 96% | Early detection rests on the research curve, not her data |
| F — adaptation timing/size | Is personalising only the size enough? | **No.** Size handles small, large and non-adapters. Timing errors produce alerts: fast 38 false days (9.5 "tell doctor"), delayed 46 (19.2 "tell doctor"), large 70 (mostly "can't tell") | Timing is not modelled |
| G — data problems | Missing, gaps, noise, outliers, sensor faults, frequency | Episode caught 97–100% in all; spikes don't move the estimate (≤ 1.15×); sensor step/drift flagged, not absorbed | Every outlier day is flagged (it can't know it's a spike); double noise ≈ 8 false days |

## 5. Calibration contamination analysis (your questions 1–10)

1. **Can a gradual health-related trend be distinguished from adaptation using temperature alone?**
   - Only if its **timing differs** from the research curve. A drift that starts later than launch-ramp timing can be detected (consistency check).
   - A drift that starts in the first ~6 weeks and merges with the ramp **cannot** be separated. The data looks identical (F2, §9).
2. **Does the 7-day exclusion protect against contamination?**
   - Only against changes **shorter than 7 days**.
   - Anything older than 7 days entered the estimate (F1, F3, F5). Trimming and the consistency check were needed.
3. **Can an older abnormal trend still influence the estimate?**
   - Yes. The estimate uses all eligible history.
   - Mitigations: trimming removes high outliers and episodes; the consistency check compares fixed earlier blocks, so a growing history can't hide a recent change.
4. **Too much dependence on early measurements?** Early days carry little weight because `g` is small (Σg² up to FD45 ≈ 5, i.e. the prior's weight), so early data matters less than late data. The real risk was the opposite: one growing early window letting contamination in. Fixed with the blocks.
5. **Is least squares robust to outliers?**
   - No. A 1.0 °C spike enters with full weight.
   - Now there is a robust first pass (median of ratios) plus one-sided trimming: 5% spikes move the estimate by ≤ 0.15×.
6. **Is the 0–2× clamp justified?**
   - It's a design assumption.
   - The lower bound 0 is needed: a negative "adaptation" makes no sense.
   - The upper bound 2 limits absorption. With the "can't tell" safeguard, anything explained only by a size > 1 can't produce OK anyway.
7. **Is a prior weight of 5 reasonable?**
   - It's **arbitrary** (5 plateau-days of evidence). No research sets it.
   - It controls how fast her own data takes over (~FD45 on the research curve).
   - Smaller values react faster but are noisier early. Left unchanged, and declared a design assumption.
8. **What if the research curve is near zero (early days)?**
   - `g ≈ 0` days carry ~0 weight in the fit, and ratios are only used where g ≥ 0.3. So early data can't tell size.
   - Early decisions therefore rest on the research curve plus the full ±0.15 °C uncertainty.
9. **Does behaviour depend on when data becomes available?**
   - Yes. Gaps late in the ramp weaken the estimate (less Σg²), and the consistency check needs Σg² ≥ 2 per window.
   - Every-other-day data (G-everyother) still worked; 30% missing still worked.
   - With very sparse data the check stays inactive (`consistency = null`) and the system falls back to research curve + prior.
10. **Can two very different physiological situations produce near-identical data?**
    - **Yes.** A small adapter with an early drift ≈ an average adapter. A delayed adapter ≈ a non-adapter with a drift. A large adapter ≈ an average adapter with a drift from launch. A sensor offset ≈ a physiological step.
    - This is the central limit of temperature-only monitoring, so the product now **says so** instead of choosing one.

## 6. Alternative approaches considered

| Approach | Advantages | Disadvantages / assumptions | Decision |
|---|---|---|---|
| Keep the original (cumulative LS, 7-day exclusion) | Simple | Silently absorbs slow drifts (F1–F4) | ✗ Rejected |
| Robust regression (median/trimmed) | Resists spikes and episodes | Doesn't stop *slow* drifts by itself | ✓ Used (first pass + one-sided trim) |
| Rolling calibration window (last N days only) | Adapts to change | Absorbs drifts **faster**: the same weakness as "last 14 days" | ✗ |
| Fixed initial calibration period (e.g. FD1–45), then frozen | Later drifts can't be absorbed; deviations escalate normally | Early g is small, so a weak estimate; problems during the period contaminate it; slow or delayed adapters → many false ACTs | Partly reflected: earlier fixed blocks serve as the reference in the consistency check |
| Slowly updating calibration | Smooth | Still absorbs, just later; needs another arbitrary rate | ✗ |
| Change-point detection on residuals | Principled | More complex; needs tuning; not explainable to an astronaut in 5 minutes | Future |
| CUSUM / EWMA on residuals | Sensitive to small persistent shifts | Works on residuals, so it inherits the absorbed expectation; ANCHOR, Sol and Pulsar already use it | Future (would complement) |
| Adaptation model with uncertain timing (fit onset/plateau) | Would address F-fast and F-delayed | Two more parameters from noisy data; makes slow drifts *easier* to absorb (a "delay" can explain a late rise) — unsafe | ✗ for now |
| **Combination: robust size estimate + consistency check + "can't tell" state + evidence-shrinking uncertainty, keeping the independent pre-flight comparison** | Never silently reassures; still uses research where it fits; simple to explain | More "keep an eye on it" days for unusual adapters; drift detection is mostly "can't tell", not escalation | **✓ Chosen** |

## 7. Recommended final algorithm

**Outcome B — modify the calibration approach** (implemented).

**Why not D (remove calibration)?**
- Without it, the small adapter's real problem is hidden inside the research band (0/3 caught in the original stress test).
- Large adapters get dozens of false "tell your medical officer" days.

**Why not A (keep as is)?** It silently absorbed drifts in 15/20 seeds (F1).

**Governing rule:**

> **Personal calibration may make BASELINE more cautious, but it may never, on its own, turn a reading into a reassuring OK.** When adaptation and an unexplained change can't be told apart, BASELINE shows "Keep an eye on it", with Low confidence and a plain "can't tell" message. The independent pre-flight comparison is always shown.

## 8. What changed in the code

| File | Change |
|---|---|
| `src/engine/personalize.ts` | Robust first pass (median of ratios); one-sided trimming at 2.5 combined SD; consistency check (recent 30 days vs lowest earlier 30-day block); `effectiveUncertainty()` shrinking with evidence; full doc comments |
| `src/engine/assess.ts` | Research-curve z kept alongside the calibrated z; "can't tell" safeguard (never OK, confidence forced Low, headline, next step, Why-card text); uses the shared uncertainty |
| `src/engine/lenses.ts` | Chart band uses the same uncertainty as the assessment |
| `src/engine/config.ts` | New documented design assumptions: trim Z, rise limit, lookback window; plain-English rule on the Science page |
| `src/domain/types.ts` | `MetricAssessment.adaptationUncertain` |
| `src/ui/components/MetricCard.tsx`, `styles.css` | Visible "Can't tell" note on the card |
| `src/data/simulated/adversarial.ts`, `src/engine/adversarialEval.ts` | Adversarial scenario generator (36 scenarios) and evaluator (5 methods, 20 seeds) |
| `src/data/simulated/scenarios.ts`, `StressTestTable.tsx` | New "non-adapter + slow drift" row; corrected wording; multi-seed caveat |
| Tests | `adversarial.test.ts` (14 regression tests over 10 seeds, including "uncertain is never OK" across all scenarios) and a new `stressTest` test. The large-adapter expectation was updated. |

## 9. Remaining scientific limitations

1. **Unidentifiable cases remain.** A drift that starts in the first ~6 weeks and blends into the ramp (e.g. small adapter + drift from FD30) is caught only 46% (25% late phase). No temperature-only method can separate it from a bigger adaptation. Pre-flight-only "catches" it only because it alerts on almost everything.
2. **Drift detection is mostly "can't tell" (WATCH), rarely ACT.** BASELINE won't escalate on an ambiguous trend. It asks the astronaut to mention it at a routine check. That is a product choice, not a clinical rule.
3. **Timing isn't modelled.** Fast or delayed adapters get false "tell your medical officer" days (9.5 and 19.2 per 120 days, simulated).
4. **Large adapters see many "can't tell" days** (~64 per 120 days, simulated). Honest, but tiring.
5. **All thresholds are design assumptions:** prior weight 5, trim 2.5, rise limit 0.25, 30-day windows, z 2.0/2.5.
6. **Everything is simulated.** The noise model, individual variation, drift shapes and sensor faults are assumptions, not data. The research curve is a group mean of 11 ISS crew on ~6-month missions.
7. **Sensor faults and physiology look the same.** BASELINE flags the change but can't say which it is.

## 10. Tests and build

| Check | Result |
|---|---|
| `npx vitest run` | **134 passed, 1 skipped** (the skipped one is the results-dump utility, only run on demand) |
| Adversarial regression tests | 14/14 pass (10 seeds each) |
| Original demo invariants (I1–I10) | All still pass |
| `npx tsc --noEmit` | Clean |
| `npm run build` | Succeeds |
| Browser check | Over time (day 60) and Science & sources stress table render; no console errors |
