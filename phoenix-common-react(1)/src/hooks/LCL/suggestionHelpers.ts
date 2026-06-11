import { MinifiedLoginClientBean } from '../../core/featureToggles/loginClientBean.types';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';
import { MultiPanelSuggestionItem } from './useGetMultiPanelSuggestions';

export const userReferenceSuggestionConfig= (
    userReferenceSuggestionConfigParam: any
) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'bookingUserNameReference',
    params: {
      c_schema_office: userReferenceSuggestionConfigParam.schemaOffice,
      c_handling_office: userReferenceSuggestionConfigParam.handlingOffice,
      officeSchemaName: userReferenceSuggestionConfigParam.schemaName,
    },
  }),

  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.keys(result).map((key) => {
      const parts = key.split(' - ');
      return {
        code: parts[0] || '',
        name: parts[1] || '',
        location: parts[2] || '',
        displayValue: key,
      };
    });
  },
});

export const clauseSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'englishMultiClauseByCodeAndName',
    params: {
      office_id: loginBean?.officeId ?? 0,
      defaultLength: 20,
      c_type: 'O',
      site_id: loginBean?.siteId ?? 0,
      inputLength: 1,
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.keys(result).map((key) => {
      const parts = key.split('$$~*!');
      return {
        code: parts[0] || '',
        name: parts[1] || '',
        description: parts[2] || '',
      };
    });
  },
});

export const buildSensitiveCargoclauseSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '%%%SC',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'englishMultiClauseByCodeAndName',
    params: {
      office_id: String(loginBean?.officeId ?? 0),
      c_type: 'O',
      defaultLength: '20',
      site_id: String(loginBean?.siteId ?? 1),
      inputLength: '3',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.keys(result).map((key) => {
      const parts = key.split('$$~*!');
      return {
        code: parts[0] || '',
        name: parts[1] || '',
        description: parts[2] || '',
      };
    });
  },
});

export const bookingTypeSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 3,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'bookingType',
    params: {
      type: 'L',
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => ({
      label: key,
      value: (val as string[])[0],
    }));
  },
});

// added duplicate code to support common code. Remove bookingTypeSuggestionConfig after migration to bookingReferenceSuggestionConfig
export const bookingReferenceSuggestionConfig = (
  type: string | undefined = 'L',
  loginBean: MinifiedLoginClientBean | null | undefined = undefined
) => {
  return {
    endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
    minChars: 1,
    initialQuery: '',
    debounceMs: 500,
    transformRequest: (query: string) => ({
      query,
      reference: 'bookingType',
      params: {
        type: type || 'L',
        officeSchemaName: loginBean?.schema ?? '',
      },
    }),
    transformResponse: (data: any) => {
      const result = data?.result;
      if (!result) return [];

      return Object.entries(result).map(([key, val]) => ({
        SUGGEST_KEY: (val as string[])[0] || '',
        SUGGEST_VALUE: key.trim(),
      }));
    },
  };
}

export const quoteByTypeSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 3,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'quoteByType',
    params: {
      type: 'L',
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => ({
      label: key,
      value: (val as string[])[0],
    }));
  },
});

export const ediDestinationSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'ediDestination',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => ({
      label: key,
      value: (val as string[])[0],
    }));
  },
});

export const officeSuggestionConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'office',
    params: {},
  }),
  transformResponse: (data: any) => {
    const result = data?.result;

    if (!result) return [];
    
      return Object.entries(result).map(([key, val]) => {
    const code = key.split(' - ')[1] || key;

    return {
      label: key, 
      value: code,
    };
  });


    
  },
};




export const timeSuggestionConfig = (timeZone: number = 12) => { return{
    endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
    minChars: 1,
    initialQuery: '',
    debounceMs: 500,
    transformRequest: (query: string) => ({
      query,
      reference: 'time',
      params: {
        timezone: timeZone,
      },
    }),
    transformResponse: (data: any) => {
      const result = data?.result;
      if (!result) return [];

      return Object.keys(result).map((key) => ({
        time: key,
      }));
    },
  };
};

export const quoteTermsSuggestionConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
     reference: "exportTerms",
      params: {}
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => ({
      SUGGEST_KEY: (val as string[])[0] || '',
      SUGGEST_VALUE: key.trim(),
    }));
  },
};

export const quoteCarrierSuggestionConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: "carrierQuote",
    params: {}
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.entries(result).map(([key, value]: any) => ({
      code: value?.[0] || '',
      name: key, // ACL - Advance Container Line
      displayName: key,
    }));
  },
};
 
export const quoteReferenceSuggestionConfig = (
  type: string | undefined,
  loginBean: MinifiedLoginClientBean | null | undefined = undefined
) => {
  return {
    endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
    minChars: 1,
    initialQuery: '',
    debounceMs: 500,
    transformRequest: (query: string) => ({
      query,
      reference: 'quoteByType',
      params: {
        type: type || 'L',
        officeSchemaName: loginBean?.schema ?? '',
      },
    }),
    transformResponse: (data: any) => {
      const result = data?.result ?? data;
      if (!result) return [];
      return Object.entries(result).map(([key, val]) => ({
        SUGGEST_KEY: (val as string[])[0] || '',
        SUGGEST_VALUE: key.trim(),
      }));
    },
  };
};

export const handlingOfficeSuggestionConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    // reference: 'handlingOffice',
    reference: 'office',
    params: {},
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.keys(result).map((key) => {
      const parts = key.split(' - ');
      return {
        code: parts[0] || '',
        name: parts[1] || '',
        location: parts[2] || '',
        displayValue: key,
      };
    });
  },
};

export const extractCountryCode = (countryValue: string): string => {
  if (!countryValue) return '';
  if (countryValue.includes(' - ')) return countryValue.split(' - ')[0].trim();
  const hyphenIdx = countryValue.indexOf('-');
  if (hyphenIdx > 0 && hyphenIdx <= 3)
    return countryValue.substring(0, hyphenIdx).trim();
  return countryValue.trim();
};

export const countrySuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'countryName',
    params: {
      company: loginBean?.company || '01',
      office: loginBean?.office || 'NYC',
      SITEID: loginBean?.siteId ? String(loginBean.siteId) : '1',
      local_currency: loginBean?.localCurrency || 'USD',
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];
    return Object.entries(result).map(([displayString]) => {
      const parts = displayString.split(' - ');
      const code = parts[0]?.trim() ?? '';
      const name = parts.slice(1).join(' - ').trim() || displayString;
      const country = displayString;
      return { code, name, displayName: displayString, country };
    });
  },
});

export type WarehouseReference =
  | 'warehouse'
  | 'warehouseDetails'
  | 'warehouseExportImport';

export const getWarehouseReference = (
  showMapPin: boolean,
  userDefaultWarehouse: boolean,
  moduleType: 'BKG' | 'QUOTE'
): WarehouseReference => {
  if (showMapPin && moduleType === 'BKG') return 'warehouseDetails';
  if (userDefaultWarehouse && moduleType === 'BKG')
    return 'warehouseExportImport';
  return 'warehouse';
};

export const buildWarehouseSuggestionConfig = (
  officeid: number,
  siteid: number,
  reference: WarehouseReference = 'warehouse',
  loginBean: MinifiedLoginClientBean | null | undefined = undefined
) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference,
    limit: 20,
    params: {
      officeid: String(officeid),
      siteid: String(siteid),
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];
    return Object.entries(result).map(([key, val]) => {
      const d = key.split('~');
      const rawValue = (val as string[])[0] ?? '';
      const v = rawValue.split('~');
      return {
        code: v[0] || d[0] || '',
        name: d[1] ?? '',
        type: d[2] ?? '',
        address: d[3] ?? '',
        state: d[4] ?? '',
        address2: v[1] ?? '',
        address3: v[2] ?? '',
        longitude: v[4] ?? '',
        latitude: v[5] ?? '',
      };
    });
  },
});

export const docDeliverySuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'wareHouseDocumentDelivery',
    limit: 20,
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];
    return Object.entries(result).map(([key]) => {
      const d = key.split('~');
      return {
        code: d[0] ?? '',
        name: d[1] ?? '',
        address1: d[2] ?? '',
        address2: d[3] ?? '',
        address3: d[4] ?? '',
        contact: d[5] ?? '',
      };
    });
  },
});

export const vesselCodeSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'vessel',
    limit: 20,
    params: { officeSchemaName: loginBean?.schema ?? '' },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];
    return Object.entries(result).map(([key, val]) => {
      const inputCode = (val as string[])[0] ?? '';
      const [code = '', name = ''] = inputCode.split('~');
      return { code, name, label: key };
    });
  },
});

