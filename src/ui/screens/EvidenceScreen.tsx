import { ACT_Z, ADAPTATION_MODELS, EVIDENCE, EVIDENCE_KIND_LABEL, METRICS, PROTOTYPE_RULES, WATCH_Z } from '../../engine/index';
import { useMission } from '../../state/MissionContext';
import { StressTestTable } from '../components/StressTestTable';

const STEPS = ['Usable reading?', 'Unusual for her?', 'Still unusual after the expected space change?', 'Lasted more than a day?', 'Past an Earth limit?'];

const RESEARCH: [string, string][] = [
  ['Core temperature rises about 1 °C over ~75 days in flight', 'Stahn et al. 2017 · 11 ISS astronauts · group average'],
  ['Earth medical limits, e.g. 38 °C', 'Clinical reference · shown for context only'],
];
const ASSUMED: string[] = [
  'Sizing that rise to each astronaut from her own data',
  `“Unusual” = ${WATCH_Z} SD · “Tell your medical officer” = ${ACT_Z} SD`,
  'Unusual on 2 of the last 3 days to escalate',
  'Heart rate, sleep and mood: her own history only (no space model)',
];

export function EvidenceScreen() {
  const { resetUserData, userEntryCount } = useMission();
  return (
    <section className="screen evidence" aria-labelledby="evidence-title">
      <header className="page-head">
        <div>
          <h2 id="evidence-title">Science &amp; sources</h2>
          <p className="muted">What BASELINE is built on, what we assumed, and where it can be wrong. All data is simulated.</p>
        </div>
      </header>

      <section className="card" aria-labelledby="how-title">
        <h3 id="how-title">How BASELINE reads one measurement</h3>
        <ol className="chain">
          {STEPS.map((q, i) => (
            <li key={q} className={i === 2 ? 'chain__step chain__step--key' : 'chain__step'}>
              <span className="chain__n">{i + 1}</span>
              {q}
            </li>
          ))}
        </ol>
        <p className="fine-print">Step 3 uses a research model for core temperature only. Each measure is judged on its own — no combined risk score.</p>
      </section>

      <section className="card" aria-labelledby="basis-title">
        <h3 id="basis-title">Research or our assumption?</h3>
        <div className="two-col">
          <div className="side side--research">
            <p className="side__title">From published sources</p>
            <ul>
              {RESEARCH.map(([t, n]) => (
                <li key={t}>
                  <strong>{t}</strong>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="side side--assumed">
            <p className="side__title">Our design choices · not medically validated</p>
            <ul>
              {ASSUMED.map((t) => (
                <li key={t}>
                  <strong>{t}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="stress-test" className="card" aria-labelledby="stress-title">
        <h3 id="stress-title">Stress test: does it work for a different astronaut?</h3>
        <StressTestTable />
      </section>

      <section className="card" aria-labelledby="limits-title">
        <div className="two-col">
          <div>
            <h3 id="limits-title">Known limitations</h3>
            <ul className="rules">
              <li>All data is simulated — not tested on real astronauts, not clinically validated.</li>
              <li>Only core temperature has a space model, from a small study (11 astronauts).</li>
              <li>A slow, early temperature drift can look like adaptation. Then BASELINE says it can't tell.</li>
              <li>Fast or strong adapters get extra alerts early in flight.</li>
            </ul>
          </div>
          <div>
            <h3>What BASELINE never does</h3>
            <ul className="rules">
              <li>Diagnose or name a condition</li>
              <li>Suggest medicines or doses</li>
              <li>Replace the crew medical officer</li>
              <li>Hide an Earth-limit crossing</li>
            </ul>
          </div>
        </div>
      </section>

      <details className="card disclosure">
        <summary>Sources and references ({Object.keys(EVIDENCE).length})</summary>
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

      <details className="card disclosure">
        <summary>Model details and prototype rules</summary>
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

      <details className="card disclosure">
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
        <p className="fine-print">
          {userEntryCount > 0
            ? `You have ${userEntryCount} check-in entr${userEntryCount === 1 ? 'y' : 'ies'} saved on this device.`
            : 'No check-in entries saved on this device.'}{' '}
          <button type="button" className="linklike" onClick={resetUserData} disabled={userEntryCount === 0}>
            Reset my entries
          </button>
        </p>
      </details>

    </section>
  );
}
