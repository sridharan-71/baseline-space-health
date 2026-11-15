import type { MetricAssessment } from '../../engine/index';

const WORD = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' } as const;

export function ConfidenceTag({ assessment }: { assessment: MetricAssessment }) {
  const why = assessment.confidenceReasons;
  const title = why.length > 0 ? `Confidence lowered: ${why.join(' ')}` : 'Full confidence: enough pre-flight data and no gaps.';
  return (
    <span className={`confidence confidence--${assessment.confidence.toLowerCase()}`} title={title}>
      Confidence: {WORD[assessment.confidence]}
    </span>
  );
}
