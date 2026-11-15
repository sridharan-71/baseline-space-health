// The ONLY place research citations live. Values copied from docs/REVISED_PRODUCT_SPEC.md §6
// and the Prompt 02 spec. Nothing here is filled in from memory.

export type EvidenceKind = 'RESEARCH' | 'CLINICAL_REFERENCE' | 'DESIGN_ASSUMPTION';

export interface EvidenceSource {
  id: string;
  kind: EvidenceKind;
  shortCite: string;
  title: string;
  venue: string;
  year: number | null;
  url: string | null;
  population: string;
  finding: string;
  limitations: string;
}

export const EVIDENCE: Record<string, EvidenceSource> = {
  stahn2017: {
    id: 'stahn2017',
    kind: 'RESEARCH',
    shortCite: 'Stahn et al. 2017',
    title: 'Increased core body temperature in astronauts during long-duration space missions',
    venue: 'Scientific Reports 7:16180',
    year: 2017,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5701078',
    population: '11 ISS astronauts (7 men, 4 women), ~6-month missions',
    finding:
      'Resting core body temperature rose about 1 °C above pre-flight, developing gradually and plateauing after about 75 days in flight.',
    limitations:
      "Small sample; group-mean result; measured with a forehead heat-flux 'Double Sensor', not an oral thermometer; sparse in-flight time points (FD15/45/75/105/135/165); one pre-flight session (L-90).",
  },
  norsk2015: {
    id: 'norsk2015',
    kind: 'RESEARCH',
    shortCite: 'Norsk et al. 2015',
    title: 'Fluid shifts, vasodilatation and ambulatory blood pressure reduction during long duration spaceflight',
    venue: 'J Physiol 593:573–584',
    year: 2015,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/4324706/',
    population: '8 middle-aged male ISS astronauts',
    finding: '24-hour ambulatory brachial blood pressure was 8–10 mmHg lower at 3–6 months in flight.',
    limitations:
      'Small, men only; 24-h ambulatory average, not single cuff readings; the time course before 3 months was not measured.',
  },
  barger2014: {
    id: 'barger2014',
    kind: 'RESEARCH',
    shortCite: 'Barger et al. 2014',
    title:
      'Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight',
    venue: 'Lancet Neurology 13:904–912',
    year: 2014,
    url: null,
    population: '85 astronauts (shuttle and ISS); actigraphy and sleep logs',
    finding:
      'Average sleep was about 6 h on ISS missions despite 8.5 h scheduled; sleep was also short (<6.5 h) during pre-flight training.',
    limitations: "Population averages; gives context, not an individual's expected change.",
  },
  cdcFever: {
    id: 'cdcFever',
    kind: 'CLINICAL_REFERENCE',
    shortCite: 'CDC fever definition',
    title: 'Definition of signs and symptoms of ill travelers',
    venue: 'US CDC',
    year: null,
    url: null,
    population: 'General population',
    finding: 'A measured temperature of at least 38.0 °C is considered a fever.',
    limitations:
      "Typically an oral measurement; a different body site and device from BASELINE's simulated sensor. Context only.",
  },
  ahaHeartRate: {
    id: 'ahaHeartRate',
    kind: 'CLINICAL_REFERENCE',
    shortCite: 'AHA resting heart rate',
    title: 'AHA resting heart rate',
    venue: 'American Heart Association',
    year: null,
    url: null,
    population: 'Not stated (general adult range)',
    finding: '60–100 bpm is a normal resting heart rate for most adults; above 100 bpm at rest is considered fast.',
    limitations: "Population range; says nothing about change from a person's own normal.",
  },
  prototypeRules: {
    id: 'prototypeRules',
    kind: 'DESIGN_ASSUMPTION',
    shortCite: 'BASELINE prototype rules',
    title: 'BASELINE prototype rules',
    venue: 'BASELINE team',
    year: null,
    url: null,
    population: 'n/a',
    finding:
      'Statistical thresholds (WATCH at 2.0, ACT at 2.5 with persistence), the data-quality rules and the SD floors were chosen by the BASELINE team for this prototype.',
    limitations: 'Not clinically validated. Tested only on simulated data.',
  },
};

export const EVIDENCE_KIND_LABEL: Record<EvidenceKind, string> = {
  RESEARCH: 'Research',
  CLINICAL_REFERENCE: 'Clinical reference',
  DESIGN_ASSUMPTION: 'Design assumption',
};
