"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_FORM_STATE,
  FORM_STORAGE_KEY,
  type PersistedFormState,
} from "./form-config";

export function loadFormState(): PersistedFormState {
  if (typeof window === "undefined") return DEFAULT_FORM_STATE;
  try {
    const raw = localStorage.getItem(FORM_STORAGE_KEY);
    if (!raw) return DEFAULT_FORM_STATE;
    return { ...DEFAULT_FORM_STATE, ...JSON.parse(raw) } as PersistedFormState;
  } catch {
    return DEFAULT_FORM_STATE;
  }
}

export function saveFormState(state: PersistedFormState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(state));
}

export function usePersistedFormState() {
  const [form, setForm] = useState<PersistedFormState>(DEFAULT_FORM_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setForm(loadFormState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveFormState(form);
  }, [form, hydrated]);

  const updateForm = useCallback(
    (patch: Partial<PersistedFormState> | ((prev: PersistedFormState) => PersistedFormState)) => {
      setForm((prev) =>
        typeof patch === "function" ? patch(prev) : { ...prev, ...patch }
      );
    },
    []
  );

  return { form, setForm: updateForm, hydrated };
}