export const carrierCodeSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'carrierQuote',
    limit: 20,
    params: { officeSchemaName: loginBean?.schema ?? '' },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];
    return Object.entries(result).map(([key, val]) => {
      const dashIdx = key.indexOf(' - ');
      const code =
        dashIdx > -1
          ? key.substring(0, dashIdx).trim()
          : String((val as string[])[0] ?? '');
      const name = dashIdx > -1 ? key.substring(dashIdx + 3).trim() : '';
      return { code, name, label: key };
    });
  },
});

export const termsSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'exportTerms',
    limit: 20,
    params: { officeSchemaName: loginBean?.schema ?? '' },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];

    return Object.entries(result).map(([label, value]) => ({
      label,
      value: value?.[0] || '',
    }));
  },
});

export const locationSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 2,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'locationCountryCode',
    limit: 20,
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];
    return Object.keys(result).map((key) => {
      const [code = '', name = '', locode = '', country = ''] = key.split('~');
      return { code, name, locode, country };
    });
  },
});

export const buildStateSuggestionConfig = (countryCode: string, loginBean: MinifiedLoginClientBean | null | undefined = undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'orgStateWithCountryName',
    params: {
      COUNTRYCODE: countryCode || '',
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];
    return Object.entries(result).map(([, inputCodes]) => {
      const inputCode = (inputCodes as string[])[0] ?? '';
      const p = inputCode.split('~');
      return {
        code: p[0] ?? '',
        name: p[1] ?? '',
        country: p[2] ?? '',
        countryName: p[3] ?? '',
        stateId: p[4] ?? '',

        countryCode: p[2] ?? '',
      };
    });
  },
});

export const pickupCargoAtcodeSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'pickupCargoAtCodeForTMS',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => {
      const parts = key.split('~');
      const values = (val as string[])[0].split('~');

      return {
        code: parts[0] || '',
        billToCode: parts[1] || '',
        name: parts[2] || '',
        type: parts[3] || '',
        alias: parts[4] || '',
        city: parts[5] || '',
        state: parts[6] || '',
        country: parts[7] || '',
        SUGGEST_VALUE: values,
      };
    });
  },
});

export const tmsLocationCodeSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'pickupCargoAtCodeForTMS',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: unknown): Record<string, unknown>[] => {
    const result = (data as { result?: Record<string, string[]> })?.result;
    if (!result) return [];

    return Object.entries(result).map(([key, valArr]) => {
      const displayParts = key.split('~');
      const valueParts = (valArr[0] ?? '').split('~');

      return {
        code: displayParts[0] ?? '',
        label: key.replace(/~/g, ' - '),
        zipCode: valueParts[6] ?? '',
      };
    });
  },
});

export const pickupCargoAtcodeOrgCodeSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'arnCustomerWithOpenBanalce',
    params: {
      moduleType: 'BKG',
      isUsRouting: 'No',
      codeLabel: 'Pickup Cargo At Code',
      company: loginBean?.company || '01',
      type: null,
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key]) => {
      const parts = key.split('~');
      return {
        code: parts[0] || '',
        billToCode: parts[1] || '',
        name: parts[2] || '',
        type: parts[3] || '',
        alias: parts[4] || '',
        city: parts[5] || '',
        state: parts[6] || '',
        country: parts[7] || '',
        status: parts[8] || '',
        lastInvoice: parts[9] || '',
        openAr: parts[10] || '',
      };
    });
  },
});

export const organizationAliasSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'orgAlias',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key]) => {
      const parts = key.split('~');
      return {
        code: parts[0] || '',
        name: parts[1] || '',
        type: parts[2] || '',
        alias: parts[3] || '',
        city: parts[4] || '',
        state: parts[5] || '',
        country: parts[6] || '',
      };
    });
  },
});

export const organizationTaxIdSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'orgVatIdNo',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key]) => {
      const parts = key.split('~');
      return {
        code: parts[0] || '',
        billToCode: parts[1] || '',
        name: parts[2] || '',
        type: parts[3] || '',
        alias: parts[4] || '',
        taxId: parts[5] || '',
      };
    });
  },
});

export const organizationCountrySuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'orgCountry',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key]) => {
      const parts = key.split('~');
      return {
        code: parts[0] || '',
        name: parts[1] || '',
      };
    });
  },
});

