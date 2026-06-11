export interface GetCurrencyConversionRateRequest {
  schemaName: string;
  company: string;
  localCurrency: string;
}

export interface GetCurrencyConversionRateResponse {
  result: Record<string, number>;
  errorCode: string | null;
  message: string | null;
  success: boolean | null;
}

export interface GetRateCalcWithFormulaRequest {}

export interface Formula {
  weightFormular: string | null;
  cubeFormular: string | null;
  formula: string | null;
  description: string;
}

export interface GetRateCalcWithFormulaResponse {
  result: Record<string, Formula>;
}

export interface GetRateCalcRequest {}

export interface GetRateCalcResponse {
  result: Record<string, string>;
}
