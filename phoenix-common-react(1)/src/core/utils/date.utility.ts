// Date formatting, parsing, and arithmetic utilities.

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);

const DEFAULT_FORMAT = 'DD-MMM-YYYY';
const DASH = '-';

/** Returns today minus N days. */
// export function getDateBeforeDays(days: number): Date;

/** Returns inputDate minus N days. */
// export function getDateBeforeDays(inputDate: Date, days: number): Date;

export function getDateBeforeDays(daysOrDate: number | Date, days?: number): Date {
  if (daysOrDate instanceof Date) {
    return dayjs(daysOrDate).subtract(days!, 'day').toDate();
  }
  return dayjs().subtract(daysOrDate, 'day').toDate();
}

/** Returns today plus N days. */
export function getDateAfterDays(days: number): Date {
  return dayjs().add(days, 'day').toDate();
}

/**
 * Adds or subtracts days from a date.
 * @param addFlag - true = add days, false = subtract days
 */
export function addSubtractDays(inputDate: Date, days: number, addFlag: boolean): Date {
  return addFlag
    ? dayjs(inputDate).add(days, 'day').toDate()
    : dayjs(inputDate).subtract(days, 'day').toDate();
}

/** Returns current datetime as "YYYY-MM-DD HH:mm". */
export function getCurrentDateTime(): string {
  return dayjs().format('YYYY-MM-DD HH:mm').toUpperCase();
}

/** Returns current date as "YYYY-MM-DD". */
export function getCurrentDate(): string {
  return dayjs().format('YYYY-MM-DD');
}

/** Returns current time in 12-hour format "hh:mm A". */
export function getCurrentTime(): string {
  return dayjs().format('hh:mm A').toUpperCase();
}

/** Returns current time in 24-hour format "HH:mm". */
export function getCurrentAstronomicalTime(): string {
  return dayjs().format('HH:mm');
}

/** Returns a timestamp string in format "YYYYMMDDHHmmss". */
export function generateTimeStr(): string {
  return dayjs().format('YYYYMMDDHHmmss');
}

/** Formats a Date as "DD-MMM-YYYY" (uppercase). Returns "" for null/undefined. */
export function getFormattedDate(inputDate: Date | string | null | undefined): string {
  return inputDate ? dayjs(inputDate).format(DEFAULT_FORMAT).toUpperCase() : '';
}

/** Returns today formatted as "DD-MMM-YYYY" (uppercase). */
export function getFormattedCurrentDate(): string {
  return dayjs().format(DEFAULT_FORMAT).toUpperCase();
}

/** Formats a Date as "MM/DD". */
export function getShortDateFormat(inputDate: Date | null | undefined): string {
  return inputDate ? dayjs(inputDate).format('MM/DD').toUpperCase() : '';
}

/** Formats a Date as "DD-MMM-YYYY" (uppercase) — alias of getFormattedDate. */
export function getDateToStringMonthFormat(date: Date): string {
  return dayjs(date).format(DEFAULT_FORMAT).toUpperCase();
}

/** Formats a Date using the default format "DD-MMM-YYYY". */
export function getDateToString(date: Date | null | undefined): string {
  return date ? dayjs(date).format(DEFAULT_FORMAT) : '';
}

/** Parses an ISO datetime string (e.g. "2024-01-15T10:30:00.000Z") and returns "DD-MMM-YYYY". */
export function getFormattedDateFromIso(dateString: string): string {
  try {
    const datePart = dateString.split('T')[0];
    const parsed = dayjs(datePart, 'YYYY-MM-DD');
    return parsed.isValid() ? parsed.format(DEFAULT_FORMAT).toUpperCase() : '';
  } catch {
    return '';
  }
}

/** Extracts the time portion (HH:mm) from an ISO datetime string (e.g. "2024-01-15T10:30:00.000Z"). */
export function getFormattedTime(dateString: string): string {
  try {
    const timePart = dateString.split('T')[1];
    return timePart.split('.')[0].substring(0, 5);
  } catch {
    return '';
  }
}

/**
 * Converts a date string from one dayjs format to another.
 * Returns DASH ("-") unchanged if the input value is "-".
 */
export function getDateFromOneFormatToAnother(
  originalFormat: string,
  targetFormat: string,
  originalDate: string
): string {
  if (originalDate.toLowerCase() === DASH) return DASH;
  try {
    const parsed = dayjs(originalDate, originalFormat);
    return parsed.isValid() ? parsed.format(targetFormat) : '';
  } catch {
    return '';
  }
}

