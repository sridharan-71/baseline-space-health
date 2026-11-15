# BASELINE — Your normal, not Earth's normal

**BASELINE** is an offline, single-astronaut health monitoring web app built for NASA Space Apps 2026 (*Create Health Monitoring Software for Astronauts on Space Missions*). For every daily reading it compares three lenses side by side and tells the astronaut whether a change is expected space adaptation, a real change worth reporting, or missing data.

> **"Is this space, or is this me?"**

⚠️ All astronaut data is **SIMULATED**. BASELINE is a prototype, not a medical device. It never diagnoses, names a condition, or suggests treatment.

## The problem

On a long mission, an astronaut looking at their own readings can't easily tell apart **expected space adaptation** (their body's normal has shifted, as it does for most crew), **a real change worth reporting**, and **missing or untrustworthy data**. Two common tools give the wrong answer:

- An **Earth threshold** misses changes that are large *for this person*.
- A **pre-flight-only baseline** raises false alarms for weeks on adaptations that are expected.

## How it works

**Three lenses**

| Lens | Question | Line |
|---|---|---|
| 🌍 Earth reference | Unusual for an average adult on Earth? | Published general reference (CDC, AHA). Context only — never lowers a status. |
| 🧑‍🚀 Pre-flight normal | Unusual compared with me before launch? | The astronaut's pre-flight mean ± SD |
| 🛰️ **Expected in-flight normal (BASELINE)** | Unusual for me *on this mission day*? | Pre-flight normal + a cited adaptation offset where research exists; otherwise the pre-flight normal, and it says so |

**Five layers** produce **OK / WATCH / ACT / UNKNOWN** plus a confidence level and a "Why?" card:

1. **Data quality** — no reading, an implausible value, or fewer than 7 pre-flight days → UNKNOWN. Missing is never "fine".
2. **Personal deviation** — z-score against the pre-flight normal.
3. **Expected adaptation** — z-score against pre-flight + cited offset (core temperature: Stahn et al. 2017).
4. **Persistence** — how many of the last 3 available days were outside the expected range.
5. **Earth reference** — crossed today, and how often recently.

When something is WATCH or ACT, BASELINE drafts an editable **SBAR note** for the crew medical officer.

## Demo

- **Live demo:** https://baseline-space-health.vercel.app
- **Source:** https://github.com/sridharan-71/baseline-space-health
- Fictional astronaut: Cmdr. Asha Rao (SIMULATED), 99 days into a 110-day mission (seed 2026). Every screen uses the same simulated dataset.
- Press **Guided demo** in the header (5 steps, about 2 minutes):
  1. **Meet Asha · FD99** — the Today screen answers "how is she doing?" in one line, then *What needs attention?* shows what changed, compared with what, over what period, how sure, and the next step.
  2. **FD60 · core temperature** — far above pre-flight normal, but inside the expected in-flight band → **Normal for you**. Up to FD99 the pre-flight-only lens flags **83** of 98 in-flight days; BASELINE flags **3**. **Caveat:** this astronaut was simulated to follow the research average, which flatters BASELINE — see *Science & sources → Stress test*.
  3. **Same number, different meaning** — the live engine judges a simulated 37.6 °C reading on day 4 (**Keep an eye on it**) and day 90 (**Normal for you**).
  4. **FD97 · resting heart rate** — normal on Earth, but outside *her own* range on consecutive days → **Tell your medical officer**. Heart rate has no space model; it uses her own history only.
  5. **FD99 · note to doctor** — SBAR draft with supporting readings and the FD98 data gap; edit, copy or download.

## Screens

| Screen | Purpose |
|---|---|
| **Today** | Overall status in one line, *What needs attention?* (only flagged measures, each with its evidence), all four measures, data quality, self-report and check-in |
| **Over time** | One measure across the mission: her pre-launch range, the research-based expected band (core temperature only), the Earth limit, daily results; three-lens counts; *Same number, different meaning* |
| **Note to doctor** | SBAR preview with a supporting-readings table, plus an editor to review before copying or downloading |
| **Science & sources** | How a reading is interpreted, research vs design assumptions, stress test, limitations, references, model assumptions, data sources and glossary |

The earlier *Body map* screen was removed: it only regrouped the same four measures by body region and added no information.

## Science

| Rule in the app | Source | Label |
|---|---|---|
| Expected core-temperature offset +1.0 °C × min(FD/75, 1), ±0.15 °C extra uncertainty | Stahn et al. 2017 (n = 11 ISS crew, heat-flux sensor) | Research-informed group-mean curve; the linear ramp and the uncertainty are **design assumptions** |
| Temperature is a simulated heat-flux core-temperature *estimate* | Stahn et al. 2017 (device) | Curve does not apply to oral or forehead-IR thermometers |
| Earth reference 38.0 °C | CDC | Clinical reference, different body site — context only |
| Earth reference resting HR > 100 bpm | AHA | Clinical reference — context only |
| Sleep: no adaptation offset | Barger et al. 2014 (85 crew; ~6 h on ISS) | Population context only |
| Heart rate, mood: no adaptation model | — | Compared with pre-flight normal |
| WATCH at z ≥ 2.0 or any Earth-reference crossing; ACT only at z ≥ 2.5 on ≥ 2 of the last 3 available days (Earth crossings alone never escalate) | — | **Prototype statistical rule — not medically validated** |
| UNKNOWN rules; SD floors per measure | — | **Design assumption** |

