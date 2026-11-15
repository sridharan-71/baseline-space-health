# BASELINE — Research and Competitor Analysis

*Written 15 Nov 2026, during the hackathon. Research was time-boxed to about 40 minutes.*

---

## 0. Inspection result (Part 1)

**I could not find an existing BASELINE project.**

- I searched `~/Desktop` (including `~/Desktop/projects`), plus the folder names under `~/projects`, `~/sri` and `~/sridharan`.
- There was no BASELINE strategy document, no source code, no tests and no README.
- When I asked, you confirmed: *"I do not have one yet."*

So this plan is **greenfield**:

- Nothing has been built yet.
- Nothing is broken yet.
- There is no code to preserve.

Prompt 00 re-checks this. If a teammate has code on another machine, bring it in **before** you run Prompt 01.

The "original spec" in this document is the description in your brief (Part 3 of your prompt). No spec file was found.

---

## 1. How the research was done (and its limits)

### What was inspected

**Same-challenge 2026 entries.** I cloned 7 public repositories and read their READMEs and file trees:

- ANCHOR
- Astronaut Health Intelligence Platform (AHI)
- BioOrbit
- Pulsar
- Sol Health
- HELIOS
- "Baseline" (obsidianprimeofficial-alt)

For each, I grepped the code for its key claimed features.

**Live demos were not run.** The sandbox blocks those sites.

**Wider landscape.** ANCHOR's own `LANDSCAPE.md` contains a coded survey of 243 public repositories for this challenge. I used it as a secondary source. It is their analysis, not mine.

### Verification levels used below

| Level | Meaning |
|---|---|
| **V-code** | Feature claimed in the README **and** matching code found by grep |
| **V-readme** | Claimed in the README; files exist, but logic not inspected |
| **Claim** | Only stated, e.g. performance numbers |

**Nothing here was executed.** No competitor metric (false-alarm rates, test counts) was reproduced by me.

### NASA systems

These come from NASA, ESA and Baylor/TRISH web pages found by search.

---

## 2. Established NASA / agency systems