/** Parses a "DD-MMM-YYYY" string to a Date. Returns null on failure. */
export function getStringToDate(dateString: string): Date | null {
  try {
    const parsed = dayjs(dateString, DEFAULT_FORMAT);
    return parsed.isValid() ? parsed.toDate() : null;
  } catch {
    return null;
  }
}

/** Re-parses a Date through "DD-MMM-YYYY" to normalize it. */
export function getDateformat(inputDate: Date | null | undefined): Date | null {
  if (!inputDate) return null;
  const formatted = getFormattedDate(inputDate);
  return getStringToDate(formatted);
}

/** Parses a "HH:mm:ss" time string to a Date. Returns null on failure. */
export function getTimeStringToDate(timeString: string): Date | null {
  try {
    const parsed = dayjs(timeString, 'HH:mm:ss');
    return parsed.isValid() ? parsed.toDate() : null;
  } catch {
    return null;
  }
}

/** Formats a Date as "hh:mmA" (e.g. "02:30PM"). */
export function getTimeAmPmString(date: Date): string {
  return dayjs(date).format('hh:mmA');
}

/** Formats a Date as "hh:mm A" (e.g. "02:30 PM"). */
export function getTimeSplitAmPmString(date: Date): string {
  return dayjs(date).format('hh:mm A');
}

/** Formats a Date as "HH:mm" (24-hour). */
export function getTimeTwentyfourString(date: Date): string {
  return dayjs(date).format('HH:mm');
}

/** Returns current datetime formatted in the given IANA timezone. */
export function getCurrentDateTimeByTimeZone(timeZoneId: string, format = DEFAULT_FORMAT): string {
  return dayjs().tz(timeZoneId).format(format).toUpperCase();
}

/** Returns current time (HH:mm:ss) in the given IANA timezone. */
export function getLoginTimeByOfficeZone(timeZoneId: string): string {
  return dayjs().tz(timeZoneId).format('HH:mm:ss').toUpperCase();
}

/** Returns current time (HH:mm) in the given IANA timezone. */
export function getLoginTimeInHoursMinsFormat(timeZoneId: string): string {
  return dayjs().tz(timeZoneId).format('HH:mm').toUpperCase();
}

/** Returns the ISO week number of the year (1–53). */
export function getWeekOfYear(date: Date): number {
  return dayjs(date).week();
}

/** Returns 0-indexed month from a Date (0 = January). */
export function getMonthFromDate(date: Date): number {
  return dayjs(date).month();
}

/** Returns the full year from a Date. */
export function getYearFromDate(date: Date): number {
  return dayjs(date).year();
}

/** Returns the 0-indexed month after adding/subtracting N months from a Date. */
export function getMonthBeforeAfterSpecificMonth(date: Date, monthOffset: number): number {
  return dayjs(date).add(monthOffset, 'month').month();
}

/** Returns the year after adding/subtracting N months from a Date. */
export function getYearBeforeAfterSpecificMonth(date: Date, monthOffset: number): number {
  return dayjs(date).add(monthOffset, 'month').year();
}

/** Returns the first day of the month for a given Date. */
export function getFirstDateOfMonth(date: Date): Date {
  return dayjs(date).startOf('month').toDate();
}

/** Returns the last day of the month for a given Date. */
export function getLastDateOfMonth(date: Date): Date;
/** Returns the last day of the given year/month (1-indexed month). */
export function getLastDateOfMonth(year: number, month: number): Date;
export function getLastDateOfMonth(dateOrYear: Date | number, month?: number): Date {
  if (dateOrYear instanceof Date) {
    return dayjs(dateOrYear).endOf('month').toDate();
  }
  return dayjs(new Date(dateOrYear, month! - 1, 1)).endOf('month').toDate();
}

/** Returns the first day of the year for a given Date. */
export function getYearFirstDate(date: Date): Date {
  return dayjs(date).startOf('year').toDate();
}

/** Returns the last day of the year for a given Date. */
export function getLastDateOfYear(date: Date): Date {
  return dayjs(date).endOf('year').toDate();
}

/** Returns the first day of the quarter for a given Date. */
export function getFirstDateOfQuarter(date: Date): Date {
  const month = dayjs(date).month();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  return dayjs(date).month(quarterStartMonth).startOf('month').toDate();
}

