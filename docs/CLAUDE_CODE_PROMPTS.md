# BASELINE — Claude Code Prompt Pack

**How to use:**

1. Open Claude Code in `~/Desktop/projects/baseline`.
2. Paste **one prompt at a time**, in order.
3. Read the report at the end of each prompt before you paste the next one.
4. If a report says tests fail, reply "Fix the failing tests before continuing" and wait.

**Execution order:**

```
00 → 01 → 02 → 03 → 04 → [Checkpoint 1] → 05 → 06 → 07 → [Checkpoint 2 / freeze] → 08 (P1, optional) → 09 → 10
```

**Parallel work:** after 01 is committed, Person B may run Prompt 08 on a separate branch. Everything else is sequential.

Every prompt contains the same **STANDING RULES** block on purpose, so each one can be pasted on its own.

---

## PROMPT 00 — Project inspection and scaffold

```
You are working in ~/Desktop/projects/baseline for NASA Space Apps 2026 ("Create Health Monitoring Software for Astronauts on Space Missions"). Project: BASELINE — "Your normal, not Earth's normal."

STANDING RULES
- Read docs/FINAL_ARCHITECTURE.md, docs/REVISED_PRODUCT_SPEC.md and docs/BUILD_ROADMAP_7_HOURS.md before doing anything. They are the source of truth.
- Inspect existing files before editing. Do not rewrite or delete unrelated files. Never touch docs/*.md except where a prompt says so.
- Keep `npm run dev`, `npm test -- --run` and `npm run build` working at the end of every prompt.
- Run the tests listed. Fix failures before declaring completion. Never claim a feature works unless you ran it.
- Allowed dependencies only: react, react-dom, recharts; dev: vite, @vitejs/plugin-react, typescript, vitest, jsdom, @testing-library/react, @testing-library/jest-dom, @types/react, @types/react-dom. Anything else: stop and ask.
- No user-facing string may diagnose, name a disease, or mention medication, dosing or treatment.
- End with the REPORT in the exact format requested.

OBJECTIVE
Confirm the folder state and scaffold an empty, runnable Vite + React + TypeScript + Vitest app matching the file structure in docs/FINAL_ARCHITECTURE.md §3.

CONTEXT
A previous inspection found no BASELINE code on this machine; the docs/ folder holds only planning documents. If you find ANY existing source code (src/, package.json, etc.), STOP and report what you found instead of scaffolding.

FILES TO INSPECT
- Everything in the project root (`ls -la`, `find . -maxdepth 3 -not -path './node_modules*'`)
- docs/*.md

FILES TO CREATE
- package.json (name "baseline", private, type module; scripts: dev, build, preview, test = "vitest", typecheck = "tsc --noEmit")
- vite.config.ts (React plugin; `base: './'` so it works on GitHub Pages or Vercel; test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.ts' })
- tsconfig.json (strict: true, noUncheckedIndexedAccess: true, jsx react-jsx, moduleResolution bundler, types ["vitest/globals"])
- index.html (title "BASELINE — Your normal, not Earth's normal")
- src/main.tsx, src/ui/App.tsx (placeholder heading "BASELINE" + text "SIMULATED DATA — prototype, not a medical device")
- src/ui/styles.css (minimal; system font; dark-on-light; readable sizes)
- src/test-setup.ts (import '@testing-library/jest-dom')
- Empty folders with a .gitkeep, as in FINAL_ARCHITECTURE §3: src/domain, src/evidence, src/engine/__tests__, src/data/simulated/__tests__, src/state, src/ui/components, src/ui/screens
- src/ui/__tests__/App.test.tsx: renders App and finds the text "SIMULATED DATA"
- .gitignore (node_modules, dist, .DS_Store)
- git init + first commit "chore: scaffold BASELINE" (if git is not already initialised)

REQUIREMENTS
- Install with npm. Pin nothing unusual; use current stable versions.
- No routing library. Tabs will be simple React state.

MODULE BOUNDARIES
- No business logic in this prompt.

DEPENDENCIES
- None (first prompt).

ERROR HANDLING
- If npm install fails because of the network, report the exact error. Do not switch package managers silently.

ACCEPTANCE CRITERIA
- `npm test -- --run` passes (1 test).
- `npm run build` succeeds.
- `npm run typecheck` passes.
- `npm run dev` serves a page showing "BASELINE" and "SIMULATED DATA".

TESTS TO RUN
npm test -- --run ; npm run typecheck ; npm run build

DEFINITION OF DONE
Scaffold committed; all three commands pass; folder tree matches FINAL_ARCHITECTURE §3 (empty folders allowed).

MUST NOT CHANGE
docs/*.md

REPORT (exact format)
## Prompt 00 report
- Existing code found: yes/no (details)
- Files created: (list)
- Commands run and results: (paste the pass/fail summary lines)
- Remaining issues: (list or "none")
```

---

## PROMPT 01 — Core data models, validation and simulated mission

