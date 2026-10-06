export interface FormState<T extends Record<string, string | undefined> = Record<string, string>> {
  error?: string;
  message?: string;
  fields?: T;
}

/**
 * Returns the old submitted value for a form field if available, or a fallback.
 * Equivalent to Laravel's old('field_name', 'default').
 */
export function old<T extends Record<string, string | undefined>>(
  state: FormState<T> | undefined | null,
  key: keyof T,
  fallback: string = ""
): string {
  if (!state || !state.fields) return fallback;
  const val = state.fields[key];
  return val !== undefined && val !== null ? String(val) : fallback;
}

/**
 * Helper to build a failed form response carrying submitted fields for preservation.
 */
export function formError<T extends Record<string, string | undefined>>(
  error: string,
  fields?: T
): FormState<T> {
  return { error, fields };
}

/**
 * Helper to build a successful form response.
 */
export function formSuccess<T extends Record<string, string | undefined>>(
  message?: string,
  fields?: T
): FormState<T> {
  return { message, fields };
}
