import type { AppState } from '../types';

export function loadPersistedState(): AppState | null {
  return null;
}

export function savePersistedState(_state: AppState): void {}

export function clearPersistedState(): void {}