```
STANDING RULES
- Read docs/FINAL_ARCHITECTURE.md, docs/REVISED_PRODUCT_SPEC.md and docs/DEMO_SCRIPT.md first. They are the source of truth.
- Inspect existing files before editing. Do not rewrite unrelated files.
- Keep `npm run dev`, `npm test -- --run`, `npm run build` working.
- Run the listed tests; fix failures before declaring completion; never claim untested behaviour.
- No new dependencies.
- No user-facing string may diagnose, name a disease, or mention medication/dosing/treatment.
- End with the REPORT.

OBJECTIVE
Create the shared types, the metric registry, input validation, and a deterministic simulated mission for one fictional astronaut.

CONTEXT
Prompt 00 scaffolded the app. Nothing else exists. Every later module depends on these types, so get them exactly right.

FILES TO INSPECT
src/ (whole tree), docs/FINAL_ARCHITECTURE.md §4, docs/DEMO_SCRIPT.md §2

FILES TO CREATE
- src/domain/types.ts
- src/domain/metrics.ts
- src/domain/validation.ts
- src/data/simulated/rng.ts
- src/data/simulated/mission.ts
- src/domain/__tests__/validation.test.ts
- src/data/simulated/__tests__/mission.test.ts

REQUIREMENTS

1) src/domain/types.ts — types only, no logic:
   export type MetricId = 'coreTemp' | 'restingHR' | 'sleepHours' | 'mood';
     (Do NOT add systolicBP yet; Prompt 02 may add it as P1.)
   export type Direction = 'up' | 'down' | 'both';      // which direction is "unhealthy"
   export type DataSource = 'SIMULATED' | 'USER_ENTERED';
   export type Phase = 'PREFLIGHT' | 'LAUNCH' | 'INFLIGHT';
   export type SymptomId = 'fatigue' | 'headache' | 'feeling_hot' | 'chills' | 'nausea' | 'congestion' | 'poor_sleep' | 'other';
   export interface Reading { metricId: MetricId; missionDay: number; value: number; source: DataSource; }
   export interface SelfReport { missionDay: number; symptoms: SymptomId[]; note?: string; source: DataSource; }
   export interface Astronaut { id: string; displayName: string; isSimulated: true; }
   export interface MissionInput { astronaut: Astronaut; readings: Reading[]; selfReports: SelfReport[]; currentDay: number; }
   export type Status = 'OK' | 'WATCH' | 'ACT' | 'UNKNOWN';
   export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
   export type LayerName = 'DATA_QUALITY' | 'PERSONAL_DEVIATION' | 'EXPECTED_ADAPTATION' | 'PERSISTENCE' | 'EARTH_REFERENCE';
   export type LayerOutcome = 'PASS' | 'FLAG' | 'NOT_APPLICABLE' | 'FAIL';
   export interface LayerResult { layer: LayerName; outcome: LayerOutcome; detail: string; evidenceIds: string[]; }
   export interface PreflightBaseline { mean: number; sd: number; n: number; }
   export interface ExpectedValue { offset: number; value: number; uncertainty: number; modelId: string | null; }
   export interface MetricAssessment {
     metricId: MetricId; missionDay: number; status: Status; confidence: Confidence; value: number | null;
     preflight: PreflightBaseline; expected: ExpectedValue | null;
     zPreflight: number | null; zExpected: number | null;
     persistence: { flaggedOfLastAvailable: number; availableInWindow: number; missingInWindow: number };
     earthCrossed: boolean; layers: LayerResult[]; headline: string; nextStep: string; reasons: string[];
   }
   export interface DayAssessment { missionDay: number; phase: Phase; overall: Status; metrics: MetricAssessment[]; unknownCount: number; selfReport: SelfReport | null; cmoSuggested: boolean; }
   export interface LensDay { missionDay: number; value: number | null; earthFlag: boolean | null; preflightFlag: boolean | null; baselineStatus: Status;
     preflightLow: number; preflightHigh: number; expectedLow: number | null; expectedHigh: number | null; expectedValue: number | null; }
   export interface LensComparison { metricId: MetricId; daysEvaluated: number; flagged: { earth: number | null; preflightOnly: number; baseline: number }; perDay: LensDay[]; }
   Also export: function phaseOf(day: number): Phase  — put this ONE tiny helper in src/domain/phase.ts, not in types.ts.
     day < 0 → PREFLIGHT, day === 0 → LAUNCH, day > 0 → INFLIGHT.
   Also export formatDay(day): "L-30" for -30, "Launch" for 0, "FD97" for 97 (same file).

2) src/domain/metrics.ts — export const METRICS: Record<MetricId, MetricDefinition> with:
   interface MetricDefinition { id; label; unit; decimals; plausibleMin; plausibleMax; sdFloor; unhealthyDirection: Direction; bodySystem: 'whole-body' | 'heart' | 'brain'; isSelfReport: boolean;
     explainer: { measuredInSpace: string; whyItMatters: string; howSpaceAffects: string; whenToContactCmo: string; prevention: string } }
   Values:
   - coreTemp: label "Core temperature estimate", unit "°C", decimals 2, plausible 34.0–42.0, sdFloor 0.1, direction 'up', bodySystem 'whole-body', isSelfReport false.
     The explainer MUST state: it is a SIMULATED heat-flux forehead sensor estimate (the type used by Stahn et al. 2017), not an oral thermometer.
   - restingHR: "Resting heart rate", "bpm", 0, 30–200, sdFloor 2, 'up', 'heart', false.
   - sleepHours: "Sleep", "h", 1, 0–16, sdFloor 0.3, 'down', 'brain', false.
   - mood: "Mood (self-rated 1–5)", "/5", 0, 1–5, sdFloor 0.5, 'down', 'brain', true.
   Explainer text: 1–2 plain sentences per field, non-medical. whenToContactCmo must say "when BASELINE shows ACT, or whenever you feel unwell — you never need the app's permission to contact your CMO." Put "TODO-CONTENT" nowhere; write real text.

3) src/domain/validation.ts
   export function validateReading(r: unknown): { ok: true; value: Reading } | { ok: false; errors: string[] }
   - metricId must be a known MetricId.
   - value must be a finite number within the plausible range.
   - missionDay must be an integer in [-60, 400] and must not be 0 (no readings on launch day).
   - mood must be an integer.
   - source must be a DataSource.
   export function validateSelfReport(s: unknown): same pattern (symptoms must all be known SymptomIds; note ≤ 500 chars).
   Never throw.

4) src/data/simulated/rng.ts — mulberry32(seed): () => number in [0,1). Add gaussian(rng): number (Box–Muller) and clampedGaussian(rng, sd, clamp): number.

5) src/data/simulated/mission.ts — export function generateDemoMission(seed = 2026): MissionInput
   - astronaut: { id: 'SIM-01', displayName: 'Cmdr. Asha Rao (SIMULATED)', isSimulated: true }
   - Days: pre-flight -30…-1; in-flight 1…110; no day 0. currentDay = 99.
   - Normal-day generation. The noise is clamped so the demo is deterministic. All source: 'SIMULATED'.
     coreTemp: pre-flight 36.75 + clampedGaussian(sd 0.10, clamp 0.15). In-flight: 36.75 + 1.0*min(day/75, 1) + clampedGaussian(0.10, 0.15).
       NOTE: this in-flight shape mirrors the Stahn 2017 group-mean result. Comment it as "simulation choice, mirrors the cited curve".
     restingHR: 58 + clampedGaussian(2.5, 3.0), all days (no in-flight shift).
     sleepHours: pre-flight 6.6 + clampedGaussian(0.3, 0.35); in-flight 6.55 + clampedGaussian(0.3, 0.35). Round to 1 decimal.
     mood: 4 or 5 only on normal days (4 with probability 0.75 using the rng).
   - Planted episode, FD96–FD100. Values are EXACT (no noise) and are computed as the normal expected value + residual:
       coreTemp residual: 96:+0.45, 97:+0.65, 98: NO READING (sensor not worn), 99:+0.60, 100:+0.30, where the expected value = 36.75 + 1.0 (plateau)
       restingHR: 96: 64, 97: 71, 98: 72, 99: 70, 100: 64
       sleepHours: 96: 5.8, 97: 5.2, 98: 5.1, 99: 5.4, 100: 6.0
       mood: 96: 3, 97: 2, 98: 2, 99: 3, 100: 4
   - selfReports: an empty-symptoms report every in-flight day, except FD97, FD98 and FD99: symptoms ['fatigue', 'feeling_hot'], note 'SIMULATED self-report'.
   - Every generated reading must pass validateReading.
   - Export const DEMO_EVENT_DAYS = [96, 97, 98, 99, 100] and DEMO_GAP = { metricId: 'coreTemp', missionDay: 98 }.

MODULE BOUNDARIES
- domain/ has no imports from engine/, evidence/, data/ or ui/.
- data/simulated imports only domain/.
- No thresholds or statistics here.

DEPENDENCIES
Prompt 00.

ERROR HANDLING
Validation returns errors. The generator throws only if its own output fails validation; that is a programming error, and the message must name the reading.

ACCEPTANCE CRITERIA / TESTS (write them)
validation.test.ts:
- accepts a valid reading for each metric
- rejects: unknown metric, NaN, Infinity, out-of-range value, day 0, non-integer day, non-integer mood, bad source, bad symptom, note > 500 chars
mission.test.ts:
- same seed → deep-equal output; a different seed → different normal-day values, but identical planted-episode values
- a reading exists for every metric for days -30…-1 and 1…110, EXCEPT coreTemp FD98 (exactly one gap)
- no reading on day 0
- every reading passes validateReading
- FD97 coreTemp === 38.40 (toBeCloseTo, 2); FD97 restingHR === 71
- in-flight normal coreTemp days stay within ±0.15 of 36.75 + min(day/75, 1)
- self-reports on FD97–99 contain 'fatigue'

TESTS TO RUN
npm test -- --run ; npm run typecheck

DEFINITION OF DONE
All tests pass; typecheck passes; committed as "feat: domain types, validation, simulated mission".

MUST NOT CHANGE
docs/*.md, vite/tsconfig settings (unless a type error requires it — report why).

REPORT
## Prompt 01 report
- Files created/changed:
- Tests: X passed / Y failed (paste summary)
- Any deviation from the spec and why:
- Remaining issues:
```

---

## PROMPT 02 — Scientific evidence and adaptation layer

