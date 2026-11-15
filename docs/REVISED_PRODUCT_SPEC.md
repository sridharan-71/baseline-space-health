# BASELINE — Revised Product Spec

**Tagline:** *Your normal, not Earth's normal.*
**Demo line:** *"Is this space, or is this me?"*

---

## 1. Final problem statement

On a long mission, an astronaut looking at their own readings can't easily tell three things apart:

- **expected space adaptation** (their body's normal has shifted, as it does for most crew)
- **a real change worth reporting**
- **missing or untrustworthy data**

Two common tools give the wrong answer:

- An **Earth threshold** misses changes that are large *for this person*.
- A **pre-flight-only baseline** raises false alarms for weeks on adaptations that are expected.

## 2. Product definition

BASELINE is an offline, single-astronaut web app. For each daily reading it shows **three lenses side by side**:

| Lens | Question it answers | Source of the line |
|---|---|---|
| 🌍 Earth reference | "Is this unusual for an average adult on Earth?" | Published general reference (CDC, AHA). Shown for context only. |
| 🧑‍🚀 Pre-flight normal | "Is this unusual compared with me before launch?" | The astronaut's own pre-flight mean and SD |
| 🛰️ **Expected in-flight normal (BASELINE)** | "Is this unusual for me *on this mission day*?" | Pre-flight normal + a cited adaptation offset, where research exists. Otherwise it falls back to the pre-flight normal and says so. |

The output for each measure is **OK / WATCH / ACT / UNKNOWN**. Each one comes with:

- a **confidence** level (High / Medium / Low)
- a **"Why?" card** with five layers, each showing what it found and the evidence behind it
- a **next step**, which is non-medical: re-check, rest, or contact the crew medical officer (CMO)

When something is WATCH or ACT, BASELINE drafts a short **CMO note** in SBAR format. The astronaut edits it before copying it.

### Hard rules

- BASELINE never diagnoses, names a disease, recommends medication or dosing, or replaces the CMO.
- It never suppresses an Earth-reference crossing. The adaptation lens can explain a change; it can never hide a line.
- All astronaut data is **SIMULATED** and labelled on every screen.

## 3. What changed from the original spec, and why

| Original | Revised | Why |
|---|---|---|
| Six "differentiators" | **One** headline differentiator (the adaptation lens and three-lens comparison). The rest are kept as hygiene. | Competitor research: baselines, trends, confidence, explainability and SBAR are already common (HELIOS has SBAR). |
| Layer 4 "expected adaptation" was one of five | It becomes the **centre of the demo and the UI** | It is the only layer not found in the 7 inspected entries. |
| NOAA GOES proton flux and NASA DONKI | **Cut** (P3) | Radiation appears in 52% of entries (ANCHOR's survey). Public space weather is not an individual's dose. Live APIs can fail mid-demo. |
| Unspecified measures | **4 measures in P0:** core temperature estimate, resting HR, sleep hours, mood. **BP in P1.** | Covers the brief's examples, and the two strongest adaptation papers. |
| No body figure | **Simple 2D clickable SVG body (P1)** | The official brief explicitly suggests a clickable human figure. A cheap 2D version satisfies it; 3D is cut. |
| SBAR as a headline | SBAR **CMO note kept**, but as the *ending* of the demo | It is the useful "act" output, but it is not distinctive. |
| Generic dashboard | **Three-lens chart + day scrubber** as the hero screen | One memorable visual |

## 4. User journey (one astronaut, one mission)

1. **Today screen** opens on mission day 99 (simulated). A banner reads "SIMULATED DATA".
   - An overall status chip.
   - Four measure cards, each with status, value and confidence.
2. **Check-in** (P0): enter or confirm today's values (temperature, HR, sleep, mood 1–5) plus optional symptom chips. Entered values are validated and saved locally.
3. Tap a card to open the **Measure screen**:
   - the three-lens chart across the mission
   - lens flag counts ("pre-flight-only would have flagged you on N of M in-flight days"; N and M are computed by the engine, never hard-coded)
   - the "Why?" card
   - the evidence card
4. **Day scrubber:** move to FD60. Temperature is high versus pre-flight, but OK versus expected in-flight (Stahn 2017). Move to FD97: ACT.
5. **CMO note:** prefilled SBAR, edited, then copied or downloaded.
6. **Evidence page:** every source, the study population and its limitations, and a label of *Research evidence* or *Prototype design assumption* for each rule.

## 5. Feature priorities

| ID | Feature | Pri | Why | Est. |
|---|---|---|---|---|
| F1 | Domain types, metric registry, validation | P0 | Everything depends on it | 35m |
| F2 | Seeded simulated mission (L-30 … FD110) with one planted event and one data gap | P0 | The demo is deterministic | incl. F1 |
| F3 | Evidence registry + adaptation models (temperature P0, BP P1) + Earth references | P0 | Scientific honesty is the pitch | 25m |
| F4 | Baseline, quality, persistence | P0 | Correctness | 35m |
| F5 | Assessment engine (5 layers → status, confidence, why, next step) | P0 | Core | 40m |
| F6 | Lens comparison counts | P0 | The headline number | incl. F5 |
| F7 | Today screen + check-in + status cards + SIMULATED banner | P0 | Brief: gather and evaluate | 60m |
| F8 | Measure screen: three-lens chart + why card + day scrubber | P0 | The demo | 45m |
| F9 | CMO note (SBAR) generator + screen | P0-lite | Brief: "act" | 20m |
| F10 | Evidence page | P0 | Judges check science | 15m |
| F11 | 2D clickable body map + per-measure explainer cards | P1 | Brief suggestion | 30m |
| F12 | BP measure with Norsk adaptation | P1 | Second adaptation example | 20m |
| F13 | Service worker for true offline install | P2 | Commodity, but nice | 20m |
| F14 | "Rolling baseline" as a 4th lens count | P2 | Strengthens the comparison | 15m |
| F15 | Playwright smoke test | P2 | — | 15m |
| F16 | Measurement-due prompts / streaks | P2 | Optional in brief; gamification is weak per evidence | — |
| F17 | Radiation / GOES / DONKI / OSDR / LLM / 3D / auth / backend / crew view | **P3** | Commodity, risky or off-centre | — |

## 6. Scientific validation table

| # | Rule / claim in the app | Source | Actual finding | Population & limits | Supports the rule? | Use in prototype | Label shown |
|---|---|---|---|---|---|---|---|
| S1 | Expected in-flight **core temperature** offset = +1.0 °C × min(FD/75, 1), with ±0.15 °C added uncertainty | Stahn 2017 | +1.01 °C resting core temp at group mean; gradual; plateau after about 75 days | n = 11 ISS crew, about 6-month missions. Forehead heat-flux Double Sensor. Sparse time points (FD15/45/75/…). Single pre-flight session. | **Partly.** The shape and magnitude are a group mean, not individual. The linear ramp between measured points is our interpolation. | Yes, P0 | "Research-informed curve (group mean, n = 11). The linear ramp and the ±0.15 °C uncertainty are **prototype design assumptions**." |
| S2 | The temperature measure is a **"core temperature estimate (simulated heat-flux wearable)"** | Stahn 2017 (device) | Measured with a heat-flux sensor, not an oral thermometer | — | Needed so the curve applies to the same kind of measurement | Yes | "Do not apply this curve to oral or forehead-IR thermometer readings." |
| S3 | Earth reference for temperature: 38.0 °C | CDC (measured, typically oral) | Fever is a measured temperature of at least 38.0 °C | Population definition; the measurement site differs from our sensor | Context only | Yes, displayed and counted as the "Earth lens"; it never lowers the status | "General Earth reference; measured at a different body site; context only" |
| S4 | Earth reference for resting HR: above 100 bpm | AHA (via Mayo) | 60–100 bpm normal for most adults | Population | Context only | Yes | Same as S3 |
| S5 | Expected in-flight **BP** offset: −9 mmHg systolic after about FD90; linear ramp from FD0 | Norsk 2015 | 24-h ambulatory BP down 8–10 mmHg at 3–6 months | n = 8 middle-aged men; ambulatory 24-h average, not a spot cuff; onset shape not measured | **Weak.** Magnitude only; the ramp is assumed; spot BP ≠ 24-h mean | P1 only | "Research-informed magnitude (n = 8, men only, 24-h ambulatory). Onset and spot-BP use are **design assumptions**." |
| S6 | BP Earth reference: 180/120 | ACC/AHA 2017 | Hypertensive crisis is >180 and/or >120 | Population | Context only | P1 | As S3 |
| S7 | **Sleep:** no adaptation offset; compared with pre-flight normal | Barger 2014 | About 6.1 h on the ISS; pre-flight already under 6.5 h | 85 crew; actigraphy + logs | It supports that *population* sleep is short; it does **not** give an individual offset | Context text only | "No adaptation curve. Population context: ISS crews averaged about 6 h." |
| S8 | **HR, mood:** no adaptation model | — | — | — | — | Fallback to pre-flight normal | "No research-based adaptation model for this measure" |
| S9 | WATCH if residual z ≥ 2.0 today; ACT if z ≥ 2.5 on ≥ 2 of the last 3 available days | None | — | — | Not clinically validated | Yes | "**Prototype statistical rule — not medically validated**" |
| S10 | UNKNOWN if there is no reading today, the value is implausible, or there are fewer than 7 pre-flight days | None | — | — | Design choice | Yes | "Prototype data-quality rule" |
| S11 | SD floor per measure (temp 0.1 °C, HR 2 bpm, sleep 0.3 h, mood 0.5) | None | — | — | Prevents divide-by-tiny | Yes | "Design assumption" |
| S12 | NOAA GOES proton flux / DONKI | — | Environment measurements, not personal dose | — | **Does not** support any personal rule | **Removed** | — |

## 7. Scientific limitations (put these in the README)

- All astronaut data is synthetic. The validation is only "the engine behaves as designed on our simulated mission".
- Adaptation curves are group means from 8–11 ISS crew. Individuals differ, and long-duration Mars missions are not studied.
- Statistical thresholds are design choices, not clinically tuned.
- Earth references are measured at different body sites or with different devices, and are context only.
- No clinician has reviewed this prototype.
