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
// Retired 15 Nov: Earth crossings no longer escalate to ACT on their own (kept for reference).
// PROTOTYPE DESIGN ASSUMPTION — not clinically validated
export const EARTH_CROSSINGS_FOR_ACT = 2;

// Personal calibration of the research adaptation curve (see engine/personalize.ts).
// PROTOTYPE DESIGN ASSUMPTION — not clinically validated
export const CALIBRATION_EXCLUDE_RECENT_DAYS = 7;
// PROTOTYPE DESIGN ASSUMPTION — the research curve counts as this many days of full-size evidence
export const CALIBRATION_PRIOR_WEIGHT = 5;
// PROTOTYPE DESIGN ASSUMPTION — personal size is limited to 0×–2× the research group mean
export const CALIBRATION_SCALE_MIN = 0;
export const CALIBRATION_SCALE_MAX = 2;
// PROTOTYPE DESIGN ASSUMPTION — readings this many combined SDs ABOVE the first-pass calibrated
// expectation are not used to learn what is normal (one-sided trimming; matches ACT_Z).
export const CALIBRATION_TRIM_Z = 2.5;
// PROTOTYPE DESIGN ASSUMPTION — if her most recent data implies an adaptation at least this much bigger
// (×research average) than her earlier in-flight data did, the rise does not follow the research timing:
// BASELINE cannot tell late adaptation from a slow unexplained change, and says so.
export const CALIBRATION_RISE_LIMIT = 0.25;
// PROTOTYPE DESIGN ASSUMPTION — length of the "recent" window for that comparison.
export const CALIBRATION_RISE_LOOKBACK_DAYS = 30;

export const PROTOTYPE_RULES: { id: string; text: string }[] = [
  {
    id: 'watch',
    text: `WATCH when today's reading is at least ${WATCH_Z} standard deviations from your expected normal in the unhealthy direction, when it passes the general Earth reference today, or when the measure was ACT earlier in the current window.`,
  },
  {
    id: 'act',
    text: `ACT when today's reading is at least ${ACT_Z} standard deviations from your expected normal AND at least ${PERSIST_REQUIRED} of the last ${PERSIST_WINDOW} available days were outside your expected range. Passing a general Earth reference always raises at least WATCH (it is never hidden), but on its own does not escalate to ACT, because those references come from other measurement sites and devices.`,
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
    id: 'calibration',
    text: `Personal calibration: research gives the SHAPE of the expected in-flight change; the astronaut's own in-flight readings set its SIZE. The size is estimated from her readings up to ${CALIBRATION_EXCLUDE_RECENT_DAYS} days ago (so a new problem cannot calibrate itself away), starts from the research group mean, which counts as ${CALIBRATION_PRIOR_WEIGHT} days of evidence, and is limited to ${CALIBRATION_SCALE_MIN}×–${CALIBRATION_SCALE_MAX}× the group mean.`,
  },
  {
    id: 'cantTell',
    text: `"Can't tell" safeguard: personal calibration may make BASELINE MORE cautious, but it is never allowed to turn a reading into a reassuring OK on its own. If a reading is only normal because her personal adaptation estimate is bigger than the research average, or if her most recent ${CALIBRATION_RISE_LOOKBACK_DAYS} days of data imply an adaptation at least ${CALIBRATION_RISE_LIMIT}× bigger than her earlier in-flight data did (the rise does not follow the research timing), the status becomes "Keep an eye on it" with Low confidence. Temperature alone cannot tell late adaptation from a slow unexplained change. Readings at least ${CALIBRATION_TRIM_Z} combined SDs above the expectation are not used to learn what is normal.`,
  },
  {
    id: 'earth',
    text: 'Earth references are shown for context. The adaptation lens can explain a change, but it never hides an Earth-reference crossing.',
  },
];
