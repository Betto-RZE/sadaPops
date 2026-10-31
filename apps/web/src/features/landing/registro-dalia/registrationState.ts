import { resolveRegistrationTheme } from './themes';

export const REGISTRATION_KEYS = {
  state: 'sada_dalia_planted_state',
  color: 'sada_dalia_color_id',
  email: 'sada_alerts_email',
} as const;

export type RegistrationStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function readStored(storage: RegistrationStorage | null, key: string): string | null {
  try { return storage?.getItem(key) ?? null; } catch { return null; }
}

export function writeStored(storage: RegistrationStorage | null, key: string, value: string | null): boolean {
  if (!storage) return false;
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
    return true;
  } catch { return false; }
}

export function isStateId(value: string | null): value is string {
  return value !== null && /^(0[1-9]|[12][0-9]|3[0-2])$/.test(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function restoreRegistration(storage: RegistrationStorage | null) {
  const state = readStored(storage, REGISTRATION_KEYS.state);
  // La demostración no conserva correos, incluidos los de versiones anteriores.
  writeStored(storage, REGISTRATION_KEYS.email, null);
  const storedColor = readStored(storage, REGISTRATION_KEYS.color);
  const theme = resolveRegistrationTheme(storedColor);
  if (storedColor && storedColor !== theme.id) writeStored(storage, REGISTRATION_KEYS.color, theme.id);
  return {
    plantedStateId: isStateId(state) ? state : null,
    email: '',
    theme,
  };
}

// Se lee también la marca persistida para cubrir envíos repetidos y otras pestañas.
export function plantOnce(
  storage: RegistrationStorage | null,
  sessionStateId: string | null,
  requestedStateId: string,
  dispatch: (stateId: string) => void,
) {
  const stored = readStored(storage, REGISTRATION_KEYS.state);
  const existing = sessionStateId ?? (isStateId(stored) ? stored : null);
  if (existing) return { stateId: existing, added: false, persisted: isStateId(stored) };
  if (!isStateId(requestedStateId)) throw new Error('Invalid registration state');
  const persisted = writeStored(storage, REGISTRATION_KEYS.state, requestedStateId);
  dispatch(requestedStateId);
  return { stateId: requestedStateId, added: true, persisted };
}
