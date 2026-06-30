'use client';

import { useEffect, useState } from 'react';
import { WindowManagerRuntime } from './WindowManagerRuntime';
import { WindowRuntimeState } from './WindowTypes';

export function useWindowRuntime(): WindowRuntimeState {
  const [runtimeState, setRuntimeState] = useState<WindowRuntimeState>(WindowManagerRuntime.getState());

  useEffect(() => {
    const unsub = WindowManagerRuntime.subscribe((next) => setRuntimeState({ ...next }));
    return unsub;
  }, []);

  return runtimeState;
}
