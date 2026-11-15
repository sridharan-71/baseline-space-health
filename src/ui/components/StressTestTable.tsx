import { useMemo } from 'react';
import { ROLLING_WINDOW_DAYS, runStressTest, type MethodResult, type StressRow } from '../../engine/index';

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

/** Live results of the real engine on hypothetical astronauts. Nothing here is hard-coded. */
export function StressTestTable() {
  const rows: StressRow[] = useMemo(() => runStressTest(), []);
  return (
    <div className="stress">
      <p>
        The main demo astronaut was simulated to follow the research average exactly, so a method built on that average is
        bound to look good on her. That's not a fair test. Here the <strong>same engine</strong> runs on hypothetical
        astronauts who adapt differently (all SIMULATED). Real individual differences are not published in a form we can
        use, so these are “what if” cases, not research findings.
      </p>
      <div className="stress__scroll">
        <table className="stress__table">
          <thead>
            <tr>
              <th scope="col">Hypothetical astronaut (temperature)</th>
              <th scope="col">Earth limit only</th>
              <th scope="col">Pre-launch normal only</th>
              <th scope="col">Last {ROLLING_WINDOW_DAYS} days only</th>
              <th scope="col">BASELINE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.scenario.id}>
                <th scope="row">
                  <strong>{row.scenario.label}</strong>
                  <br />
                  <span className="muted small">{row.scenario.description}</span>
                </th>
                <Cell r={row.earth} total={row.problemDaysWithData} />
                <Cell r={row.preflightOnly} total={row.problemDaysWithData} />
                <Cell r={row.rolling} total={row.problemDaysWithData} />
                <Cell r={row.baseline} total={row.problemDaysWithData} best />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small">
        <strong>How to read it:</strong> “false” = alerts on days with no problem. “caught” = problem days flagged.
        “told doctor” = false alerts that reached “Tell your medical officer”.
      </p>
      <p className="small">
        <strong>What it shows honestly:</strong> On a slow drift, a rolling “last {ROLLING_WINDOW_DAYS} days” baseline
        quietly adapts and misses it. The Earth limit only catches drifts that happen to cross 38 °C — it misses the
        non-adapter's drift completely. BASELINE catches it on its own data, mostly as “Keep an eye on it — can't tell”,
        because temperature alone cannot prove whether a slow rise is late adaptation or something else.
        BASELINE's weak spots: astronauts who adapt much faster or later than the research curve get extra alerts, and a
        drift that starts in the first ~6 weeks can look exactly like normal adaptation.
      </p>
      <p className="small muted">
        This table is one simulated mission per row (seed 2026). Results over 20 random seeds and 36 harder
        “adversarial” cases are in research/10_ADVERSARIAL_STRESS_TEST_RESULTS.md. None of this is clinical
        performance.
      </p>
    </div>
  );
}