Every source, its population and its limitations are shown on the in-app **Evidence** page.

| Personal calibration: expected offset = scale × research curve; robust size estimate from her own in-flight readings up to 7 days ago (median first pass, unusually high days trimmed), starting from 1.0 (worth 5 days of evidence), limited to 0–2×; model uncertainty shrinks as her evidence grows | Shape from Stahn et al. 2017 | **Design assumption.** Personalises the *size* of the change, not its *timing* |
| "Can't tell" safeguard: if a reading is only normal because of the personal size, or her recent data implies ≥ 0.25× more adaptation than her earlier data, the status is never OK (Keep an eye on it, Low confidence) | — | **Design assumption.** Temperature alone cannot separate late adaptation from slow change |

## Stress test (simulated, run live in the app)

The main demo astronaut follows the research average exactly, so the 83-vs-3 result is partly built in. The app therefore re-runs the same engine on hypothetical astronauts who adapt differently (seed 2026). It compares Earth limit only, pre-flight normal only, last 14 days only (a common competitor approach) and BASELINE.

| Hypothetical astronaut | Earth only | Pre-flight only | Last 14 days | BASELINE |
|---|---|---|---|---|
| Average adapter (+1.0 °C) | 0 false · 3/3 caught | 80 · 3/3 | 10 · 3/3 | 0 · 3/3 |
| Small adapter (+0.5 °C) | 0 · **0/3** | 71 · 3/3 | 3 · 3/3 | 0 · 3/3 |
| Large adapter (+1.5 °C) | 33 · 3/3 | 84 · 3/3 | 12 · 3/3 | 51 (all "keep an eye on it", 0 sent to doctor) · 3/3 |
| Fast adapter (plateau day 30) | 0 · 3/3 | 88 · 3/3 | 8 · 3/3 | **41 (11 sent to doctor)** · 3/3 |
| Non-adapter | 0 · **0/3** | 0 · 3/3 | 0 · 3/3 | 0 · 3/3 |
| Slow drift, average adapter (crosses 38 °C) | 0 · 9/9 | 51 · 9/9 | 9 · **0/9** | 0 · 9/9 |
| Slow drift, non-adapter (stays below 38 °C) | 0 · **0/9** | 0 · 9/9 | 0 · **0/9** | 0 · 9/9 (as "can't tell") |

Correction: an earlier version said BASELINE was the only method to catch the slow drift. That was wrong; the Earth line also caught it, because that drift crossed 38 °C. The non-adapter row shows a drift the Earth line cannot see.

**Personal-calibration audit** (`research/09_…`, `research/10_…`): 36 adversarial scenarios × 20 seeds found that the first version of the calibration **silently absorbed slow drifts** (non-adapter drift: 0% caught). The fix:
- robust size estimate
- a consistency check between earlier and recent data
- a "can't tell" state that is never shown as OK
- uncertainty that shrinks with her own evidence

Remaining unidentifiable case: a drift that starts in the first ~6 weeks and blends into normal adaptation.

## Limitations

- All astronaut data is synthetic. The validation is only "the engine behaves as designed on our simulated mission".
- Adaptation curves are group means from 8–11 ISS crew. Individuals differ, and long-duration Mars missions are not studied.
- Statistical thresholds are design choices, not clinically tuned.
- Earth references are measured at different body sites or with different devices, and are context only.
- No clinician has reviewed this prototype.

## What we deliberately did not build

- **Radiation / space weather (NOAA GOES, DONKI):** public space-weather data is not an individual's dose, and live APIs can fail mid-demo.
- **LLM / chatbot:** every output must be traceable to a rule and a source.
- **3D anatomy:** a simple 2D clickable figure (Body tab) covers the brief's suggestion.
- **Backend, database, accounts:** everything runs offline in the browser; check-ins are saved on the device only.
- **Blood pressure (Norsk et al. 2015 model):** planned as an optional extra; left out of this build to protect the core demo.

## Related work

Other 2026 entries such as ANCHOR, Pulsar and HELIOS also use personal baselines, and do it well. BASELINE's focus is narrower: an explicit, cited model of *expected in-flight change*, and showing the astronaut which lens says what.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
npm test -- --run    # 132 tests
npm run build
```

Code layout: `src/domain` (types, measures, validation) · `src/evidence` (the only place research numbers live) · `src/engine` (pure assessment logic; `engine/index.ts` is the public API) · `src/data/simulated` (seeded mission) · `src/state` (React context + localStorage) · `src/ui` (render only — no thresholds or rules).

## Use of AI tools

Code was written with Anthropic Claude (Claude Code) under the team's direction; the team chose the idea, the scope, the scientific sources and the rules, and reviewed and tested the result.

## Team and licence

Team: _add names_. Code licensed under MIT.
