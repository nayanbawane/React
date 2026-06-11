export const mapCustomFromPopulate = (quoteBean: any) => {
  const cust = quoteBean?.bookingQuoteCargoBean.genAesFilingBean;
  if (!cust) return null;

  return {
    fillingType: cust.filingType ?? '',
    SCACCodeText: cust.scacCode ?? '',
    fillingAs: cust.filingType,
    ITNNumber: cust.itnNumber ?? '',
    fillingByUCR: '',
    ucrNumberUCR: '',
    masterUCR: false,
  };
}
