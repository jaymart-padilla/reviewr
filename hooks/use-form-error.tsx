import { useState, useCallback, useMemo } from 'react';

export function useFormError<T extends Record<string, unknown>>() {
  const [errors, setErrors] = useState<T>({} as T);

  const setFieldError = useCallback(
    <K extends keyof T>(field: K, message: T[K]) => {
      setErrors((prev) => ({ ...prev, [field]: message }));
    },
    []
  );

  // set multiple field errors at once (e.g. after a failed server validation response)
  const setFieldErrors = useCallback((newErrors: Partial<T>) => {
    setErrors((prev) => ({ ...prev, ...newErrors }));
  }, []);

  // clear a single field's error
  const clearFieldError = useCallback(<K extends keyof T>(field: K) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // clear everything (e.g. on successful submit, or when reopening a dialog)
  const clearAllErrors = useCallback(() => {
    setErrors({} as T);
  }, []);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return {
    errors,
    setErrors,
    setFieldError,
    setFieldErrors,
    clearFieldError,
    clearAllErrors,
    hasErrors,
  };
}
