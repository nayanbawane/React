export const formatSixDecimals = (n: number): string =>
  parseFloat(n.toFixed(6)).toString();
