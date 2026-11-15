import { EVIDENCE, EVIDENCE_KIND_LABEL } from '../../engine/index';
import { useMission } from '../../state/MissionContext';

export function scrollToEvidence(id: string) {
  window.setTimeout(() => {
    const el = document.getElementById(`evidence-${id}`);
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

export function EvidenceChip({ id }: { id: string }) {
  const { setActiveTab } = useMission();
  const src = EVIDENCE[id];
  if (!src) return null;
  return (
    <button
      type="button"
      className={`evidence-chip evidence-chip--${src.kind.toLowerCase()}`}
      onClick={() => {
        setActiveTab('evidence');
        scrollToEvidence(id);
      }}
      title="Open in the Evidence page"
    >
      {src.shortCite} <span className="evidence-chip__kind">{EVIDENCE_KIND_LABEL[src.kind]}</span>
    </button>
  );
}
