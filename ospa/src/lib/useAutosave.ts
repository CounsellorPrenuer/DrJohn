import { useCallback, useEffect, useRef } from "react";

type SaveFn = (questionId: string, value: number) => Promise<void>;

/**
 * Debounces per-question saves by 5s (per ASSUMPTIONS.md item 7), and also
 * exposes an immediate flush for save-on-blur and save-on-navigate-away.
 */
export function useAutosave(save: SaveFn, debounceMs = 5000) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pending = useRef<Map<string, number>>(new Map());

  const flush = useCallback(
    async (questionId: string) => {
      const timer = timers.current.get(questionId);
      if (timer) {
        clearTimeout(timer);
        timers.current.delete(questionId);
      }
      const value = pending.current.get(questionId);
      if (value === undefined) return;
      pending.current.delete(questionId);
      await save(questionId, value);
    },
    [save]
  );

  const schedule = useCallback(
    (questionId: string, value: number) => {
      pending.current.set(questionId, value);
      const existing = timers.current.get(questionId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        void flush(questionId);
      }, debounceMs);
      timers.current.set(questionId, timer);
    },
    [debounceMs, flush]
  );

  useEffect(() => {
    const timersMap = timers.current;
    return () => {
      // Flush everything still pending on unmount.
      for (const questionId of timersMap.keys()) {
        void flush(questionId);
      }
    };
  }, [flush]);

  return { schedule, flush };
}