/** Returns the last day of the quarter for a given Date. */
export function getLastDateOfQuarter(date: Date): Date {
  const month = dayjs(date).month();
  const quarterEndMonth = Math.floor(month / 3) * 3 + 2;
  return dayjs(date).month(quarterEndMonth).endOf('month').toDate();
}

/** Returns whole days between two dates (positive if end > start). */
export function difference(start: Date | null, end: Date | null): number {
  if (!start || !end) return 0;
  return Math.trunc((end.getTime() - start.getTime()) / 86_400_000);
}

/** Returns whole days between fromDate and toDate, ignoring time component. */
export function getNoOfDaysBetweenDates(fromDate: Date | null, toDate: Date | null): number {
  if (!fromDate || !toDate) return 0;
  const from = dayjs(fromDate).startOf('day');
  const to   = dayjs(toDate).startOf('day');
  return to.diff(from, 'day');
}

/** Returns absolute number of whole months between two dates. */
export function getNumberOfMonthsBetweenDate(firstDate: Date | null, lastDate: Date | null): number {
  if (!firstDate || !lastDate) return -1;
  const a = dayjs(firstDate);
  const b = dayjs(lastDate);
  return Math.abs(b.year() * 12 + b.month() - (a.year() * 12 + a.month()));
}

/** Returns exact months between two dates, accounting for day-of-month. */
export function getExactNumberOfMonthsBetweenDate(firstDate: Date | null, lastDate: Date | null): number {
  if (!firstDate || !lastDate) return -1;
  const after  = dayjs(firstDate);
  const before = dayjs(lastDate);
  let months = (before.year() - after.year()) * 12 + (before.month() - after.month());
  if (before.date() < after.date()) months--;
  return months;
}

/** Returns minutes difference between two "yyyy-MM-dd HH:mm:ss" strings. */
export function findDateAndTimeDifferenceInMinutes(startDate: string, endDate: string): number {
  try {
    const fmt = 'YYYY-MM-DD HH:mm:ss';
    const d1 = dayjs(startDate, fmt);
    const d2 = dayjs(endDate, fmt);
    return d2.diff(d1, 'minute');
  } catch {
    return 0;
  }
}

/**
 * Compares two dates.
 * @param aftrBefore - "after" checks if toCheck is after withWhichToCheck, otherwise before
 * @param checkEqual - when true, also returns true if both dates fall on the same day
 */
export function checkDate(
  toCheck: Date | null,
  withWhichToCheck: Date | null,
  aftrBefore: 'after' | 'before',
  checkEqual: boolean
): boolean {
  if (!toCheck || !withWhichToCheck) return false;
  const a = dayjs(toCheck);
  const b = dayjs(withWhichToCheck);
  if (checkEqual && a.isSame(b, 'day')) return true;
  return aftrBefore === 'after' ? a.isAfter(b) : a.isBefore(b);
}

/**
 * Returns true if selectedDate is within numberOfDays of now (in the given IANA timezone).
 * @param numberOfDays - threshold; 0 means always return true
 */
export function compareDays(selectedDate: Date, numberOfDays: number, timeZoneId: string): boolean {
  const now = dayjs().tz(timeZoneId);
  const selected = dayjs(selectedDate);
  if (numberOfDays !== 0 && selected.isAfter(now)) {
    return selected.diff(now, 'day', true) <= numberOfDays;
  }
  return true;
}

export const parseApiDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;
  const months: Record<string, number> = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const [day, mon, year] = parts;
  const month = months[mon.toUpperCase()];
  if (month === undefined) return null;
  return new Date(Number(year), month, Number(day));
};

/** Formats a date as "May 5, 2026 10:30:00 PM". */
export function getLongDateTimeFormat(
  inputDate: Date | string | null | undefined
): string {
  return inputDate
    ? dayjs(inputDate).format('MMM D, YYYY hh:mm:ss A')
    : '';
}

export function formatDate(date: Date = new Date()): string {
  const pad = (num: number): string => num.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Supports: Convert GMT time to 12 or 24 hour format
    // "09:00:00 CST"
    // "18:30:00 GMT"
export const formatTime = (
  timeString: string,
  is12HourFormat: boolean = true
): string => {
  if (!timeString) return '';

  try {

    const [timePart] = timeString.split(' ');

    const date = new Date(`1970-01-01T${timePart}Z`);

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: is12HourFormat,
    });
  } catch (e) {
    return timeString;
  }
};