```
STANDING RULES
- Read docs/REVISED_PRODUCT_SPEC.md §6 (scientific validation table) and docs/RESEARCH_AND_COMPETITOR_ANALYSIS.md §6 first.
- Inspect existing files before editing. Do not rewrite unrelated files.
- Keep dev/test/build working. Run tests; fix failures; never claim untested behaviour.
- No new dependencies.
- No diagnosis, disease names, medication, dosing or treatment in any string.
- Do NOT invent any number, study, sample size or URL. Use ONLY the values given below. If something seems missing, write "not stated" — never fill it in from memory.
- End with the REPORT.

OBJECTIVE
Create the evidence registry, the expected-adaptation models and the Earth reference lines. This is the ONLY place in the codebase where research numbers live.

CONTEXT
BASELINE's differentiator: "expected in-flight normal = pre-flight normal + a cited adaptation offset". Only measures with published evidence get a model. Everything else falls back to the pre-flight normal and says so.

FILES TO INSPECT
src/domain/*, docs/REVISED_PRODUCT_SPEC.md §6

FILES TO CREATE
- src/evidence/sources.ts
- src/evidence/adaptation.ts
- src/evidence/references.ts
- src/evidence/__tests__/evidence.test.ts

REQUIREMENTS

1) sources.ts
   export type EvidenceKind = 'RESEARCH' | 'CLINICAL_REFERENCE' | 'DESIGN_ASSUMPTION';
   export interface EvidenceSource { id; kind; shortCite; title; venue; year: number | null; url: string | null; population: string; finding: string; limitations: string; }
   export const EVIDENCE: Record<string, EvidenceSource> with exactly these ids:
   - 'stahn2017' RESEARCH. "Stahn et al. 2017". "Increased core body temperature in astronauts during long-duration space missions". Scientific Reports 7:16180. 2017. https://pmc.ncbi.nlm.nih.gov/articles/PMC5701078
     population: "11 ISS astronauts (7 men, 4 women), ~6-month missions"
     finding: "Resting core body temperature rose about 1 °C above pre-flight, developing gradually and plateauing after about 75 days in flight."
     limitations: "Small sample; group-mean result; measured with a forehead heat-flux 'Double Sensor', not an oral thermometer; sparse in-flight time points (FD15/45/75/105/135/165); one pre-flight session (L-90)."
   - 'norsk2015' RESEARCH. "Norsk et al. 2015". "Fluid shifts, vasodilatation and ambulatory blood pressure reduction during long duration spaceflight". J Physiol 593:573–584. 2015. https://pmc.ncbi.nlm.nih.gov/articles/4324706/
     population: "8 middle-aged male ISS astronauts"; finding: "24-hour ambulatory brachial blood pressure was 8–10 mmHg lower at 3–6 months in flight."
     limitations: "Small, men only; 24-h ambulatory average, not single cuff readings; the time course before 3 months was not measured."
   - 'barger2014' RESEARCH. "Barger et al. 2014". "Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight". Lancet Neurology 13:904–912. 2014. url null.
     population: "85 astronauts (shuttle and ISS); actigraphy and sleep logs"; finding: "Average sleep was about 6 h on ISS missions despite 8.5 h scheduled; sleep was also short (<6.5 h) during pre-flight training."
     limitations: "Population averages; gives context, not an individual's expected change."
   - 'cdcFever' CLINICAL_REFERENCE. "CDC fever definition". "Definition of signs and symptoms of ill travelers". US CDC. year null, url null. population "General population"; finding "A measured temperature of at least 38.0 °C is considered a fever." limitations "Typically an oral measurement; a different body site and device from BASELINE's simulated sensor. Context only."
   - 'ahaHeartRate' CLINICAL_REFERENCE. "AHA resting heart rate". American Heart Association. url null. finding "60–100 bpm is a normal resting heart rate for most adults; above 100 bpm at rest is considered fast." limitations "Population range; says nothing about change from a person's own normal."
   - 'prototypeRules' DESIGN_ASSUMPTION. "BASELINE prototype rules". population "n/a"; finding "Statistical thresholds (WATCH at 2.0, ACT at 2.5 with persistence), the data-quality rules and the SD floors were chosen by the BASELINE team for this prototype." limitations "Not clinically validated. Tested only on simulated data."
   (A display string like "fever definition" is allowed ONLY inside EVIDENCE titles and findings, never in assessment output.)

2) adaptation.ts
   export interface AdaptationModel { id: string; metricId: MetricId; sourceIds: string[]; evidenceStrength: 'MODERATE' | 'LOW'; summary: string; designAssumptions: string[]; offset(day: number): number; uncertainty: number; }
   export const ADAPTATION_MODELS: AdaptationModel[] = [
     { id: 'coreTemp-stahn2017', metricId: 'coreTemp', sourceIds: ['stahn2017', 'prototypeRules'], evidenceStrength: 'MODERATE',
       summary: 'Expected rise of about +1.0 °C reached by flight day 75, then flat (group mean of 11 ISS crew).',
       designAssumptions: ['Linear ramp from FD0 to FD75 between the measured time points', 'Extra ±0.15 °C uncertainty for individual differences', 'Applies only to heat-flux core-temperature estimates'],
       offset: (d) => d <= 0 ? 0 : 1.0 * Math.min(d / 75, 1), uncertainty: 0.15 } ];
   export function getAdaptationModel(metricId): AdaptationModel | null
   export function expectedOffset(metricId, day): { offset; uncertainty; modelId } | null   — null if there is no model OR day <= 0.
   P1 (only if docs/BUILD_ROADMAP says time allows; otherwise SKIP and say so in the report): add 'systolicBP' to MetricId and METRICS (label "Systolic blood pressure", "mmHg", 0, 60–260, sdFloor 4, direction 'both', 'heart'), plus model 'systolicBP-norsk2015': evidenceStrength 'LOW', offset d<=0 ? 0 : -9*Math.min(d/90, 1), uncertainty 6, with designAssumptions ['Onset shape not measured; linear ramp to FD90 assumed', 'Study used 24-h ambulatory averages, not single readings', 'Men only (n = 8)']. If you add it, also extend the simulated mission with matching normal-day BP (pre 118 ± 4, in-flight following the offset) and no planted event.

3) references.ts
   export interface EarthReference { metricId; value: number; direction: 'above' | 'below'; inclusive: boolean; label: string; sourceId: string; caveat: string; }
   export const EARTH_REFERENCES: EarthReference[] = [
     { metricId: 'coreTemp', value: 38.0, direction: 'above', inclusive: true, label: 'General Earth reference (38.0 °C)', sourceId: 'cdcFever', caveat: 'Measured at a different body site with a different device. Context only.' },
     { metricId: 'restingHR', value: 100, direction: 'above', inclusive: false, label: 'General Earth reference (100 bpm)', sourceId: 'ahaHeartRate', caveat: 'Population range. Context only.' } ]
   (BP P1: value 180, above, false, label 'General Earth reference (180 mmHg systolic)', sourceId — add 'accaha2017bp' CLINICAL_REFERENCE: "ACC/AHA 2017 BP guideline", J Am Coll Cardiol 2017, url https://www.acc.org/%7E/media/Non-Clinical/Files-PDFs-Excel-MS-Word-etc/Guidelines/2017/Guidelines_Made_Simple_2017_HBP.pdf, finding "Systolic above 180 and/or diastolic above 120 mmHg is classed as a hypertensive crisis.")
   export function getEarthReference(metricId): EarthReference | null
   export function crossesEarthReference(ref, value): boolean

MODULE BOUNDARIES
- evidence/ imports only domain/.
- No statistics (z-scores etc.) here. The engine does those.

DEPENDENCIES
Prompt 01.

ERROR HANDLING
Unknown metric → null. Never throw.

ACCEPTANCE CRITERIA / TESTS (evidence.test.ts)
- every sourceId referenced by ADAPTATION_MODELS and EARTH_REFERENCES exists in EVIDENCE
- every EVIDENCE entry has non-empty population, finding and limitations
- coreTemp offset: day -5 → null from expectedOffset; day 0 → null; day 37.5 → 0.5; day 75 → 1.0; day 100 → 1.0
- restingHR, sleepHours, mood → expectedOffset null
- crossesEarthReference: coreTemp 38.0 → true (inclusive), 37.99 → false; restingHR 100 → false, 101 → true
- sleepHours and mood → getEarthReference null

TESTS TO RUN
npm test -- --run ; npm run typecheck

DEFINITION OF DONE
Tests pass; committed "feat: evidence registry, adaptation models, Earth references".

MUST NOT CHANGE
src/domain/types.ts beyond adding 'systolicBP' (P1 only); the simulated planted episode.

REPORT
## Prompt 02 report
- Files created/changed:
- P1 BP model: added / skipped (why)
- Tests: (summary)
- Any value you were unsure about (should be none):
- Remaining issues:
```