export const organizationStateSuggestionConfig = (countryCode: string, loginBean: MinifiedLoginClientBean | null | undefined = undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'orgStateFinance',
    params: {
      COUNTRYCODE: countryCode || '',
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];
    return Object.entries(result).map(([key]) => {
      const p = key.split('~');
      return {
        code: p[0] ?? '',
        name: p[1] ?? '',
        country: p[2] ?? '',
      };
    });
  },
});

export const handlingChargeNameSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'localechargeCodeWithGroup',
    params: {
      type: 'QUO',
      locale: loginBean?.locale || 'en',
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => ({
      SUGGEST_KEY: (val as string[])[0] || '',
      SUGGEST_VALUE: key.trim(),
    }));
  },
});

export const handlingCurrencySuggestionConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'currency',
    params: {},
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => ({
      SUGGEST_KEY: (val as string[])[0] || '',
      SUGGEST_VALUE: key.trim(),
    }));
  },
};
export const handlingVendorSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'vendor',
    params: {
      usercompany: '01',
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];
    return Object.entries(result).map(([key, val]) => ({
      SUGGEST_KEY: key.trim(),
      SUGGEST_VALUE: (val as string[])[0] || '',
    }));
  },
});

export const prebookingRefrenceeSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 3,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'preBookingType',
    params: {
      type: 'L',
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => ({
      label: key,
      value: (val as string[])[0],
    }));
  },
});

export const fclQuotePickupAndTruckerCodeSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: "nonCustomerCode",
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    }
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];
    return Object.entries(result).map(([key, val]) => {
      const [
        code = '',
        billToCode = '',
        name = '',
        type = '',
        alias = '',
        city = '',
        state = '',
        country = '',
      ] = key.split('~');

      return ({
        code,
        billToCode,
        name,
        type,
        alias,
        city,
        state,
        country,
        selectedData: (val as string[])[0] || '',
      });
    });
  },
});

export const fclQuoteChargeDescriptionSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 2,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'localechargeCode',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
      type: 'BKG',
      locale: loginBean?.locale || 'en',
    },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result ?? {};
    return Object.entries(result).map(([key, val]) => ({
      SUGGEST_KEY: key.trim(),
      SUGGEST_VALUE: (val as string[])[0] || '',
    }));
  },
});

export const buildPickupTruckerData = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,

  transformRequest: (query: string) => ({
    query,
    reference: 'nonCustomerCode',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),

  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.entries(result).map(([key, values]) => {
      const keyParts = key.split('~');
      const raw = (values as string[])[0] || '';

      return {
        Code: keyParts[0] || '',
        'Bill To Code': keyParts[1] || '',
        Name: keyParts[2] || '',
        Type: keyParts[3] || '',
        Alias: keyParts[4] || '',
        City: keyParts[5] || '',
        State: keyParts[6] || '',
        Country: keyParts[7] || '',
        rawDetails: raw,
      };
    });
  },
});

export const SearchByPostalCodeCityConfig = (countryCode: string, loginBean: MinifiedLoginClientBean | null | undefined = undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA_FROM_API,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,

  transformRequest: (query: string) => ({
    query,
    reference: 'postalCode',
    params: {
      COUNTRYCODE: countryCode || '',
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),

  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];

    return Object.entries(result).map(([key, inputCodes]) => {
      const raw = (inputCodes as string[])[0] ?? '';

      const parts = raw.split('~');

      const safe = Array.from({ length: 15 }, (_, i) => parts[i] || '');

      const mapped = {
        name: safe[0],
        altName: safe[1],
        address1: safe[2],
        address2: safe[3],
        address3: safe[4], //  used as city in Java
        longitude: safe[5],
        latitude: safe[6],
        contact: safe[7],
        phone: safe[8],
        fax: safe[9],
        activeFlag: safe[10],
        email: safe[11],
        country: safe[12],
        stateId: safe[13],
        stateName: safe[14],
      };

      const displayName =
        key || `${mapped.name} - ${mapped.address1}- ${mapped.address3}`;

      return {
        displayName,
        value: raw,

        data: mapped,
      };
    });
  },
});

