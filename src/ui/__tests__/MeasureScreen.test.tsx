import './setup';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../App';
import { compareLenses } from '../../engine/index';
import { generateDemoMission } from '../../data/simulated/mission';

beforeEach(() => localStorage.clear());

function openMeasure() {
  render(<App />);
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Screens' })).getByRole('button', { name: 'Over time' }));
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
    expect(screen.getByText(/No published research says how this measure changes in space/)).toBeInTheDocument();
  });

  it('sleep has no Earth reference', () => {
    openMeasure();
    fireEvent.click(screen.getByRole('button', { name: 'Sleep' }));
    expect(screen.getByText('No Earth reference for this measure')).toBeInTheDocument();
  });

  it('FD60 quick button shows Expected space adaptation PASS', () => {
    openMeasure();
    fireEvent.click(screen.getByRole('button', { name: 'FD60' }));
    expect(screen.getByLabelText(/Drag to pick a day: Day 60 in space/)).toBeInTheDocument();
    const layer = screen.getByText('Is it still different after allowing for normal space changes?').closest('li')!;
    expect(within(layer).getByText('No')).toBeInTheDocument();
    const pre = screen.getByText('Is it different from your normal before launch?').closest('li')!;
    expect(within(pre).getByText('Yes')).toBeInTheDocument();
  });
});
