import './setup';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../App';

beforeEach(() => localStorage.clear());

describe('App', () => {
  it('renders BASELINE and the SIMULATED banner', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'BASELINE' })).toBeInTheDocument();
    expect(screen.getByText(/SIMULATED DATA · Fictional astronaut/)).toBeInTheDocument();
  });

  it('shows the SIMULATED banner on every tab', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Screens' });
    for (const name of ['Today', 'Measure', 'CMO note', 'Body', 'Evidence']) {
      fireEvent.click(within(nav).getByRole('button', { name }));
      expect(screen.getByText(/SIMULATED DATA · Fictional astronaut · Prototype, not a medical device/)).toBeInTheDocument();
    }
  });

  it('guided demo walks through the four steps', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Guided demo' }));
    const tour = screen.getByRole('complementary', { name: 'Guided demo' });
    expect(within(tour).getByText(/FD60 core temperature/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Core temperature estimate/ })).toBeInTheDocument();
    fireEvent.click(within(tour).getByRole('button', { name: 'Next' }));
    expect(within(tour).getByText(/FD97 resting heart rate/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Resting heart rate/ })).toBeInTheDocument();
    fireEvent.click(within(tour).getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: /FD98 · Cmdr\. Asha Rao/ })).toBeInTheDocument();
    expect(within(tour).getByText(/UNKNOWN/)).toBeInTheDocument();
    fireEvent.click(within(tour).getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'CMO note · FD99' })).toBeInTheDocument();
  });
});
