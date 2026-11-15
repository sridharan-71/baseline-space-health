import { Component, useState, type ReactNode } from 'react';
import { MissionProvider, useMission } from '../state/MissionContext';
import { DemoTour, TOUR_FIRST_STEP } from './components/DemoTour';
import { SimulatedBanner } from './components/SimulatedBanner';
import { Tabs } from './components/Tabs';
import { CmoNoteScreen } from './screens/CmoNoteScreen';
import { EvidenceScreen } from './screens/EvidenceScreen';
import { MeasureScreen } from './screens/MeasureScreen';
import { TodayScreen } from './screens/TodayScreen';

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="screen error-box" role="alert">
          <p>Something went wrong displaying this screen. Your data is unchanged.</p>
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Shell() {
  const { activeTab, jumpTo } = useMission();
  const [tourOpen, setTourOpen] = useState(false);
  const startTour = () => {
    setTourOpen(true);
    jumpTo(TOUR_FIRST_STEP.day, TOUR_FIRST_STEP.metricId, TOUR_FIRST_STEP.tab);
  };
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
              <path d="M4 19 C 10 19, 12 11, 16 11 S 22 19, 28 19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="16" cy="11" r="2.4" fill="#3b5bdb" />
            </svg>
            <div>
              <h1>BASELINE</h1>
              <p className="tagline">Your normal, not Earth's normal.</p>
            </div>
          </div>
          <Tabs />
          <button type="button" className="btn btn--on-dark" onClick={startTour}>
            ▶ Guided demo
          </button>
        </div>
      </header>
      <SimulatedBanner />
      <div className={`layout${tourOpen ? ' layout--tour' : ''}`}>
        <main id="main">
          <ErrorBoundary key={activeTab}>
            {activeTab === 'today' && <TodayScreen onStartDemo={startTour} />}
            {activeTab === 'measure' && <MeasureScreen />}
            {activeTab === 'note' && <CmoNoteScreen />}
            {activeTab === 'evidence' && <EvidenceScreen />}
          </ErrorBoundary>
        </main>
        {tourOpen && <DemoTour onClose={() => setTourOpen(false)} />}
      </div>
      <footer className="app-footer">
        SIMULATED DATA · Not a medical device · Decision-support prototype built for NASA Space Apps 2026
      </footer>
      <Tabs variant="bottom" />
    </>
  );
}

export function App() {
  return (
    <MissionProvider>
      <Shell />
    </MissionProvider>
  );
}

export default App;
