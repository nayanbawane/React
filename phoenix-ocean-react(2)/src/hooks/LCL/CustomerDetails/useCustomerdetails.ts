import {
  CustomerDetailFormState,
  CustomerFormData,
  LclBookingDetailsForm,
  CustomerMoreDetailsForm,
  OrgCodeSuggestionItem,
  initialCustomerDetailFormState,
  useGetMultiPanelSuggestions,
  useGetSuggestions,
  useFeatureToggle,
  CommonToggleKeys,
  countrySuggestionConfig,
  buildStateSuggestionConfig,
  extractCountryCode,
  updateCustomerType,
} from 'phoenix-common-react';
import { useState, useMemo, useEffect } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { ApiService } from '@/core/api/client';
import { useCustomerSettingsApi } from './useCustomerSettingsApi';
import {
  buildCustomerCodeMultiPanelConfig,
  buildShipperCodeMultiPanelConfig,
  buildForwarderCodeMultiPanelConfig,
  buildConsigneeCodeMultiPanelConfig,
  buildNotifyPartyCodeMultiPanelConfig,
  parseCustomerTypeList,
} from './customerSuggestionConfigs';
import type { SuggestionModuleType } from './customerSuggestionConfigs';
import { devAPIlog } from '@/components/Utils/console.extension';
import { useDispatch } from 'react-redux';

