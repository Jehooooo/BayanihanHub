/**
 * Utility to generate random client IDs for optimistic UI updates.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
