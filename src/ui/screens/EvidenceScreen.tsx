import { ACT_Z, ADAPTATION_MODELS, EVIDENCE, EVIDENCE_KIND_LABEL, METRICS, PROTOTYPE_RULES, WATCH_Z } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { StressTestTable } from '../components/StressTestTable';
import { LAYER_QUESTION } from '../plain';

const BASIS: { part: string; basis: 'Research' | 'Clinical reference' | 'Design assumption'; note: string }[] = [
  { part: 'Core temperature rises about 1 °C over ~75 days in flight', basis: 'Research', note: 'Stahn et al. 2017, 11 ISS astronauts. Group average, not a personal prediction.' },
  { part: 'Sizing that rise to each astronaut from her own data', basis: 'Design assumption', note: 'Our method. Tested only on simulated astronauts (see stress test).' },
  { part: `“Unusual” = ${WATCH_Z} × her usual wobble; “tell your medical officer” = ${ACT_Z} × on 2 of the last 3 days`, basis: 'Design assumption', note: 'Prototype thresholds. Not medically validated.' },
  { part: 'Heart rate, sleep and mood: compared with her own pre-launch range', basis: 'Design assumption', note: 'No research-based space model is implemented for these.' },
  { part: 'Earth medical limits (e.g. 38 °C)', basis: 'Clinical reference', note: 'Shown for context. Never hidden, but on their own they do not escalate to “Tell your medical officer”.' },
];

export function EvidenceScreen() {
  const { resetUserData, userEntryCount } = useMission();
  return (
    <section className="screen evidence" aria-labelledby="evidence-title">
      <header className="page-head">
        <div>
          <h2 id="evidence-title">Science &amp; sources</h2>
          <p className="muted">
            What BASELINE is based on, what we assumed, and where it can be wrong. Every rule is labelled{' '}
            <strong>Research</strong>, <strong>Clinical reference</strong> or <strong>Design assumption</strong>. All
            astronaut data in this prototype is SIMULATED.
          </p>
        </div>
      </header>

      <div className="evidence-top">
        <section className="panel" aria-labelledby="how-title">
          <h3 id="how-title">How BASELINE reads one measurement</h3>
          <ol className="steps">
            {Object.values(LAYER_QUESTION).map((q, i) => (
              <li key={q}>
                <span className="steps__n">{i + 1}</span> {q}
              </li>
            ))}
          </ol>
          <p className="fine-print">Each measure is checked on its own. BASELINE does not combine measures into a risk score.</p>
        </section>

        <section className="panel" aria-labelledby="basis-title">
          <h3 id="basis-title">Research or assumption?</h3>
          <ul className="basis-list">
            {BASIS.map((b) => (
              <li key={b.part}>
                <span className={`kind-tag kind-tag--${b.basis.toLowerCase().replace(' ', '_')}`}>{b.basis}</span>
                <div>
                  <strong>{b.part}</strong>
                  <p className="muted small">{b.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section id="stress-test" className="panel" aria-labelledby="stress-title">
        <h3 id="stress-title">Stress test: does the method work for a different astronaut?</h3>
        <StressTestTable />
      </section>

      <section className="panel" aria-labelledby="limits-title">
        <h3 id="limits-title">Limitations</h3>
        <ul className="rules">
          <li>All data is simulated. BASELINE has not been tested on real astronaut data and is not clinically validated.</li>
          <li>Only core temperature has a research-based space model, built from a small group (11 astronauts).</li>
          <li>A slow, small unexplained drift in temperature can look the same as normal adaptation. When BASELINE can't tell, it says so and never shows “Normal for you”.</li>
          <li>Astronauts who adapt more strongly or faster than average get more “keep an eye on it” results early in flight (see stress test).</li>
          <li>Thresholds are prototype choices, not medical standards.</li>
        </ul>
        <h4>What BASELINE never does</h4>
        <ul className="rules">
          <li>Diagnose, or name a condition.</li>
          <li>Suggest medicines or doses.</li>
          <li>Replace your crew medical officer — you never need the app's permission to contact them.</li>
          <li>Hide an Earth-reference crossing. The adaptation lens can explain a change; it never hides a line.</li>
        </ul>
      </section>

      <details className="panel disclosure">
        <summary>Research references ({Object.keys(EVIDENCE).length})</summary>
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
      </details>

      <details className="panel disclosure">
        <summary>Model assumptions</summary>
        {ADAPTATION_MODELS.map((m) => (
          <article key={m.id} className="evidence-card">
            <h4>{METRICS[m.metricId].label}</h4>
            <p>{m.summary}</p>
            <p>
              <strong>Evidence strength:</strong> {m.evidenceStrength === 'MODERATE' ? 'Moderate' : 'Low'} · Sources:{' '}
              {m.sourceIds.map((id) => EVIDENCE[id]?.shortCite).join(', ')}
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
        <h4>Prototype rules</h4>
        <p className="warning-text">Prototype statistical rules — not medically validated.</p>
        <ul className="rules">
          {PROTOTYPE_RULES.map((r) => (
            <li key={r.id}>{r.text}</li>
          ))}
        </ul>
      </details>

      <details className="panel disclosure">
        <summary>Data sources and words used in this app</summary>
        <p>
          The astronaut, Cmdr. Asha Rao, is fictional. Her 30 days before launch and 99 days in flight are generated by a
          seeded simulator (seed 2026), so every screen shows the same numbers. Readings you add in the check-in are saved
          only in this browser.
        </p>
        <dl className="glossary">
          <dt>Normal before launch (pre-flight normal)</dt>
          <dd>Her average and usual day-to-day range, from 30 days of readings before launch.</dd>
          <dt>Expected in space</dt>
          <dd>Her normal before launch, shifted by the change that published research found in astronauts (only where such research exists).</dd>
          <dt>Earth medical limit (Earth reference)</dt>
          <dd>A general limit used for everyone on Earth, e.g. 38 °C for temperature. Shown for context only.</dd>
          <dt>SD (standard deviation) / “usual wobble”</dt>
          <dd>The size of her normal day-to-day variation. A reading 2 SD or more from what is expected is unusual.</dd>
          <dt>FD99 / L-30</dt>
          <dd>Mission codes: FD99 = flight day 99 (day 99 in space); L-30 = 30 days before launch.</dd>
          <dt>CMO</dt>
          <dd>Crew medical officer: the crew member trained to give medical care on board.</dd>
          <dt>How sure (confidence)</dt>
          <dd>High, Medium or Low. Lower when data is missing, the pre-launch record is short, or the research behind a rule is weak. Not a probability.</dd>
        </dl>
      </details>

      <section className="panel" aria-labelledby="entries-title">
        <h3 id="entries-title">Your entries</h3>
        <p>
          {userEntryCount > 0
            ? `You have ${userEntryCount} check-in entr${userEntryCount === 1 ? 'y' : 'ies'} saved on this device.`
            : 'No check-in entries saved on this device.'}
        </p>
        <button type="button" className="btn btn--ghost" onClick={resetUserData} disabled={userEntryCount === 0}>
          Reset my entries
        </button>
      </section>
    </section>
  );
}