---

## PROMPT 03 — Baseline, data quality and persistence

```
STANDING RULES
- Read docs/FINAL_ARCHITECTURE.md §5–6 first.
- Inspect existing files before editing. Do not rewrite unrelated files.
- Keep dev/test/build working. Run tests; fix failures; never claim untested behaviour.
- No new dependencies. No diagnosis/medication text.
- End with the REPORT.

OBJECTIVE
Implement the pure statistical building blocks: config, reading lookup, pre-flight baseline, data-quality check, and persistence counting.

CONTEXT
Prompts 01–02 are done. The assessment engine (Prompt 04) will combine these. Each function must be small, pure and independently tested.

FILES TO INSPECT
src/domain/*, src/evidence/*, docs/FINAL_ARCHITECTURE.md §6

FILES TO CREATE
- src/engine/config.ts
- src/engine/readings.ts
- src/engine/baseline.ts
- src/engine/quality.ts
- src/engine/trend.ts
- src/engine/__tests__/baseline.test.ts, quality.test.ts, trend.test.ts, readings.test.ts

REQUIREMENTS

1) config.ts — each constant gets a comment "// PROTOTYPE DESIGN ASSUMPTION — not clinically validated"
   WATCH_Z = 2.0; ACT_Z = 2.5; MIN_BASELINE_DAYS = 7; CONFIDENT_BASELINE_DAYS = 14;
   PERSIST_WINDOW = 3; PERSIST_REQUIRED = 2; MAX_LOOKBACK_DAYS = 5; EARTH_CROSSINGS_FOR_ACT = 2.
   Also export PROTOTYPE_RULES: { id; text }[] — plain-English descriptions of each rule, used by the Evidence page.

2) readings.ts
   getReading(readings, metricId, day): Reading | null
   - Only readings that pass validateReading count.
   - If several readings exist for the same metric and day: prefer source 'USER_ENTERED' over 'SIMULATED'; among equals, use the LAST one in the array.
   availableDays(readings, metricId, fromDay, toDay): number[] — days with a valid reading, ascending.

3) baseline.ts
   computePreflightBaseline(readings, metricId): PreflightBaseline
   - Uses one reading per pre-flight day (day < 0), via getReading.
   - mean = arithmetic mean; sd = sample SD (n-1); sd = max(sd, METRICS[id].sdFloor); if n < 2, sd = sdFloor.
   - n = 0 → { mean: NaN, sd: sdFloor, n: 0 }. The caller must check n. Document this in a comment.

4) quality.ts
   checkDataQuality({ baseline, reading, metricId }): { ok: boolean; reasons: string[] }
   - baseline.n < MIN_BASELINE_DAYS → "Only {n} pre-flight readings (need {MIN}) — personal normal not established."
   - reading null → "No reading for this day."
   - Value outside the plausible range can't happen after getReading, but check it anyway (defensive) → "Reading outside plausible range."
   - All reasons are collected, not just the first.

5) trend.ts
   unhealthyZ(z: number, direction: Direction): number   — up → z; down → -z; both → |z|
   windowDays(available: number[], day: number): { days: number[]; missing: number }
   - The window is the last PERSIST_WINDOW available days ≤ day, considering only days in [day − MAX_LOOKBACK_DAYS + 1, day] AND in the same phase as `day` (never mix pre-flight and in-flight).
   - missing = number of calendar days in [first window day … day] that have no reading (0 if the window is empty).
   persistenceCount(zByDay: Map<number, number>, days: number[], direction): number — count of days where unhealthyZ ≥ WATCH_Z.

MODULE BOUNDARIES
- engine/ may import domain/ and evidence/. Never ui/ or state/.
- Thresholds only from config.ts.

DEPENDENCIES
Prompts 01–02.

ERROR HANDLING
No throws. NaN never leaks out of trend functions (skip NaN entries).

TESTS (write them)
- baseline: known inputs [1, 2, 3] → mean 2, sd 1; SD floor applied; n < 2 → sdFloor; ignores in-flight readings; USER_ENTERED overrides SIMULATED on the same day; on the demo mission coreTemp n === 30 and the mean is within 0.05 of 36.75
- quality: missing → FAIL reason; small baseline → reason; both → 2 reasons
- trend: unhealthyZ for all directions; windowDays skips the gap (available [95, 96, 97, 99], day 99 → days [96, 97, 99], missing 1); never crosses into pre-flight (day 1 → only day 1); persistenceCount with a down metric
- readings: preference order; invalid readings ignored

TESTS TO RUN
npm test -- --run ; npm run typecheck

DEFINITION OF DONE
All tests pass; committed "feat: baseline, quality, persistence".

MUST NOT CHANGE
domain/, evidence/, data/ (except bug fixes you must report).

REPORT
## Prompt 03 report
- Files:
- Tests: (summary)
- Deviations:
- Remaining issues:
```

---

## PROMPT 04 — Assessment engine, lens comparison and CMO note

