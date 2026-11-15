import { vi } from 'vitest';
import type { ReactNode } from 'react';

// Recharts' ResponsiveContainer measures 0×0 in jsdom; give it a fixed size.
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  const { cloneElement, isValidElement } = await import('react');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div style={{ width: 800, height: 320 }}>
        {isValidElement(children) ? cloneElement(children as React.ReactElement<{ width?: number; height?: number }>, { width: 800, height: 320 }) : children}
      </div>
    ),
  };
});
