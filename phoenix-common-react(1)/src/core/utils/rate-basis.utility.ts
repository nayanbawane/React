// export type ModuleType = 'O' | 'A';

export interface RateCalculationInput {
  moduleType: 'O' | 'A';
  basis: string;
  uom: string;

  rate: number;

  weight?: number;
  cube?: number;
  pieces?: number;

  ofrAmount?: number;
  inlAmount?: number;
  dlcAmount?: number;
  preAmount?: number;
  strAmount?: number;

  totalTEU?: number;

  actualWeight?: number;
  actualLength?: number;
  fromWeight?: number;
  fromLength?: number;

  flatRate?: number;
  minRate?: number;
  percentage?: number;
  airAmount?: number;
}
export interface FormulaEntry {
  formula: string;
  weightFormular?: string | null;
  cubeFormular?: string | null;
  description?: string;
}

export type DetailedFormulaMap = Record<string, FormulaEntry>;

export type FormulaMap = Record<string, string>;

export interface FormularDescription {
  formulaType: 'W/M' | 'other';
  calculationDescription: string;
  popupDescription: string;
  description: string;
  weightDescription?: string;
  measureDescription?: string;
  maxValue?: 'W' | 'M';
}

const ALL_KEY_BASIS = new Set([
  'EA',
  'LS',
  'C',
  'MIN',
  'PC',
  'CA',
  'F',
  'P',
  '%',
  'PTU',
  'S%',
  '%I',
  '%D',
  '%P',
]);

export class RateBasisUtility {
  private formulas: DetailedFormulaMap;

  constructor(formulas: DetailedFormulaMap | FormulaMap) {
    const first = Object.values(formulas)[0];
    if (first === undefined || typeof first === 'string') {
      this.formulas = Object.fromEntries(
        Object.entries(formulas as FormulaMap).map(([k, v]) => [
          k,
          { formula: v },
        ])
      );
    } else {
      this.formulas = formulas as DetailedFormulaMap;
    }
  }

  calculate(input: RateCalculationInput): number {
    const formula = this.getFormula(input);
    if (!formula) return 0;
    return this.evaluate(
      this.resolveFormula(formula, input),
      this.isUseMinForGreatest(input)
    );
  }

  getFormular(input: RateCalculationInput): FormulaEntry | null {
    const { moduleType, basis, uom } = input;
    const basisUpper = basis.toUpperCase();

    if (ALL_KEY_BASIS.has(basisUpper)) {
      const allKey = `${moduleType}-${basis}-ALL`.toUpperCase();
      return this.formulas[allKey] ?? null;
    }

    const exactKey = `${moduleType}-${basis}-${uom}`.toUpperCase();
    const allKey = `${moduleType}-${basis}-ALL`.toUpperCase();
    return this.formulas[exactKey] ?? this.formulas[allKey] ?? null;
  }

  getFormula(input: RateCalculationInput): string | null {
    return this.getFormular(input)?.formula ?? null;
  }

