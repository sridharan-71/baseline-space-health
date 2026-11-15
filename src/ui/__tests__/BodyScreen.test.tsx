import './setup';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../App';

beforeEach(() => localStorage.clear());

function openBody() {
  render(<App />);
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Screens' })).getByRole('button', { name: 'Body' }));
}

describe('BodyScreen', () => {
  it('FD99 heart region is ACT and opens explainers', () => {
    openBody();
    const heart = screen.getByRole('button', { name: /Heart — status/ });
    expect(heart.getAttribute('aria-label')).toContain('ACT');
    fireEvent.click(heart);
    expect(screen.getByText('When to contact your CMO')).toBeInTheDocument();
  });

  it('keyboard Enter activates a region', () => {
    openBody();
    fireEvent.keyDown(screen.getByRole('button', { name: /Head — status/ }), { key: 'Enter' });
    expect(screen.getAllByText('Why it matters').length).toBe(2); // sleep + mood
  });

  it('FD60: all regions OK', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Guided demo' })); // jumps to FD60
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Screens' })).getByRole('button', { name: 'Body' }));
    for (const r of ['Head', 'Heart', 'Whole body']) {
      expect(screen.getByRole('button', { name: new RegExp(`^${r} — status OK`) })).toBeInTheDocument();
    }
  });
});
