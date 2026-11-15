# BASELINE — Final Architecture

## 1. Stack decision

No code exists, so this is a fresh choice. It uses tools you already know:

| Choice | Why | Rejected alternative |
|---|---|---|
| **Vite + React 18 + TypeScript** | Fast; static build; no server | Next.js: no server-side rendering needed, so it's more config for nothing |
| **Vitest** | Same TypeScript code tested directly; very fast | Jest: slower to set up with Vite |
| **Recharts** (only chart dependency) | Bands (`Area`), lines and `ReferenceLine` take minutes | Hand-written SVG: more code under time pressure |
| **No backend, no auth, no database.** State lives in React context plus `localStorage`. | Offline by default; nothing to fail in the demo | Supabase: unnecessary, and a network risk |
| **No zod.** Hand-written validation (about 40 lines). | Fewer dependencies | zod would be fine; it just isn't needed |
| **Deploy:** Vercel (static) or GitHub Pages | One command | — |

**Allowed dependencies:** `react`, `react-dom`, `recharts`, plus dev-only `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom` and `jsdom`. Anything else needs a written reason in the prompt report.

## 2. Data flow

```
data/simulated/mission.ts ──► Reading[] + SelfReport[] (SIMULATED)
                                   │
state/MissionContext  (merges user-entered readings over simulated ones, persists to localStorage)
                                   │
                      engine/index.ts : assessDay(input, day) / compareLenses(input, metric, upToDay) / buildCmoNote(dayAssessment, input)
                                   │
   ┌──────────────┬────────────────┼──────────────────┬───────────────┐
 quality.ts   baseline.ts    adaptation (evidence/)   trend.ts      references (evidence/)
                                   │
                          assess.ts → MetricAssessment, DayAssessment
                                   │
                      ui/ screens (render only; NO thresholds or rules in UI)
```

**The rule that matters:** the UI imports from `engine/index.ts` only. Tests import the same functions. Thresholds live only in `engine/config.ts`; evidence and adaptation live only in `evidence/`.

## 3. File structure

```
baseline/
  index.html  package.json  vite.config.ts  tsconfig.json  README.md
  docs/                         ← the six planning docs
  src/
    main.tsx
    domain/
      types.ts                  ← all shared types (no logic)
      phase.ts                  ← phaseOf(day), formatDay(day)  (tiny helpers)
      metrics.ts                ← METRICS registry (labels, units, plausible ranges, sdFloor, unhealthyDirection, bodySystem, explainer text)
      validation.ts             ← validateReading, validateSelfReport
    evidence/
      sources.ts                ← EVIDENCE registry (citation, url, population, limitations)
      adaptation.ts             ← ADAPTATION_MODELS + expectedOffset(metricId, missionDay)
      references.ts             ← EARTH_REFERENCES (line, direction, sourceId, caveat)
    engine/
      config.ts                 ← WATCH_Z, ACT_Z, MIN_BASELINE_DAYS, PERSIST_WINDOW, … (all labelled DESIGN ASSUMPTION)
      readings.ts               ← getReading (USER_ENTERED beats SIMULATED), availableDays
      baseline.ts               ← computePreflightBaseline
      quality.ts                ← checkDataQuality
      trend.ts                  ← lastAvailableDays, persistenceCount, slope (P1)
      assess.ts                 ← assessMetric, assessDay
      lenses.ts                 ← compareLenses
      handoff.ts                ← buildCmoNote (SBAR text)
      index.ts                  ← public API (re-exports only)
      __tests__/*.test.ts
    data/simulated/
      rng.ts                    ← mulberry32(seed)
      mission.ts                ← generateDemoMission(seed = 2026): MissionInput
      __tests__/mission.test.ts
    state/
      MissionContext.tsx        ← provider: input, selectedDay, addReading, addSelfReport, reset
      persistence.ts            ← load/save user entries (try/catch; versioned key)
    ui/
      App.tsx                   ← tabs: Today · Measure · CMO note · Evidence (· Body P1)
      components/ SimulatedBanner, StatusBadge, ConfidenceTag, MetricCard, WhyCard, EvidenceCard,
                  ThreeLensChart, LensCounts, DayScrubber, CheckInForm, BodyMap (P1)
      screens/   TodayScreen, MeasureScreen, CmoNoteScreen, EvidenceScreen, BodyScreen (P1)
      styles.css
```

