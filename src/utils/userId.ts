/**
 * User ID utilities for robust comparison and normalization across BayanihanHub.
 * Handles IDs formatted as numbers (1), numeric strings ("1"), or prefixed strings ("user-1").
 */

export function cleanUserId(id?: string | number | null): string {
  if (id == null) return '';
  return String(id).replace(/^user-/, '').trim();
}

export function toUserPrefixedId(id?: string | number | null): string {
  const clean = cleanUserId(id);
  return clean ? `user-${clean}` : '';
}

export function isSameUserId(a?: string | number | null, b?: string | number | null): boolean {
  if (a == null || b == null) return false;
  const cleanA = cleanUserId(a);
  const cleanB = cleanUserId(b);
  return cleanA !== '' && cleanA === cleanB;
}

export function dedupeMessages<T extends { id: string }>(messages: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const msg of messages) {
    if (!seen.has(msg.id)) {
      seen.add(msg.id);
      result.push(msg);
    }
  }
  return result;
}
