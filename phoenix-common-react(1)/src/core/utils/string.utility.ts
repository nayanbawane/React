/** 
* String manipulation, formatting, and validation utilities.
* @author - Kishan Jotaniya
*/


/** Returns true if value is null, undefined, or empty string. */
export function isEmpty(input: string | null | undefined): boolean {
  return input == null || input.length === 0;
}

/** Returns true if value is not null and not empty. */
export function isNotEmpty(input: string | null | undefined): boolean {
  return !isEmpty(input);
}

/** Returns true if value is null, undefined, or blank (whitespace only). */
export function isNullOrEmpty(input: string | null | undefined): boolean {
  return input == null || input.trim().length === 0;
}

/** Returns true if ANY of the provided values is null/empty. */
export function isAnyNullOrEmpty(...values: (string | null | undefined)[]): boolean {
  return values.some(isNullOrEmpty);
}

/** Returns true if value is not null and not blank. */
export function isNotNullOrEmpty(input: string | null | undefined): boolean {
  return !isNullOrEmpty(input);
}

/** Returns true if string contains only whitespace characters. */
export function isWhitespace(input: string | null | undefined): boolean {
  return input != null && input.length > 0 && /^\s+$/.test(input);
}

// ---------------------------------------------------------------------------
// Safe accessors
// ---------------------------------------------------------------------------

/** Returns trimmed string, or "" for null/undefined. */
export function getEmptyIfNull(value: string | object | null | undefined): string {
  return value == null ? '' : String(value).trim();
}

/** Returns trimmed string, or "" for null/undefined/"null". */
export function getEmptyTextIfNull(value: string | null | undefined): string {
  return value == null || value.toLowerCase() === 'null' ? '' : value;
}

/** Returns value as string, or "" for null/undefined. */
export function getEmptyStringIfNull(value: unknown): string {
  return value == null ? '' : String(value);
}

/** Returns "-" if value is null/empty, otherwise returns the value. */
export function getDashIfNull(value: string | null | undefined): string {
  return isNullOrEmpty(value) ? '-' : value!;
}

/** Returns "0" if value is null/empty, otherwise returns the value. */
export function replaceEmptyToZero(input: string | null | undefined): string {
  return isEmpty(input) ? '0' : input!;
}

/** Returns the string value from a data map, falling back to defaultValue or "". */
export function getValueAsString(
  dataMap: Record<string, unknown>,
  key: string,
  defaultValue = ''
): string {
  const value = dataMap[key];
  return value == null ? defaultValue : String(value);
}

/** Returns string length, or 0 for null/undefined. */
export function length(input: string | null | undefined): number {
  return input == null ? 0 : input.length;
}

/** Returns trimmed string, or null for null input. */
export function trim(input: string | null): string | null {
  return input != null ? input.trim() : null;
}

/** Returns trimmed string, or "" for null input. */
export function trimToEmpty(input: string | null | undefined): string {
  return input != null ? input.trim() : '';
}

/** Null-safe toUpperCase. */
export function toUpperCase(text: string | null | undefined): string | null {
  return text != null ? text.toUpperCase() : null;
}

/**
 * Title-cases each word split by space/comma/period/semicolon.
 */
export function toCamelCase(text: string | null | undefined): string | null {
  if (text == null) return null;

  return text.split(/[ ,.;]/).map(piece => {
    if (piece.includes('/')) {
      const parts = piece.split('/');
      return parts.map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w).join('/');
    }
    if (!piece) return piece;
    // Find first letter or digit and capitalise it; lowercase the rest
    const idx = [...piece].findIndex(c => /[a-zA-Z0-9]/.test(c));
    if (idx === -1) return piece;
    return piece.slice(0, idx) + piece[idx].toUpperCase() + piece.slice(idx + 1).toLowerCase();
  }).join(' ');
}

/**
 * Title-cases text capitalising the first letter after each delimiter (. ; space , /).
 * Does not lowercase the rest of each word.
 */
export function toNormalCamelCase(text: string | null | undefined): string | null {
  if (text == null) return null;
  let capitaliseNext = true;
  return [...text].map(c => {
    if ('.;, /'.includes(c)) { capitaliseNext = true; return c.toUpperCase(); }
    if (capitaliseNext && /[a-zA-Z0-9]/.test(c)) { capitaliseNext = false; return c.toUpperCase(); }
    return c.toLowerCase();
  }).join('');
}

/** Title-cases the first character of each line; lowercases the rest. */
export function toCamelCaseLineWise(text: string | null | undefined): string | null {
  if (text == null) return null;
  return text.split('\n').map(line =>
    line ? line[0].toUpperCase() + line.slice(1).toLowerCase() : line
  ).join('\n ');
}

/**
 * Title-cases preserving delimiters (space, comma, period).
 * Only the first letter after a delimiter is uppercased; the rest are lowercased.
 */
