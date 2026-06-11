import { useMemo, useState, useEffect } from 'react';
import { CommonToggleKeys, ToggleKey, useFeatureToggle, type LoginClientBeanRaw, type LCLFormState as QuoteMainDetailsState } from 'phoenix-common-react';

const createDefaultQuoteDates = () => {
  const effectiveDate = new Date();
  const expirationDate = new Date(effectiveDate);
  expirationDate.setDate(expirationDate.getDate() + 29);

  return {
    effectiveDate,
    expirationDate,
  };
};

export const createDefaultMainDetailsState = (
  loginClientBean: any,
  isVisible: (key: ToggleKey) => boolean,
  selectedType = '-1'
): QuoteMainDetailsState => {
  const defaultDates = createDefaultQuoteDates();

  return {
    type: selectedType || '-1',
    referenceNumber: 0,
    userReference: '',
    status: '',
    clauses: [],
    effectiveDate: defaultDates.effectiveDate,
    expirationDate: defaultDates.expirationDate,
    quoteChannel: '',
    direction: 'Export',
    pendingFinal: '',
    truckQuote: '',
    quoteType: 'Actual',
    billingCompany: '',
    handlingOffice: loginClientBean?.office || '',
    createdBy: isVisible(CommonToggleKeys.OCN_IMPORT_QUOTE_ENHANCEMENT)
      ? loginClientBean?.ldapUser
      : loginClientBean?.username || '',
    createdOn: null,
    updatedBy: '',
    updatedOn: null,
    terms: '',
    termName: '',
    carrier: [],
    carrierBookingNumber: '',
    frequency: '',
    pickupNeeded: 'N',
    prepaidCollect: '',
    controllingEntity: 'ORG',
    transitTime: '0'
  };
};

export type MainDetailsDeps = {
  loginClientBean?: LoginClientBeanRaw;
 
};
export const useQuoteMainDetails = (loginClientBean: any, selectedType?: string) => {
    const featureToggle = useFeatureToggle();
    const { isVisible, getToggleValue } = featureToggle;
  const [formData, setFormData] = useState<QuoteMainDetailsState>(() =>
    createDefaultMainDetailsState(loginClientBean,isVisible, selectedType)

  );

  useEffect(() => {
    if (loginClientBean && !formData.createdBy) {
      setFormData((prev) => ({
        ...prev,
        createdBy: isVisible(CommonToggleKeys.OCN_IMPORT_QUOTE_ENHANCEMENT)
          ? loginClientBean?.ldapUser
          : loginClientBean?.username,

        handlingOffice:loginClientBean.office,
      }));
    }
  }, [loginClientBean]);

  useEffect(() => {
    setFormData((prev) => {
      if (prev.effectiveDate && prev.expirationDate) return prev;

      const defaultDates = createDefaultQuoteDates();
      const effectiveDate = prev.effectiveDate || defaultDates.effectiveDate;
      const expirationDate = prev.expirationDate || defaultDates.expirationDate;

      return {
        ...prev,
        effectiveDate,
        expirationDate,
      };
    });
  }, []);

  const handleMainDetailsChange = (data: Partial<QuoteMainDetailsState>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return useMemo(() => ({
    mainDetailsValue: formData,
    setFormData,
    handleMainDetailsChange,
  }), [formData]);
};