export const buildPickupTruckerDataForDoorDelivery = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,

  transformRequest: (query: string) => ({
    query,
    reference: 'integratedtruckerNonCustomerCode',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),

  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.entries(result).map(([key, values]) => {
      const keyParts = key.split('~');
      const raw = (values as string[])[0] || '';

      return {
        Code: keyParts[0] || '',
        'Bill To Code': keyParts[1] || '',
        Name: keyParts[2] || '',
        Type: keyParts[3] || '',
        Alias: keyParts[4] || '',
        City: keyParts[5] || '',
        State: keyParts[6] || '',
        Country: keyParts[7] || '',
        rawDetails: raw,
      };
    });
  },
});

export const transformCustomerOrgSearchItem = (
  item: MultiPanelSuggestionItem
): Record<string, unknown> => {
  const d = item.displayString.split('~');
  return {
    code: d[0] ?? '',
    billToCode: d[1] ?? '',
    name: d[2] ?? '',
    type: d[3] ?? '',
    alias: d[4] ?? '',
    city: d[5] ?? '',
    state: d[6] ?? '',
    country: d[7] ?? '',
    count: d[8] ?? '',
  };
};

export const organizationSalesPersonSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'salePerson',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key]) => {
      const parts = key.split('~');
      return {
        code: parts[0] || '',
        name: parts[1] || '',
      };
    });
  },
});

// suggest_key format from selectCustomerCode.sql:
// code~billToCode~name~type~alias~city~state~country~eoriNumber
export const organizationTrackingCodeSuggestionConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'customerCode',
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];
    return Object.entries(result).map(([key]) => {
      const parts = key.split('~');
      return {
        code: parts[0] || '',
        name: parts[2] || '',
      };
    });
  },
};


export type OrgSearchModuleType = 'BKG' | 'QUO' | 'prebooking';
type OrgSearchEntityType = 'customer' | 'shipper' | 'consignee' | 'forwarder' | 'notifyParty';

const ORG_SEARCH_REFERENCE_LISTS: Record<OrgSearchModuleType, Record<OrgSearchEntityType, readonly string[]>> = {
  BKG: {
    customer:    ['customerCodeByUser',    'customerCodeByRegion',    'customerCodeAll'],
    shipper:     ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    consignee:   ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    forwarder:   ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    notifyParty: ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
  },
  QUO: {
    customer:    ['quoteCustCodeByUser',    'quoteCustCodeByRegion',    'quoteCustCodeAll'],
    shipper:     ['quoteShpConsCodeByUser', 'quoteShpConsCodeByRegion', 'quoteShpConsCodeAll'],
    consignee:   ['quoteShpConsCodeByUser', 'quoteShpConsCodeByRegion', 'quoteShpConsCodeAll'],
    forwarder:   ['quoteShpConsCodeByUser', 'quoteShpConsCodeByRegion', 'quoteShpConsCodeAll'],
    notifyParty: ['quoteShpConsCodeByUser', 'quoteShpConsCodeByRegion', 'quoteShpConsCodeAll'],
  },
  prebooking: {
    customer:    ['customerCodeByUser',    'customerCodeByRegion',    'customerCodeAll'],
    shipper:     ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    consignee:   ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    forwarder:   ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    notifyParty: ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
  },
};

const ORG_SEARCH_CUST_COLUMNS: Record<OrgSearchModuleType, Record<OrgSearchEntityType, string>> = {
  BKG: {
    customer:    'ship_code',
    shipper:     'fwdr_code',
    consignee:   'cons_code',
    forwarder:   'c_actual_forwarder_code',
    notifyParty: 'c_notify_party_code',
  },
  QUO: {
    customer:    'quote_cust_code',
    shipper:     'c_forwarder_code',
    consignee:   'c_consignee_code',
    forwarder:   'c_actual_forwarder_code',
    notifyParty: 'c_notify_party_code',
  },
  prebooking: {
    customer:    'ship_code',
    shipper:     'fwdr_code',
    consignee:   'cons_code',
    forwarder:   'c_actual_forwarder_code',
    notifyParty: 'c_notify_party_code',
  },
};

export interface OrgSearchSessionParams {
  countryCode:      string;
  office:           string;
  officeSchemaName: string;
  user:             string;
  loginBean?:       MinifiedLoginClientBean | null;
}

const DEFAULT_ORG_SEARCH_CUSTOMER_TYPES = ['A', 'F', 'H', 'I', 'N', 'S'] as const;

