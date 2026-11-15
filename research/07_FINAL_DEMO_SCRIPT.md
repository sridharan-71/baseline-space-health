# 07 — Final Demo Script (about 2 min 45 s)

**Before you start**
- Open the deployed site in Chrome, full screen. Clear your own entries (Science & sources → Reset my entries).
- Start on the **Today** tab with the intro panel hidden.
- Use only numbers the app shows on screen. Never say "accurate", "detects illness" or "validated".

| Time | Screen / action | What to say |
|---|---|---|
| 0:00–0:15 | **Today**, day 99, red "Tell your medical officer" badge | "On a long mission, an astronaut's body changes. Her resting core temperature can rise about one degree over the first months in space. So when a reading looks high, she can't tell: is this space, or is this me? BASELINE answers that question." |
| 0:15–0:40 | Guided demo **step 1** → Over time, **day 60**, temperature | "Grey is her normal before launch. Blue is what research expects for her in space on that day. The shape comes from a study of 11 ISS astronauts, Stahn 2017. On day 60 she's far above her pre-launch normal, so a pre-launch-only system would alarm. But she's inside the blue band, so BASELINE says *normal for you*, and shows why." |
| 0:40–1:05 | Open **Why this result?** — point at question 3 | "Here's the key: the research gives the *shape* of the change, and her own data gives the *size*. Her rise so far is about 1.0 times the research average. A different astronaut gets a different band." |
| 1:05–1:30 | Step **2** → **heart rate, day 97** | "Now the opposite failure. 71 beats per minute is normal on Earth, so an Earth limit never fires. For her it is about 12 above her own normal, two days in a row, with short sleep. BASELINE says *tell your medical officer*." |
| 1:30–1:45 | Step **3** → **day 98**, temperature card says *No data* | "Missing data is never treated as fine. It says *No data*, and the next day its confidence drops." |
| 1:45–2:10 | Step **4** → **Note to doctor** | "It drafts a note in SBAR, the format hospital teams use: situation, her normal and expected values, the gap, and a request for review. She edits it. BASELINE never diagnoses." |
| 2:10–2:40 | Step **5** → **stress test table** | "Here's the honest part. Our main astronaut follows the research average, so of course we look good on her. So we ran the same engine on astronauts who adapt less, more, faster, or not at all, and on a slow drift. A last-14-days method, which several teams use, misses the slow drift completely: zero of nine days. BASELINE catches all nine with no false alerts. And here's where we fail: a fast adapter. We show that too." |
| 2:40–2:50 | Back to the Today tab | "BASELINE: your normal, not Earth's normal. A tool that knows what space is supposed to do to you, and tells you when it's something else. All data is simulated; this is a prototype, not a medical device." |

## Show / skip

| Show | Skip |
|---|---|
| Today (5 s), Over time (chart + why card), Note to doctor, **Stress test** | Body map, check-in form, full Evidence list, Prev/Next day buttons |

## If a judge asks

- **"Isn't 83 vs 3 rigged?"** — "Yes, partly, and we say so on screen. That's why we built the stress test."
- **"Only temperature?"** — "It's the only measure with a clear published in-flight trajectory we trust. For heart rate, sleep and mood we compare with her pre-launch normal and say so."
- **"Real data?"** — "No real astronaut data. The next step is checking false-alarm rates on public wearable datasets, which can test our false-alarm rate but can't test space adaptation."
