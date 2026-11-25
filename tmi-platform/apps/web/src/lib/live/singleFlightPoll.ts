const inflight = new Map<string, Promise<unknown>>();
const controllers = new Map<string, AbortController>();
const holders = new Map<string, number>();

/**
 * One in-flight JSON read per key. Extra callers share that request
 * instead of opening another socket. `load` receives the flight's
 * AbortSignal; a caller that ignores it stays compatible.
 */
export function singleFlightJson<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T | null>,
): Promise<T | null> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T | null>;
  const controller = new AbortController();
  controllers.set(key, controller);
  const job = Promise.resolve()
    .then(() => load(controller.signal))
    .finally(() => {
      if (inflight.get(key) === job) inflight.delete(key);
      if (controllers.get(key) === controller) controllers.delete(key);
    });
  inflight.set(key, job);
  return job;
}

/** Hold a shared flight. The network request aborts only when the last holder releases. */
export function beginSharedFlight(key: string): () => void {
  holders.set(key, (holders.get(key) ?? 0) + 1);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const next = (holders.get(key) ?? 1) - 1;
    if (next <= 0) {
      holders.delete(key);
      controllers.get(key)?.abort();
    } else {
      holders.set(key, next);
    }
  };
}
