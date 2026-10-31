'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import messages from '@/i18n/es.json';
import { DEFAULT_REGISTRATION_THEME, type RegistrationTheme } from './themes';
import { prepareThemeAssets } from './themeAssets';
import { isValidEmail, plantOnce, REGISTRATION_KEYS, restoreRegistration, writeStored, type RegistrationStorage } from './registrationState';

const copy = messages.dahliaRegistration;

function browserStorage(): RegistrationStorage | null {
  try { return window.localStorage; } catch { return null; }
}

export function useDahliaRegistration(stateId: string) {
  const [theme, setTheme] = useState<RegistrationTheme>(DEFAULT_REGISTRATION_THEME);
  const [pendingTheme, setPendingTheme] = useState<RegistrationTheme | null>(null);
  const [themeError, setThemeError] = useState(false);
  const [ready, setReady] = useState(false);
  const [plantedStateId, setPlantedStateId] = useState<string | null>(null);
  const [wantsAlerts, setWantsAlerts] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [alertsSaved, setAlertsSaved] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const sessionState = useRef<string | null>(null);
  const themeRequest = useRef(0);
  const storage = useRef<RegistrationStorage | null>(null);

  useEffect(() => {
    // Conservar el contador compartido para invalidar también selecciones posteriores al montaje.
    const requests = themeRequest;
    storage.current = browserStorage();
    const restored = restoreRegistration(storage.current);
    sessionState.current = restored.plantedStateId;
    setPlantedStateId(restored.plantedStateId);
    setReady(true);
    const request = ++requests.current;
    setPendingTheme(restored.theme);
    prepareThemeAssets(restored.theme).then(() => {
      if (request !== requests.current) return;
      setTheme(restored.theme);
      setPendingTheme(null);
    }).catch(() => {
      if (request !== requests.current) return;
      setPendingTheme(null);
      setThemeError(true);
    });
    return () => { requests.current++; };
  }, []);

  const onThemeChange = async (next: RegistrationTheme) => {
    const request = ++themeRequest.current;
    setThemeError(false);
    setPendingTheme(next);
    try {
      await prepareThemeAssets(next);
      if (request !== themeRequest.current) return;
      setTheme(next);
      setPendingTheme(null);
      if (!writeStored(storage.current, REGISTRATION_KEYS.color, next.id)) setStorageWarning(true);
    } catch {
      if (request !== themeRequest.current) return;
      setPendingTheme(null);
      setThemeError(true);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready || pendingTheme) return;
    // El campo opcional solo valida formato; nunca se guarda ni se transmite.
    if (wantsAlerts && email.trim() && !isValidEmail(email)) {
      setEmailError(copy.emailError);
      event.currentTarget.querySelector<HTMLInputElement>('#registro-correo')?.focus();
      return;
    }
    setEmailError(null);
    setAlertsSaved(wantsAlerts);
    setEmail('');
    const result = plantOnce(storage.current, sessionState.current, stateId, nextStateId => {
      window.dispatchEvent(new CustomEvent('dalias:add-dahlia', { detail: { stateId: nextStateId } }));
    });
    sessionState.current = result.stateId;
    setPlantedStateId(result.stateId);
    const themePersisted = writeStored(storage.current, REGISTRATION_KEYS.color, theme.id);
    setStorageWarning(!result.persisted || !themePersisted);
  };

  return {
    theme, pendingTheme, themeError, ready, plantedStateId, isPlanted: Boolean(plantedStateId),
    wantsAlerts, email, emailError, alertsSaved, storageWarning, detailsOpen,
    onThemeChange,
    onSubmit,
    onAlertsChange: (checked: boolean) => { setWantsAlerts(checked); setEmailError(null); },
    onEmailChange: (value: string) => { setEmail(value); setEmailError(null); },
    onDetailsChange: () => setDetailsOpen(value => !value),
  };
}