export function toCamelCaseReserveDelimiters(text: string | null | undefined): string | null {
  if (text == null) return null;
  const delimiters = ' .,';
  let toUpper = true;
  return [...text].map(ch => {
    if (delimiters.includes(ch)) { toUpper = true; return ch; }
    if (toUpper) { toUpper = false; return ch.toUpperCase(); }
    return ch.toLowerCase();
  }).join('');
}

/**
 * Capitalises the first letter after any non-letter character.
 * Does not lowercase surrounding characters.
 */
export function capitalizeEngOnly(str: string | null | undefined): string | null {
  if (!str) return str ?? null;
  let capitaliseNext = true;
  return [...str].map(ch => {
    if (!/[a-zA-Z]/.test(ch)) { capitaliseNext = true; return ch; }
    if (capitaliseNext) { capitaliseNext = false; return ch.toUpperCase(); }
    return ch;
  }).join('');
}

/** Splits a string by separator; returns [] for null/empty input. */
export function split(value: string | null | undefined, separator: string): string[] {
  if (isNullOrEmpty(value)) return [];
  return value!.split(separator);
}

/** Splits a string by separator and returns the element at index, or "" if out of bounds. */
export function getSplittedValue(source: string | null | undefined, delimiter: string, index: number): string {
  if (isEmpty(source)) return '';
  const parts = source!.split(delimiter);
  return index < parts.length ? parts[index] : '';
}

/** Joins an array or list with a separator; returns null for null input. */
export function join(items: string[] | null | undefined, separator: string | string): string | null {
  if (items == null) return null;
  return items.filter(i => i != null).join(separator);
}

/** Appends non-empty strings separated by ", ". */
export function appendString(...parts: (string | null | undefined)[]): string {
  return parts.filter(p => !isNullOrEmpty(p)).join(', ');
}

/** Joins non-null, non-empty values with a conjunction string. */
export function concat(conjunction: string, ...values: unknown[]): string {
  return values
    .filter(v => v != null && String(v).length > 0)
    .join(conjunction);
}

/** Joins non-null, non-empty values with newline. */
export function concatLines(...values: unknown[]): string {
  return concat('\n', ...values);
}

/** Null-safe string replace. */
export function replace(
  input: string | null | undefined,
  search: string,
  replacement: string
): string | null {
  return input == null ? null : input.split(search).join(replacement);
}

/** Replaces indexed placeholders {0}, {1}, … with provided values. */
export function replacePlaceHolder(template: string, ...placeholders: string[]): string {
  return placeholders.reduce(
    (result, value, i) => result.split(`{${i}}`).join(value),
    template
  );
}

/** Replaces every line that contains searchText with replacement. */
export function replaceLineContaining(
  input: string | null | undefined,
  searchText: string,
  replacement: string
): string | null {
  if (input == null || searchText == null || replacement == null) return input ?? null;
  return input.split('\n').map(line => line.includes(searchText) ? replacement : line).join('\n');
}

/**
 * Word-wraps a string at wrapLength columns.
 * @param wrapLongWords - when true, long words are broken at wrapLength
 */
export function wrap(
  str: string | null | undefined,
  wrapLength: number,
  newLineStr = '\n',
  wrapLongWords = false
): string | null {
  if (str == null) return null;
  const len = Math.max(1, wrapLength);
  let offset = 0;
  let result = '';
  while (str.length - offset > len) {
    if (str[offset] === ' ') { offset++; continue; }
    let spaceAt = str.lastIndexOf(' ', len + offset);
    if (spaceAt >= offset) {
      result += str.slice(offset, spaceAt) + newLineStr;
      offset = spaceAt + 1;
    } else if (wrapLongWords) {
      result += str.slice(offset, len + offset) + newLineStr;
      offset += len;
    } else {
      spaceAt = str.indexOf(' ', len + offset);
      if (spaceAt >= 0) {
        result += str.slice(offset, spaceAt) + newLineStr;
        offset = spaceAt + 1;
      } else {
        result += str.slice(offset);
        offset = str.length;
      }
    }
  }
  return result + str.slice(offset);
}

/** Left-pads a string to size using padChar. Returns null for null input. */
export function leftPad(str: string | null | undefined, size: number, padChar: string | string = ' '): string | null {
  if (str == null) return null;
  const pad = String(padChar) || ' ';
  const pads = size - str.length;
  if (pads <= 0) return str;
  return pad.repeat(Math.ceil(pads / pad.length)).slice(0, pads) + str;
}

/** Returns true if string represents a valid number (int, float, signed). */
export function isNumeric(text: string | null | undefined): boolean {
  if (isNullOrEmpty(text)) return false;
  return /^[-+]?\d*\.?\d+\.?$/.test(text!);
}

/** Rounds value to decimalPlaces. */
export function roundToDecimalPlaces(value: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}

/**
 * Formats a number with optional rounding.
 * @param roundFlag      - when true, rounds to roundToDecimal places
 * @param roundToDecimal - number of decimal places when rounding
 */
