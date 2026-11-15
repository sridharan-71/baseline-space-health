import { ADAPTATION_MODELS, EVIDENCE, EVIDENCE_KIND_LABEL, METRICS, PROTOTYPE_RULES } from '../../engine/index';
import { useMission } from '../../state/MissionContext';

export function EvidenceScreen() {
  const { resetUserData, userEntryCount } = useMission();
  return (
    <section className="screen evidence" aria-labelledby="evidence-title">
      <h2 id="evidence-title">Evidence</h2>
      <p>
        Every rule in BASELINE is labelled either <strong>Research</strong>, <strong>Clinical reference</strong> or{' '}
        <strong>Design assumption</strong>. Astronaut data in this prototype is SIMULATED.
      </p>

      <h3>1. Research and references</h3>
      <div className="evidence-list">
        {Object.values(EVIDENCE).map((e) => (
          <article key={e.id} id={`evidence-${e.id}`} className="evidence-card">
            <header>
              <span className={`kind-tag kind-tag--${e.kind.toLowerCase()}`}>{EVIDENCE_KIND_LABEL[e.kind]}</span>
              <h4>{e.shortCite}</h4>
            </header>
            <p className="evidence-card__title">
              {e.title}. <em>{e.venue}</em>
              {e.year ? ` (${e.year})` : ''}.
            </p>
            <dl>
              <dt>Population</dt>
              <dd>{e.population}</dd>
              <dt>Finding</dt>
              <dd>{e.finding}</dd>
              <dt>Limitations</dt>
              <dd>{e.limitations}</dd>
            </dl>
            {e.url && (
              <a href={e.url} target="_blank" rel="noreferrer">
                Read the source
              </a>
            )}
          </article>
        ))}
      </div>

      <h3>2. Expected-adaptation models</h3>
      {ADAPTATION_MODELS.map((m) => (
        <article key={m.id} className="evidence-card">
          <h4>{METRICS[m.metricId].label}</h4>
          <p>{m.summary}</p>
          <p>
            <strong>Evidence strength:</strong> {m.evidenceStrength === 'MODERATE' ? 'Moderate' : 'Low'} · Sources:{' '}
            {m.sourceIds.map((id) => EVIDENCE[id]?.shortCite).join(', ')}
          </p>
          <p>
            <strong>Design assumptions:</strong>
          </p>
          <ul>
            {m.designAssumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </article>
      ))}
      <p className="muted">
        Resting heart rate, sleep and mood have no research-based adaptation model, so BASELINE compares them with your
        pre-flight normal and says so.
      </p>

      <h3>3. Prototype rules</h3>
      <p className="warning-text">Prototype statistical rules — not medically validated.</p>
      <ul className="rules">
        {PROTOTYPE_RULES.map((r) => (
          <li key={r.id}>{r.text}</li>
        ))}
      </ul>

      <h3>4. What BASELINE never does</h3>
      <ul className="rules">
        <li>Diagnose, or name a condition.</li>
        <li>Suggest medicines or doses.</li>
        <li>Replace your crew medical officer — you never need the app's permission to contact them.</li>
        <li>Hide an Earth-reference crossing. The adaptation lens can explain a change; it never hides a line.</li>
      </ul>

      <h3>Your entries</h3>
      <p>
        {userEntryCount > 0
          ? `You have ${userEntryCount} check-in entr${userEntryCount === 1 ? 'y' : 'ies'} saved on this device.`
          : 'No check-in entries saved on this device.'}
      </p>
      <button type="button" className="btn btn--ghost" onClick={resetUserData} disabled={userEntryCount === 0}>
        Reset my entries
      </button>
    </section>
  );
}
