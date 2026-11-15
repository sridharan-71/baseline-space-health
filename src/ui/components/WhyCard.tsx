import type { LayerOutcome, MetricAssessment } from '../../engine/index';
import { LAYER_QUESTION, layerAnswer } from '../plain';
import { EvidenceChip } from './EvidenceChip';

const ICON: Record<LayerOutcome, string> = { PASS: '✓', FLAG: '!', NOT_APPLICABLE: '–', FAIL: '✕' };

export function WhyCard({ assessment }: { assessment: MetricAssessment }) {
  return (
    <div className="why-card">
      <h4>How BASELINE decided — 5 questions</h4>
      <ol className="why-card__layers">
        {assessment.layers.map((l) => (
          <li key={l.layer} className={`layer layer--${l.outcome.toLowerCase()}`}>
            <div className="layer__head">
              <span className="layer__icon" aria-hidden="true">
                {ICON[l.outcome]}
              </span>
              <strong>{LAYER_QUESTION[l.layer]}</strong>
              <span className="layer__outcome" data-outcome={l.outcome}>
                {layerAnswer(l.layer, l.outcome)}
              </span>
            </div>
            <p className="layer__detail">{l.detail}</p>
            {l.evidenceIds.length > 0 && (
              <div className="chips">
                {l.evidenceIds.map((id) => (
                  <EvidenceChip key={id} id={id} />
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="fine-print">
        “SD” (standard deviation) is the size of your normal day-to-day wobble. 2 SD or more away from your average is unusual.
        These rules are prototype design choices, not medically validated.
      </p>
    </div>
  );
}
