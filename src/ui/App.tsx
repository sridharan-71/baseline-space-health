import { Component, useState, type ReactNode } from 'react';
import { MissionProvider, useMission } from '../state/MissionContext';
import { DemoTour, TOUR_FIRST_STEP } from './components/DemoTour';
import { SimulatedBanner } from './components/SimulatedBanner';
import { Tabs } from './components/Tabs';
import { BodyScreen } from './screens/BodyScreen';
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
  return (
    <>
      <SimulatedBanner />
      <header className="app-header">
        <div className="app-header__brand">
          <h1>BASELINE</h1>
          <p className="tagline">Your normal, not Earth's normal.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            setTourOpen(true);
            jumpTo(TOUR_FIRST_STEP.day, TOUR_FIRST_STEP.metricId, TOUR_FIRST_STEP.tab);
          }}
        >
          Guided demo
        </button>
      </header>
      <Tabs />
      <div className={`layout${tourOpen ? ' layout--tour' : ''}`}>
        <main>
          <ErrorBoundary key={activeTab}>
            {activeTab === 'today' && <TodayScreen />}
            {activeTab === 'measure' && <MeasureScreen />}
            {activeTab === 'note' && <CmoNoteScreen />}
            {activeTab === 'body' && <BodyScreen />}
            {activeTab === 'evidence' && <EvidenceScreen />}
          </ErrorBoundary>
        </main>
        {tourOpen && <DemoTour onClose={() => setTourOpen(false)} />}
      </div>
      <footer className="app-footer">SIMULATED DATA · Not a medical device · Built for NASA Space Apps 2026</footer>
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
