# BASELINE — Demo Script

**The one idea judges should leave with:**

> **"Earth thresholds miss changes that are big for *you*. Pre-flight baselines cry wolf because space changes your normal. BASELINE separates expected space adaptation from unexplained change, and shows its evidence."**

---

## 1. Setup (before you present)

- Open the deployed URL on a laptop, using Chrome at full screen. Keep a phone with the same URL as a backup.
- Clear your own check-in entries first: Evidence page → "Reset my entries".
- Write the lens counts from the Prompt 04 report on a sticky note. Say the numbers **as the app shows them**; never quote a number the app isn't showing.

## 2. Demonstration dataset (SIMULATED)

Fictional astronaut: **Cmdr. Asha Rao (SIMULATED)**, id `SIM-01`, seed `2026`.

| Period | Days | Core temp estimate | Resting HR | Sleep | Mood |
|---|---|---|---|---|---|
| Pre-flight | L-30 … L-1 | 36.75 ± 0.10 °C | 58 ± 2.5 bpm | 6.6 ± 0.3 h | 4–5 |
| In-flight, normal | FD1 … FD95 | Follows the Stahn-shaped rise: +1.0 °C by FD75, then flat | Unchanged | 6.55 h | 4–5 |
| Planted episode | FD96 | 38.20 | 64 | 5.8 | 3 |
| | FD97 | 38.40 | 71 | 5.2 | 2 |
| | FD98 | **no reading** (sensor not worn) | 72 | 5.1 | 2 |
| | FD99 (= "today") | 38.35 | 70 | 5.4 | 3 |
| | FD100 | 38.05 | 64 | 6.0 | 4 |

- **Self-reports:** "fatigue, feeling hot" on FD97–99.
- The episode is deliberately non-specific. It is **not** a disease, and the app never names one.

## 3. Expected outputs (these are test invariants I1–I10)

| ID | Day · measure | Expected |
|---|---|---|
| I1 | — | Same seed gives an identical mission |
| I2 | — | Every measure is present on L-30…L-1 and FD1…FD110, except core temp on FD98 |
| I3 | FD1–FD95, all measures | BASELINE status is OK (no WATCH or ACT) |
| I4 | FD1–FD95 core temp | The pre-flight-only lens flags ≥ 60 days |
| I5 | FD1–FD95 core temp; FD1–FD110 resting HR | The Earth lens flags 0 days |
| I6 | FD60 core temp | **OK**, while zPreflight ≥ 2.0 (pre-flight layer FLAG) and the expected-adaptation layer is PASS citing Stahn 2017 |
| I7 | Core temp | FD96 **WATCH** · FD97 **ACT** + Earth crossed · FD98 **UNKNOWN** · FD99 **ACT** with confidence **MEDIUM** (missing day in window) |
| I8 | FD97–FD99 resting HR; FD97 sleep | **ACT** |
| I9 | FD98 overall | **ACT**, unknownCount = 1 |
| I10 | FD99 | cmoSuggested = true; the CMO note has S/B/A/R, "SIMULATED", "Stahn et al. 2017", and a gap line for FD98; no banned words |

## 4. Exact demo sequence (about 3 minutes live; 30-second cut below)

**Step 1 — Today, FD99 (20 s)**

- *Show:* the SIMULATED banner and overall **ACT**. The four cards read: core temp ACT (Medium confidence), HR ACT, sleep ACT, mood status as shown.
- *Say:* "This is Commander Rao, a fictional astronaut, 99 days into a mission. BASELINE says: talk to your medical officer. But the interesting part is *why*, and why it stayed quiet for the 95 days before."

**Step 2 — Guided demo 1: FD60 · Core temperature (40 s): "Is this space?"**

