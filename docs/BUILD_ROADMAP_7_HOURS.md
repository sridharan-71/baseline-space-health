# BASELINE — Build Roadmap

The clock times assume you start executing prompts at **17:00** and the submission closes about **22:45**: seven hours after your 15:44 message. **Check the real deadline on your Space Apps team page now** and shift these times if it differs.

## Timeline

| Clock | Prompt | What | P | Cut rule if late |
|---|---|---|---|---|
| 17:00–17:15 | 00 | Scaffold Vite + React + TS + Vitest; confirm no existing code | P0 | — |
| 17:15–17:45 | 01 | Types, metric registry, validation, seeded simulated mission | P0 | — |
| 17:45–18:05 | 02 | Evidence registry, adaptation models, Earth references | P0 | Drop the BP model |
| 18:05–18:35 | 03 | Baseline, quality, persistence | P0 | — |
| 18:35–19:15 | 04 | Assessment engine, lens comparison, CMO-note builder | P0 | Drop the cool-down rule |
| **19:15** | ✅ **Checkpoint 1** | `npm test` green; demo invariants pass | | If red at 19:30, fix only failing P0 tests and skip BP/P1 everywhere |
| 19:15–19:35 | 05 | Context, persistence, wiring | P0 | — |
| 19:35–20:30 | 06 | Today, check-in, cards, Why card, Evidence page | P0 | Plain styling is fine |
| 20:30–21:15 | 07 | Three-lens chart, lens counts, day scrubber, CMO note screen, demo tour | P0 | Drop the demo tour first |
| **21:15** | ✅ **Checkpoint 2 — FEATURE FREEZE** | Full demo runs end to end | | After 21:15, no new features |
| 21:15–21:40 | 08 | 2D clickable body map + explainer cards | P1 | **Skip entirely** if Checkpoint 2 slipped |
| 21:40–22:00 | 09 | Full test pass, manual demo checklist | P0 | — |
| 22:00–22:25 | 10 | Build, deploy, README, AI disclosure | P0 | — |
| 22:25–22:45 | — | Submit: project page, demo link, repo link, video/slides | P0 | **Submit something by 22:30 no matter what** |

## Feature tiers

**P0 (must work)**

- 4 measures
- simulated mission
- 5-layer engine
- OK / WATCH / ACT / UNKNOWN + confidence
- Why card
- three-lens chart + counts
- day scrubber
- check-in
- CMO note
- Evidence page
- SIMULATED labels
- deployed link

**P1:** BP with the Norsk model; 2D body map + per-measure explainer cards.

**P2:** service worker offline install; rolling-baseline 4th lens; Playwright smoke test; measurement-due prompt.

**P3 (roadmap slide only):**

- real wearable input
- HERMES-style data interoperability
- OSDR / real-data validation (as ANCHOR did with LifeSnaps)
- multi-astronaut CMO view
- individual adaptation learning
- clinician review

## Cut list (do not build)

3D anatomy · LLM / chatbot · backend / database / auth · NOAA GOES / DONKI / radiation dose · OSDR import · gamification / streaks / badges · camera pulse · composite readiness score · crew dashboard · encryption / signing.

## Parallel work (two people)

| Person A — runs Claude Code | Person B — no Claude Code on `engine/` |
|---|---|
| Prompts 00–07, 09, 10 | From 17:45: write plain-English explainer text for the 4 measures (measured in space? why it matters? how space affects it? when to contact CMO? prevention?). This goes into `metrics.ts` *content fields only*, after Prompt 01 creates them. |
| | From 18:30: run Prompt 08 (body map) in a **separate branch**, *only after* Prompt 01 types exist; merge after 05 |
| | From 19:30: 6–7 slides + a 30-second video script from `DEMO_SCRIPT.md`. (The competitors inspected all made a ~30-s video and a ~7-slide deck; check what your submission form requires.) |
| | 21:40: run the manual demo checklist on the deployed URL from a phone |

## Testing and submission time is protected

- 20 minutes for tests (Prompt 09) and 45 minutes for deploy + submission are **not** buffer.
- Do not spend them on features.
