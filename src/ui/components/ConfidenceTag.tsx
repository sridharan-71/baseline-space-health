import type { MetricAssessment } from '../../engine/index';
import { CONFIDENCE_WORD } from '../plain';

/** Confidence is a category with reasons — BASELINE does not compute calibrated probabilities. */
export function ConfidenceTag({ assessment, inline = false }: { assessment: MetricAssessment; inline?: boolean }) {
  const why = assessment.confidenceReasons;
  const reason = why.length > 0 ? `Lower because: ${why.join(' ')}` : 'Enough data before launch and no missing days.';
  return (
    <p className={`confidence confidence--${assessment.confidence.toLowerCase()}${inline ? ' confidence--inline' : ''}`} title={reason}>
      <span className="confidence__meter" aria-hidden="true">
        <i /><i /><i />
      </span>
      <span className="confidence__word">How sure: {CONFIDENCE_WORD[assessment.confidence]}</span>
      {!inline && <span className="confidence__why">{reason}</span>}
    </p>
  );
}