export const parseOrgSearchCustomerTypeList = (
  toggleValue: string | null | undefined,
): string[] => {
  const trimmed = (toggleValue ?? '').trim();
  if (!trimmed) return [...DEFAULT_ORG_SEARCH_CUSTOMER_TYPES];
  return trimmed.split(',').map((t) => t.trim()).filter(Boolean);
};

const buildOrgSearchRequest = (
  entity:           OrgSearchEntityType,
  moduleType:       OrgSearchModuleType,
  params:           OrgSearchSessionParams,
  customerTypeList: string[],
) => (query: string) => ({
  query:         query || '%%%',
  referenceList: ORG_SEARCH_REFERENCE_LISTS[moduleType][entity],
  countryCode:   params.countryCode,
  params: {
    custColumn:       ORG_SEARCH_CUST_COLUMNS[moduleType][entity],
    office:           params.office,
    user:             params.user,
    officeSchemaName: params.officeSchemaName,
  },
  inClause: {
    CUSTOMER_TYPE: customerTypeList,
  },
  isClassicFlatSuggestionBox: false,
});

const ORG_SEARCH_BASE = {
  endpoint:      COMMON_ENDPOINTS.SUGGESTION_BOX.GET_MULTI_PANEL_SUGGEST_DATA,
  minChars:      1,
  debounceMs:    300,
  transformItem: transformCustomerOrgSearchItem,
} as const;

export const buildCustomerCodeOrgSearchConfig = (
  moduleType: OrgSearchModuleType,
  params: OrgSearchSessionParams,
  customerTypeList: string[],
) => ({ ...ORG_SEARCH_BASE, transformRequest: buildOrgSearchRequest('customer', moduleType, params, customerTypeList) });

export const buildShipperCodeOrgSearchConfig = (
  moduleType: OrgSearchModuleType,
  params: OrgSearchSessionParams,
  customerTypeList: string[],
) => ({ ...ORG_SEARCH_BASE, transformRequest: buildOrgSearchRequest('shipper', moduleType, params, customerTypeList) });

export const buildConsigneeCodeOrgSearchConfig = (
  moduleType: OrgSearchModuleType,
  params: OrgSearchSessionParams,
  customerTypeList: string[],
) => ({ ...ORG_SEARCH_BASE, transformRequest: buildOrgSearchRequest('consignee', moduleType, params, customerTypeList) });

export const buildForwarderCodeOrgSearchConfig = (
  moduleType: OrgSearchModuleType,
  params: OrgSearchSessionParams,
  customerTypeList: string[],
) => ({ ...ORG_SEARCH_BASE, transformRequest: buildOrgSearchRequest('forwarder', moduleType, params, customerTypeList) });

export const buildNotifyPartyCodeOrgSearchConfig = (
  moduleType: OrgSearchModuleType,
  params: OrgSearchSessionParams,
  customerTypeList: string[],
) => ({ ...ORG_SEARCH_BASE, transformRequest: buildOrgSearchRequest('notifyParty', moduleType, params, customerTypeList) });

export const getPreBookingOfficeSuggestionConfig = (officeid: string) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'bookingStation',
    params: {
      officeCode : officeid,
      
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => ({
      label: key,
      value: (val as string[])[0],
    }));
  },
});




export const prebookingquoteReferenceSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 500,
  transformRequest: (query: string) => ({
    query,
    reference: 'preBookingType',
    params: {
      type: 'L',
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => ({
      SUGGEST_KEY: (val as string[])[0] || '',
      SUGGEST_VALUE: key.trim(),
    }));
  },
});

export const specialProvisionSuggestionConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'specialprovision',
    params: {},
  }),
  transformResponse: (data: any) => {
    const result = data?.result ?? data;
    if (!result) return [];

    return Object.entries(result).map(([key, val]) => ({
      SUGGEST_KEY: (val as string[])[0] || '',
      SUGGEST_VALUE: key.trim(),
    }));
  },
};

export const printerSuggestionConfig = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
  minChars: 1,
  initialQuery: '',
  debounceMs: 300,
  transformRequest: (query: string) => ({
    query,
    reference: 'printer',
    params: {
      officeSchemaName: loginBean?.schema ?? '',
    },
  }),
  transformResponse: (data: any): Record<string, unknown>[] => {
    const result = data?.result;
    if (!result) return [];
    return Object.entries(result).map(([key, val]) => ({
      name: key,
      code: (val as string[])[0] || key,
    }));
  },
});

