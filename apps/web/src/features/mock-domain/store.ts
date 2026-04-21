import { useSyncExternalStore } from "react";
import { createSeededMockDomainState } from "./seed";
import type { MockDomainState } from "./types";

export type MockDomainStore = {
  getState: () => MockDomainState;
  setState: (updater: (current: MockDomainState) => MockDomainState) => void;
  subscribe: (listener: () => void) => () => void;
  reset: (nextState?: MockDomainState) => void;
};

export function createMockDomainStore(
  initialState = createSeededMockDomainState()
): MockDomainStore {
  let state = initialState;
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  return {
    getState() {
      return state;
    },
    setState(updater) {
      state = updater(state);
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset(nextState = createSeededMockDomainState()) {
      state = nextState;
      notify();
    },
  };
}

let singletonStore: MockDomainStore | null = null;

export function getMockDomainStore() {
  if (!singletonStore) {
    singletonStore = createMockDomainStore();
  }

  return singletonStore;
}

export function useMockDomainStore<T>(selector: (state: MockDomainState) => T): T {
  const store = getMockDomainStore();

  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
}
