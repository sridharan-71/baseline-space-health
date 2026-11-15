import { useMemo, useState } from 'react';
import { ROLLING_WINDOW_DAYS, runStressTest, type MethodResult, type StressRow } from '../../engine/index';

const METHODS: { key: 'earth' | 'preflightOnly' | 'rolling' | 'baseline'; name: string }[] = [
  { key: 'earth', name: 'Earth limit only' },
  { key: 'preflightOnly', name: 'Pre-launch normal only' },
  { key: 'rolling', name: `Last ${ROLLING_WINDOW_DAYS} days only` },
  { key: 'baseline', name: 'BASELINE' },
];

function Cell({ r, total, best }: { r: MethodResult; total: number; best?: boolean }) {
  const caught = r.episodeCaught;
  const missed = caught !== null && caught < total;
  return (
    <td className={best ? 'stress__cell stress__cell--ours' : 'stress__cell'}>
      <span className={r.falseAlerts > 0 ? 'stress__bad' : 'stress__good'}>{r.falseAlerts} false</span>
      <br />
      {caught === null ? (
        <span className="muted">no problem to catch</span>
      ) : (
        <span className={missed ? 'stress__bad' : 'stress__good'}>
          caught {caught}/{total}
        </span>
      )}
      {r.falseMedicalAlerts !== null && r.falseMedicalAlerts > 0 && (
        <>
          <br />
          <span className="stress__bad small">{r.falseMedicalAlerts} told doctor</span>
        </>
      )}
    </td>
  );
}

function MethodCard({ name, r, total, ours }: { name: string; r: MethodResult; total: number; ours: boolean }) {
  const caught = r.episodeCaught;
  return (
    <div className={`st-method${ours ? ' st-method--ours' : ''}`}>
      <p className="st-method__name">{name}</p>
      <div className="st-method__row">
        <span className={`st-num ${r.falseAlerts > 0 ? 'st-num--bad' : 'st-num--good'}`}>{r.falseAlerts}</span>
        <span className="st-method__label">false alerts</span>
      </div>
      <div className="st-method__row">
        {caught === null ? (
          <span className="st-method__label">No problem to catch</span>
        ) : (
          <>
            <span className={`st-num ${caught < total ? 'st-num--bad' : 'st-num--good'}`}>
              {caught}/{total}
            </span>
            <span className="st-method__label">problem days caught</span>
          </>
        )}
      </div>
      {r.falseMedicalAlerts !== null && (
        <div className="st-method__row">
          <span className={`st-num ${r.falseMedicalAlerts > 0 ? 'st-num--bad' : 'st-num--good'}`}>{r.falseMedicalAlerts}</span>
          <span className="st-method__label">false alerts that reached “Tell your medical officer”</span>
        </div>
      )}
    </div>
  );
}

/** Live results of the real engine on hypothetical astronauts. Nothing here is hard-coded. */
export function StressTestTable() {
  const rows: StressRow[] = useMemo(() => runStressTest(), []);
  const [sel, setSel] = useState(rows[0]!.scenario.id);
  const row = rows.find((r) => r.scenario.id === sel)!;
  const weak = (r: StressRow) => r.baseline.falseAlerts > 0 || (r.baseline.episodeCaught !== null && r.baseline.episodeCaught < r.problemDaysWithData);

  return (
    <div className="stress">
      <p className="lead">
        The demo astronaut follows the research average, which flatters BASELINE. So the <strong>same engine</strong> runs
        on 8 simulated astronauts who adapt differently. Pick one.
      </p>
      <dl className="st-key">
        <div><dt>False alert</dt><dd>an alert on a day with no problem</dd></div>
        <div><dt>Caught</dt><dd>planted problem days that were flagged</dd></div>
      </dl>

      <div className="st-scenarios" role="group" aria-label="Choose a hypothetical astronaut">
        {rows.map((r) => (
          <button
            key={r.scenario.id}
            type="button"
            className={`st-chip${sel === r.scenario.id ? ' st-chip--on' : ''}`}
            aria-pressed={sel === r.scenario.id}
            onClick={() => setSel(r.scenario.id)}
          >
            {r.scenario.label}
            {weak(r) && <span className="st-chip__weak">weak spot</span>}
          </button>
        ))}
      </div>

      <div className="st-detail">
        <p className="st-detail__title">{row.scenario.label}</p>
        <p className="muted">{row.scenario.description}</p>
        <div className="st-methods">
          {METHODS.map((m) => (
            <MethodCard key={m.key} name={m.name} r={row[m.key]} total={row.problemDaysWithData} ours={m.key === 'baseline'} />
          ))}
        </div>
      </div>

      <div className="st-callouts">
        <div className="st-callout st-callout--good">
          <p className="st-callout__title">Flaw found and fixed</p>
          <p>
            Over 20 random simulated runs, the first version missed a slow drift in <strong>15 of 20</strong>. After adding
            the “can't tell” safeguard: <strong>0 of 20</strong> missed.
          </p>
        </div>
        <div className="st-callout st-callout--bad">
          <p className="st-callout__title">Weak spots we keep visible</p>
          <ul>
            {rows.filter(weak).map((r) => (
              <li key={r.scenario.id}>
                {r.scenario.label}: {r.baseline.falseAlerts} false alerts
                {r.baseline.falseMedicalAlerts ? `, ${r.baseline.falseMedicalAlerts} reached “Tell your medical officer”` : ''}
              </li>
            ))}
            <li>A slow drift that starts in the first ~6 weeks can look exactly like normal adaptation.</li>
          </ul>
        </div>
      </div>

      <details className="disclosure disclosure--inline">
        <summary>All scenarios as one table</summary>
        <div className="stress__scroll">
          <table className="stress__table">
            <thead>
              <tr>
                <th scope="col">Hypothetical astronaut (temperature)</th>
                {METHODS.map((m) => <th key={m.key} scope="col">{m.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.scenario.id}>
                  <th scope="row">
                    <strong>{r.scenario.label}</strong>
                    <br />
                    <span className="muted small">{r.scenario.description}</span>
                  </th>
                  <Cell r={r.earth} total={r.problemDaysWithData} />
                  <Cell r={r.preflightOnly} total={r.problemDaysWithData} />
                  <Cell r={r.rolling} total={r.problemDaysWithData} />
                  <Cell r={r.baseline} total={r.problemDaysWithData} best />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="fine-print">
        One simulated mission per scenario (seed 2026). 20-seed and adversarial results: research/10_ADVERSARIAL_STRESS_TEST_RESULTS.md.
        Simulated test results — not clinical accuracy.
      </p>
    </div>
  );
}
