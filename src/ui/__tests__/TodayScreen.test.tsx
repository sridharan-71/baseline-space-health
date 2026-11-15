import './setup';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../App';

beforeEach(() => localStorage.clear());

describe('TodayScreen', () => {
  it('renders FD99 with overall ACT, 4 cards and the banner', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /FD99 · Cmdr\. Asha Rao/ })).toBeInTheDocument();
    expect(screen.getAllByLabelText('Status ACT').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.metric-card')).toHaveLength(4);
    expect(screen.getByText(/SIMULATED DATA · Fictional astronaut/)).toBeInTheDocument();
    expect(screen.getByText(/Consider contacting your crew medical officer/)).toBeInTheDocument();
  });

  it('coreTemp card shows Medium confidence, and Why? shows Stahn', () => {
    render(<App />);
    const card = screen.getByTestId('card-coreTemp');
    expect(within(card).getByText('Confidence: Medium')).toBeInTheDocument();
    fireEvent.click(within(card).getByRole('button', { name: 'Why?' }));
    expect(within(card).getByText('Expected space adaptation')).toBeInTheDocument();
    expect(within(card).getAllByText(/Stahn et al\. 2017/).length).toBeGreaterThan(0);
  });

  it('check-in with temperature 99 shows an error', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Check in for FD99' }));
    fireEvent.change(screen.getByLabelText(/Core temperature estimate \(°C\)/), { target: { value: '99' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save check-in' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/between 34 and 42/);
  });

  it('FD98 shows "No reading" on the temperature card; a check-in fills it', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }));
    const card = () => screen.getByTestId('card-coreTemp');
    expect(within(card()).getByText('No reading')).toBeInTheDocument();
    expect(within(card()).getByLabelText('Status UNKNOWN')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Check in for FD98' }));
    fireEvent.change(screen.getByLabelText(/Core temperature estimate \(°C\)/), { target: { value: '37.8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save check-in' }));
    expect(within(card()).getByText('37.80 °C')).toBeInTheDocument();
  });
});
