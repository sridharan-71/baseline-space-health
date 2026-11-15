import { METRICS, METRIC_ORDER, SYMPTOM_LABELS, formatValue } from '../domain/metrics';
import { formatDay, phaseOf } from '../domain/phase';
import type { Confidence, DayAssessment, MissionInput } from '../domain/types';
import { getAdaptationModel } from '../evidence/adaptation';
import { EVIDENCE } from '../evidence/sources';
import { MAX_LOOKBACK_DAYS } from './config';
import { getReading } from './readings';

const CONF_WORD: Record<Confidence, string> = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };

function dataGaps(day: DayAssessment, input: MissionInput): string[] {
  const gaps: string[] = [];
  const phase = phaseOf(day.missionDay);
  for (const id of METRIC_ORDER) {
    for (let d = day.missionDay - MAX_LOOKBACK_DAYS + 1; d <= day.missionDay; d++) {
      if (d === 0 || phaseOf(d) !== phase) continue;
      if (!getReading(input.readings, id, d)) gaps.push(`${METRICS[id].label} on ${formatDay(d)}`);
    }
  }
  return gaps;
}

export function buildCmoNote(day: DayAssessment, input: MissionInput): string {
  const dayText = formatDay(day.missionDay);
  const flagged = day.metrics.filter((m) => m.status === 'WATCH' || m.status === 'ACT');
  const symptoms = day.selfReport?.symptoms ?? [];
  const symptomSentence =
    symptoms.length > 0 ? ` Self-reported: ${symptoms.map((s) => SYMPTOM_LABELS[s]).join(', ')}.` : '';
  const gaps = dataGaps(day, input);
  const gapLine = `Data gaps in the last ${MAX_LOOKBACK_DAYS} days: ${gaps.length > 0 ? gaps.join(', ') : 'none'}.`;

  const lines: string[] = [
    'SIMULATED DATA — BASELINE prototype, not a medical device. Drafted by the app; reviewed and edited by the astronaut before sending.',
    '',
    `To: Crew Medical Officer   From: ${input.astronaut.displayName}   Day: ${dayText}`,
    '',
  ];

  if (flagged.length === 0) {
    lines.push(`S — Situation: Nothing flagged by BASELINE today.${symptomSentence}`);
    lines.push('');
    lines.push('B — Background:');
    lines.push(`- ${gapLine}`);
    lines.push('');
    lines.push('A — Assessment (app output only, not a clinical judgement): all assessed measures within the expected range.');
    lines.push('');
    lines.push('R — Request: No review needed unless I add something below.');
    return lines.join('\n');
  }

  lines.push(
    `S — Situation: BASELINE marked ${flagged.map((m) => `${METRICS[m.metricId].label} (${m.status})`).join(', ')} on ${dayText}.${symptomSentence}`,
  );
  lines.push('');
  lines.push('B — Background:');
  for (const m of flagged) {
    const def = METRICS[m.metricId];
    const d = def.decimals;
    const pre = `pre-flight normal ${m.preflight.mean.toFixed(Math.max(d, 1))} ± ${formatValue(m.metricId, m.preflight.sd, Math.max(d, 1))} (n = ${m.preflight.n})`;
    let exp = 'no adaptation model; compared with pre-flight normal';
    const model = getAdaptationModel(m.metricId);
    if (m.expected && model) {
      const cite = model.sourceIds
        .map((id) => EVIDENCE[id])
        .filter((s) => s && s.kind === 'RESEARCH')
        .map((s) => s!.shortCite)
        .join(', ');
      exp = `expected today ${formatValue(m.metricId, m.expected.value)} per ${cite} (group-mean curve; design assumption)`;
    }
    lines.push(`- ${def.label}: ${pre}; ${exp}.`);
  }
  lines.push(`- ${gapLine}`);
  lines.push('');
  lines.push('A — Assessment (app output only, not a clinical judgement):');
  for (const m of flagged) {
    const def = METRICS[m.metricId];
    const value = m.value === null ? 'no reading' : `${formatValue(m.metricId, m.value)} today`;
    lines.push(
      `- ${def.label} — ${m.status}: ${value}; outside the expected range on ${m.persistence.flaggedOfLastAvailable} of the last ${m.persistence.availableInWindow} available days${m.earthCrossed ? '; past the general Earth reference' : ''}; confidence ${CONF_WORD[m.confidence]}.`,
    );
  }
  lines.push('');
  lines.push('R — Request: Please review these readings and advise me on next steps.');
  return lines.join('\n');
}