  calculateFormular(input: RateCalculationInput): FormularDescription {
    const empty: FormularDescription = {
      formulaType: 'other',
      calculationDescription: '',
      popupDescription: '',
      description: '',
    };

    const entry = this.getFormular(input);
    if (!entry) return empty;

    const description = entry.description ?? '';
    const wf = (entry.weightFormular ?? '').trim();
    const cf = (entry.cubeFormular ?? '').trim();
    const hasWeight = wf !== '' && wf !== ' ';
    const hasCube = cf !== '' && cf !== ' ';

    if (!hasWeight && !hasCube) {
      const formula = entry.formula ?? '';
      const result = this.evaluate(
        this.resolveFormula(formula, input),
        this.isUseMinForGreatest(input)
      );
      const displayFormula = this.substituteForDisplay(formula, input);
      const labeledFormula = this.showFormula(formula);
      return {
        formulaType: 'other',
        calculationDescription: `${displayFormula} = ${result}`,
        popupDescription: `This is the formula for ${description}.\n  ${description}: ${labeledFormula}`,
        description,
      };
    }

    if (hasWeight && !hasCube) {
      const weightAmount = this.getRateWeight(
        wf,
        input.rate,
        input.weight ?? 0
      );
      const displayFormula = this.addWeightUnits(
        this.substituteForDisplay(wf, input)
      );
      const labeledFormula = this.showFormula(wf);
      return {
        formulaType: 'other',
        calculationDescription: `Weight: ${displayFormula} = ${weightAmount}`,
        popupDescription: `This is the formula for ${description}.\nWeight : ${labeledFormula}`,
        description,
      };
    }

    if (!hasWeight && hasCube) {
      const cubeAmount = this.getRateCube(cf, input.rate, input.cube ?? 0);
      const displayFormula = this.addCubeUnits(
        this.substituteForDisplay(cf, input)
      );
      const labeledFormula = this.showFormula(cf);
      return {
        formulaType: 'other',
        calculationDescription: `Measure: ${displayFormula} = ${cubeAmount}`,
        popupDescription: `This is the formula for ${description}.\nMeasure   : ${labeledFormula}`,
        description,
      };
    }

    const weightAmount = this.getRateWeight(wf, input.rate, input.weight ?? 0);
    const cubeAmount = this.getRateCube(cf, input.rate, input.cube ?? 0);
    const maxValue = this.findMax(weightAmount, cubeAmount);

    const weightDisplay = this.addWeightUnits(
      this.substituteForDisplay(wf, input)
    );
    const cubeDisplay = this.addCubeUnits(this.substituteForDisplay(cf, input));
    const weightLabel = this.showFormula(wf);
    const cubeLabel = this.showFormula(cf);

    const weightAmountRounded = Number(weightAmount.toFixed(4));

    return {
      formulaType: 'W/M',
      calculationDescription: '',
      popupDescription: `This is the formula for ${description}.\nWeight : ${weightLabel}\nMeasure   : ${cubeLabel}`,
      description,
      weightDescription: `Weight: ${weightDisplay} = ${weightAmountRounded}`,
      measureDescription: `Measure: ${cubeDisplay} = ${cubeAmount}`,
      maxValue,
    };
  }

  getFormulaForUI(input: RateCalculationInput): string {
    const desc = this.calculateFormular(input);
    if (desc.formulaType === 'W/M') {
      return [desc.weightDescription, desc.measureDescription]
        .filter(Boolean)
        .join(' ');
    }
    return desc.calculationDescription;
  }

  private isUseMinForGreatest(input: RateCalculationInput): boolean {
    const isAirFreight =
      input.flatRate !== undefined || input.minRate !== undefined;
    return isAirFreight && (input.minRate ?? 0) === 0 && input.rate < 0;
  }

  private resolveFormula(formula: string, input: RateCalculationInput): string {
    const map: Record<string, number> = {
      srate: input.rate ?? 0,
      weight: input.weight ?? 0,
      cube: input.cube ?? 0,
      cbf: input.cube ?? 0,
      no_pieces: input.pieces ?? 0,
      oframt: input.ofrAmount ?? 0,
      inlamt: input.inlAmount ?? 0,
      dlcamt: input.dlcAmount ?? 0,
      preamt: input.preAmount ?? 0,
      stramt: input.strAmount ?? 0,
      totalteu: input.totalTEU ?? 0,
      actualwt: input.actualWeight ?? 0,
      actuallh: input.actualLength ?? 0,
      fromwt: input.fromWeight ?? 0,
      fromlh: input.fromLength ?? 0,
      frate: input.flatRate ?? 0,
      mrate: input.minRate ?? 0,
      per: input.percentage ?? 0,
      airamt: input.airAmount ?? 0,
    };

    let resolved = formula;
    Object.entries(map).forEach(([key, value]) => {
      resolved = resolved.replace(new RegExp(`\\b${key}\\b`, 'g'), `${value}`);
    });
    return resolved;
  }

  private evaluate(expression: string, useMinForGreatest = false): number {
    try {
      const round = (v: number, d = 0): number => {
        const f = Math.pow(10, d);
        return Math.round(v * f) / f;
      };

      const greatest = (...args: number[]): number =>
        useMinForGreatest ? Math.min(...args) : Math.max(...args);
      const abs = (v: number): number => Math.abs(v);
      const sign = (v: number): number => Math.sign(v);
      const ceil = (v: number): number => Math.ceil(v);
      const trunc = (v: number): number => Math.trunc(v);

      const fn = new Function(
        'round',
        'greatest',
        'abs',
        'sign',
        'ceil',
        'trunc',
        `return (${expression})`
      );
      const result = fn(round, greatest, abs, sign, ceil, trunc);
      return this.format(result);
    } catch (e) {
      console.error('Error evaluating formula:', expression, e);
      return 0;
    }
  }

