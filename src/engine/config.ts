// Every threshold in BASELINE lives here.

// PROTOTYPE DESIGN ASSUMPTION — not clinically validated
export const WATCH_Z = 2.0;
// PROTOTYPE DESIGN ASSUMPTION — not clinically validated
export const ACT_Z = 2.5;
// PROTOTYPE DESIGN ASSUMPTION — not clinically validated
export const MIN_BASELINE_DAYS = 7;
// PROTOTYPE DESIGN ASSUMPTION — not clinically validated
export const CONFIDENT_BASELINE_DAYS = 14;
// PROTOTYPE DESIGN ASSUMPTION — not clinically validated
export const PERSIST_WINDOW = 3;
// PROTOTYPE DESIGN ASSUMPTION — not clinically validated
export const PERSIST_REQUIRED = 2;
// PROTOTYPE DESIGN ASSUMPTION — not clinically validated
export const MAX_LOOKBACK_DAYS = 5;
// PROTOTYPE DESIGN ASSUMPTION — not clinically validated
export const EARTH_CROSSINGS_FOR_ACT = 2;

export const PROTOTYPE_RULES: { id: string; text: string }[] = [
  {
    id: 'watch',
    text: `WATCH when today's reading is at least ${WATCH_Z} standard deviations from your expected normal in the unhealthy direction, when it passes the general Earth reference today, or when the measure was ACT earlier in the current window.`,
  },
  {
    id: 'act',
    text: `ACT when today's reading is at least ${ACT_Z} standard deviations from your expected normal AND at least ${PERSIST_REQUIRED} of the last ${PERSIST_WINDOW} available days were outside your expected range — or when the general Earth reference was passed on at least ${EARTH_CROSSINGS_FOR_ACT} of those days.`,
  },
  {
    id: 'window',
    text: `The persistence window is the last ${PERSIST_WINDOW} days with a reading, looking back at most ${MAX_LOOKBACK_DAYS} calendar days, and never mixing pre-flight and in-flight days.`,
  },
  {
    id: 'unknown',
    text: `UNKNOWN when there is no reading for the day, the value is outside the plausible range, or there are fewer than ${MIN_BASELINE_DAYS} pre-flight readings to set your personal normal. Missing data is never treated as "fine".`,
  },
  {
    id: 'confidence',
    text: `Confidence starts High and drops one level for each of: fewer than ${CONFIDENT_BASELINE_DAYS} pre-flight readings, an adaptation model with low evidence strength, or a missing day inside the window.`,
  },
  {
    id: 'sdFloor',
    text: 'Each measure has a minimum standard deviation (temperature 0.1 °C, heart rate 2 bpm, sleep 0.3 h, mood 0.5) so a very steady pre-flight period cannot make tiny changes look large.',
  },
  {
    id: 'combinedSd',
    text: "When an adaptation model is used, its extra uncertainty is combined with your pre-flight spread: combined SD = √(pre-flight SD² + model uncertainty²).",
  },
  {
    id: 'earth',
    text: 'Earth references are shown for context. The adaptation lens can explain a change, but it never hides an Earth-reference crossing.',
  },
];
