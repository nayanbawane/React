/**
 * quoteValidation.ts
 *
 * Pre-save validation for the LCL Quote form.
 * Validates sequentially — returns the FIRST failing rule only.
 *
 * DEBUGGING TIP: Set `ENABLE_QUOTE_VALIDATION = false` to bypass all checks
 * during development/debugging without having to remove any code.
 */

export const ENABLE_QUOTE_VALIDATION = true;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point — sequential validation, stops at first failure
// ─────────────────────────────────────────────────────────────────────────────
export function validateQuoteForm(
  main: any,
  customer: any,
  routing: any,
  _cargo: any,
  rate: any,
): ValidationResult {
  debugger  
  if (!ENABLE_QUOTE_VALIDATION) {
    return { valid: true, errors: [] };
  }
  // 1. If type is not selected → silent block (no error, no save)
  if (!main?.type || main?.type === '-1') {
    return { valid: false, errors: [] };
  }

  // Skip LCL-specific validations for FCL quotes
  // const quoteType = String(main.type).toUpperCase();
  // if (quoteType === 'F') {
  //   return { valid: true, errors: [] };
  // }

  // 2. Quote must be rated (chargeBeanList check)
  const chargeRows: any[] = rate?.charges?.rateDetails ?? [];
  const hasRatedCharges = chargeRows.some(
    (row) => row?.incomeChargeDetails?.chargeDescription || row?.incomeAmount
  );
  const ratedChargeRows = chargeRows.filter(
    (row) => row?.incomeChargeDetails?.chargeDescription || row?.incomeChargeDetails?.chargeCode
  );
  // main?.type === 'F' && 
  if (ratedChargeRows.length === 0) {
    return { valid: false, errors: ['Quote Must be Rated.'] };
  }

  // Rate basis validation
  const rowsWithoutBasis = ratedChargeRows.filter(
    (row) => !row?.incomeBasis?.trim()
  );
  if (main?.type === 'F' && rowsWithoutBasis.length > 0) {
    return { valid: false, errors: ['Please select Basis.'] };
  }

  // Routing → Terms & Main → Terms & Main -> quoteChannel validation
  const termsChannelErrors: string[] = [];
  const r = routing?.routingFormData ?? routing;
  if (!r?.terms && main?.type === 'L') {
    return { valid: false, errors: ['Terms is mandatory.'] };
  }
    if (main?.type === 'L' && (!main?.quoteChannel || main?.quoteChannel === '-1')) termsChannelErrors.push('Please select a Quote Channel.');
  // Truck Quote minimized routing — certain fields are hidden and must not be validated
  const isTruckQuoteDoorToCFS =
    main?.truckQuote === 'Yes' &&
    r?.terms === 'DRCF' &&
    (r?.pickupNeeded === 'Y' || r?.pickupNeeded === 'T');
  const isTruckQuoteCFSToDoor =
    main?.truckQuote === 'Yes' &&
    r?.terms === 'CFDR' &&
    r?.pickupNeeded === 'N';
  const isTruckQuoteMinimized = isTruckQuoteDoorToCFS || isTruckQuoteCFSToDoor;

  //if (main?.type === 'F' && !routing?.terms ) termsChannelErrors.push('Terms is mandatory.'); 
  if (main?.type === 'F' && (!main?.quoteChannel || main?.quoteChannel === '-1')) termsChannelErrors.push('Please select a Quote Channel.');
  if (termsChannelErrors.length) return { valid: false, errors: termsChannelErrors };

  // Customer → Name & Address
  const lclForm = customer?.lclForm ?? customer?.defaultForm ?? customer;
  const customerErrors: string[] = [];
  if (main?.type === 'F' && !lclForm?.customerName) customerErrors.push('Please enter some text for Customer Name.');
  if (main?.type === 'F' && !lclForm?.customerAddress) customerErrors.push('Please enter some text for Customer Address.');
  if (customerErrors.length) return { valid: false, errors: customerErrors };


  // 6. Port of Loading / Discharge Code & Name (skipped in truck quote minimized view — fields are hidden)
  const portErrors: string[] = [];
  if (main?.type === 'L' && !isTruckQuoteMinimized) {
    if (!r?.portOfLoadingCode) portErrors.push('Port of Loading Code is mandatory.');
    if (!r?.portOfLoadingName) portErrors.push('Port of Loading Name is mandatory.');
    if (!r?.portOfDischargeCode) portErrors.push('Port of Discharge Code is mandatory.');
    if (!r?.portOfDischargeName) portErrors.push('Port of Discharge Name is mandatory.');
    if (portErrors.length) {
      return { valid: false, errors: [portErrors.join(' ')] };
    }
  }

  // FCL routing load code/name discharge Code/name
  if (main?.type === 'F') {
    // if (!main?.terms) termsChannelErrors.push('Terms is mandatory.');
    if (!r?.loadCode) portErrors.push('Load Code is mandatory.');
    if (!r?.loadName) portErrors.push('Load Name is mandatory.');
    if (!r?.dischargeCode) portErrors.push('Discharge Code is mandatory.');
    if (!r?.dischargeName) portErrors.push('Discharge Name is mandatory.');
    if (portErrors.length) return { valid: false, errors: portErrors };
  }

  // 7. CFS Cutoff Date & Time (skipped for CFS/DOOR minimized view — fields are hidden there)
  const cfsErrors: string[] = [];
  if (main?.type === 'L' && !isTruckQuoteCFSToDoor) {
    if (!r?.cfsCutoffDate) cfsErrors.push('CFS Cutoff Date is mandatory.');
    if (!r?.cfsCutoffTime) cfsErrors.push('CFS Cutoff Time is mandatory.');
    if (cfsErrors.length) {
      return { valid: false, errors: [cfsErrors.join(' ')] };
    }
  }

  return { valid: true, errors: [] };
}
