import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

/**
 * Formats a date string smartly for Vietnamese UI:
 * - hôm nay HH:mm
 * - hôm qua HH:mm
 * - hôm kia HH:mm
 * - dd/MM HH:mm (same year)
 * - dd/MM/yyyy HH:mm (other years)
 */
export function formatDateSmart(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'N/A';
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);
    const startOfDayBeforeYesterday = new Date(startOfToday);
    startOfDayBeforeYesterday.setDate(startOfToday.getDate() - 2);

    if (date >= startOfToday) {
      return `hôm nay ${format(date, 'HH:mm')}`;
    }

    if (date >= startOfYesterday && date < startOfToday) {
      return `hôm qua ${format(date, 'HH:mm')}`;
    }

    if (date >= startOfDayBeforeYesterday && date < startOfYesterday) {
      return `hôm kia ${format(date, 'HH:mm')}`;
    }

    // same year -> dd/MM HH:mm
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'dd/MM HH:mm');
    }

    // different year -> dd/MM/yyyy HH:mm
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting smart date:', error);
    return 'N/A';
  }
}

/**
 * Formats a date string into a readable format
 * @param dateString The date string to format
 * @param formatStr The format string to use
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDate(
  dateString?: string,
  formatStr: string = 'PPP'
): string {
  if (!dateString) return 'N/A';

  try {
    const date = parseISO(dateString);

    if (isValid(date)) {
      return format(date, formatStr);
    }

    return 'N/A';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

/**
 * Formats a date string with locale support
 * @param dateString The date string to format
 * @param localeCode The locale code ('en' or 'vi')
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDateWithLocale(
  dateString?: string,
  localeCode: 'en' | 'vi' = 'vi' // default to Vietnamese
): string {
  if (!dateString) return 'N/A';

  try {
    const date = parseISO(dateString);

    if (isValid(date)) {
      const localeMap: Record<string, any> = {
        en: enUS,
        vi: vi,
      };

      const locale = localeMap[localeCode] || enUS;

      const formatStr = localeCode === 'vi' ? "d 'tháng' M, yyyy" : 'PPP';

      return format(date, formatStr, { locale });
    }

    return 'N/A';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

export const formatTimeAgo = (date: string | Date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export function formatTimeFromISOString(
  isoString: string,
  options?: { useUTC?: boolean; hour12?: boolean }
): string {
  const date = new Date(isoString);
  const useUTC = options?.useUTC ?? false;
  const hour12 = options?.hour12 ?? false;

  if (useUTC) {
    const utcHours = date.getUTCHours().toString().padStart(2, '0');
    const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${utcHours}:${utcMinutes}`;
  } else {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: hour12,
    });
  }
}
