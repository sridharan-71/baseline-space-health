import type { Reading, SelfReport } from '../engine/index';

export const KEY = 'baseline.v1.userEntries';

export interface UserEntries {
  version: 1;
  readings: Reading[];
  selfReports: SelfReport[];
}

export const emptyEntries = (): UserEntries => ({ version: 1, readings: [], selfReports: [] });

function removeKey(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable — nothing to remove */
  }
}

/** Loads USER_ENTERED items. Missing, corrupt or wrong-version data → empty (and the bad key is removed). */
export function load(): UserEntries {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return emptyEntries();
  }
  if (raw === null) return emptyEntries();
  try {
    const parsed = JSON.parse(raw) as Partial<UserEntries> | null;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.readings) || !Array.isArray(parsed.selfReports)) {
      removeKey();
      return emptyEntries();
    }
    return {
      version: 1,
      readings: parsed.readings.filter((r) => r && r.source === 'USER_ENTERED'),
      selfReports: parsed.selfReports.filter((s) => s && s.source === 'USER_ENTERED'),
    };
  } catch {
    removeKey();
    return emptyEntries();
  }
}

export function save(entries: UserEntries): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function clear(): void {
  removeKey();
}
