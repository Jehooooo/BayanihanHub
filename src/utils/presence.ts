/**
 * Presence & Last Seen Utilities
 *
 * Formats user activity timestamps into natural, realistic messaging presence:
 * - Within 2.5 minutes: "Active" (online)
 * - 2-59 minutes: "Active X mins ago"
 * - 1-23 hours: "Active X hrs ago"
 * - Yesterday: "Active yesterday"
 * - Older or unknown: "Offline"
 */

export interface PresenceInfo {
  isOnline: boolean;
  statusText: string;
}

export function getPresenceInfo(
  lastActive?: string | null,
  isExplicitOnline?: boolean
): PresenceInfo {
  // If explicitly signaled online and no timestamp, assume online
  if (isExplicitOnline && !lastActive) {
    return { isOnline: true, statusText: 'Active' };
  }

  if (!lastActive) {
    return { isOnline: false, statusText: 'Offline' };
  }

  try {
    const d = new Date(lastActive);
    if (isNaN(d.getTime())) {
      return { isOnline: false, statusText: 'Offline' };
    }

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    // If future timestamp or within last 2.5 minutes (150 seconds)
    if (diffSec <= 150) {
      return { isOnline: true, statusText: 'Active' };
    }

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return {
        isOnline: false,
        statusText: `Active ${diffMin} ${diffMin === 1 ? 'min' : 'mins'} ago`,
      };
    }

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return {
        isOnline: false,
        statusText: `Active ${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ago`,
      };
    }

    // Check if it was yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate()
    ) {
      return {
        isOnline: false,
        statusText: 'Active yesterday',
      };
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays <= 6) {
      return {
        isOnline: false,
        statusText: `Active ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`,
      };
    }

    return { isOnline: false, statusText: 'Offline' };
  } catch {
    return { isOnline: false, statusText: 'Offline' };
  }
}
