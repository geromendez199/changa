/**
 * WHY: Provide a typed validation error that service modules can throw before hitting Supabase.
 * CHANGED: YYYY-MM-DD
 */
export class ValidationError extends Error {
  code = "VALIDATION_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
