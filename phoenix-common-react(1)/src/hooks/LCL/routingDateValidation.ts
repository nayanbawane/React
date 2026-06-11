import type {
  RoutingFormData,
  TransshipmentPortRow,
} from '../../types/LCL/routing/RoutingDetails.types';

export type RoutingDateField =
  | 'placeOfReceiptEtd'
  | 'consolidationCfsEtd'
  | 'portOfLoadingEts'
  | 'portOfDischargeEta'
  | 'deconsolidationCfsEta'
  | 'destinationCfsEta'
  | 'placeOfDeliveryEta';

interface FieldMeta {
  dateLabel: string;
  fieldLabel: string;
}

const FIELD_META: Record<RoutingDateField, FieldMeta> = {
  placeOfReceiptEtd: { dateLabel: 'ETD', fieldLabel: 'Place of Receipt Code' },
  consolidationCfsEtd: {
    dateLabel: 'ETD',
    fieldLabel: 'Consolidation CFS Code',
  },
  portOfLoadingEts: { dateLabel: 'ETS', fieldLabel: 'Port of Loading Code' },
  portOfDischargeEta: {
    dateLabel: 'ETA',
    fieldLabel: 'Port of Discharge Code',
  },
  deconsolidationCfsEta: {
    dateLabel: 'ETA',
    fieldLabel: 'Deconsolidation CFS Code',
  },
  destinationCfsEta: { dateLabel: 'ETA', fieldLabel: 'Destination CFS Code' },
  placeOfDeliveryEta: {
    dateLabel: 'ETA',
    fieldLabel: 'Place of Delivery Code',
  },
};

const TRANSSHIPMENT_DATE_LABEL = 'ETA';
const TRANSSHIPMENT_FIELD_LABEL = 'Transshipment Port';

export interface RoutingDateValidationResult {
  valid: boolean;
  message?: string;
  autoCopy?: { field: 'placeOfReceiptEtd'; value: Date };
}

type DateSnap = Pick<
  RoutingFormData,
  | 'placeOfReceiptEtd'
  | 'consolidationCfsEtd'
  | 'portOfLoadingEts'
  | 'portOfDischargeEta'
  | 'deconsolidationCfsEta'
  | 'destinationCfsEta'
  | 'placeOfDeliveryEta'
  | 'transshipmentPorts'
  | 'direction'
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
  if (!toCheck || !withWhich) return { valid: true };

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

function tMeta(seq: number): FieldMeta {
  return {
    dateLabel: TRANSSHIPMENT_DATE_LABEL,
    fieldLabel: `${TRANSSHIPMENT_FIELD_LABEL} ${seq}`,
  };
}


