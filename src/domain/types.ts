// Shared types only — no logic lives here.

export type MetricId = 'coreTemp' | 'restingHR' | 'sleepHours' | 'mood';
export type Direction = 'up' | 'down' | 'both'; // which direction is "unhealthy"
export type DataSource = 'SIMULATED' | 'USER_ENTERED';
export type Phase = 'PREFLIGHT' | 'LAUNCH' | 'INFLIGHT';
export type SymptomId =
  | 'fatigue'
  | 'headache'
  | 'feeling_hot'
  | 'chills'
  | 'nausea'
  | 'congestion'
  | 'poor_sleep'
  | 'other';

export interface Reading {
  metricId: MetricId;
  missionDay: number;
  value: number;
  source: DataSource;
}

export interface SelfReport {
  missionDay: number;
  symptoms: SymptomId[];
  note?: string;
  source: DataSource;
}

export interface Astronaut {
  id: string;
  displayName: string;
  isSimulated: true;
}

export interface MissionInput {
  astronaut: Astronaut;
  readings: Reading[];
  selfReports: SelfReport[];
  currentDay: number;
}

export type Status = 'OK' | 'WATCH' | 'ACT' | 'UNKNOWN';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type LayerName =
  | 'DATA_QUALITY'
  | 'PERSONAL_DEVIATION'
  | 'EXPECTED_ADAPTATION'
  | 'PERSISTENCE'
  | 'EARTH_REFERENCE';
export type LayerOutcome = 'PASS' | 'FLAG' | 'NOT_APPLICABLE' | 'FAIL';

export interface LayerResult {
  layer: LayerName;
  outcome: LayerOutcome;
  detail: string;
  evidenceIds: string[];
}

export interface PreflightBaseline {
  mean: number;
  sd: number;
  n: number;
}

export interface ExpectedValue {
  offset: number;
  value: number;
  uncertainty: number;
  /** Personal size of the adaptation relative to the research group mean (1 = same as the group). */
  scale: number;
  /** In-flight days of the astronaut's own data used to estimate `scale` (0 = research curve only). */
  scaleDaysUsed: number;
  modelId: string | null;
}

export interface MetricAssessment {
  metricId: MetricId;
  missionDay: number;
  status: Status;
  confidence: Confidence;
  value: number | null;
  preflight: PreflightBaseline;
  expected: ExpectedValue | null;
  zPreflight: number | null;
  zExpected: number | null;
  persistence: { flaggedOfLastAvailable: number; availableInWindow: number; missingInWindow: number };
  earthCrossed: boolean;
  layers: LayerResult[];
  headline: string;
  nextStep: string;
  reasons: string[];
  /** Plain-English reasons the confidence was lowered (empty when HIGH). */
  confidenceReasons: string[];
  /** True when personal calibration (not the research curve) is what makes this reading look normal. */
  adaptationUncertain?: boolean;
}

export interface DayAssessment {
  missionDay: number;
  phase: Phase;
  overall: Status;
  metrics: MetricAssessment[];
  unknownCount: number;
  selfReport: SelfReport | null;
  cmoSuggested: boolean;
}

export interface LensDay {
  missionDay: number;
  value: number | null;
  earthFlag: boolean | null;
  preflightFlag: boolean | null;
  baselineStatus: Status;
  preflightLow: number;
  preflightHigh: number;
  expectedLow: number | null;
  expectedHigh: number | null;
  expectedValue: number | null;
}

export interface LensComparison {
  metricId: MetricId;
  daysEvaluated: number;
  flagged: { earth: number | null; preflightOnly: number; baseline: number };
  perDay: LensDay[];
}