## 4. Core types (summary; the full version is in Prompt 01)

- `MetricId = 'coreTemp' | 'restingHR' | 'sleepHours' | 'mood'` (+ `'systolicBP'` in P1)
- `missionDay`: integer. `-30…-1` is pre-flight (L-n), `0` is launch (no readings), `1…110` is in-flight (FD n).
- `Reading { metricId, missionDay, value, source: 'SIMULATED' | 'USER_ENTERED' }`
- `SelfReport { missionDay, mood?: 1–5, symptoms: SymptomId[], note?: string, source }`
- `MissionInput { astronaut: { id, displayName, isSimulated: true }, readings, selfReports, currentDay }`
- `Status = 'OK' | 'WATCH' | 'ACT' | 'UNKNOWN'`; `Confidence = 'HIGH' | 'MEDIUM' | 'LOW'`
- `LayerResult { layer: 'DATA_QUALITY' | 'PERSONAL_DEVIATION' | 'PERSISTENCE' | 'EXPECTED_ADAPTATION' | 'EARTH_REFERENCE', outcome: 'PASS' | 'FLAG' | 'NOT_APPLICABLE' | 'FAIL', detail, evidenceIds[] }`
- `MetricAssessment { metricId, missionDay, status, confidence, value, preflight: { mean, sd, n }, expected: { offset, value, uncertainty, modelId | null }, zPreflight, zExpected, persistence: { flaggedOfLastAvailable, windowDays }, earthCrossed, layers[], headline, nextStep, reasons[] }`
- `DayAssessment { missionDay, overall: Status, metrics: MetricAssessment[], unknownCount, selfReport?, cmoSuggested: boolean }`
- `LensComparison { metricId, daysEvaluated, flagged: { earth: number | null, preflightOnly, baseline }, perDay: { missionDay, value, earthFlag, preflightFlag, baselineStatus, expectedValue, expectedLow, expectedHigh, preflightLow, preflightHigh }[] }`

## 5. Modules

| Module | Responsibility | Inputs | Outputs | Depends on | Tests | Error handling |
|---|---|---|---|---|---|---|
| `domain/types` | Shared types | — | types | — | tsc only | — |
| `domain/metrics` | Measure metadata | — | `METRICS` | types | Every metric has all fields; sdFloor > 0 | — |
| `domain/validation` | Reject bad input | raw object | `{ ok, errors[] }` | metrics | Out-of-range, NaN, wrong day, wrong type | Never throws; returns errors |
| `evidence/sources` | Citations | — | `EVIDENCE` | — | Every id used anywhere exists | — |
| `evidence/adaptation` | Expected offset per day | metricId, day | `{ offset, uncertainty, modelId } \| null` | sources | Stahn curve values at FD0/37.5/75/100; null for HR/sleep/mood; 0 pre-flight | Unknown metric → null |
| `evidence/references` | Earth lines | metricId | reference \| null | sources | Line values and direction | — |
| `engine/config` | All thresholds | — | constants | — | Snapshot | — |
| `engine/baseline` | Pre-flight mean/SD (sample SD, floored) | readings, metricId | `{ mean, sd, n }` | metrics, config | Known numbers; floor; n < MIN | n = 0 → `{ n: 0 }`, no NaN |
| `engine/quality` | Is today assessable? | readings, metric, day, baseline | `{ ok, reasons[] }` | validation, config | Missing, implausible, small baseline | — |
| `engine/trend` | Persistence over the last available days | per-day z list | count | config | Gaps skipped; lookback cap | Empty → 0 |
| `engine/assess` | 5 layers → status/confidence/why | MissionInput, metricId, day | `MetricAssessment` / `DayAssessment` | all of the above | Every status path; demo days | Never throws; returns UNKNOWN with a reason |
| `engine/lenses` | Three-lens counts and series | MissionInput, metricId, upToDay | `LensComparison` | assess, baseline, references | Demo invariants | — |
| `engine/handoff` | SBAR text | DayAssessment, MissionInput | string | metrics, sources | Contains S/B/A/R; no banned words; mentions SIMULATED | — |
| `data/simulated` | Deterministic mission | seed | MissionInput | rng, types | Same seed → identical; invariants | — |
| `state` | App state + localStorage | user actions | context | engine, data | 1 integration test | Corrupt storage → ignore + reset key |
| `ui` | Render | context | DOM | engine **public API only** | RTL smoke tests | Error boundary shows "Something failed — data unchanged" |