```
STANDING RULES
- Read docs/FINAL_ARCHITECTURE.md §6 (assessment sequence — implement EXACTLY) and docs/DEMO_SCRIPT.md §3 (expected outputs) first.
- Inspect existing files before editing. Do not rewrite unrelated files.
- Keep dev/test/build working. Run tests; fix failures; never claim untested behaviour.
- If a demo invariant fails, FIX THE ENGINE LOGIC OR REPORT IT. Never change thresholds in config.ts, the adaptation model or the planted episode just to make a test pass.
- No new dependencies. No diagnosis, disease names, medication, dosing or treatment in output strings.
- End with the REPORT.

OBJECTIVE
Implement the complete 5-layer assessment, the day roll-up, the three-lens comparison and the SBAR CMO-note builder, behind ONE public API that the UI and the tests both use.

CONTEXT
Prompts 01–03 built the types, evidence and statistics. This prompt is the heart of BASELINE.

FILES TO INSPECT
All of src/domain, src/evidence, src/engine, src/data

FILES TO CREATE
- src/engine/assess.ts
- src/engine/lenses.ts
- src/engine/handoff.ts
- src/engine/index.ts
- src/engine/__tests__/assess.test.ts, lenses.test.ts, handoff.test.ts, demo.test.ts

REQUIREMENTS

1) assess.ts
   assessMetric(input: MissionInput, metricId, day): MetricAssessment — follow FINAL_ARCHITECTURE §6 exactly:
   L1 DATA_QUALITY → if it fails: status UNKNOWN, confidence LOW, the other layers NOT_APPLICABLE; headline "{label}: not enough data — {first reason}"; nextStep "Take or re-take this reading."
   L2 PERSONAL_DEVIATION → zPreflight; outcome FLAG if unhealthyZ ≥ WATCH_Z; detail e.g. "+6.3 SD above your pre-flight normal (36.75 ± 0.10 °C, n = 30)."
   L3 EXPECTED_ADAPTATION → if a model exists and day > 0: expected = mean + offset; combinedSd = sqrt(sd² + uncertainty²); zExpected = (v − expected) / combinedSd; outcome PASS if unhealthyZ(zExpected) < WATCH_Z, else FLAG; evidenceIds = model.sourceIds; detail names the shortCite and says "group-mean curve; design assumptions apply".
       No model → zExpected = zPreflight; outcome NOT_APPLICABLE; detail "No research-based adaptation model for this measure; compared with your pre-flight normal."; evidenceIds ['prototypeRules'].
       Pre-flight day → NOT_APPLICABLE, "Pre-flight day."
   L4 PERSISTENCE → windowDays + persistenceCount over zExpected for each window day (compute zExpected for previous days with the same formula; write a small internal helper — do NOT call assessMetric recursively for the whole history, to avoid O(n²) blow-ups; one level of lookback for the cool-down rule is fine).
   L5 EARTH_REFERENCE → crossed today? Count crossings in the window; NOT_APPLICABLE if there is no reference; evidenceIds [ref.sourceId]; the detail includes the caveat.
   Status:
     ACT   if (unhealthyZ(zExpected) ≥ ACT_Z AND persistence ≥ PERSIST_REQUIRED) OR earthCrossings ≥ EARTH_CROSSINGS_FOR_ACT
     WATCH if unhealthyZ(zExpected) ≥ WATCH_Z OR earth crossed today OR any OTHER window day had status ACT (cool-down; reason "Recently ACT — keep checking.")
     OK    otherwise
   Confidence: start HIGH; −1 if baseline.n < CONFIDENT_BASELINE_DAYS; −1 if the model's evidenceStrength is 'LOW'; −1 if missingInWindow > 0; floor at LOW. (UNKNOWN is always LOW.)
   headline templates (fill with formatted numbers using METRICS decimals and units):
     OK + model + L2 FLAG → "{label}: above your pre-flight normal, but within the expected in-flight range for {formatDay(day)}."
     OK otherwise → "{label}: within your expected range."
     WATCH → "{label}: outside your expected range today ({value} vs expected {expected} ± {band} {unit})."   band = WATCH_Z × combinedSd (or × sd with no model)
     ACT → "{label}: outside your expected range on {k} of the last {n} available days."
     If Earth was crossed, append " Also past the general Earth reference."
   nextStep: OK "No action needed." | WATCH "Re-check within 24 h. Note how you feel." | ACT "Contact your crew medical officer. BASELINE has drafted a note."
   reasons: a short list of the layer details that drove the status.
   assessDay(input, day): DayAssessment — all METRICS keys; overall = worst known (ACT > WATCH > OK); UNKNOWN only if all are UNKNOWN; unknownCount; selfReport for that day (USER_ENTERED preferred); phase; cmoSuggested = any ACT OR (any WATCH AND selfReport has ≥ 1 symptom).

2) lenses.ts
   compareLenses(input, metricId, upToDay = input.currentDay): LensComparison
   - perDay for every day from the first pre-flight day to upToDay (skip day 0); value null where missing.
   - preflightLow/High = mean ∓ WATCH_Z × sd; expectedLow/High = expected ∓ WATCH_Z × combinedSd (null if no model or pre-flight).
   - preflightFlag = unhealthyZ(zPreflight) ≥ WATCH_Z; earthFlag = crossing (null if no reference); baselineStatus from assessMetric.
   - flagged counts are over IN-FLIGHT days with a reading only: earth (null if no reference), preflightOnly, baseline (WATCH or ACT). daysEvaluated = in-flight days with a reading.

3) handoff.ts
   buildCmoNote(day: DayAssessment, input: MissionInput): string. Plain text, exactly these sections:
     "SIMULATED DATA — BASELINE prototype, not a medical device. Drafted by the app; reviewed and edited by the astronaut before sending."
     "To: Crew Medical Officer   From: {displayName}   Day: {formatDay}"
     "S — Situation: BASELINE marked {comma list of 'Label (STATUS)' for WATCH/ACT metrics} on {day}." + symptoms sentence if any ("Self-reported: fatigue, feeling hot.") — map SymptomIds to plain words.
     "B — Background:" one line per flagged metric: pre-flight normal mean ± sd (n); expected value for today and the source shortCite + "(group-mean curve; design assumption)", or "no adaptation model; compared with pre-flight normal". Plus "Data gaps in the last {MAX_LOOKBACK_DAYS} days: {Label on FDxx, …}" or "none".
     "A — Assessment (app output, not a diagnosis):" one line per flagged metric: value, k of n available days outside the expected range, confidence.
     "R — Request: Please review these readings and advise me on next steps."
   If nothing is flagged: "S — Situation: Nothing flagged by BASELINE today." and keep the other sections short.

4) index.ts — the ONLY import surface for state/ and ui/:
   export { assessMetric, assessDay } from './assess'; export { compareLenses } from './lenses'; export { buildCmoNote } from './handoff';
   export { PROTOTYPE_RULES, WATCH_Z, ACT_Z } from './config'; export { EVIDENCE } from '../evidence/sources'; export { ADAPTATION_MODELS } from '../evidence/adaptation'; export { EARTH_REFERENCES } from '../evidence/references'; export { METRICS } from '../domain/metrics'; export * from '../domain/types'; export { formatDay, phaseOf } from '../domain/phase';

MODULE BOUNDARIES
- The engine is pure: no React, no localStorage, no Date.now(), no randomness.
- Tests import from '../index' (the public API), except unit tests of internal helpers.

DEPENDENCIES
Prompts 01–03.

ERROR HANDLING
assessMetric never throws: on unexpected input return UNKNOWN with reason "Could not assess this reading."

TESTS (write them)
assess.test.ts — small hand-built MissionInputs covering every path: UNKNOWN (missing), UNKNOWN (n < 7), OK (no model), OK-with-adaptation, WATCH (single day), ACT (persistence), ACT (Earth crossings ≥ 2), WATCH via cool-down, a confidence step-down for each cause, a 'down' metric (sleep), overall roll-up, unknownCount, and cmoSuggested both ways.
demo.test.ts — on generateDemoMission(2026), assert ALL of docs/DEMO_SCRIPT.md §3 invariants I3–I10 (copy them in as test names).
lenses.test.ts — counts only include in-flight days with data; restingHR earth count 0; sleep earth null; preflightOnly coreTemp ≥ 60 for upToDay 95.
handoff.test.ts — the FD99 note contains "SIMULATED", "S —", "B —", "A —", "R —", "Stahn et al. 2017", "Core temperature estimate on FD98"; and it does NOT contain (case-insensitive) any of: diagnos, disease, infection, fever, prescri, medicat, dose, dosing, treatment, mg.
Also: a test that scans every headline/nextStep/reason string produced for ALL days of the demo mission for the same banned words.

TESTS TO RUN
npm test -- --run ; npm run typecheck ; npm run build

DEFINITION OF DONE
All tests pass, including every demo invariant. Committed "feat: assessment engine, lenses, CMO note".

MUST NOT CHANGE
config.ts values, evidence values, the planted episode.

REPORT
## Prompt 04 report
- Files:
- Tests: (summary; list each demo invariant with PASS/FAIL)
- The computed lens counts for coreTemp and restingHR up to FD99 (paste numbers — these go in the pitch):
- Deviations:
- Remaining issues:
```

> **CHECKPOINT 1 (≈19:15):** do not continue until Prompt 04 reports all invariants PASS. Write down the lens counts from its report; you'll use them in the pitch.

---

## PROMPT 05 — Application state and integration

