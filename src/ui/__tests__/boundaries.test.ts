import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
}

describe('module boundaries', () => {
  it('ui/ and state/ never import engine internals', () => {
    const root = join(__dirname, '..', '..');
    const offenders: string[] = [];
    for (const f of [...files(join(root, 'ui')), ...files(join(root, 'state'))]) {
      if (f.includes('__tests__')) continue;
      const src = readFileSync(f, 'utf8');
      if (/engine\/(assess|lenses|handoff|config|baseline|quality|trend|readings)/.test(src)) offenders.push(f);
      if (/from ['"].*\/evidence\//.test(src)) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });
});
