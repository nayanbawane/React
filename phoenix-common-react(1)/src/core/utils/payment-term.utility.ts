// Payment term due-day calculation utilities.

import dayjs from 'dayjs';

const HALF_MONTH_DAY = 15;

function getDayOfMonth(date: Date): number {
  return dayjs(date).date();
}

function getLastDayOfMonth(date: Date): number {
  return dayjs(date).daysInMonth();
}

/**
 * Calculates invoice due days based on EOM type and due-days offset.
 * @param eom - "H" = half-month, "Y" = end-of-month, anything else = exact due days
 */
export function calculateInvoiceDueDays(invoiceDate: Date, eom: string, dueDays: number): number {
  const dayOfMonth     = getDayOfMonth(invoiceDate);
  const lastDayOfMonth = getLastDayOfMonth(invoiceDate);

  if (eom.toUpperCase() === 'H') {
    return dayOfMonth <= HALF_MONTH_DAY
      ? HALF_MONTH_DAY - dayOfMonth + dueDays
      : lastDayOfMonth - dayOfMonth + dueDays;
  }

  if (eom.toUpperCase() === 'Y') {
    return lastDayOfMonth - dayOfMonth + dueDays;
  }

  return dueDays;
}
