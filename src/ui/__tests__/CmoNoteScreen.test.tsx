import './setup';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { App } from '../App';

beforeEach(() => localStorage.clear());

function openNote() {
  render(<App />);
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Screens' })).getByRole('button', { name: 'CMO note' }));
}

describe('CmoNoteScreen', () => {
  it('FD99 draft has SBAR and SIMULATED', () => {
    openNote();
    const ta = screen.getByLabelText('CMO note draft') as HTMLTextAreaElement;
    expect(ta.value).toContain('S —');
    expect(ta.value).toContain('SIMULATED');
    expect(screen.getByText(/BASELINE does not diagnose/)).toBeInTheDocument();
  });

  it('Download builds a Blob', () => {
    const create = vi.fn(() => 'blob:x');
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    openNote();
    fireEvent.click(screen.getByRole('button', { name: 'Download .txt' }));
    expect(create).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it('editing shows Reset to draft, which restores the draft', () => {
    openNote();
    const ta = screen.getByLabelText('CMO note draft') as HTMLTextAreaElement;
    const original = ta.value;
    fireEvent.change(ta, { target: { value: original + '\nExtra line' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset to draft' }));
    expect((screen.getByLabelText('CMO note draft') as HTMLTextAreaElement).value).toBe(original);
  });

  it('a quiet day says nothing needs reporting', () => {
    openNote();
    for (let i = 0; i < 10; i++) fireEvent.click(screen.getByRole('button', { name: 'Previous day' }));
    expect(screen.getByText('Nothing needs reporting today')).toBeInTheDocument();
  });

  it('Copy shows Copied', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn(() => Promise.resolve()) } });
    openNote();
    fireEvent.click(screen.getByRole('button', { name: 'Copy note' }));
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });
});
