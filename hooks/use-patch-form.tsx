import { useState, useCallback } from 'react';

export function usePatchForm<T extends Record<string, unknown>>(
  initialState: T
) {
  const [formData, setFormData] = useState<T>(initialState);

  const patchForm = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const patchFormMultiple = useCallback((patch: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
  }, [initialState]);

  return { formData, setFormData, patchForm, patchFormMultiple, resetForm };
}
