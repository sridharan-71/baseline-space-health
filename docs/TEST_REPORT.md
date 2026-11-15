# BASELINE — Test Report

**Date:** 2026-11-15 · **Seed:** 2026 · **Commands:** `npm test -- --run`, `npm run typecheck`, `npm run build`

## Totals

- **112 tests passed, 0 failed** (18 test files)
- `npm run typecheck`: pass
- `npm run build`: pass

## Demo invariants (DEMO_SCRIPT §3)

| ID | Check | Result |
|---|---|---|
| I1 | Same seed → identical mission | PASS |
| I2 | Every measure present L-30…L-1, FD1…FD110, except coreTemp FD98 | PASS |
| I3 | FD1–FD95, all measures: BASELINE OK | PASS |
| I4 | FD1–FD95 coreTemp: pre-flight-only lens flags ≥ 60 days | PASS |
| I5 | Earth lens flags 0 days (coreTemp FD1–95, restingHR FD1–110) | PASS |
| I6 | FD60 coreTemp OK; pre-flight FLAG; expected-adaptation PASS citing Stahn 2017 | PASS |
| I7 | coreTemp FD96 WATCH · FD97 ACT + Earth · FD98 UNKNOWN · FD99 ACT, Medium | PASS |
| I8 | restingHR FD97–99 ACT; sleep FD97 ACT | PASS |
| I9 | FD98 overall ACT, unknownCount 1 | PASS |
| I10 | FD99 cmoSuggested; note has S/B/A/R, SIMULATED, Stahn, FD98 gap; no banned words | PASS |

## Lens counts up to FD99 (for the pitch)

| Measure | Earth | Pre-flight only | BASELINE | In-flight days with data |
|---|---|---|---|---|
| Core temperature | 3 | 83 | 3 | 98 |
| Resting heart rate | 0 | 4 | 4 | 99 |
| Sleep | — | 4 | 4 | 99 |
| Mood | — | 4 | 4 | 99 |

## Other automated checks

- SIMULATED banner present on every tab — PASS
- `ui/` and `state/` never import engine internals or `evidence/` directly — PASS
- Banned-word scan over every headline, next step, reason, layer detail and CMO note for every demo day — PASS
- Guided demo steps 1–4 (jsdom) — PASS
- Check-in: invalid value shows an inline error; FD98 entry fills the gap; persisted to localStorage; corrupt storage loads empty; reset clears — PASS

## Manual checklist

Not yet run in a real browser (no browser automation was available in the build session). Run these on the deployed URL:

- [ ] Today FD99 shows overall ACT, 4 cards, coreTemp Medium confidence
- [ ] Guided demo steps 1–4 work
- [ ] FD60 coreTemp: OK; Why card shows pre-flight FLAG + expected-adaptation PASS (Stahn)
- [ ] FD98 coreTemp: UNKNOWN "No reading for this day"
- [ ] Check-in 37.8 for FD98 → card updates; reload → still there; Evidence → "Reset my entries" restores it
- [ ] CMO note copies and downloads
- [ ] 390 px width usable
- [ ] Evidence page shows every source with limitations
- [ ] Zero console errors on `npm run preview`

## Known issues / deviations

- The CMO note's assessment heading reads "app output only, not a clinical judgement" instead of "not a diagnosis", because the spec's own banned-word test forbids "diagnos" in the note.
- P1 blood-pressure model (Norsk 2015) was skipped to protect the core demo.
- React 19 / Recharts 3 / Vite 8 / TypeScript 7 (current stable) were used rather than React 18. `@testing-library/dom` (required peer of Testing Library) and `@types/node` (for the import-boundary test) were added as dev dependencies.
