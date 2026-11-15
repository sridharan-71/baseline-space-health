# 06 — Implementation Roadmap

**Deadline (verified):** project submission closes Sunday 15 Nov 2026 at **11:59 PM local time** ([spaceappschallenge.org/2026](https://www.spaceappschallenge.org/2026/)). Your local event may judge earlier, so ask your Coimbatore lead.

At the time of writing (~19:00 IST) about 5 hours remain.

## Already done today (tested: 119 tests pass, production build OK)

| # | Change | Files |
|---|---|---|
| D1 | Plain-language UI: intro panel, status names, "Day 99 in space", tab names, three-number cards, 5-question why card, chart key, glossary, SBAR explained | `src/ui/**`, `src/ui/plain.ts` |
| D2 | Personal calibration of the temperature adaptation (research shape × personal size) | `src/engine/personalize.ts`, `assess.ts`, `lenses.ts`, `config.ts`, `handoff.ts` |
| D3 | The Earth line no longer escalates to "tell your medical officer" on its own | `assess.ts`, `config.ts`, test updated |
| D4 | Stress test: 7 hypothetical astronauts × 4 methods, computed live, with tests | `data/simulated/scenarios.ts`, `engine/stressTest.ts`, `ui/components/StressTestTable.tsx`, Science page |
| D5 | Caveat on the 83-vs-3 tiles, linking to the stress test; guided demo step 5 | `LensCounts.tsx`, `DemoTour.tsx` |
| D6 | README: stress-test table, calibration rule, changed ACT rule | `README.md` |

## P0 — must do before submission (about 1 h 45 min)

| Task | Weakness addressed | Time | How to show judges |
|---|---|---|---|
| **Commit** (`git add -A && git commit -m "science: personal calibration + stress test; plain-language UI"`) and push to GitHub | Work only exists locally | 5 min | Repo link |
| **Rebuild and redeploy** (`npm run build`, then Vercel or GitHub Pages) | The live site is the old version | 15 min | Live link |
| **Open the deployed site on a phone** and click through all 5 guided-demo steps | Untested on a real device | 10 min | — |
| **Record a 2–3 minute demo video** following doc 07 | No video yet | 40 min | Video link |
| **Fill in the Space Apps project page**: description, links, the stress-test table as an image, the AI-use statement, all simulated data declared | Submission | 30 min | — |

## P1 — high value, only if P0 is done by about 21:30

| Task | Why | Time | Risk |
|---|---|---|---|
| Add a service worker (offline after first visit) | "Works with no Earth link" becomes true; ANCHOR and Pulsar have it | 25 min | Low; test the reload offline |
| Show the personal size on the chart ("her rise so far: 1.01× the research average") | Makes calibration visible without opening "why" | 20 min | Low |

## P2 — useful, not needed

- Widen the blue band early in the mission, when calibration has little data (uncertainty visualisation).
- A "rename" decision: the other 2026 entry called "Baseline" may confuse judges. A subtitle may be enough: "BASELINE — Is this space, or is this me?"

## P3 — avoid in this hackathon

- Blood-pressure model (weak evidence).
- Combined "pattern" alerts (risk of implied diagnosis).
- AI chat, radiation or space weather, 3D, wearables, backend or login.
- Learning the adaptation's timing (too risky to build and validate tonight).
- Real-data validation pipeline (right next step, not tonight).

## Dependencies

P0 commit → deploy → phone check → video (record from the deployed site) → submission form.