- *Show:* the three-lens chart. The grey band (pre-flight normal) ends far below the dots; the blue band (expected in flight) rises and contains them. Then the Why card: pre-flight layer **!** FLAG, expected-adaptation layer **✓** PASS, and the Stahn 2017 chip.
- *Say:* "On day 60 her temperature is well above her pre-flight normal. A pre-flight-only system would alarm. But ISS research found resting core temperature rises about 1 °C over roughly 75 days in flight. BASELINE expects that rise, so it says OK, *and it tells her why*."
- *Point at the lens tiles:* "Pre-flight-only would have flagged her on **[N]** days. BASELINE flagged **[M]**, and all of those were in the planted episode."

**Step 3 — Guided demo 2: FD97 · Resting heart rate (30 s): "…or is this me?"**

- *Show:* HR at 71 bpm, far below the red dashed Earth line (100). The tile reads Earth reference: **0** days. BASELINE status: ACT, "2 of the last 3 days".
- *Say:* "Now the opposite failure. 71 bpm is perfectly normal on Earth, so an Earth threshold never fires. For her, it's 13 beats above her own normal, two days in a row, alongside short sleep. That's a real change worth reporting."

**Step 4 — Guided demo 3: FD98 · Missing data (20 s)**

- *Show:* the temperature card reading **UNKNOWN**: "No reading for this day." Next day, the confidence drops to Medium.
- *Say:* "No reading is not 'fine'. BASELINE says it doesn't know, and lowers its confidence the next day."

**Step 5 — Guided demo 4: CMO note, FD99 (30 s)**

- *Show:* the SBAR note. Edit one word, then Copy.
- *Say:* "One tap gives a structured note for the crew medical officer: situation, her pre-flight and expected values, the data gap, and a request for review. It's a draft she edits. BASELINE never diagnoses or suggests treatment."

**Step 6 — Evidence page (15 s)**

- *Show:* Stahn 2017 (n = 11, heat-flux sensor, limitations), the adaptation model's "design assumptions" list, and the prototype rules labelled *not medically validated*.
- *Say:* "Every rule is labelled either research or design assumption. The curve is a group mean of 11 ISS astronauts. We say so on screen."

**Close (10 s):** "Your normal, not Earth's normal. BASELINE helps astronauts tell space adaptation from real change, and act on it."

## 5. 30-second video script

| Time | Visual | Voice-over |
|---|---|---|
| 0–4 s | Logo + "SIMULATED" banner | "In space, your body's normal changes." |
| 4–11 s | FD60 temperature chart: grey vs blue band | "BASELINE expects the research-documented rise in core temperature, so it doesn't cry wolf." |
| 11–18 s | FD97 heart rate under the Earth line, ACT | "But a heart rate that's normal on Earth can be a real change for *you*. BASELINE catches it." |
| 18–23 s | FD98 UNKNOWN | "Missing data is unknown, never 'fine'." |
| 23–28 s | CMO note → Copy | "Then it drafts a clear note for your crew medical officer." |
| 28–30 s | Tagline | "BASELINE. Your normal, not Earth's normal." |

## 6. Likely judge questions and honest answers

- **"Other teams have personal baselines."** "Yes. ANCHOR, Pulsar and HELIOS all do, and well. Ours adds an explicit, cited model of *expected in-flight change* and shows the astronaut which lens says what. A rolling baseline adapts silently, can't say *why* the normal moved, and can absorb a slow drift."
- **"Is n = 11 enough?"** "Not for clinical use. That's why the curve is labelled as a group mean with design assumptions and extra uncertainty. In real use the curve would be personalised from the astronaut's own early-flight data, which is on our roadmap."
- **"Your temperature threshold, 38 °C, is oral."** "Right. It's shown only as context, with that caveat on screen, and it never lowers a status."
- **"Why no radiation?"** "Public space-weather data isn't an individual's dose, over half the entries already show it, and it doesn't answer our question."
- **"Real data?"** "All astronaut data is simulated and labelled. The engine is deterministic and tested. Validation on real data, for example public wearable datasets, is the next step."