| System | What it actually is | Who uses it | Data | Gap BASELINE could address |
|---|---|---|---|---|
| **Spaceflight Standard Measures** (NASA HRP) | A research data-collection study, not a crew tool. NASA describes it as collecting a standardised set of measurements across body systems at set time points before, during and after missions ([NASA](https://www.nasa.gov/reference/standard-measures/)). Test sessions are sparse (e.g. blood at L-180, FD30, R-30, R+30) ([NTRS 2018](https://ntrs.nasa.gov/api/citations/20180002943/downloads/20180002943.pdf)). Data are archived and released to IRB-approved studies via data-sharing agreements. | Researchers | Actigraphy, sleep logs, blood, saliva, cognition, sensorimotor, microbiome | No daily self-interpretation for the astronaut. Data are not public at individual level. |
| **ARCHeR** (Artemis II) | A research study on how crew perform individually and as a team; wearable actigraphy before, during and after the mission ([NASA](https://www.nasa.gov/humans-in-space/artemis-ii-crew-to-advance-human-spaceflight-research/)) | Researchers, mission control | Actigraphy, sleep, activity, cognition, teamwork | Research instrument. Not a personal interpretation tool. |
| **HERMES** (TRISH / Baylor) | A vehicle-agnostic health data platform: aggregation, interoperability, remote care ([BCM](https://www.bcm.edu/academic-centers/space-medicine/translational-research-institute/research/hermes)). Two prototypes were demonstrated in lab demos in 2025 ([BCM blog](https://blogs.bcm.edu/2026/03/11/reinventing-remote-healthcare-on-earth-and-beyond/)). | Medical and research teams | Multi-sensor | Infrastructure (data pipes and records), not astronaut-facing interpretation. BASELINE could sit *on top* of something like HERMES. |
| **Tempus Pro** (Philips RDT / ESA) | A certified multifunction vital-signs monitor with telemedicine and step-by-step guidance (iAssist) ([NASA](https://www.nasa.gov/?p=850075), [AMHP 2024](https://asma.kglmeridian.com/view/journals/amhp/95/3/article-p139.xml)) | ESA Space Medicine, flight surgeons | ECG, SpO2, BP, temperature, ultrasound | Acquires and transmits readings. It does not interpret them against an astronaut's own pre-flight normal plus expected adaptation. |
| **NASA HRP** | Owns the risks and gaps (the 5 hazards). In 2026 its work runs through Artemis II studies, ISS studies and the Human Research Roadmap. | — | — | Supplies BASELINE's framing and its evidence sources. |
| **NASA OSDR** | An open repository of spaceflight omics and physiology datasets | Researchers | Mostly omics and animal data; some human data | AHI already imports OSD-569 and OSD-575 (V-code). For a 7-hour build it is a time sink with low demo value, so it is a **P3** item for us. |

**Takeaway.** The real systems split into two groups: *collect and archive* (Standard Measures, ARCHeR, HERMES) and *acquire vitals* (Tempus Pro). None of them, at least publicly, gives the astronaut a daily answer to "is this change expected for me in space?" That is the space BASELINE is aimed at.

---

## 3. Same-challenge competitor matrix

Legend: ✅ V-code · 📄 V-readme · 💬 Claim only · — not found · ✖ deliberately refused

| Capability | **ANCHOR** | **Pulsar** | **HELIOS** | **BioOrbit** | **AHI** | **Sol Health** | **"Baseline" (other team)** |
|---|---|---|---|---|---|---|---|
| Personal baseline | ✅ Bayesian, anchored on pre-flight | ✅ rolling 10–45 d, EWMA | 📄 pre-flight, adapting (30-d half-life) | ✅ 18-day z-score | 📄 median/MAD | ✅ robust + CUSUM | 📄 rolling ≤30 d |
| Mission-phase awareness | 📄 pre-flight anchor + "new normal" by consent | 📄 environment (ISS/Moon/Mars) | 📄 | 📄 environment | 📄 | 📄 Mars-surface demo | — |
| **Explicit, sourced *expected spaceflight adaptation* model (offset by mission day)** | — | — (Stahn 2017 is cited; a rolling baseline absorbs the shift silently) | — | — | — | — | — |
| Longitudinal / persistence | ✅ CUSUM, false-alarm budget | ✅ EWMA | 📄 Mann–Kendall | 📄 3-day vs baseline | 📄 | ✅ bounded CUSUM | 📄 2-day rule |
| Data quality / confidence | 📄 | 📄 "No data / Learning" states | ✅ coverage gating | — | 📄 | — | 📄 |
| Explainable rules ("why") | ✅ "Why this note?" | 📄 | 📄 | 📄 | 📄 | 📄 one-sentence reason | 📄 evidence card + NASA study |
| Offline-first | ✅ PWA + service worker | ✅ PWA | 📄 PWA | 📄 localStorage | — | — | 📄 |
| Self-assessment | ✅ mood/energy/calm sliders | ✅ check-in + PVT | 📄 | ✅ PVT, camera PPG | 📄 | 📄 | 📄 |
| Medical handoff | ✅ consent log | ✅ ECDSA-signed packet | ✅ **SBAR** message | ✅ downlink report | 📄 | 📄 daily report | ✅ "queue for flight surgeon" |
| NASA data integration | 📄 HRP mapping | — | 📄 PMData, Inspiration4 | 💬 dose-rate constants | ✅ OSDR | ✅ MSL RAD, OSDR EDA | ✅ MSL RAD, NOAA GOES |
| Real vs simulated | Synthetic + real LifeSnaps validation (💬 numbers) | Synthetic, labelled | Simulated + PMData | Simulated | Simulated, labelled | Real-data-calibrated | Simulated vitals; real radiation |
| Clickable body figure | — | ✅ cartoon astronaut | — | ✅ body map | ✅ 3D (three.js) | 📄 planned | — |
| Unique angle | Disclosure contract, calm-language audit, dual kernels | Signed handover, full brief coverage | Most complete statistics | Camera pulse, crew heat-map | 3D anatomy, ground view | ML + real data notebooks | Real radiation + NASA study cards |

**How the "expected adaptation" cell was checked.** I grepped all 7 repositories for terms such as `expected … adaptation/shift/offset` and `adaptation model/envelope/curve`. There were 0 relevant hits; the only match was an unrelated test line in Sol Health. ANCHOR's 243-repo survey has no coded feature for it either.

**This is evidence of absence in 7 repos plus one survey, not proof that nobody does it.** Say "we did not find it in the entries we inspected", not "no one does this".

---

## 4. Brutally honest answers (Part 2D)

**1. Is BASELINE, as originally specified, still different enough?**
**No.** Of its six listed differentiators, five are common or done better elsewhere:

- personal pre-flight baseline (ANCHOR)
- recent trends (Pulsar, Sol, HELIOS)
- data quality and confidence (HELIOS, Pulsar)
- explainable assessment (ANCHOR, "Baseline")
- SBAR handoff (HELIOS has exactly this)

ANCHOR's survey puts personal baselines in 40% of entries and offline operation in 40%.

There is also a **name collision**: another 2026 entry is literally called "Baseline" and also cites NASA studies.

**2. Which features are already common?**
Personal baseline, offline operation, radiation and space-weather panels (52% per ANCHOR's survey), mood logging, OK/Watch/Act colour coding, flight-surgeon reports, composite scores, gamification and LLM chat.

**3. Useful but not distinctive?**
Data-quality/UNKNOWN states, persistence rules, the SBAR note and offline storage. **Keep them**, because the product is unsafe without them. **Do not pitch them** as differentiators.

**4. What can BASELINE demonstrate better than its competitors?**
The one item no inspected entry implements: an **explicit, sourced model of expected in-flight change**, layered on a frozen pre-flight baseline. It produces a visible three-way answer: *"expected space adaptation"* vs *"unexplained change"* vs *"not enough data"*. It also shows why both common approaches fail:

- A **fixed Earth threshold** misses changes that are large for *this* person. (Resting HR 72 bpm is "normal" on Earth but +14 for an astronaut whose normal is 58.)
- A **frozen pre-flight baseline** cries wolf for months on expected adaptation. (Resting core temperature rises about 1 °C over 2.5 months; Stahn 2017.)
- A **rolling baseline**, as Pulsar uses, adapts silently. It can't tell the astronaut *why* their normal changed, and by design it can absorb a slow drift.

**5. Is there a narrower, underserved problem?**
Yes. ***"Is this space, or is this me?"*** That is the interpretation question itself, not monitoring in general. It is narrower than every competitor's scope, and it matches your original problem statement word for word.

**6. Can we make a meaningful improvement in 7 hours?**
Yes, **if** the scope is roughly 4 measures, 1 simulated astronaut, 1 chart that compares three lenses, a why-card and a CMO note. The engine is about 400 lines of pure TypeScript.

**7. Would changing direction now be a mistake?**
A *new project* would be a mistake: it costs time and loses your story. **Re-centring the pitch** on the adaptation lens is not a change of direction. It is your original idea, made concrete.

---

## 5. Verified differentiator (what you may claim)

> "BASELINE separates *expected spaceflight adaptation* from *unexplained change*. It compares each reading with the astronaut's own pre-flight normal shifted by a published, cited in-flight adaptation curve where one exists. It then shows the astronaut, side by side, what an Earth threshold and a pre-flight-only baseline would have said. Among the 2026 entries we inspected, we did not find this layer implemented."

### Do NOT claim

- clinical validity
- real-astronaut validation
- that no other team does this
- radiation dose
- that the adaptation curve fits any individual

---

## 6. Science sources verified for this plan

| Source | Verified fact used | Where verified |
|---|---|---|
| Stahn et al. 2017, *Sci Rep* 7:16180 | Resting core body temperature rose about 1.01 °C above baseline, developing gradually and plateauing after about 75 days. n = 11 (7 men, 4 women). Measured with a forehead "Double Sensor" heat-flux device. Pre-flight at L-90; in-flight at FD15, 45, 75, 105, 135 and 165. | [PMC5701078](https://pmc.ncbi.nlm.nih.gov/articles/PMC5701078) |
| Norsk et al. 2015, *J Physiol* 593:573 | 24-h ambulatory brachial BP reduced by 8–10 mmHg at 3–6 months on the ISS. n = 8 middle-aged male astronauts. | [PMC4324706](https://pmc.ncbi.nlm.nih.gov/articles/4324706/), [commentary PMC4324697](https://pmc.ncbi.nlm.nih.gov/articles/PMC4324697) |
| Barger et al. 2014, *Lancet Neurol* 13:904 | Mean sleep about 6.09 h on the ISS (5.96 h shuttle), despite 8.5 h scheduled. Pre-flight training also averaged under 6.5 h. 75% of ISS crew used sleep medication. | [Sleep Review](https://sleepreviewmag.com/sleep-health/parameters/quantity/astronaut-sleep-hypnotics/), [OmicsDI abstract](https://www.omicsdi.org/dataset/biostudies-literature/S-EPMC4188436) |
| CDC fever definition | Measured temperature of at least 38.0 °C (typically oral). | [via NCMIC summary of CDC](https://www.ncmic.com/practice-resources/practice-matters/checking-patients-for-fever-whats-too-high/) (check the primary CDC page before submission) |
| AHA resting heart rate | 60–100 bpm is normal for most adults; above 100 at rest is tachycardia. | [Mayo Clinic citing AHA](https://mayoclinic.org/health/heart-rate/AN01906/) |
| ACC/AHA 2017 BP guideline | Hypertensive crisis is above 180 systolic and/or above 120 diastolic. | [ACC Guidelines Made Simple](https://www.acc.org/%7E/media/Non-Clinical/Files-PDFs-Excel-MS-Word-etc/Guidelines/2017/Guidelines_Made_Simple_2017_HBP.pdf) |
| Official challenge brief | "Build a health monitoring software that gathers health indicators and enables astronauts to evaluate and act on the status of their health." Suggests a clickable human figure and per-indicator explanations (can it be measured in space, why, how hazards affect it, when to escalate, prevention). | Secondhand: mirrored in Sol Health's `docs/CHALLENGE.md`, which cites a local-event mirror. **Re-read the official page yourself.** |

NOAA GOES and NASA DONKI were **not** researched further, because they are cut (see the revised spec, §6).

---

## 7. Research limitations

- About 7 of more than 2,400 teams were inspected directly; the survey is ANCHOR's, not mine.
- No competitor demo was run.
- Code was grepped, not reviewed.
- The CDC and AHA values come from reputable secondary pages that quote the primary sources. Open the primary pages before you cite them on a slide.
- Stahn and Norsk are small samples of ISS crew. Their **group-mean** curves are not individual predictions.
