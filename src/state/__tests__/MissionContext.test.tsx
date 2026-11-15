import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MissionProvider, useDayAssessment, useMission } from '../MissionContext';
import { KEY } from '../persistence';

const wrapper = ({ children }: { children: ReactNode }) => <MissionProvider>{children}</MissionProvider>;
const useBoth = () => ({ m: useMission(), day: useDayAssessment(), d98: useDayAssessment(98) });

beforeEach(() => localStorage.clear());

describe('MissionContext', () => {
  it('defaults to FD99 with overall ACT', () => {
    const { result } = renderHook(useBoth, { wrapper });
    expect(result.current.m.selectedDay).toBe(99);
    expect(result.current.day.overall).toBe('ACT');
  });

  it('addReading fills the FD98 gap and persists it', () => {
    const { result } = renderHook(useBoth, { wrapper });
    expect(result.current.d98.metrics[0]!.status).toBe('UNKNOWN');
    let res: ReturnType<typeof result.current.m.addReading> | undefined;
    act(() => {
      res = result.current.m.addReading({ metricId: 'coreTemp', missionDay: 98, value: 37.8 });
    });
    expect(res).toEqual({ ok: true });
    expect(result.current.d98.metrics[0]!.status).not.toBe('UNKNOWN');
    expect(localStorage.getItem(KEY)).toContain('37.8');
  });

  it('rejects an invalid reading and saves nothing', () => {
    const { result } = renderHook(useBoth, { wrapper });
    let res: ReturnType<typeof result.current.m.addReading> | undefined;
    act(() => {
      res = result.current.m.addReading({ metricId: 'coreTemp', missionDay: 98, value: 99 });
    });
    expect(res!.ok).toBe(false);
    if (res && !res.ok) expect(res.errors.length).toBeGreaterThan(0);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('loads empty from corrupt storage without crashing', () => {
    localStorage.setItem(KEY, '{not json');
    const { result } = renderHook(useBoth, { wrapper });
    expect(result.current.m.userEntryCount).toBe(0);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('resetUserData clears entries', () => {
    const { result } = renderHook(useBoth, { wrapper });
    act(() => {
      result.current.m.addReading({ metricId: 'coreTemp', missionDay: 98, value: 37.8 });
    });
    act(() => result.current.m.resetUserData());
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(result.current.d98.metrics[0]!.status).toBe('UNKNOWN');
  });

  it('setSelectedDay clamps and skips launch day', () => {
    const { result } = renderHook(useBoth, { wrapper });
    act(() => result.current.m.setSelectedDay(0));
    expect(result.current.m.selectedDay).toBe(1);
    act(() => result.current.m.stepDay(-1));
    expect(result.current.m.selectedDay).toBe(-1);
    act(() => result.current.m.setSelectedDay(500));
    expect(result.current.m.selectedDay).toBe(99);
  });
});