## 6. Assessment sequence (exact; Prompt 04 implements this)

For each `metricId` and `day`:

1. **DATA_QUALITY**
   - The baseline needs at least `MIN_BASELINE_DAYS` (7) valid pre-flight readings; otherwise FAIL.
   - Today must have a valid reading; otherwise FAIL ("No reading for this day").
   - The value must be within the plausible range; otherwise FAIL.
   - **On FAIL, the status is UNKNOWN** and later layers are NOT_APPLICABLE.
2. **PERSONAL_DEVIATION.** `zPreflight = (v − mean) / sd`. FLAG if it is ≥ `WATCH_Z` in the unhealthy direction.
3. **EXPECTED_ADAPTATION**
   - If the day is in-flight and a model exists: `expected = mean + offset`, `combinedSd = sqrt(sd² + uncertainty²)`, `zExpected = (v − expected) / combinedSd`.
   - Otherwise: `zExpected = zPreflight`, and the layer is NOT_APPLICABLE with the text "No research-based adaptation model for this measure; compared with pre-flight normal."
4. **PERSISTENCE.** Take the last `PERSIST_WINDOW` (3) *available* days, including today, looking back at most `MAX_LOOKBACK_DAYS` (5) calendar days. Count the days where `zExpected` is ≥ `WATCH_Z` in the unhealthy direction.
5. **EARTH_REFERENCE.** Crossed today? Count crossings over the same window.

**Status**

| Status | Condition |
|---|---|
| ACT | (`zExpected(today) ≥ ACT_Z` **and** persistence count ≥ 2) **or** Earth crossings ≥ 2 in the window |
| WATCH | Today `zExpected ≥ WATCH_Z`, **or** Earth crossed today, **or** any previous day in the window was ACT ("cool-down") |
| OK | Otherwise |

**Confidence.** Start at HIGH and step down one level (never below LOW) for each of these:

- baseline n < 14
- the model used has `evidenceStrength: 'LOW'`
- a missing day inside the window

**Overall day status:** the worst of ACT > WATCH > OK among known metrics. UNKNOWN only if *all* metrics are UNKNOWN. `cmoSuggested` = any ACT, or (any WATCH and symptoms reported).

**Next step text** (fixed, non-medical):

| Status | Text |
|---|---|
| UNKNOWN | "Take or re-take this reading." |
| OK | "No action needed." |
| WATCH | "Re-check within 24 h. Note how you feel." |
| ACT | "Contact your crew medical officer. BASELINE has drafted a note." |

## 7. Parallel work

- **Person A (engine):** Prompts 01 → 02 → 03 → 04 in one Claude Code session. They are sequential.
- **Person B (after Prompt 01 is committed):** writes the explainer text in `domain/metrics.ts` (content only), drafts the body-map SVG in a separate file (`ui/components/BodyMap.tsx`, P1), and drafts the README, slides and video script. B must not touch `engine/` or `evidence/`.
- Prompts 05 → 06 → 07 must wait for 04. Prompt 08 (body map) can run while Person A reviews 07. Prompt 09 runs after 07. Prompt 10 runs last.
- Use one git branch per person. Merge B's files once Prompt 05 is done. The files don't overlap, so conflicts are unlikely.