```
STANDING RULES
- Read docs/FINAL_ARCHITECTURE.md §2 and §5 first.
- Inspect existing files before editing. Do not rewrite unrelated files.
- Keep dev/test/build working. Run tests; fix failures; never claim untested behaviour.
- state/ and ui/ import engine code ONLY from 'src/engine/index.ts'. No thresholds, z-scores or rules outside engine/.
- No new dependencies. No diagnosis/medication text.
- End with the REPORT.

OBJECTIVE
Connect the engine to React with one context provider, local persistence of user-entered data, and memoised selectors.

FILES TO INSPECT
src/engine/index.ts, src/data/simulated/mission.ts, src/ui/App.tsx

FILES TO CREATE / MODIFY
- create src/state/persistence.ts
- create src/state/MissionContext.tsx
- create src/state/__tests__/MissionContext.test.tsx
- modify src/ui/App.tsx (wrap in the provider; keep the placeholder content)

REQUIREMENTS
persistence.ts
- KEY = 'baseline.v1.userEntries'; shape { version: 1, readings: Reading[], selfReports: SelfReport[] } holding ONLY USER_ENTERED items.
- load(): returns the empty shape on missing/corrupt JSON or a wrong version (and removes the bad key). Every read and write is wrapped in try/catch, because localStorage can throw.
- save(entries).
MissionContext.tsx
- State: base = generateDemoMission(2026) (memoised once); user = load(); selectedDay (default base.currentDay = 99); selectedMetric (default 'coreTemp'); activeTab ('today' | 'measure' | 'note' | 'evidence' | 'body').
- input = { ...base, readings: [...base.readings, ...user.readings], selfReports: [...base.selfReports, ...user.selfReports] }  (the engine already prefers USER_ENTERED).
- Actions: addReading(partial) → runs validateReading with source 'USER_ENTERED'; on success saves and returns { ok: true }, else { ok: false, errors }. addSelfReport (same pattern). setSelectedDay (clamp to [-30, currentDay], skip 0 → 1). setSelectedMetric. setActiveTab. resetUserData() (clears the key).
- Selectors (hooks): useMission(), useDayAssessment(day = selectedDay) → useMemo(assessDay), useLens(metricId) → useMemo(compareLenses(input, metricId, currentDay)), useCmoNote(day) → buildCmoNote(assessDay(...), input).
- Expose a `jumpTo(day, metricId, tab)` helper for the demo tour.

MODULE BOUNDARIES
No assessment logic here — it only calls the engine API.

DEPENDENCIES
Prompt 04.

ERROR HANDLING
Add a top-level ErrorBoundary in App.tsx that shows "Something went wrong displaying this screen. Your data is unchanged." with a Reload button.

TESTS
MissionContext.test.tsx (React Testing Library):
- the default selectedDay is 99 and useDayAssessment().overall === 'ACT'
- addReading({ metricId: 'coreTemp', missionDay: 98, value: 37.8 }) → FD98 coreTemp is no longer UNKNOWN, and localStorage contains it
- addReading with value 99 → { ok: false } with an error, and nothing saved
- corrupt localStorage JSON → loads empty without crashing
- resetUserData clears it

TESTS TO RUN
npm test -- --run ; npm run typecheck ; npm run build

DEFINITION OF DONE
Tests pass; app still renders; committed "feat: state and persistence".

MUST NOT CHANGE
engine/, evidence/, domain/, data/.

REPORT
## Prompt 05 report
- Files:
- Tests:
- Remaining issues:
```

---

## PROMPT 06 — Core UI and user journey

```
STANDING RULES
- Read docs/REVISED_PRODUCT_SPEC.md §2 and §4 and docs/DEMO_SCRIPT.md first.
- Inspect existing files before editing. Do not rewrite unrelated files.
- Keep dev/test/build working. Run tests; fix failures; never claim untested behaviour. Open the app in a browser (or use RTL) to verify each screen renders.
- UI components render engine output only. No thresholds, no z-score maths, no status decisions in ui/. Import from src/engine/index.ts and src/state/MissionContext.tsx only.
- No new dependencies. No diagnosis/medication text.
- End with the REPORT.

OBJECTIVE
Build the essential screens: Today (status + check-in), Evidence, and the shared components. The chart/scrubber/note come in Prompt 07.

FILES TO INSPECT
src/state/*, src/engine/index.ts, src/ui/*

FILES TO CREATE / MODIFY
- src/ui/components/SimulatedBanner.tsx, StatusBadge.tsx, ConfidenceTag.tsx, MetricCard.tsx, WhyCard.tsx, EvidenceChip.tsx, CheckInForm.tsx, Tabs.tsx
- src/ui/screens/TodayScreen.tsx, EvidenceScreen.tsx
- modify src/ui/App.tsx (header "BASELINE — Your normal, not Earth's normal", Tabs: Today · Measure · CMO note · Evidence; the Measure and CMO note tabs show "Coming in next step" for now)
- modify src/ui/styles.css
- src/ui/__tests__/TodayScreen.test.tsx

REQUIREMENTS
- SimulatedBanner: sticky top bar on every screen: "SIMULATED DATA · Fictional astronaut · Prototype, not a medical device".
- StatusBadge: text + icon + colour (never colour alone). OK ✓ green #1f7a3a; WATCH ! amber #a15c00; ACT ▲ red #b3261e; UNKNOWN ? grey #5f6368. White text, min contrast 4.5:1, readable at 16px.
- ConfidenceTag: "Confidence: High / Medium / Low", plus a tooltip (title attr) listing why it was lowered (derive from the reasons that the engine returned — do not recompute).
- TodayScreen:
  * Title "{formatDay(selectedDay)} · {displayName}". Previous/next day buttons (skip day 0).
  * Overall StatusBadge (large) + a one-line summary: "{n} measures need attention" / "All measures as expected" / "{u} measure(s) have no data".
  * If cmoSuggested: a callout "Consider contacting your crew medical officer — a draft note is ready", with a button → CMO note tab.
  * A grid of 4 MetricCards (order: coreTemp, restingHR, sleepHours, mood): label, value + unit (or "No reading"), StatusBadge, ConfidenceTag, headline, nextStep, a "Why?" toggle → WhyCard, and a "See chart" button → jumpTo(day, metric, 'measure').
  * The self-report symptoms for the day, if any (plain words).
  * CheckInForm (collapsed by default, button "Check in for {day}"): number inputs for coreTemp, restingHR, sleepHours (with units and step), mood as 5 buttons, symptom chips (multi-select), an optional note. On save, call addReading/addSelfReport for each filled field; show validation errors inline next to the field; show a success message. Clearly label: "Saved on this device only."
- WhyCard: an ordered list of the 5 layers. Each row: layer name in plain words (Data quality · Compared with your pre-flight normal · Expected space adaptation · Persistence · Earth reference), an outcome icon (PASS ✓ / FLAG ! / N/A – / FAIL ✕), the detail text, EvidenceChips. At the bottom: "Rules are prototype design choices, not medically validated."
- EvidenceChip: shows shortCite + a kind tag (Research / Clinical reference / Design assumption); click → Evidence tab scrolled to #evidence-{id}.
- EvidenceScreen: sections — (1) "Research and references": every EVIDENCE entry as a card with id anchor, kind tag, citation, population, finding, limitations, link if url. (2) "Expected-adaptation models": each ADAPTATION_MODEL with summary, evidence strength, design assumptions list. (3) "Prototype rules": PROTOTYPE_RULES. (4) "What BASELINE never does": diagnose, name conditions, suggest medicines or doses, replace your CMO, hide an Earth reference crossing.
- Responsive: works at 390px wide (phone) and 1280px. Use CSS grid/flex; no UI library.
- Accessibility: buttons are <button>; inputs have <label>; focus visible.

MODULE BOUNDARIES
Do not compute statuses. If you need a value the engine does not expose, STOP and report — do not compute it in the UI.

DEPENDENCIES
Prompt 05.

ERROR HANDLING
A day with no assessment data still renders cards with UNKNOWN. Form errors are shown, never thrown.

TESTS
TodayScreen.test.tsx: renders FD99 with the overall ACT badge text; shows 4 cards; the coreTemp card shows "Confidence: Medium"; clicking "Why?" shows "Expected space adaptation" and "Stahn et al. 2017"; the check-in with temperature 99 shows an error; navigating to FD98 shows "No reading" on the temperature card; the SIMULATED banner is present.

TESTS TO RUN
npm test -- --run ; npm run typecheck ; npm run build ; npm run dev (manually check 390px and 1280px)

DEFINITION OF DONE
All tests pass; the screens look clean on phone and laptop widths; committed "feat: Today, check-in, Why card, Evidence".

MUST NOT CHANGE
engine/, evidence/, domain/, data/, state/ (except adding a selector that only calls the engine API — report it).

REPORT
## Prompt 06 report
- Files:
- Tests:
- Screens manually checked (widths):
- Remaining issues:
```

