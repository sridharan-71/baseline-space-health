import type { LayerName, LayerOutcome, MetricAssessment } from '../../engine/index';
import { EvidenceChip } from './EvidenceChip';

const LAYER_LABEL: Record<LayerName, string> = {
  DATA_QUALITY: 'Data quality',
  PERSONAL_DEVIATION: 'Compared with your pre-flight normal',
  EXPECTED_ADAPTATION: 'Expected space adaptation',
  PERSISTENCE: 'Persistence',
  EARTH_REFERENCE: 'Earth reference',
};
const OUTCOME: Record<LayerOutcome, { icon: string; word: string }> = {
  PASS: { icon: '✓', word: 'PASS' },
  FLAG: { icon: '!', word: 'FLAG' },
  NOT_APPLICABLE: { icon: '–', word: 'N/A' },
  FAIL: { icon: '✕', word: 'FAIL' },
};

export function WhyCard({ assessment }: { assessment: MetricAssessment }) {
  return (
    <div className="why-card">
      <h4>Why?</h4>
      <ol className="why-card__layers">
        {assessment.layers.map((l) => (
          <li key={l.layer} className={`layer layer--${l.outcome.toLowerCase()}`}>
            <div className="layer__head">
              <span className="layer__icon" aria-hidden="true">
                {OUTCOME[l.outcome].icon}
              </span>
              <strong>{LAYER_LABEL[l.layer]}</strong>
              <span className="layer__outcome">{OUTCOME[l.outcome].word}</span>
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
      <p className="fine-print">Rules are prototype design choices, not medically validated.</p>
    </div>
  );
}