export function validateRoutingDate(
  changedField: RoutingDateField,
  newValue: Date | null,
  snap: DateSnap,
  options: { disablePlaceOfDelivery: boolean }
): RoutingDateValidationResult {
  if (!newValue) return { valid: true };

  const { disablePlaceOfDelivery } = options;
  const dates: DateSnap = { ...snap, [changedField]: newValue };

  const por = dates.placeOfReceiptEtd;
  const consol = dates.consolidationCfsEtd;
  const pol = dates.portOfLoadingEts;
  const pod = dates.portOfDischargeEta;
  const decon = dates.deconsolidationCfsEta;
  const dest = dates.destinationCfsEta;
  const deliv = dates.placeOfDeliveryEta;
  const trans = dates.transshipmentPorts;

  const M = FIELD_META;
  const c: Collector = { passed: true };

  switch (changedField) {
    case 'placeOfReceiptEtd': {
      const m = M.placeOfReceiptEtd;
      run(c, por, m, consol, M.consolidationCfsEtd, 'before');
      run(c, por, m, pol, M.portOfLoadingEts, 'before');
      trans.forEach((t, i) => run(c, por, m, t.eta, tMeta(i + 1), 'before'));
      run(c, por, m, pod, M.portOfDischargeEta, 'before');
      run(c, por, m, decon, M.deconsolidationCfsEta, 'before');
      run(c, por, m, dest, M.destinationCfsEta, 'before');
      if (!disablePlaceOfDelivery)
        run(c, por, m, deliv, M.placeOfDeliveryEta, 'before');
      break;
    }
    case 'consolidationCfsEtd': {
      const m = M.consolidationCfsEtd;
      run(c, consol, m, por, M.placeOfReceiptEtd, 'after');
      run(c, consol, m, pol, M.portOfLoadingEts, 'before');
      trans.forEach((t, i) => run(c, consol, m, t.eta, tMeta(i + 1), 'before'));
      run(c, consol, m, pod, M.portOfDischargeEta, 'before');
      run(c, consol, m, decon, M.deconsolidationCfsEta, 'before');
      run(c, consol, m, dest, M.destinationCfsEta, 'before');
      if (!disablePlaceOfDelivery)
        run(c, consol, m, deliv, M.placeOfDeliveryEta, 'before');
      break;
    }
    case 'portOfLoadingEts': {
      const m = M.portOfLoadingEts;
      run(c, pol, m, por, M.placeOfReceiptEtd, 'after');
      run(c, pol, m, consol, M.consolidationCfsEtd, 'after');
      trans.forEach((t, i) => run(c, pol, m, t.eta, tMeta(i + 1), 'before'));
      run(c, pol, m, pod, M.portOfDischargeEta, 'before');
      run(c, pol, m, decon, M.deconsolidationCfsEta, 'before');
      run(c, pol, m, dest, M.destinationCfsEta, 'before');
      if (!disablePlaceOfDelivery)
        run(c, pol, m, deliv, M.placeOfDeliveryEta, 'before');
      break;
    }
    case 'portOfDischargeEta': {
      const m = M.portOfDischargeEta;
      run(c, pod, m, por, M.placeOfReceiptEtd, 'after');
      run(c, pod, m, consol, M.consolidationCfsEtd, 'after');
      run(c, pod, m, pol, M.portOfLoadingEts, 'after');
      trans.forEach((t, i) => run(c, pod, m, t.eta, tMeta(i + 1), 'after'));
      run(c, pod, m, decon, M.deconsolidationCfsEta, 'before');
      run(c, pod, m, dest, M.destinationCfsEta, 'before');
      if (!disablePlaceOfDelivery)
        run(c, pod, m, deliv, M.placeOfDeliveryEta, 'before');
      break;
    }
    case 'deconsolidationCfsEta': {
      const m = M.deconsolidationCfsEta;
      run(c, decon, m, por, M.placeOfReceiptEtd, 'after');
      run(c, decon, m, consol, M.consolidationCfsEtd, 'after');
      run(c, decon, m, pol, M.portOfLoadingEts, 'after');
      trans.forEach((t, i) => run(c, decon, m, t.eta, tMeta(i + 1), 'after'));
      run(c, decon, m, pod, M.portOfDischargeEta, 'after');
      run(c, decon, m, dest, M.destinationCfsEta, 'before');
      if (!disablePlaceOfDelivery)
        run(c, decon, m, deliv, M.placeOfDeliveryEta, 'before');
      break;
    }
    case 'destinationCfsEta': {
      const m = M.destinationCfsEta;
      run(c, dest, m, por, M.placeOfReceiptEtd, 'after');
      run(c, dest, m, consol, M.consolidationCfsEtd, 'after');
      run(c, dest, m, pol, M.portOfLoadingEts, 'after');
      trans.forEach((t, i) => run(c, dest, m, t.eta, tMeta(i + 1), 'after'));
      run(c, dest, m, pod, M.portOfDischargeEta, 'after');
      run(c, dest, m, decon, M.deconsolidationCfsEta, 'after');
      if (!disablePlaceOfDelivery)
        run(c, dest, m, deliv, M.placeOfDeliveryEta, 'before');
      break;
    }
    case 'placeOfDeliveryEta': {
      const m = M.placeOfDeliveryEta;
      run(c, deliv, m, por, M.placeOfReceiptEtd, 'after');
      run(c, deliv, m, consol, M.consolidationCfsEtd, 'after');
      run(c, deliv, m, pol, M.portOfLoadingEts, 'after');
      trans.forEach((t, i) => run(c, deliv, m, t.eta, tMeta(i + 1), 'after'));
      run(c, deliv, m, pod, M.portOfDischargeEta, 'after');
      run(c, deliv, m, decon, M.deconsolidationCfsEta, 'after');
      run(c, deliv, m, dest, M.destinationCfsEta, 'after');
      break;
    }
  }

  if (!c.passed) {
    return { valid: false, message: c.message };
  }

  if (
    changedField === 'portOfLoadingEts' &&
    newValue &&
    snap.direction === 'IM' &&
    !snap.placeOfReceiptEtd
  ) {
    return {
      valid: true,
      autoCopy: { field: 'placeOfReceiptEtd', value: newValue },
    };
  }

  return { valid: true };
}


export function validateTransshipmentDate(
  changedIndex: number,
  newValue: Date | null,
  snap: DateSnap,
  options: { disablePlaceOfDelivery: boolean }
): RoutingDateValidationResult {
  if (!newValue) return { valid: true };

  const { disablePlaceOfDelivery } = options;
  const changedSeq = changedIndex + 1;
  const changedMeta = tMeta(changedSeq);

  const trans = snap.transshipmentPorts.map((t, i) =>
    i === changedIndex ? { ...t, eta: newValue } : t
  );

  const por = snap.placeOfReceiptEtd;
  const consol = snap.consolidationCfsEtd;
  const pol = snap.portOfLoadingEts;
  const pod = snap.portOfDischargeEta;
  const decon = snap.deconsolidationCfsEta;
  const dest = snap.destinationCfsEta;
  const deliv = snap.placeOfDeliveryEta;

  const M = FIELD_META;
  const c: Collector = { passed: true };

  run(c, newValue, changedMeta, por, M.placeOfReceiptEtd, 'after');
  run(c, newValue, changedMeta, consol, M.consolidationCfsEtd, 'after');
  run(c, newValue, changedMeta, pol, M.portOfLoadingEts, 'after');

  trans.forEach((t, i) => {
    const seq = i + 1;
    if (seq === changedSeq) return;
    const dir: 'before' | 'after' = changedSeq > seq ? 'after' : 'before';
    run(c, newValue, changedMeta, t.eta, tMeta(seq), dir);
  });

  run(c, newValue, changedMeta, pod, M.portOfDischargeEta, 'before');
  run(c, newValue, changedMeta, decon, M.deconsolidationCfsEta, 'before');
  run(c, newValue, changedMeta, dest, M.destinationCfsEta, 'before');
  if (!disablePlaceOfDelivery)
    run(c, newValue, changedMeta, deliv, M.placeOfDeliveryEta, 'before');

  if (!c.passed) {
    return { valid: false, message: c.message };
  }
  return { valid: true };
}