---

## PROMPT 07 — Main demo feature: three-lens chart, day scrubber, CMO note, guided demo

```
STANDING RULES
- Read docs/DEMO_SCRIPT.md fully first — this prompt implements the demo.
- Inspect existing files before editing. Do not rewrite unrelated files.
- Keep dev/test/build working. Run tests; fix failures; never claim untested behaviour.
- The chart and counts come ONLY from useLens() (engine compareLenses). Hard-coding any number or status in UI is forbidden.
- Allowed new import: recharts (already allowed). No other dependency.
- No diagnosis/medication text.
- End with the REPORT.

OBJECTIVE
Build the memorable screen: one chart that shows Earth reference vs pre-flight normal vs expected in-flight normal for a measure across the mission, the lens counts, a day scrubber, the CMO note screen, and a 4-step guided demo.

FILES TO INSPECT
src/state/MissionContext.tsx, src/engine/index.ts, src/ui/**

FILES TO CREATE / MODIFY
- src/ui/components/ThreeLensChart.tsx, LensCounts.tsx, DayScrubber.tsx, DemoTour.tsx
- src/ui/screens/MeasureScreen.tsx, CmoNoteScreen.tsx
- modify src/ui/App.tsx (wire the tabs; add a "Guided demo" button in the header)
- src/ui/__tests__/MeasureScreen.test.tsx, CmoNoteScreen.test.tsx

REQUIREMENTS
MeasureScreen:
- A metric selector (4 segmented buttons). The title is the metric label + unit.
- ThreeLensChart (Recharts ComposedChart, responsive container, height 320):
  * x = missionDay from -30 to currentDay; tick labels via formatDay; a vertical ReferenceLine at x=0 labelled "Launch".
  * Grey band = pre-flight normal range (preflightLow–preflightHigh) — an Area with a range dataKey (d => [d.preflightLow, d.preflightHigh]) — legend "Your pre-flight normal".
  * Blue band = expected in-flight range (expectedLow–expectedHigh) where not null — legend "Expected in flight (research-informed)". If the metric has no model, show no blue band and add a note under the chart: "No research-based adaptation model for this measure — compared with your pre-flight normal."
  * Red dashed horizontal ReferenceLine at the Earth reference value, if any, labelled from EARTH_REFERENCES.label.
  * The readings line with dots coloured by baselineStatus (use the StatusBadge colours), gaps not connected (connectNulls false).
  * A vertical ReferenceLine at selectedDay.
  * Tooltip: day, value, BASELINE status, pre-flight z flag, Earth flag.
  * An accessible text alternative under the chart (a visually hidden <p>) summarising the lens counts.
- LensCounts: three tiles, using numbers from useLens(...).flagged:
  🌍 "Earth reference" → `{earth}` days flagged (or "No Earth reference for this measure")
  🧑‍🚀 "Pre-flight normal only" → `{preflightOnly}` days flagged
  🛰️ "BASELINE (expected in-flight)" → `{baseline}` days flagged
  with a subtitle "of {daysEvaluated} in-flight days with data, up to {formatDay(currentDay)}". Under it, one sentence: "Different lenses, different answers — BASELINE separates expected space adaptation from unexplained change."
- DayScrubber: a range input from -30 to currentDay (skip 0), plus quick buttons "FD60", "FD96", "FD97", "FD98", "FD99". Moving it updates selectedDay everywhere.
- Below the chart: the MetricCard + WhyCard for the selected day (reuse the Prompt 06 components).
CmoNoteScreen:
- Shows the day's overall status and a <textarea> prefilled with useCmoNote(selectedDay) (re-prefills when the day changes, unless the user has edited — then show a "Reset to draft" button).
- Buttons: "Copy note" (navigator.clipboard.writeText; fallback: select the text + document.execCommand('copy'); show "Copied"), "Download .txt" (Blob, filename baseline-cmo-note-{formatDay}.txt).
- Notice: "Draft generated by a prototype from SIMULATED data. Review before sending. BASELINE does not diagnose."
- If not cmoSuggested: show "Nothing needs reporting today", but still allow viewing the draft.
DemoTour (a header button opens a small side panel with Back/Next, 4 steps; each step calls jumpTo):
  1. FD60 · coreTemp · measure — caption from DEMO_SCRIPT step 2
  2. FD97 · restingHR · measure — caption from DEMO_SCRIPT step 3
  3. FD98 · coreTemp · today — caption from DEMO_SCRIPT step 4
  4. FD99 · — · note — caption from DEMO_SCRIPT step 5
  The captions are static explanatory text; any numbers in captions must be read from engine output at render time (e.g. counts), not typed in.

MODULE BOUNDARIES
No logic outside engine. The chart only maps LensDay fields to visuals.

DEPENDENCIES
Prompt 06.

ERROR HANDLING
If useLens returns an empty perDay, show "No data to chart". Clipboard failure → show "Copy failed — select the text and copy manually."

TESTS
MeasureScreen.test.tsx: renders the coreTemp lens tiles, with numbers equal to compareLenses(generateDemoMission(2026), 'coreTemp', 99).flagged (compute the expected values in the test via the engine API, not hard-coded); switching to restingHR shows the Earth count 0; the scrubber quick button FD60 sets the WhyCard to show "Expected space adaptation" with PASS.
(Recharts SVG may not render in jsdom — mock ResponsiveContainer with a fixed size, or assert on the LensCounts and the text alternative instead of SVG paths.)
CmoNoteScreen.test.tsx: FD99 textarea contains "S —" and "SIMULATED"; Download builds a Blob; editing shows "Reset to draft".

TESTS TO RUN
npm test -- --run ; npm run typecheck ; npm run build ; npm run dev and click through the 4 tour steps manually.

DEFINITION OF DONE
The demo tour works end to end in the browser; tests pass; committed "feat: three-lens chart, scrubber, CMO note, guided demo".

MUST NOT CHANGE
engine/, evidence/, domain/, data/.

REPORT
## Prompt 07 report
- Files:
- Tests:
- Manual tour check: step 1..4 PASS/FAIL with what was on screen
- Remaining issues:
```

> **CHECKPOINT 2 — FEATURE FREEZE (≈21:15).** If you're past 21:15, skip Prompt 08 and go to 09.

---

## PROMPT 08 (P1, optional) — Clickable body map + measure explainers