  private format(value: number): number {
    return Number(value.toFixed(2));
  }

  private substituteForDisplay(
    formula: string,
    input: RateCalculationInput
  ): string {
    const map: Record<string, number> = {
      srate: input.rate ?? 0,
      weight: input.weight ?? 0,
      cube: input.cube ?? 0,
      cbf: input.cube ?? 0,
      no_pieces: input.pieces ?? 0,
      oframt: input.ofrAmount ?? 0,
      inlamt: input.inlAmount ?? 0,
      dlcamt: input.dlcAmount ?? 0,
      preamt: input.preAmount ?? 0,
      stramt: input.strAmount ?? 0,
      totalteu: input.totalTEU ?? 0,
      actualwt: input.actualWeight ?? 0,
      actuallh: input.actualLength ?? 0,
      fromwt: input.fromWeight ?? 0,
      fromlh: input.fromLength ?? 0,
      frate: input.flatRate ?? 0,
      mrate: input.minRate ?? 0,
      per: input.percentage ?? 0,
      airamt: input.airAmount ?? 0,
    };
    let result = formula;
    Object.entries(map).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\b${key}\\b`, 'g'), `${value}`);
    });
    return result;
  }

  private addWeightUnits(formula: string): string {
    return formula.replace(/\//g, 'Kg/').replace(/\*\./g, 'Kg*.');
  }

  private addCubeUnits(formula: string): string {
    return formula.replace(/\*/g, 'Cbm *');
  }

  getRateWeight(formula: string, rate: number, weight: number): number {
    const resolved = this.resolveFormula(formula, {
      moduleType: 'O',
      basis: '',
      uom: '',
      rate,
      weight,
    });
    return this.evaluate(resolved);
  }

  getRateCube(formula: string, rate: number, cube: number): number {
    const resolved = this.resolveFormula(formula, {
      moduleType: 'O',
      basis: '',
      uom: '',
      rate,
      cube,
    });
    return this.evaluate(resolved);
  }

  getRateFull(formula: string, input: RateCalculationInput): number {
    return this.evaluate(
      this.resolveFormula(formula, input),
      this.isUseMinForGreatest(input)
    );
  }

  findAmountFromFormula(formula: string): number {
    return this.evaluate(formula);
  }

  calculateQuantity(input: RateCalculationInput): number {
    const formula = this.getFormula(input);
    if (!formula) return 1;

    const hasWeight = formula.includes('weight');
    const hasCube = formula.includes('cube');

    if (hasWeight && hasCube) {
      const weightRate = this.getRateFull(formula, { ...input, cube: 0 });
      const cubeRate = this.getRateFull(formula, { ...input, weight: 0 });
      return weightRate > cubeRate ? (input.weight ?? 0) : (input.cube ?? 0);
    }

    if (hasWeight) return input.weight ?? 0;
    if (hasCube) return input.cube ?? 0;

    if (formula.includes('no_pieces') && formula.includes('srate'))
      return input.pieces ?? 0;
    if (formula.includes('oframt') && formula.includes('srate'))
      return input.ofrAmount ?? 0;

    return 1;
  }

  showFormula(formula: string): string {
    return formula
      .replace(/\bsrate\b/g, 'Rate')
      .replace(/\bweight\b/g, 'Weight in Kg')
      .replace(/\bcube\b/g, 'CBM')
      .replace(/\bcbf\b/g, 'CBM')
      .replace(/\bno_pieces\b/g, 'Pieces');
  }

  showWeightFormula(formula: string): string {
    return `Weight: ${this.showFormula(formula)}`;
  }

  showCubeFormula(formula: string): string {
    return `Measure: ${this.showFormula(formula)}`;
  }

  showWeightCubeFormula(weightFormula: string, cubeFormula: string): string {
    return `Weight: ${this.showFormula(weightFormula)}\nMeasure: ${this.showFormula(cubeFormula)}`;
  }

  findMax(weightAmount: number, cubeAmount: number): 'W' | 'M' {
    return weightAmount > cubeAmount ? 'W' : 'M';
  }
}
