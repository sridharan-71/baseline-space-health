# 03 — BASELINE Competitive Scorecard

## How to read this scorecard

- **Scale:** 1–10. 5 means typical for a decent hackathon entry; 8 or more means clearly better than most entries in the same challenge.
- **What the scores rest on:** the code checks in doc 02. "?" means there was not enough evidence to score.
- **BASELINE is scored on its state after today's changes** (personal calibration, stress test, plain-language UI). The pre-change score is in brackets where it differs.

| Dimension | BASELINE | ANCHOR | Pulsar | HELIOS | MHCC | BioOrbit |
|---|---|---|---|---|---|---|
| Problem relevance | 8 | 8 | 9 | 8 | 6 | 7 |
| Scientific credibility | **7** [4] | 9 | 7 | 8 | 8 | 4 |
| Data quality / transparency | 6 | 9 | 6 | 7 | 9 | 4 |
| Personalisation | 8 [6] | 9 | 7 | 8 | 6 | 6 |
| Space adaptation | **8** [6] | 6 | 6 | 6 | 3 | 4 |
| Trend detection | 6 | 9 | 8 | 8 | 4 | 6 |
| Explainability | 8 | 9 | 7 | ? | 8 | 6 |
| Decision support | 7 | 7 | 9 | 8 | 5 | 7 |
| Offline readiness | 4 | 9 | 9 | 7 | 3 | 7 |
| UX | 7 [4] | 8 | 8 | ? | 7 | 8 |
| Technical implementation | 7 | 10 | 8 | 8 | 6 | 7 |
| Demonstration | 7 [5] | 8 | 8 | ? | 7 | 8 |
| Originality | **7** [5] | 8 | 6 | 6 | 6 | 5 |
| Mission relevance | 8 | 8 | 9 | 8 | 5 | 8 |

## Reasoning per row

1. **Problem relevance.** The question "is this space or is this me?" maps exactly to the brief's *evaluate* step. MHCC is post-flight lab analysis, not daily self-monitoring.
2. **Scientific credibility.**
   - *Before (4):* the 83-vs-3 headline was circular, because the data was generated from the model it was tested on (doc 04).
   - *After (7):* a stress test against four methods and seven scenarios is shown in the app, and the weaknesses are stated.
   - Still below ANCHOR and MHCC, because those use real human data.
3. **Data quality.** All astronaut data is simulated, but every source shows its population and limits. MHCC uses only real OSDR data; ANCHOR validates on LifeSnaps (claimed).
4. **Personalisation.** Before: pre-flight mean/SD only. Now the *size* of the in-flight change is learned from her own data. ANCHOR's Bayesian approach is more principled.
5. **Space adaptation.** This is BASELINE's clearest lead. It is the only entry in the 9 inspected repositories with an explicit, cited, personally calibrated in-flight expectation. It covers only **one** measure (temperature), which caps the score at 8.
6. **Trend detection.** A simple persistence rule (2 of 3 days). ANCHOR, Sol and HELIOS use CUSUM, EWMA or Mann–Kendall.
7. **Explainability.** A 5-question "why" card with evidence chips, and a glossary.
8. **Decision support.** An SBAR draft exists, but next steps are generic. Pulsar has per-alert checklists and signed handover.
9. **Offline.** It makes no network calls, but there is **no service worker**, so it isn't installable or offline after a reload. ANCHOR and Pulsar are real PWAs.
10. **UX.** After today's rewrite it is understandable within about 60 seconds. It is still text-heavy, and the body map is mostly decorative.
11. **Technical implementation.** 119 tests, a pure TypeScript engine, deterministic simulation. ANCHOR has dual kernels in two languages and real-data validation.
12. **Demonstration.** The guided demo now has a fifth step (the stress test). No video recorded yet.
13. **Originality.** The adaptation layer plus calibration plus self-stress-test is unusual. "Personal baseline" on its own is commodity.
14. **Mission relevance.** Strong for long-duration missions. No environment modes (Moon/Mars), unlike Pulsar and BioOrbit.

## Answers

1. **Where BASELINE outperforms:**
   - It explicitly separates expected space adaptation from unexplained change, and explains *which research* sets the expectation.
   - In its own stress test it catches slow drifts that a rolling baseline misses, including a non-adapter's drift that stays below the 38 °C Earth line (where the Earth-only method also misses). It flags these as "can't tell" rather than calling them normal (corrected after the calibration audit, doc 09).
2. **Where it loses:**
   - real data (MHCC, ANCHOR, Sol)
   - statistical sophistication (ANCHOR, Sol, HELIOS)
   - offline PWA (ANCHOR, Pulsar)
   - handover security (Pulsar)
   - breadth of measures (everyone)
3. **Genuinely more advanced:** ANCHOR overall; Sol Health in data science; MHCC in real-data honesty.
4. **Becoming generic:**
   - personal baseline
   - OK/Watch/Act colours
   - SBAR or downlink note
   - offline claims
   - body maps
   - radiation panels
   - readiness scores
5. **Is the adaptation layer defensible?**
   - **Partly.** The original version (group curve as-is) was **not**: it hid a real problem for small adapters (0/3 caught) and produced many false alerts for large adapters.
   - With personal calibration and the stress test it is defensible **for temperature**, and honestly limited elsewhere.
6. **Has anyone built something substantially similar?**
   - Not found in the 9 repositories inspected.
   - Pulsar addresses the same temperature problem differently, with a rolling baseline.
   - ANCHOR's consented "new normal" is a manual version of re-anchoring.
7. **What judges will remember:** the stress-test table. It shows we tested our own method against the alternatives, including the cases where ours fails. Few hackathon teams do that.
