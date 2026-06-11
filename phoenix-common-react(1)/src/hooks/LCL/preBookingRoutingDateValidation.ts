import type { RoutingFormData } from '../../types/LCL/routing/RoutingDetails.types';

export type RoutingDateField =
  | 'placeOfReceiptEtd'
  | 'portOfLoadingEts'
  | 'portOfDischargeEta'
  | 'destinationCfsEta'
  | 'placeOfDeliveryEta';

interface FieldMeta {
  dateLabel: string;
  fieldLabel: string;
}

const FIELD_META: Record<RoutingDateField, FieldMeta> = {
  placeOfReceiptEtd: {
    dateLabel: 'ETD',
    fieldLabel: 'Place of Receipt Code',
  },

  portOfLoadingEts: {
    dateLabel: 'ETS',
    fieldLabel: 'Port of Loading Code',
  },

  portOfDischargeEta: {
    dateLabel: 'ETA',
    fieldLabel: 'Port of Discharge Code',
  },

  destinationCfsEta: {
    dateLabel: 'ETA',
    fieldLabel: 'Destination CFS Code',
  },

  placeOfDeliveryEta: {
    dateLabel: 'ETA',
    fieldLabel: 'Place of Delivery Code',
  },
};

export interface RoutingDateValidationResult {
  valid: boolean;
  message?: string;
  autoCopy?: {
    field: 'placeOfReceiptEtd';
    value: Date;
  };
}

type DateSnap = Pick<
  RoutingFormData,
  | 'placeOfReceiptEtd'
  | 'portOfLoadingEts'
  | 'portOfDischargeEta'
  | 'destinationCfsEta'
  | 'placeOfDeliveryEta'
>;

function dayMs(d: Date): number {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

function checkDate(
  toCheck: Date | null,
  withWhich: Date | null,
  dir: 'before' | 'after',
  toCheckDateLabel: string,
  toCheckFieldLabel: string,
  withWhichDateLabel: string,
  withWhichFieldLabel: string
): { valid: boolean; message?: string } {
  if (!toCheck || !withWhich) {
    return { valid: true };
  }

  const t = dayMs(toCheck);
  const w = dayMs(withWhich);

  const isValid = dir === 'before' ? t <= w : t >= w;

  if (!isValid) {
    const rel =
      dir === 'before' ? 'less than or equal to' : 'greater than or equal to';

    return {
      valid: false,
      message: `The ${toCheckDateLabel} (${toCheckFieldLabel}) should be ${rel} the ${withWhichDateLabel} (${withWhichFieldLabel}).`,
    };
  }

  return { valid: true };
}

interface Collector {
  passed: boolean;
  message?: string;
}

function run(
  c: Collector,
  toDate: Date | null,
  toMeta: FieldMeta,
  withDate: Date | null,
  withMeta: FieldMeta,
  dir: 'before' | 'after'
): void {
  if (!c.passed) return;

  const r = checkDate(
    toDate,
    withDate,
    dir,
    toMeta.dateLabel,
    toMeta.fieldLabel,
    withMeta.dateLabel,
    withMeta.fieldLabel
  );

  if (!r.valid) {
    c.passed = false;
    c.message = r.message;
  }
}

export function validatePreBookingRoutingDate(
  changedField: RoutingDateField,
  newValue: Date | string | null,
  snap: DateSnap
): RoutingDateValidationResult {
  if (!newValue) {
    return { valid: true };
  }

  const dates: DateSnap = {
    ...snap,
    [changedField]: newValue,
  };

  const por = dates.placeOfReceiptEtd;
  const pol = dates.portOfLoadingEts;
  const pod = dates.portOfDischargeEta;
  const dest = dates.destinationCfsEta;
  const deliv = dates.placeOfDeliveryEta;

  const M = FIELD_META;

  const c: Collector = {
    passed: true,
  };

  switch (changedField) {
    case 'placeOfReceiptEtd': {
      const m = M.placeOfReceiptEtd;

      run(c, por, m, pol, M.portOfLoadingEts, 'before');
      run(c, por, m, pod, M.portOfDischargeEta, 'before');
      run(c, por, m, dest, M.destinationCfsEta, 'before');
      run(c, por, m, deliv, M.placeOfDeliveryEta, 'before');

      break;
    }

    case 'portOfLoadingEts': {
      const m = M.portOfLoadingEts;

      run(c, pol, m, por, M.placeOfReceiptEtd, 'after');
      run(c, pol, m, pod, M.portOfDischargeEta, 'before');
      run(c, pol, m, dest, M.destinationCfsEta, 'before');
      run(c, pol, m, deliv, M.placeOfDeliveryEta, 'before');

      break;
    }

    case 'portOfDischargeEta': {
      const m = M.portOfDischargeEta;

      run(c, pod, m, por, M.placeOfReceiptEtd, 'after');
      run(c, pod, m, pol, M.portOfLoadingEts, 'after');
      run(c, pod, m, dest, M.destinationCfsEta, 'before');
      run(c, pod, m, deliv, M.placeOfDeliveryEta, 'before');

      break;
    }

    case 'destinationCfsEta': {
      const m = M.destinationCfsEta;

      run(c, dest, m, por, M.placeOfReceiptEtd, 'after');
      run(c, dest, m, pol, M.portOfLoadingEts, 'after');
      run(c, dest, m, pod, M.portOfDischargeEta, 'after');
      run(c, dest, m, deliv, M.placeOfDeliveryEta, 'before');

      break;
    }

    case 'placeOfDeliveryEta': {
      const m = M.placeOfDeliveryEta;

      run(c, deliv, m, por, M.placeOfReceiptEtd, 'after');
      run(c, deliv, m, pol, M.portOfLoadingEts, 'after');
      run(c, deliv, m, pod, M.portOfDischargeEta, 'after');
      run(c, deliv, m, dest, M.destinationCfsEta, 'after');

      break;
    }
  }

  if (!c.passed) {
    return {
      valid: false,
      message: c.message,
    };
  }

  return { valid: true };
}
