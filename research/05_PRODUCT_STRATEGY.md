# 05 — Product Strategy

## Honest position

BASELINE was a well-explained personal-baseline monitor, with one scientific idea that, as built, was **unsafe for some astronauts and proved by a circular test**.

After today's changes it has one defensible idea, tested honestly:

> **Research tells us the *shape* of how the body changes in space. The astronaut's own data tells us the *size*. Anything left over is worth a look.**

## Recommended direction: keep the core, change the proof

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A. Pivot to real NASA data (e.g. OSDR Inspiration4, as MHCC does) | Wins on data credibility | MHCC already does it; a 3-day mission has no long-duration adaptation; not feasible in ~5 h | ✗ |
| B. Add measures (BP with Norsk, more indicators) | Looks broader | The BP evidence is weak (n = 8 men, 24-h ambulatory); it dilutes the story | ✗ for this submission |
| **C. Keep "is this space or is this me?" and make the scientific method the hero** (calibration + stress test) | Unique among the entries inspected; matches the *Best Use of Science* definition ("most valid use of the scientific method"); already built and tested | One measure only; simulated data | **✓ Recommended** |

## Strongest defensible differentiators (in pitch order)

1. **The expected-in-space band, sized to the person.** Research shape × personal size. Not found in the 9 entries inspected.
2. **A self-stress-test in the app.** The same engine runs against Earth limits, pre-flight-only and last-14-days methods on 7 hypothetical astronauts, **including where BASELINE fails**.
3. **Catches slow unexplained drift** that rolling baselines (Pulsar, AstroHealth and the other "Baseline") absorb by design. Shown in the stress test (simulated).

## Hygiene — keep, but don't pitch as unique

- the 5-question "why" card
- the UNKNOWN state for missing data
- the confidence level
- the SBAR note
- the evidence page with limitations

## Remove or demote

| Item | Action | Why |
|---|---|---|
| "83 vs 3" as a headline | Demote; always show the caveat | It's circular (doc 04 §3) |
| Body map | Keep, but skip in the demo | It only re-colours the Today statuses; it's in the brief but adds no insight |
| The ACT-by-Earth-line rule | **Removed** | The 38 °C line is an oral reference used on a different sensor |
| Mood SD maths | Keep; make no claims | The 1–5 integer scale is too coarse |

## Feature evaluation (Part 7 of your brief)

| Feature | Astronaut need | Evidence | Differentiation | Feasible today | Misleading risk | Demo value | Decision |
|---|---|---|---|---|---|---|---|
| Personal calibration of the adaptation | High | Shape from Stahn; size is a design choice | High | ✅ done | Low (labelled, tested) | High | **Built** |
| Scenario stress test | Indirect (trust) | Method, not data | High | ✅ done | Low if labelled "what if" | **Very high** | **Built** |
| Mission timeline replay / day scrubber | Medium | — | Low | Exists | Low | Medium | Keep |
| Service worker (true offline) | High for Mars | — | Low (commodity) | ~20 min | None | Low | P2 |
| Multi-indicator interpretation | High | Weak; risks diagnosis | Low | Risky | **High** (BioOrbit's "possible infection") | Medium | Avoid |
| Uncertainty visualisation (band widens early) | Medium | Method | Medium | ~45 min | Low | Medium | P2 |
| Learning the timing of the adaptation (not just its size) | Medium | Method | High | 1–2 h, risky | Medium | Medium | P3 — future |
| CUSUM / EWMA detector | Medium | Established statistics | Low (others have it) | 1 h | Low | Low | P3 |
| Real-data false-alarm test (PMData / LifeSnaps) | Indirect | Real data | Medium | Not in ~5 h | — | High | Future work; say so |
| AI chat, radiation, 3D, wearables | — | — | Commodity | — | High | — | Avoid |

## Is it competitive for the next round?

- **Locally (Coimbatore):** likely competitive. It is clear, honest and working, with an unusual scientific angle.
- **Globally:** borderline. ANCHOR is stronger on almost every axis except the explicit adaptation model.

**What still blocks award level:**
- no real human data
- one adapted measure
- basic statistics
- no offline PWA
- no recorded demo video yet
