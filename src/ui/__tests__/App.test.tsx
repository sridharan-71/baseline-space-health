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
    for (const name of ['Today', 'Over time', 'Note to doctor', 'Science & sources']) {
      fireEvent.click(within(nav).getByRole('button', { name }));
      expect(screen.getByText(/SIMULATED DATA · Fictional astronaut · Prototype, not a medical device/)).toBeInTheDocument();
    }
  });

  it('guided demo walks through the five-step journey', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '▶ Guided demo' }));
    const tour = screen.getByRole('complementary', { name: 'Guided demo' });
    expect(within(tour).getByRole('heading', { name: /Meet Cmdr\. Asha Rao/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Day 99 in space · Cmdr\. Asha Rao/ })).toBeInTheDocument();
    fireEvent.click(within(tour).getByRole('button', { name: 'Next' }));
    expect(within(tour).getByText(/temperature on day 60/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Core temperature estimate/ })).toBeInTheDocument();
    fireEvent.click(within(tour).getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Same number, different meaning' })).toBeInTheDocument();
    fireEvent.click(within(tour).getByRole('button', { name: 'Next' }));
    expect(within(tour).getByText(/heart rate on day 97/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Resting heart rate/ })).toBeInTheDocument();
    fireEvent.click(within(tour).getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Note to the medical officer · Day 99 in space' })).toBeInTheDocument();
  });

  it('same reading gets different results on day 4 and day 90 (live engine)', () => {
    render(<App />);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Screens' })).getByRole('button', { name: 'Over time' }));
    const panel = screen.getByRole('heading', { name: 'Same number, different meaning' }).closest('section')!;
    const badges = within(panel).getAllByLabelText(/^Status /);
    expect(badges.map((b) => b.getAttribute('aria-label'))).toEqual(['Status WATCH', 'Status OK']);
  });
});
