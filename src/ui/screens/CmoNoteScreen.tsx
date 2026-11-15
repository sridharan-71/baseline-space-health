import { useEffect, useRef, useState } from 'react';
import { formatDay, formatValue } from '../../engine/index';
import { useCmoNote, useDayAssessment, useMission } from '../../state/MissionContext';
import { StatusBadge } from '../components/StatusBadge';
import { DayStepper } from '../components/DayStepper';
import { CONFIDENCE_WORD, SHORT_LABEL, friendlyDay, referenceFor } from '../plain';

export function CmoNoteScreen() {
  const { selectedDay } = useMission();
  const day = useDayAssessment();
  const draft = useCmoNote();
  const [text, setText] = useState(draft);
  const [edited, setEdited] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!edited) setText(draft);
  }, [draft, edited]);

  useEffect(() => setMsg(null), [selectedDay]);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        ref.current?.select();
        if (!document.execCommand('copy')) throw new Error('copy failed');
      }
      setMsg('Copied');
    } catch {
      setMsg('Copy failed — select the text and copy manually.');
    }
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baseline-cmo-note-${formatDay(selectedDay)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMsg('Downloaded');
  }

  const sections = parseSbar(text);
  const flagged = day.metrics.filter((m) => m.status === 'WATCH' || m.status === 'ACT');

  return (
    <section className="screen" aria-labelledby="note-title">
      <header className="page-head">
        <div>
          <h2 id="note-title">Note to the medical officer · {friendlyDay(selectedDay)}</h2>
          <p className="muted">
            A first draft for the <strong>crew medical officer</strong> (CMO) — the crew member trained to give medical
            care on board. She reviews and edits it before sharing. Format: SBAR, the structure hospital teams use for
            handovers.
          </p>
        </div>
        <DayStepper compact />
      </header>

      <div className={`note-status note-status--${day.overall.toLowerCase()}`}>
        <StatusBadge status={day.overall} large />
        <p className="overall__summary">
          {day.cmoSuggested ? 'BASELINE suggests sending this to the crew medical officer.' : 'Nothing needs reporting today'}
        </p>
      </div>

      <div className="note-layout">
        <div className="sbar" aria-label="Note preview">
          {SBAR.map((k) => (
            <article key={k.key} className="sbar__section">
              <span className="sbar__letter" aria-hidden="true">{k.key}</span>
              <div>
                <h3>{k.title}</h3>
                <p className="sbar__hint">{k.hint}</p>
                {(sections[k.key] ?? []).length > 0 ? (
                  <ul className="sbar__lines">
                    {sections[k.key]!.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Empty — add text in the editor.</p>
                )}
                {k.key === 'A' && flagged.length > 0 && (
                  <table className="support">
                    <caption>Supporting readings</caption>
                    <thead>
                      <tr><th scope="col">Measure</th><th scope="col">{formatDay(selectedDay)}</th><th scope="col">Compared with</th><th scope="col">Unusual days</th><th scope="col">How sure</th></tr>
                    </thead>
                    <tbody>
                      {flagged.map((m) => {
                        const ref = referenceFor(m);
                        return (
                          <tr key={m.metricId}>
                            <th scope="row">{SHORT_LABEL[m.metricId]}</th>
                            <td>{m.value === null ? 'No reading' : formatValue(m.metricId, m.value)}</td>
                            <td>{ref ? `${formatValue(m.metricId, ref.value)} (${ref.kind === 'space-model' ? 'expected in space' : 'usual before launch'})` : '—'}</td>
                            <td>{m.persistence.flaggedOfLastAvailable} of last {m.persistence.availableInWindow}</td>
                            <td>{CONFIDENCE_WORD[m.confidence]}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="note-editor panel">
          <header className="panel__head">
            <h3>Review and edit before sharing</h3>
            {edited && <span className="panel__meta">Edited</span>}
          </header>
          <p className="notice">Draft generated by a prototype from SIMULATED data. Review before sending. BASELINE does not diagnose.</p>
          <label htmlFor="cmo-note" className="visually-hidden">
            CMO note draft
          </label>
          <textarea
            id="cmo-note"
            ref={ref}
            className="note-text"
            rows={18}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setEdited(true);
            }}
          />
          <div className="note-actions">
            <button type="button" className="btn btn--primary" onClick={copy}>
              Copy note
            </button>
            <button type="button" className="btn btn--ghost" onClick={download}>
              Download .txt
            </button>
            {edited && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setEdited(false);
                  setText(draft);
                }}
              >
                Reset to draft
              </button>
            )}
            {msg && (
              <span className="success" role="status">
                {msg}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const SBAR: { key: 'S' | 'B' | 'A' | 'R'; title: string; hint: string }[] = [
  { key: 'S', title: 'Situation', hint: 'What is happening now' },
  { key: 'B', title: 'Background', hint: 'Her normal values and data gaps' },
  { key: 'A', title: 'Assessment', hint: 'What the app found — not a clinical judgement' },
  { key: 'R', title: 'Request', hint: 'What she is asking the medical officer for' },
];

/** Splits the plain-text note into its S/B/A/R parts so the preview follows the user's edits. */
function parseSbar(text: string): Partial<Record<'S' | 'B' | 'A' | 'R', string[]>> {
  const out: Partial<Record<'S' | 'B' | 'A' | 'R', string[]>> = {};
  let cur: 'S' | 'B' | 'A' | 'R' | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const m = /^([SBAR]) — [A-Za-z]+(?: \([^)]*\))?:\s*(.*)$/.exec(line);
    if (m) {
      cur = m[1] as 'S' | 'B' | 'A' | 'R';
      out[cur] = m[2] ? [m[2]] : [];
      continue;
    }
    if (cur && line) out[cur]!.push(line.replace(/^-\s*/, ''));
  }
  return out;
}
