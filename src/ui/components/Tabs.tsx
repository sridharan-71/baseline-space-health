import { useMission, type Tab } from '../../state/MissionContext';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'measure', label: 'Measure' },
  { id: 'note', label: 'CMO note' },
  { id: 'body', label: 'Body' },
  { id: 'evidence', label: 'Evidence' },
];

export function Tabs() {
  const { activeTab, setActiveTab } = useMission();
  return (
    <nav className="tabs" aria-label="Screens">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tab${activeTab === t.id ? ' tab--active' : ''}`}
          aria-current={activeTab === t.id ? 'page' : undefined}
          onClick={() => setActiveTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
