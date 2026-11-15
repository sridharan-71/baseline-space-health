import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  assessDay,
  buildCmoNote,
  compareLenses,
  validateReading,
  validateSelfReport,
  type DayAssessment,
  type LensComparison,
  type MetricId,
  type MissionInput,
  type SymptomId,
} from '../engine/index';
import { generateDemoMission } from '../data/simulated/mission';
import { clear, load, save, type UserEntries } from './persistence';

export type Tab = 'today' | 'measure' | 'note' | 'evidence';
export type ActionResult = { ok: true } | { ok: false; errors: string[] };

const FIRST_DAY = -30;

interface MissionState {
  input: MissionInput;
  selectedDay: number;
  selectedMetric: MetricId;
  activeTab: Tab;
  userEntryCount: number;
  addReading(p: { metricId: MetricId; missionDay: number; value: number }): ActionResult;
  addSelfReport(p: { missionDay: number; symptoms: SymptomId[]; note?: string }): ActionResult;
  setSelectedDay(day: number): void;
  stepDay(delta: 1 | -1): void;
  setSelectedMetric(id: MetricId): void;
  setActiveTab(tab: Tab): void;
  jumpTo(day: number, metricId: MetricId | null, tab: Tab): void;
  resetUserData(): void;
}

const Ctx = createContext<MissionState | null>(null);

function clampDay(day: number, currentDay: number): number {
  let d = Math.round(day);
  if (Number.isNaN(d)) d = currentDay;
  d = Math.max(FIRST_DAY, Math.min(currentDay, d));
  return d === 0 ? 1 : d;
}

export function MissionProvider({ children }: { children: ReactNode }) {
  const base = useMemo(() => generateDemoMission(2026), []);
  const [user, setUser] = useState<UserEntries>(() => load());
  const [selectedDay, setDay] = useState(base.currentDay);
  const [selectedMetric, setSelectedMetric] = useState<MetricId>('coreTemp');
  const [activeTab, setActiveTab] = useState<Tab>('today');

  const input = useMemo<MissionInput>(
    () => ({
      ...base,
      readings: [...base.readings, ...user.readings],
      selfReports: [...base.selfReports, ...user.selfReports],
    }),
    [base, user],
  );

  const commit = useCallback((next: UserEntries) => {
    save(next);
    setUser(next);
  }, []);

  const addReading = useCallback<MissionState['addReading']>(
    (p) => {
      const res = validateReading({ ...p, source: 'USER_ENTERED' });
      if (!res.ok) return { ok: false, errors: res.errors };
      const r = res.value;
      const readings = [
        ...user.readings.filter((x) => !(x.metricId === r.metricId && x.missionDay === r.missionDay)),
        r,
      ];
      commit({ ...user, readings });
      return { ok: true };
    },
    [user, commit],
  );

  const addSelfReport = useCallback<MissionState['addSelfReport']>(
    (p) => {
      const res = validateSelfReport({ ...p, source: 'USER_ENTERED' });
      if (!res.ok) return { ok: false, errors: res.errors };
      const s = res.value;
      const selfReports = [...user.selfReports.filter((x) => x.missionDay !== s.missionDay), s];
      commit({ ...user, selfReports });
      return { ok: true };
    },
    [user, commit],
  );

  const setSelectedDay = useCallback((day: number) => setDay(clampDay(day, base.currentDay)), [base.currentDay]);

  const stepDay = useCallback(
    (delta: 1 | -1) =>
      setDay((d) => {
        let next = d + delta;
        if (next === 0) next += delta;
        return clampDay(next, base.currentDay);
      }),
    [base.currentDay],
  );

  const jumpTo = useCallback<MissionState['jumpTo']>(
    (day, metricId, tab) => {
      setDay(clampDay(day, base.currentDay));
      if (metricId) setSelectedMetric(metricId);
      setActiveTab(tab);
    },
    [base.currentDay],
  );

  const resetUserData = useCallback(() => {
    clear();
    setUser({ version: 1, readings: [], selfReports: [] });
  }, []);

  const value = useMemo<MissionState>(
    () => ({
      input,
      selectedDay,
      selectedMetric,
      activeTab,
      userEntryCount: user.readings.length + user.selfReports.length,
      addReading,
      addSelfReport,
      setSelectedDay,
      stepDay,
      setSelectedMetric,
      setActiveTab,
      jumpTo,
      resetUserData,
    }),
    [input, selectedDay, selectedMetric, activeTab, user, addReading, addSelfReport, setSelectedDay, stepDay, jumpTo, resetUserData],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMission(): MissionState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMission must be used inside <MissionProvider>');
  return v;
}

export function useDayAssessment(day?: number): DayAssessment {
  const { input, selectedDay } = useMission();
  const d = day ?? selectedDay;
  return useMemo(() => assessDay(input, d), [input, d]);
}

export function useLens(metricId: MetricId): LensComparison {
  const { input } = useMission();
  return useMemo(() => compareLenses(input, metricId, input.currentDay), [input, metricId]);
}

export function useCmoNote(day?: number): string {
  const { input, selectedDay } = useMission();
  const d = day ?? selectedDay;
  return useMemo(() => buildCmoNote(assessDay(input, d), input), [input, d]);
}