export const useCustomerDetails = (
  moduleType: SuggestionModuleType = 'BKG'
) => {
  const [formData, setFormData] = useState<CustomerDetailFormState>(
    initialCustomerDetailFormState
  );
  const { isVisible, getToggleValue } = useFeatureToggle();

  const loginBean = useAppSelector((state) => state.loginClientBean.data);
  const dispatch = useDispatch();
  const direction = useAppSelector(
    (state) => state.quoteBooking.mainDetails.direction
  );
  const PreBookingMainDetails = useAppSelector(
    (state) => state.preBooking.mainDetails
  );
  let isAgentBooking = false;
  let isCrossTread = false;
  const countryCode = loginBean?.countryCode ?? '';
  const office = loginBean?.office ?? '';
  const officeSchemaName = loginBean?.schema ?? '';
  const user = loginBean?.ldapUser ?? '';

  if (PreBookingMainDetails.agentBooking) {
    isAgentBooking = true;
  }
  if (PreBookingMainDetails.routed === 'CT') {
    isCrossTread = true;
  }

  const sessionParams = useMemo(
    () => ({ countryCode, office, officeSchemaName, user, loginBean }),
    [countryCode, office, officeSchemaName, user, loginBean]
  );

  const isQuote = moduleType === 'QUO';
  const isImportQuote = isQuote && direction === 'Import';

  const custTypeValue = getToggleValue(
    isImportQuote
      ? CommonToggleKeys.IMPORT_QUO_CUST_MULTIPANEL_SUGGESTION
      : isQuote
        ? CommonToggleKeys.QUO_CUST_MULTIPANEL_SUGGESTION
        : CommonToggleKeys.BKG_CUST_MULTIPANEL_SUGGESTION
  );
  const shipTypeValue = getToggleValue(
    isQuote
      ? CommonToggleKeys.QUO_SHIP_MULTIPANEL_SUGGESTION
      : CommonToggleKeys.BKG_SHIP_MULTIPANEL_SUGGESTION
  );
  const consTypeValue = getToggleValue(
    isQuote
      ? CommonToggleKeys.QUO_CONS_MULTIPANEL_SUGGESTION
      : CommonToggleKeys.BKG_CONS_MULTIPANEL_SUGGESTION
  );

  const isPreBKG = moduleType === 'prebooking';
  let DEFAULT_CUSTOMER_TYPES;

  if (isAgentBooking && isCrossTread) {
    DEFAULT_CUSTOMER_TYPES = ['A', 'I'] as const;
  } else if (isAgentBooking) {
    DEFAULT_CUSTOMER_TYPES = ['A'] as const;
  } else if (isCrossTread) {
    DEFAULT_CUSTOMER_TYPES = ['A', 'F', 'H', 'N', 'S', 'I'] as const;
  } else {
    DEFAULT_CUSTOMER_TYPES = ['A', 'F', 'H', 'N', 'S'] as const;
  }

  const custType = isPreBKG ? DEFAULT_CUSTOMER_TYPES.join(',') : custTypeValue;

  const forwTypeValue = getToggleValue(
    CommonToggleKeys.BKG_FORW_MULTIPANEL_SUGGESTION
  );

  const customerTypeList = useMemo(
    () => parseCustomerTypeList(custType),
    [custType]
  );
  const shipperTypeList = useMemo(
    () => parseCustomerTypeList(shipTypeValue),
    [shipTypeValue]
  );
  const consigneeTypeList = useMemo(
    () => parseCustomerTypeList(consTypeValue),
    [consTypeValue]
  );
  const forwarderTypeList = useMemo(
    () => parseCustomerTypeList(forwTypeValue),
    [forwTypeValue]
  );

  const customerCodeConfig = useMemo(
    () =>
      buildCustomerCodeMultiPanelConfig(sessionParams, {
        moduleType,
        customerTypeList,
      }),
    [sessionParams, moduleType, customerTypeList]
  );
  const shipperCodeConfig = useMemo(
    () =>
      buildShipperCodeMultiPanelConfig(sessionParams, {
        moduleType,
        customerTypeList: shipperTypeList,
      }),
    [sessionParams, moduleType, shipperTypeList]
  );
  const forwarderCodeConfig = useMemo(
    () =>
      buildForwarderCodeMultiPanelConfig(sessionParams, {
        moduleType,
        customerTypeList: forwarderTypeList,
      }),
    [sessionParams, moduleType, forwarderTypeList]
  );
  const consigneeCodeConfig = useMemo(
    () =>
      buildConsigneeCodeMultiPanelConfig(sessionParams, {
        moduleType,
        customerTypeList: consigneeTypeList,
      }),
    [sessionParams, moduleType, consigneeTypeList]
  );
  const notifyPartyCodeConfig = useMemo(
    () =>
      buildNotifyPartyCodeMultiPanelConfig(sessionParams, {
        moduleType,
        customerTypeList: forwarderTypeList,
      }),
    [sessionParams, moduleType, forwarderTypeList]
  );

  const {
    customerRateSetting,
    customerPatterns,
    isLoading: customerSettingsLoading,
    error: customerSettingsError,
    fetchCustomerSettings,
  } = useCustomerSettingsApi();

  useEffect(() => {
    if (!customerRateSetting) return;
    setFormData((prev) => ({
      ...prev,
      lclForm: {
        ...prev.lclForm,
        accuRateProfile: customerRateSetting.accurateProfile ?? '',
      },
    }));
  }, [customerRateSetting]);

  const resolveState = (item: OrgCodeSuggestionItem): string =>
    isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME)
      ? item.stateName || item.stateCode
      : item.stateCode;

  const resolveControllingEntity = (): string => {
    return 'O';
  };

  const resolveRateControllingEntity = (): string => {
    return 'O';
  };

  const customerCountryCode = useMemo(
    () =>
      extractCountryCode(formData.lclForm.customerCountry) ||
      extractCountryCode(formData.defaultForm.customerCountry),
    [formData.lclForm.customerCountry, formData.defaultForm.customerCountry]
  );
  const shipperCountryCode = useMemo(
    () => extractCountryCode(formData.customerMoreDetails.shipperCountry),
    [formData.customerMoreDetails.shipperCountry]
  );
  const forwarderCountryCode = useMemo(
    () => extractCountryCode(formData.customerMoreDetails.forwarderCountry),
    [formData.customerMoreDetails.forwarderCountry]
  );
  const consigneeCountryCode = useMemo(
    () => extractCountryCode(formData.customerMoreDetails.consigneeCountry),
    [formData.customerMoreDetails.consigneeCountry]
  );
  const notifyPartyCountryCode = useMemo(
    () => extractCountryCode(formData.customerMoreDetails.notifyPartyCountry),
    [formData.customerMoreDetails.notifyPartyCountry]
  );

  const customerStateConfig = useMemo(
    () => buildStateSuggestionConfig(customerCountryCode, loginBean),
    [customerCountryCode, loginBean]
  );
  const shipperStateConfig = useMemo(
    () => buildStateSuggestionConfig(shipperCountryCode, loginBean),
    [shipperCountryCode, loginBean]
  );
  const forwarderStateConfig = useMemo(
    () => buildStateSuggestionConfig(forwarderCountryCode, loginBean),
    [forwarderCountryCode, loginBean]
  );
  const consigneeStateConfig = useMemo(
    () => buildStateSuggestionConfig(consigneeCountryCode, loginBean),
    [consigneeCountryCode, loginBean]
  );
  const notifyPartyStateConfig = useMemo(
    () => buildStateSuggestionConfig(notifyPartyCountryCode, loginBean),
    [notifyPartyCountryCode, loginBean]
  );

  // Resolve raw country codes (e.g. "US") to full display strings (e.g. "US - USA") after populate
  useEffect(() => {
    const fields = [
      {
        val: formData.lclForm.customerCountry,
        isLcl: true,
        key: 'customerCountry',
      },
      {
        val: formData.customerMoreDetails.shipperCountry,
        isLcl: false,
        key: 'shipperCountry',
      },
      {
        val: formData.customerMoreDetails.consigneeCountry,
        isLcl: false,
        key: 'consigneeCountry',
      },
    ];
    const raw = fields.filter((f) => f.val && !f.val.includes(' - '));
    if (!raw.length) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      const countryConfig = countrySuggestionConfig(loginBean);
      ApiService.post<any>(
        countryConfig.endpoint,
        countryConfig.transformRequest('%%%%')
      )
        .then((res) => {
          if (cancelled) return;
          const items = countryConfig.transformResponse(res.data) as Array<{
            code: string;
            displayName: string;
          }>;
          const lclUp: Record<string, string> = {};
          const defUp: Record<string, string> = {};
          const moreUp: Record<string, string> = {};
          raw.forEach(({ val, isLcl, key }) => {
            const match = items.find((i) => i.code === val);
            if (!match) return;
            if (isLcl) {
              lclUp[key] = match.displayName;
              defUp[key] = match.displayName;
            } else {
              moreUp[key] = match.displayName;
            }
          });
          if (Object.keys(lclUp).length || Object.keys(moreUp).length) {
            setFormData((prev) => ({
              ...prev,
              defaultForm: {
                ...prev.defaultForm,
                ...defUp,
              } as typeof prev.defaultForm,
              lclForm: { ...prev.lclForm, ...lclUp } as typeof prev.lclForm,
              customerMoreDetails: {
                ...prev.customerMoreDetails,
                ...moreUp,
              } as typeof prev.customerMoreDetails,
            }));
          }
        })
        .catch(() => {});
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    formData.lclForm.customerCountry,
    formData.customerMoreDetails.shipperCountry,
    formData.customerMoreDetails.consigneeCountry,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve raw state codes (e.g. "CA") to full names (e.g. "CALIFORNIA") after populate
  useEffect(() => {
    const stateFields = [
      {
        val: formData.lclForm.customerState,
        isLcl: true,
        key: 'customerState',
        countryCode: customerCountryCode,
        config: customerStateConfig,
      },
      {
        val: formData.customerMoreDetails.shipperState,
        isLcl: false,
        key: 'shipperState',
        countryCode: shipperCountryCode,
        config: shipperStateConfig,
      },
      {
        val: formData.customerMoreDetails.consigneeState,
        isLcl: false,
        key: 'consigneeState',
        countryCode: consigneeCountryCode,
        config: consigneeStateConfig,
      },
    ];
    // Only attempt resolution for short values without spaces (typical raw state codes like "CA", "NSW")
    const raw = stateFields.filter(
      (f) => f.val && f.countryCode && f.val.length <= 4 && !f.val.includes(' ')
    );
    if (!raw.length) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      Promise.all(
        raw.map(({ val, isLcl, key, config }) =>
          ApiService.post<any>(config.endpoint, config.transformRequest(val))
            .then((res) => {
              const items = config.transformResponse(res.data) as Array<{
                code: string;
                name: string;
              }>;
              const match = items.find((i) => i.code === val);
              if (!match || match.name === val) return null;
              return { isLcl, key, name: match.name };
            })
            .catch(() => null)
        )
      ).then((results) => {
        if (cancelled) return;
        const lclUp: Record<string, string> = {};
        const defUp: Record<string, string> = {};
        const moreUp: Record<string, string> = {};
        results.forEach((r) => {
          if (!r) return;
          if (r.isLcl) {
            lclUp[r.key] = r.name;
            defUp[r.key] = r.name;
          } else {
            moreUp[r.key] = r.name;
          }
        });
        if (Object.keys(lclUp).length || Object.keys(moreUp).length) {
          setFormData((prev) => ({
            ...prev,
            defaultForm: {
              ...prev.defaultForm,
              ...defUp,
            } as typeof prev.defaultForm,
            lclForm: { ...prev.lclForm, ...lclUp } as typeof prev.lclForm,
            customerMoreDetails: {
              ...prev.customerMoreDetails,
              ...moreUp,
            } as typeof prev.customerMoreDetails,
          }));
        }
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    // eslint-disable-line react-hooks/exhaustive-deps
    formData.lclForm.customerState,
    customerCountryCode,
    customerStateConfig,
    formData.customerMoreDetails.shipperState,
    shipperCountryCode,
    shipperStateConfig,
    formData.customerMoreDetails.consigneeState,
    consigneeCountryCode,
    consigneeStateConfig,
  ]);

  const handleDefaultQuoteCustomerStackState = () => {
    const response = loginBean?.officeSettingMap?.BKG_CONTROLLING_ENTITY;
    if (
      Array.isArray(response) &&
      response.length > 0 &&
      typeof response[0] === 'string'
    ) {
      setFormData((prev) => ({
        ...prev,
        lclForm: {
          ...prev.lclForm,
          controllingEntity: response[0],
          rateControllingEntity: response[0],
        },
      }));
    }
  };

  // Setting the default value for customer details stack for quote
  useEffect(() => {
    if (!isQuote) return;
    handleDefaultQuoteCustomerStackState();
  }, [loginBean]);

  // Resolve stateId → display name when state display is empty but stateId is set (after populate)
  useEffect(() => {
    const candidates = [
      {
        stateId: formData.lclForm.customerStateId,
        stateVal: formData.lclForm.customerState,
        isLcl: true,
        key: 'customerState',
        countryCode: customerCountryCode,
        config: customerStateConfig,
      },
      {
        stateId: formData.customerMoreDetails.shipperStateId,
        stateVal: formData.customerMoreDetails.shipperState,
        isLcl: false,
        key: 'shipperState',
        countryCode: shipperCountryCode,
        config: shipperStateConfig,
      },
      {
        stateId: formData.customerMoreDetails.consigneeStateId,
        stateVal: formData.customerMoreDetails.consigneeState,
        isLcl: false,
        key: 'consigneeState',
        countryCode: consigneeCountryCode,
        config: consigneeStateConfig,
      },
    ].filter((f) => f.stateId && !f.stateVal && f.countryCode);

    if (!candidates.length) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      Promise.all(
        candidates.map(({ stateId, config }) =>
          ApiService.post<any>(config.endpoint, config.transformRequest('%%%%'))
            .then((res) => {
              const items = config.transformResponse(res.data) as Array<{
                code: string;
                name: string;
                stateId: string;
              }>;
              return (
                items.find((i) => String(i.stateId) === String(stateId)) ?? null
              );
            })
            .catch(() => null)
        )
      ).then((results) => {
        if (cancelled) return;
        const lclUp: Record<string, string> = {};
        const defUp: Record<string, string> = {};
        const moreUp: Record<string, string> = {};
        results.forEach((match, idx) => {
          if (!match) return;
          const field = candidates[idx];
          const displayName = isVisible(
            CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME
          )
            ? match.name || match.code
            : match.code;
          if (field.isLcl) {
            lclUp[field.key] = displayName;
            defUp[field.key] = displayName;
          } else {
            moreUp[field.key] = displayName;
          }
        });
        if (Object.keys(lclUp).length || Object.keys(moreUp).length) {
          setFormData((prev) => ({
            ...prev,
            defaultForm: {
              ...prev.defaultForm,
              ...defUp,
            } as typeof prev.defaultForm,
            lclForm: { ...prev.lclForm, ...lclUp } as typeof prev.lclForm,
            customerMoreDetails: {
              ...prev.customerMoreDetails,
              ...moreUp,
            } as typeof prev.customerMoreDetails,
          }));
        }
      });
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    // eslint-disable-line react-hooks/exhaustive-deps
    formData.lclForm.customerStateId,
    formData.lclForm.customerState,
    customerCountryCode,
    customerStateConfig,
    formData.customerMoreDetails.shipperStateId,
    formData.customerMoreDetails.shipperState,
    shipperCountryCode,
    shipperStateConfig,
    formData.customerMoreDetails.consigneeStateId,
    formData.customerMoreDetails.consigneeState,
    consigneeCountryCode,
    consigneeStateConfig,
  ]);

  const handleDefaultFormChange = (
    field: keyof CustomerFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      defaultForm: { ...prev.defaultForm, [field]: value },
    }));
  };

  const handleLclFormChange = (
    field: keyof LclBookingDetailsForm,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      lclForm: { ...prev.lclForm, [field]: value },
    }));
  };

  const handleMoreDetailsChange = (
    field: keyof CustomerMoreDetailsForm,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: { ...prev.customerMoreDetails, [field]: value },
    }));
  };

  const buildName = (item: OrgCodeSuggestionItem) => {
    const data =
      item.fmcLicensed === 'Y'
        ? [
            item.custName1,
            item.custName2,
            item.custName3,
            item.custName4,
            item.custName5,
          ]
        : [item.detailName, item.detailName2];
    const fromInputCode = data.filter(Boolean).join('\n');
    return fromInputCode || item.name || '';
  };

  const bulkUpdateCustomer = (data: {
    defaultForm?: Partial<CustomerFormData>;
    lclForm?: Partial<LclBookingDetailsForm>;
    customerMoreDetails?: Partial<CustomerMoreDetailsForm>;
  }) => {
    devAPIlog('bulkUpdateCustomer', {
      customerStateId: data.lclForm?.customerStateId,
      shipperStateId: data.customerMoreDetails?.shipperStateId,
      consigneeStateId: data.customerMoreDetails?.consigneeStateId,
    });
    setFormData((prev) => ({
      defaultForm: { ...prev.defaultForm, ...(data.defaultForm ?? {}) },
      lclForm: { ...prev.lclForm, ...(data.lclForm ?? {}) },
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        ...(data.customerMoreDetails ?? {}),
      },
    }));
  };

  const buildAddress = (item: OrgCodeSuggestionItem) =>
    [item.addressLine1, item.addressLine2, item.addressLine3, item.addressLine4]
      .filter(Boolean)
      .join('\n');

  const handleCustomerCodeSelect = (item: OrgCodeSuggestionItem) => {
    const state = resolveState(item);
    const disableCtrlForWwa = isVisible(
      CommonToggleKeys.OCEAN_CONTROLLING_ENTITY_DISABLE_FOR_WWA_CUSTOMER
    );
    const isWwa = disableCtrlForWwa && item.wwaCustomer === 'Y';
    const controllingEntity = isWwa ? 'WWA' : resolveControllingEntity();
    const rateControllingEntity = isWwa
      ? 'WWA'
      : resolveRateControllingEntity();

    const contactName = item.contactName;
    const phoneNumber = item.phoneNumber;
    const cellPhone = item.cellPhone;
    const email = item.email;
    setFormData((prev) => ({
      ...prev,
      lclForm: {
        ...prev.lclForm,
        customerCode: item.code,
        customerName: buildName(item),
        customerAddress: buildAddress(item),
        customerCity: item.city,
        customerState: state,
        customerStateId: item.stateId ?? '',
        customerStateName: item.stateName ?? '',
        customerZipCode: item.zipCode,
        customerCountry: item.country,
        customerFax: item.fax,
        customersContactName: contactName,
        salesRepresentative: item.salesRep,
        telephoneNumber: phoneNumber,
        mobileNumber: cellPhone,
        customerEmail: email,
        customerEoriNumber: item.eoriNumber,
        customerType: item.type,
        controllingEntity,
        rateControllingEntity,
        accuRateProfile: 'STANDARD',
        namedAccount: '',
        customerNamedAccount: '',
      },
      defaultForm: {
        ...prev.defaultForm,
        customerCode: item.code,
        customerName: buildName(item),
        customerAddress: buildAddress(item),
        customerCity: item.city,
        customerState: state,
        customerStateId: item.stateId ?? '',
        customerStateName: item.stateName ?? '',
        customerZipCode: item.zipCode,
        customerCountry: item.country,
        customerFax: item.fax,
        customersContactName: contactName,
        salesRepresentative: item.salesRep,
        telephoneNumber: phoneNumber,
        mobileNumber: cellPhone,
        customerEmail: email,
        customerType: item.customerType,
      },
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        wwaCustomer: item.wwaCustomer,
      },
    }));
    dispatch(updateCustomerType(item.type));
    fetchCustomerSettings(item.code);
  };

  const handleShipperCodeSelect = (item: OrgCodeSuggestionItem) => {
    const state = resolveState(item);
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        shipperCode: item.code,
        shipperName: buildName(item),
        shipperAddress: buildAddress(item),
        shipperCity: item.city,
        shipperState: state,
        shipperStateId: item.stateId ?? '',
        shipperStateName: item.stateName ?? '',
        shipperZipCode: item.zipCode,
        shipperCountry: item.country,
        shipperContactName: item.contactName,
        shipperPhoneNumber: item.phoneNumber,
        shipperEmail: item.email,
        shipperFax: item.fax,
        shipperFmcLicensed: item.fmcLicensed,
        shipperEoriNumber: item.eoriNumber,
      },
    }));
  };

  const handleConsigneeCodeSelect = (item: OrgCodeSuggestionItem) => {
    const state = resolveState(item);
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        consigneeCode: item.code,
        consigneeName: buildName(item),
        consigneeAddress: buildAddress(item),
        consigneeCity: item.city,
        consigneeState: state,
        consigneeStateId: item.stateId ?? '',
        consigneeStateName: item.stateName ?? '',
        consigneeZipCode: item.zipCode,
        consigneeCountry: item.country,
        consigneeContactName: item.contactName,
        consigneePhoneNumber: item.phoneNumber,
        consigneeEmail: item.email,
        consigneeFax: item.fax,
        consigneeFmcLicensed: item.fmcLicensed,
        consigneeEoriNumber: item.eoriNumber,
      },
    }));
  };

  const handleForwarderCodeSelect = (item: OrgCodeSuggestionItem) => {
    const state = resolveState(item);
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        forwarderCode: item.code,
        forwarderName: buildName(item),
        forwarderAddress: buildAddress(item),
        forwarderCity: item.city,
        forwarderState: state,
        forwarderStateId: item.stateId ?? '',
        forwarderStateName: item.stateName ?? '',
        forwarderZipCode: item.zipCode,
        forwarderCountry: item.country,
        forwarderContactName: item.contactName,
        forwarderPhoneNumber: item.phoneNumber,
        forwarderEmail: item.email,
        forwarderFax: item.fax,
        forwarderFmcLicensed: item.fmcLicensed,
        forwarderEoriNumber: item.eoriNumber,
      },
    }));
  };

  const handleNotifyPartyCodeSelect = (item: OrgCodeSuggestionItem) => {
    const state = resolveState(item);
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        notifyPartyCode: item.code,
        notifyPartyName: buildName(item),
        notifyPartyAddress: buildAddress(item),
        notifyPartyCity: item.city,
        notifyPartyState: state,
        notifyStateId: item.stateId ?? '',
        notifyStateName: item.stateName ?? '',
        notifyPartyZipCode: item.zipCode,
        notifyPartyCountry: item.country,
        notifyPartyContactName: item.contactName,
        notifyPartyPhoneNumber: item.phoneNumber,
        notifyPartyEmail: item.email,
        notifyPartyFax: item.fax,
        notifyPartyFmcLicensed: item.fmcLicensed,
        notifyPartyEoriNumber: item.eoriNumber,
      },
    }));
  };

  const handleCustomerCountrySelect = (item: Record<string, unknown>) => {
    const displayName = String(item['displayName'] ?? item['name'] ?? '');
    devAPIlog('customer country selected', { item, displayName });
    setFormData((prev) => ({
      ...prev,
      lclForm: {
        ...prev.lclForm,
        customerCountry: displayName,
        customerState: '',
        customerStateId: '',
        customerStateName: '',
      },
      defaultForm: {
        ...prev.defaultForm,
        customerCountry: displayName,
        customerState: '',
        customerStateId: '',
        customerStateName: '',
      },
    }));
  };

  const handleShipperCountrySelect = (item: Record<string, unknown>) => {
    devAPIlog('shipper country selected', { item });
    const displayName = String(item['displayName'] ?? item['name'] ?? '');
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        shipperCountry: displayName,
        shipperState: '',
        shipperStateId: '',
        shipperStateName: '',
      },
    }));
  };

  const handleForwarderCountrySelect = (item: Record<string, unknown>) => {
    devAPIlog('forwarder country selected', { item });
    const displayName = String(item['displayName'] ?? item['name'] ?? '');
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        forwarderCountry: displayName,
        forwarderState: '',
        forwarderStateId: '',
        forwarderStateName: '',
      },
    }));
  };

  const handleConsigneeCountrySelect = (item: Record<string, unknown>) => {
    devAPIlog('consignee country selected', { item });
    const displayName = String(item['displayName'] ?? item['name'] ?? '');
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        consigneeCountry: displayName,
        consigneeState: '',
        consigneeStateId: '',
        consigneeStateName: '',
      },
    }));
  };

  const handleNotifyPartyCountrySelect = (item: Record<string, unknown>) => {
    devAPIlog('notify party country selected', { item });
    const displayName = String(item['displayName'] ?? item['name'] ?? '');
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        notifyPartyCountry: displayName,
        notifyPartyState: '',
        notifyStateId: '',
        notifyStateName: '',
      },
    }));
  };

  const buildCountryDisplay = (item: Record<string, unknown>): string => {
    const code = String(item['country'] ?? '');
    const name = String(item['countryName'] ?? '');
    if (!code) return '';
    return name ? `${code} - ${name}` : code;
  };

  const handleCustomerStateSelect = (item: Record<string, unknown>) => {
    devAPIlog('customer state selected', { item });
    const stateName = String(item['name'] ?? '');
    const stateId = String(item['stateId'] ?? '');
    const countryDisplay = buildCountryDisplay(item);
    setFormData((prev) => ({
      ...prev,
      lclForm: {
        ...prev.lclForm,
        customerState: stateName,
        customerStateId: stateId,
        customerStateName: stateName,
        ...(countryDisplay ? { customerCountry: countryDisplay } : {}),
      },
      defaultForm: {
        ...prev.defaultForm,
        customerState: stateName,
        customerStateId: stateId,
        customerStateName: stateName,
        ...(countryDisplay ? { customerCountry: countryDisplay } : {}),
      },
    }));
  };

  const handleShipperStateSelect = (item: Record<string, unknown>) => {
    devAPIlog('shipper state selected', { item });
    const stateName = String(item['name'] ?? '');
    const stateId = String(item['stateId'] ?? '');
    const countryDisplay = buildCountryDisplay(item);
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        shipperState: stateName,
        shipperStateId: stateId,
        shipperStateName: stateName,
        ...(countryDisplay ? { shipperCountry: countryDisplay } : {}),
      },
    }));
  };

  const handleForwarderStateSelect = (item: Record<string, unknown>) => {
    devAPIlog('forwarder state selected', { item });
    const stateName = String(item['name'] ?? '');
    const stateId = String(item['stateId'] ?? '');
    const countryDisplay = buildCountryDisplay(item);
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        forwarderState: stateName,
        forwarderStateId: stateId,
        forwarderStateName: stateName,
        ...(countryDisplay ? { forwarderCountry: countryDisplay } : {}),
      },
    }));
  };

  const handleConsigneeStateSelect = (item: Record<string, unknown>) => {
    devAPIlog('consignee state selected', { item });
    const stateName = String(item['name'] ?? '');
    const stateId = String(item['stateId'] ?? '');
    const countryDisplay = buildCountryDisplay(item);
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        consigneeState: stateName,
        consigneeStateId: stateId,
        consigneeStateName: stateName,
        ...(countryDisplay ? { consigneeCountry: countryDisplay } : {}),
      },
    }));
  };

  const handleNotifyPartyStateSelect = (item: Record<string, unknown>) => {
    devAPIlog('notify party state selected', { item });
    const stateName = String(item['name'] ?? '');
    const stateId = String(item['stateId'] ?? '');
    const countryDisplay = buildCountryDisplay(item);
    setFormData((prev) => ({
      ...prev,
      customerMoreDetails: {
        ...prev.customerMoreDetails,
        notifyPartyState: stateName,
        notifyStateId: stateId,
        notifyStateName: stateName,
        ...(countryDisplay ? { notifyPartyCountry: countryDisplay } : {}),
      },
    }));
  };

  //State suggestion hooks
  const {
    data: customerStateData,
    loading: customerStateLoading,
    setQuery: setCustomerStateQuery,
  } = useGetSuggestions(customerStateConfig);

  const {
    data: shipperStateData,
    loading: shipperStateLoading,
    setQuery: setShipperStateQuery,
  } = useGetSuggestions(shipperStateConfig);

  const {
    data: forwarderStateData,
    loading: forwarderStateLoading,
    setQuery: setForwarderStateQuery,
  } = useGetSuggestions(forwarderStateConfig);

  const {
    data: consigneeStateData,
    loading: consigneeStateLoading,
    setQuery: setConsigneeStateQuery,
  } = useGetSuggestions(consigneeStateConfig);

  const {
    data: notifyPartyStateData,
    loading: notifyPartyStateLoading,
    setQuery: setNotifyPartyStateQuery,
  } = useGetSuggestions(notifyPartyStateConfig);

  // Country suggestion hooks
  const countryConfig = useMemo(
    () => countrySuggestionConfig(loginBean),
    [loginBean]
  );

  const {
    data: customerCountryData,
    loading: customerCountryLoading,
    setQuery: setCustomerCountryQuery,
  } = useGetSuggestions(countryConfig);

  const {
    data: shipperCountryData,
    loading: shipperCountryLoading,
    setQuery: setShipperCountryQuery,
  } = useGetSuggestions(countryConfig);

  const {
    data: forwarderCountryData,
    loading: forwarderCountryLoading,
    setQuery: setForwarderCountryQuery,
  } = useGetSuggestions(countryConfig);

  const {
    data: consigneeCountryData,
    loading: consigneeCountryLoading,
    setQuery: setConsigneeCountryQuery,
  } = useGetSuggestions(countryConfig);

  const {
    data: notifyPartyCountryData,
    loading: notifyPartyCountryLoading,
    setQuery: setNotifyPartyCountryQuery,
  } = useGetSuggestions(countryConfig);

  // Multi-panel hooks
  const {
    result: customerCodeResult,
    loading: customerCodeLoading,
    setQuery: setCustomerCodeQuery,
  } = useGetMultiPanelSuggestions(customerCodeConfig);

  const {
    result: shipperCodeResult,
    loading: shipperCodeLoading,
    setQuery: setShipperCodeQuery,
  } = useGetMultiPanelSuggestions(shipperCodeConfig);

  const {
    result: forwarderCodeResult,
    loading: forwarderCodeLoading,
    setQuery: setForwarderCodeQuery,
  } = useGetMultiPanelSuggestions(forwarderCodeConfig);

  const {
    result: consigneeCodeResult,
    loading: consigneeCodeLoading,
    setQuery: setConsigneeCodeQuery,
  } = useGetMultiPanelSuggestions(consigneeCodeConfig);

  const {
    result: notifyPartyCodeResult,
    loading: notifyPartyCodeLoading,
    setQuery: setNotifyPartyCodeQuery,
  } = useGetMultiPanelSuggestions(notifyPartyCodeConfig);

  return {
    customerFormData: formData,
    setFormData,
    bulkUpdateCustomer,
    customerSettings: {
      rateSetting: customerRateSetting,
      patterns: customerPatterns,
      isLoading: customerSettingsLoading,
      error: customerSettingsError,
    },
    customerHandlers: {
      handleDefaultFormChange,
      handleLclFormChange,
      handleMoreDetailsChange,
      onCustomerCodeSelect: handleCustomerCodeSelect,
      onShipperCodeSelect: handleShipperCodeSelect,
      onConsigneeCodeSelect: handleConsigneeCodeSelect,
      onForwarderCodeSelect: handleForwarderCodeSelect,
      onNotifyPartyCodeSelect: handleNotifyPartyCodeSelect,
    },

    customerSuggestions: {
      lclForm: {
        customerCode: {
          data: customerCodeResult.data,
          data1: customerCodeResult.data1,
          data2: customerCodeResult.data2,
          setQuery: setCustomerCodeQuery,
          loading: customerCodeLoading,
        },
        customerState: {
          data: customerStateData,
          loading: customerStateLoading,
          setQuery: setCustomerStateQuery,
          onSelect: handleCustomerStateSelect,
        },
        customerCountry: {
          data: customerCountryData,
          loading: customerCountryLoading,
          setQuery: setCustomerCountryQuery,
          onSelect: handleCustomerCountrySelect,
        },
      },
      moreDetails: {
        shipperCode: {
          data: shipperCodeResult.data,
          data1: shipperCodeResult.data1,
          data2: shipperCodeResult.data2,
          setQuery: setShipperCodeQuery,
          loading: shipperCodeLoading,
        },
        shipperState: {
          data: shipperStateData,
          loading: shipperStateLoading,
          setQuery: setShipperStateQuery,
          onSelect: handleShipperStateSelect,
        },
        shipperCountry: {
          data: shipperCountryData,
          loading: shipperCountryLoading,
          setQuery: setShipperCountryQuery,
          onSelect: handleShipperCountrySelect,
        },
        forwarderCode: {
          data: forwarderCodeResult.data,
          data1: forwarderCodeResult.data1,
          data2: forwarderCodeResult.data2,
          setQuery: setForwarderCodeQuery,
          loading: forwarderCodeLoading,
        },
        forwarderState: {
          data: forwarderStateData,
          loading: forwarderStateLoading,
          setQuery: setForwarderStateQuery,
          onSelect: handleForwarderStateSelect,
        },
        forwarderCountry: {
          data: forwarderCountryData,
          loading: forwarderCountryLoading,
          setQuery: setForwarderCountryQuery,
          onSelect: handleForwarderCountrySelect,
        },
        consigneeCode: {
          data: consigneeCodeResult.data,
          data1: consigneeCodeResult.data1,
          data2: consigneeCodeResult.data2,
          setQuery: setConsigneeCodeQuery,
          loading: consigneeCodeLoading,
        },
        consigneeState: {
          data: consigneeStateData,
          loading: consigneeStateLoading,
          setQuery: setConsigneeStateQuery,
          onSelect: handleConsigneeStateSelect,
        },
        consigneeCountry: {
          data: consigneeCountryData,
          loading: consigneeCountryLoading,
          setQuery: setConsigneeCountryQuery,
          onSelect: handleConsigneeCountrySelect,
        },
        notifyPartyCode: {
          data: notifyPartyCodeResult.data,
          data1: notifyPartyCodeResult.data1,
          data2: notifyPartyCodeResult.data2,
          setQuery: setNotifyPartyCodeQuery,
          loading: notifyPartyCodeLoading,
        },
        notifyPartyState: {
          data: notifyPartyStateData,
          loading: notifyPartyStateLoading,
          setQuery: setNotifyPartyStateQuery,
          onSelect: handleNotifyPartyStateSelect,
        },
        notifyPartyCountry: {
          data: notifyPartyCountryData,
          loading: notifyPartyCountryLoading,
          setQuery: setNotifyPartyCountryQuery,
          onSelect: handleNotifyPartyCountrySelect,
        },
      },
    },
  };
};