export function getFormattedNumber(
  value: number | null | undefined,
  roundFlag: boolean,
  roundToDecimal: number
): string {
  if (value == null) return '';
  try {
    const rounded = roundFlag ? roundToDecimalPlaces(value, roundToDecimal) : value;
    return roundFlag
      ? rounded.toFixed(roundToDecimal)
      : parseFloat(rounded.toPrecision(10)).toString();
  } catch {
    return String(value);
  }
}

/** Returns true if string contains only ASCII characters (code points 0–128). */
export function isEnglishChar(str: string): boolean {
  return /^[\u0000-\u0080]+$/.test(str);
}

/**
 * Returns byte-length of string counting non-ASCII characters as 2 bytes.
 */
export function getNonEnglishTextLength(s: string): number {
  return [...s].reduce((len, c) => len + (isEnglishChar(c) ? 1 : 2), 0);
}

/** Removes specific control characters (VT \u000b, STX \u0002) and trims/uppercases. */
export function removeSpecialChar(str: string | null | undefined): string | null {
  if (isEmpty(str)) return str ?? null;
  return str!.replace(/\u000b|\u0002/g, ' ').trim().toUpperCase();
}

/** Returns true if "true" (case-insensitive). */
export function isFlagOn(value: string | null | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

/** Truncates text to endIndex characters and appends "...". */
export function getFixedCharacterString(text: string | null | undefined, endIndex: number): string {
  if (isEmpty(text)) return '';
  return text!.length > endIndex ? text!.slice(0, endIndex) + '...' : text!;
}

/** Extracts the part after the first "-" in a key string. */
export function getReferenceFromKey(text: string | null | undefined): string {
  if (text?.includes('-')) return text.split('-')[1] ?? '';
  return '';
}

/**
 * Extracts the numeric booking number from a BL number
 * where the first 3 chars are the office code (letters) and the rest are digits.
 */
export function getBookingNumberFromBLNumber(blNumber: string | null | undefined): string {
  if (!blNumber || blNumber.length <= 3) return '';
  const officeCode = blNumber.slice(0, 3);
  const bookingNumber = blNumber.slice(3);
  return /^[A-Za-z]+$/.test(officeCode) && /^\d+$/.test(bookingNumber) ? bookingNumber : '';
}

/**
 * Converts a list to a SQL-style CSV string (e.g. ['a','b','c'] → "'a','b','c'").
 */
export function convertListToCsv(list: string[]): string {
  return list.map(item => `'${item}'`).join(',');
}

/**
 * Splits an email string (delimited by , ; : or space) into a deduped map of { email: "" }.
 */
export function splitMail(value: string | null | undefined): Record<string, string> {
  if (isNullOrEmpty(value)) return {};
  return Object.fromEntries(
    value!.replace(/[,:]/g, ';').replace(/ /g, ';')
      .split(';')
      .map(e => e.trim())
      .filter(e => e.length > 0)
      .map(e => [e, ''])
  );
}

/**
 * Extracts email addresses from a string, handling "Name <email>" format.
 * @param splitDelimiter - regex or string delimiter to split the input
 */
export function getEmailIdsFromString(input: string, splitDelimiter: string): string[] {
  return input.split(splitDelimiter).map(data => {
    const match = data.match(/<([^>]+)>/);
    return match ? match[1].trim() : data.trim();
  }).filter(e => e.length > 0);
}

/**
 * Returns the substring between startDelimiter and endDelimiter.
 * Returns "" if delimiters are not found.
 */
export function getDelimitedSubstring(
  text: string | null | undefined,
  startDelimiter: string,
  endDelimiter: string
): string {
  if (!text || !startDelimiter || !endDelimiter) return '';
  const start = text.indexOf(startDelimiter);
  if (start < 0) return '';
  const stop = text.indexOf(endDelimiter, start + 1);
  return stop > start ? text.slice(start + 1, stop) : '';
}

/** Returns true if email matches standard email format. */
export function isValidEmailFormat(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim());
}

export function str(v: any): string {
  return v != null ? String(v) : '';
}

export function strOrNull(v: any): string | null {
  return v != null && v !== '' ? String(v) : null;
}

export function formatName(v: any): string {
  if (v == null) return '';
  return String(v).replace(/\r?\n/g, ' ').substring(0, 50);
}

export function formatAddress(v: any): {
  addr1: string;
  addr2: string;
  addr3: string;
} {
  const lines = (v == null ? '' : String(v))
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  return {
    addr1: (lines[0] || '').substring(0, 50),
    addr2: (lines[1] || '').substring(0, 50),
    addr3: (lines[2] || '').substring(0, 50),
  };
}

export function num(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const joinLines = (...parts: (string | null | undefined)[]): string =>
  parts.filter(Boolean).join('\n');

export const replacePleaseSelect = (value: string | null): string => {
  return value === 'Please Select' ? "-1" : value ?? "-1";
}

export function formatSequenceNumber(value: number, padding: number): string {
  const finalValue = !value ? 1 : value;
  return finalValue.toString().padStart(padding, "0");
}