```
STANDING RULES
- Inspect existing files before editing. Do not rewrite unrelated files.
- Keep dev/test/build working. Run tests; fix failures; never claim untested behaviour.
- Render engine output only; no status logic in UI.
- No new dependencies. No diagnosis/medication text. No copyrighted/branded character art — draw a simple, generic, original figure.
- End with the REPORT.

OBJECTIVE
Satisfy the challenge brief's suggestion of a clickable human figure, cheaply: a 2D SVG figure whose regions show the worst status of their measures for the selected day, and open the measure explainer.

FILES TO INSPECT
src/domain/metrics.ts (bodySystem + explainer), src/ui/**

FILES TO CREATE / MODIFY
- src/ui/components/BodyMap.tsx, ExplainerCard.tsx
- src/ui/screens/BodyScreen.tsx
- modify App.tsx (add the "Body" tab)
- src/ui/__tests__/BodyScreen.test.tsx

REQUIREMENTS
- An original, simple SVG (viewBox 0 0 200 420): a head circle, neck, torso, arms and legs as rounded shapes. Three clickable regions: head = 'brain' (sleepHours, mood), chest = 'heart' (restingHR, + systolicBP if present), torso outline/whole figure = 'whole-body' (coreTemp).
- Region fill = the StatusBadge colour of the WORST status among the region's metrics in useDayAssessment(selectedDay).metrics (ordering ACT > WATCH > UNKNOWN > OK — the only ordering done in UI, purely for colour; document it). Also show a text label next to each region ("Heart: ACT").
- Each region is a focusable <g role="button" tabIndex={0} aria-label="Heart — status ACT — open details">; Enter/Space activates it.
- Clicking opens ExplainerCard(s) for the region's metrics: label, current value + StatusBadge, and the 5 explainer fields with headings: Can it be measured in space? · Why it matters · How space affects it · When to contact your CMO · Prevention / good habits.
- Under the figure: "Figure is a simplified, original illustration."

TESTS
BodyScreen.test.tsx: on FD99 the Heart region's aria-label contains "ACT"; click → shows "When to contact your CMO"; on FD60 all regions are OK.

TESTS TO RUN
npm test -- --run ; npm run typecheck ; npm run build

DEFINITION OF DONE
Tests pass; committed "feat: body map and explainers".

MUST NOT CHANGE
engine/, evidence/, data/, state/ logic.

REPORT
## Prompt 08 report
- Files:
- Tests:
- Remaining issues:
```

---

## PROMPT 09 — Testing and validation pass

```
STANDING RULES
- Inspect existing files before editing. Fix bugs, don't add features.
- Keep dev/test/build working. Run everything; fix failures; never claim untested behaviour.
- No new dependencies (Playwright only if already installed — otherwise skip and say so).
- End with the REPORT.

OBJECTIVE
Prove the demo works: complete unit/integration coverage of the engine, UI smoke tests, a banned-word scan, a production build check, and a written test report.

FILES TO INSPECT
All src/**, docs/DEMO_SCRIPT.md

FILES TO CREATE / MODIFY
- add missing tests (see below)
- create docs/TEST_REPORT.md (this is the ONLY docs file you may create/modify)

REQUIREMENTS
1. Run `npm test -- --run` and list any failures; fix the root cause (engine bugs in engine/, UI bugs in ui/). Do not weaken assertions or change config thresholds to make tests pass — if a test expectation is wrong per docs, report it instead.
2. Make sure these exist and pass (add if missing):
   - every DEMO_SCRIPT §3 invariant (I1–I10) as a named test
   - a UI test that the SIMULATED banner appears on every tab
   - a test that ui/ files do not import from engine/* internals: read the ui/ and state/ source files with fs in a test and assert there are no imports matching /engine\/(assess|lenses|handoff|config|baseline|quality|trend|readings)/
   - a banned-word scan over all engine output strings for every day of the demo mission (diagnos|disease|infection|fever|prescri|medicat|dose|dosing|treatment|\bmg\b), excluding EVIDENCE titles/findings
3. `npm run typecheck` and `npm run build` must pass; `npm run preview` must load with zero console errors. Check this in a browser if available.
4. Manual checklist (do it, then record PASS/FAIL in TEST_REPORT.md):
   [ ] Today FD99 shows overall ACT, 4 cards, coreTemp Medium confidence
   [ ] Guided demo steps 1–4 work
   [ ] FD60 coreTemp: OK, Why card shows the pre-flight FLAG + expected-adaptation PASS (Stahn)
   [ ] FD98 coreTemp: UNKNOWN "No reading for this day"
   [ ] Check-in: enter coreTemp 37.8 for FD98 → the card updates; reload the page → still there; "Reset my entries" (add a small button in Evidence or a footer if it's missing) restores it
   [ ] CMO note copies and downloads
   [ ] 390px width usable
   [ ] Evidence page shows every source with limitations
5. TEST_REPORT.md: date/time, test counts, invariant table, manual checklist results, known issues.

DEFINITION OF DONE
All green; TEST_REPORT.md written; committed "test: validation pass".

MUST NOT CHANGE
config.ts thresholds, evidence values, the planted episode, the docs other than TEST_REPORT.md.

REPORT
## Prompt 09 report
- Test totals:
- Invariants I1–I10: PASS/FAIL each
- Bugs found and fixed:
- Manual checklist results:
- Known remaining issues:
```

---

## PROMPT 10 — Polish, deployment and submission readiness

```
STANDING RULES
- Inspect existing files before editing. Bug fixes and copy polish only — NO new features.
- Keep dev/test/build working; run the full test suite again at the end.
- Never claim deployment worked unless you opened the deployed URL and saw the app.
- End with the REPORT.

OBJECTIVE
Make the app presentable, deploy it to a public URL, and write the README that judges will read.

FILES TO INSPECT
All src/**, docs/*.md, package.json, vite.config.ts

FILES TO CREATE / MODIFY
- README.md (create/overwrite)
- small CSS / copy fixes in src/ui/**
- optional: vercel.json only if needed

REQUIREMENTS
1. Polish: consistent spacing; the header shows the tagline; the footer shows "SIMULATED DATA · Not a medical device · Built for NASA Space Apps 2026"; a favicon (simple SVG letter "B" — original); page title. Fix any console warnings.
2. Deploy (pick ONE, in this order of preference):
   a) Vercel: `npx vercel --prod` (framework Vite, output dist). If it needs login, STOP and tell me the exact command to run myself.
   b) GitHub Pages: build with base './', push dist via the gh-pages branch (only if a GitHub remote already exists; do not create repos without asking).
   Open the deployed URL and confirm the Today screen renders.
3. README.md sections:
   - What BASELINE is (2 sentences) + the "Is this space, or is this me?" line
   - The problem (from REVISED_PRODUCT_SPEC §1)
   - How it works: the 3 lenses + the 5 layers (short)
   - Demo: link + the 4 guided-demo steps
   - Science: the validation table condensed from REVISED_PRODUCT_SPEC §6 (Research vs Design assumption)
   - Limitations (REVISED_PRODUCT_SPEC §7) — verbatim meaning, don't soften
   - What we deliberately did not build (and why): radiation/space-weather, LLM, 3D, backend
   - Related work (1 short paragraph: other 2026 entries such as ANCHOR, Pulsar and HELIOS use personal baselines too; BASELINE's focus is the explicit expected-adaptation lens). Be respectful; no claims about their flaws.
   - Run locally: npm install, npm run dev, npm test -- --run
   - Use of AI tools: "Code was written with Anthropic Claude (Claude Code) under the team's direction; the team chose the idea, the scope, the scientific sources and the rules, and reviewed and tested the result." (Edit if the team's process differed.)
   - Team, licence (MIT for code).
4. Final: `npm test -- --run`, `npm run typecheck`, `npm run build` — all pass.

DEFINITION OF DONE
Public URL works; README complete; committed "docs: README, deploy".

MUST NOT CHANGE
engine/, evidence/, data/ logic; tests' assertions.

REPORT
## Prompt 10 report
- Deployed URL:
- Verified in browser: yes/no
- Final test totals:
- Anything I must do by hand (login, form fields):
```

---

## If something breaks

Paste this:

```
Stop adding features. Run `npm test -- --run` and `npm run build`. For each failure: show the error, find the root cause, fix it in the module that owns that logic (see docs/FINAL_ARCHITECTURE.md §5), and re-run. Do not change config thresholds, evidence values or the simulated planted episode. Report what you changed.
```
