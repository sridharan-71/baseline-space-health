import './setup';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../App';
import { compareLenses } from '../../engine/index';
import { generateDemoMission } from '../../data/simulated/mission';

beforeEach(() => localStorage.clear());

function openMeasure() {
  render(<App />);
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Screens' })).getByRole('button', { name: 'Measure' }));
}

describe('MeasureScreen', () => {
  it('lens tiles match the engine for coreTemp', () => {
    openMeasure();
    const expected = compareLenses(generateDemoMission(2026), 'coreTemp', 99).flagged;
    expect(within(screen.getByTestId('lens-earth')).getByText(String(expected.earth))).toBeInTheDocument();
    expect(within(screen.getByTestId('lens-preflight')).getByText(String(expected.preflightOnly))).toBeInTheDocument();
    expect(within(screen.getByTestId('lens-baseline')).getByText(String(expected.baseline))).toBeInTheDocument();
  });

  it('restingHR shows an Earth count of 0', () => {
    openMeasure();
    fireEvent.click(screen.getByRole('button', { name: 'Resting heart rate' }));
    expect(within(screen.getByTestId('lens-earth')).getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/No research-based adaptation model for this measure — compared/)).toBeInTheDocument();
  });

  it('sleep has no Earth reference', () => {
    openMeasure();
    fireEvent.click(screen.getByRole('button', { name: 'Sleep' }));
    expect(screen.getByText('No Earth reference for this measure')).toBeInTheDocument();
  });

  it('FD60 quick button shows Expected space adaptation PASS', () => {
    openMeasure();
    fireEvent.click(screen.getByRole('button', { name: 'FD60' }));
    expect(screen.getByLabelText('Mission day: FD60')).toBeInTheDocument();
    const layer = screen.getByText('Expected space adaptation').closest('li')!;
    expect(within(layer).getByText('PASS')).toBeInTheDocument();
    const pre = screen.getByText('Compared with your pre-flight normal').closest('li')!;
    expect(within(pre).getByText('FLAG')).toBeInTheDocument();
  });
});
