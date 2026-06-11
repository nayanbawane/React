export type ControlFlag = "N" | "U" | "A" | "" | " " | string;
export type YesNo = "Y" | "N";
export type PayType = "P" | "C";
export type OriginDestination = "O" | "D";

/**
 * Generic checker
 */
const isOneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T => {
  return typeof value === "string" && allowed.includes(value as T);
};

export const toControlFlag = (
  value?: unknown
): ControlFlag | undefined => {
  return typeof value === "string" ? value : undefined;
};

export const toYesNo = (
  value?: unknown
): YesNo | undefined => {
  return isOneOf(value, ["Y", "N"]) ? value : undefined;
};

export const toPayType = (
  value?: unknown
): PayType | undefined => {
  return isOneOf(value, ["P", "C"]) ? value : undefined;
};

export const toOriginDestination = (
  value?: unknown
): OriginDestination | undefined => {
  return isOneOf(value, ["O", "D"]) ? value : undefined;
};