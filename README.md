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

- **Live demo:** _add the deployed URL here_
- Fictional astronaut: Cmdr. Asha Rao (SIMULATED), 99 days into a 110-day mission (seed 2026).
- Press **Guided demo** in the header:
  1. **FD60 · core temperature** — far above pre-flight normal, but inside the expected in-flight band → **OK**. Up to FD99, the pre-flight-only lens flags **83** of 98 in-flight days; BASELINE flags **3** (all in the planted episode).
  2. **FD97 · resting heart rate** — 71 bpm, normal on Earth (Earth lens: **0** days), but outside *her* normal on consecutive days → **ACT**.
  3. **FD98 · missing data** — temperature sensor not worn → **UNKNOWN**; confidence drops to Medium the next day.
  4. **FD99 · CMO note** — prefilled SBAR draft; edit, copy or download.

## Science

| Rule in the app | Source | Label |
|---|---|---|
| Expected core-temperature offset +1.0 °C × min(FD/75, 1), ±0.15 °C extra uncertainty | Stahn et al. 2017 (n = 11 ISS crew, heat-flux sensor) | Research-informed group-mean curve; the linear ramp and the uncertainty are **design assumptions** |
| Temperature is a simulated heat-flux core-temperature *estimate* | Stahn et al. 2017 (device) | Curve does not apply to oral or forehead-IR thermometers |
| Earth reference 38.0 °C | CDC | Clinical reference, different body site — context only |
| Earth reference resting HR > 100 bpm | AHA | Clinical reference — context only |
| Sleep: no adaptation offset | Barger et al. 2014 (85 crew; ~6 h on ISS) | Population context only |
| Heart rate, mood: no adaptation model | — | Compared with pre-flight normal |
| WATCH at z ≥ 2.0; ACT at z ≥ 2.5 on ≥ 2 of the last 3 available days (or ≥ 2 Earth crossings) | — | **Prototype statistical rule — not medically validated** |
| UNKNOWN rules; SD floors per measure | — | **Design assumption** |

Every source, its population and its limitations are shown on the in-app **Evidence** page.

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
npm test -- --run    # 112 tests
npm run build
```

Code layout: `src/domain` (types, measures, validation) · `src/evidence` (the only place research numbers live) · `src/engine` (pure assessment logic; `engine/index.ts` is the public API) · `src/data/simulated` (seeded mission) · `src/state` (React context + localStorage) · `src/ui` (render only — no thresholds or rules).

## Use of AI tools

Code was written with Anthropic Claude (Claude Code) under the team's direction; the team chose the idea, the scope, the scientific sources and the rules, and reviewed and tested the result.

## Team and licence

Team: _add names_. Code licensed under MIT.
