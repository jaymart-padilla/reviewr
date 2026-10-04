import { z } from 'zod';

function getErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err)
    return String((err as Record<string, unknown>).message);
  return fallback;
}

// get first message of flattened error
function firstZodFlattenFieldErrors<T extends Record<string, unknown>>(
  error: z.ZodError<T>
): Partial<Record<keyof T, string>> {
  const flattened = z.flattenError(error).fieldErrors;
  return Object.fromEntries(
    Object.entries(flattened).map(([key, messages]) => [
      key,
      (messages as string[] | undefined)?.[0],
    ])
  ) as Partial<Record<keyof T, string>>;
}

export { getErrorMessage, firstZodFlattenFieldErrors };
