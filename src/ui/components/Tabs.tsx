import { useMission, type Tab } from '../../state/MissionContext';

export const TABS: { id: Tab; label: string; hint: string; icon: string }[] = [
  { id: 'today', label: 'Today', hint: 'How she is doing on the chosen day', icon: '◉' },
  { id: 'measure', label: 'Over time', hint: 'One measure across the whole mission', icon: '∿' },
  { id: 'note', label: 'Note to doctor', hint: 'Draft message for the crew medical officer', icon: '✎' },
  { id: 'evidence', label: 'Science & sources', hint: 'Studies, rules, limits and the stress test', icon: '❖' },
];

export function Tabs({ variant = 'top' }: { variant?: 'top' | 'bottom' }) {
  const { activeTab, setActiveTab } = useMission();
  return (
    <nav className={`tabs tabs--${variant}`} aria-label={variant === 'top' ? 'Screens' : 'Screens (mobile)'}>
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.hint}
          className={`tab${activeTab === t.id ? ' tab--active' : ''}`}
          aria-current={activeTab === t.id ? 'page' : undefined}
          onClick={() => {
            setActiveTab(t.id);
            window.scrollTo?.({ top: 0 });
          }}
        >
          {variant === 'bottom' && (
            <span className="tab__icon" aria-hidden="true">
              {t.icon}
            </span>
          )}
          <span className="tab__label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
