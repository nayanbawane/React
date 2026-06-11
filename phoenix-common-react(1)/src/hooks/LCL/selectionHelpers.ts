import { MinifiedLoginClientBean } from '@/core/featureToggles/loginClientBean.types';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';

export const imoClassSelectionConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  transformRequest: () => ({
    reference: 'hazarodousImoClass',
    params: {
      moduleCode: 'QUO',
    },
  }),
  transformResponse: (data: any): { label: string; value: string }[] => {
    const result = data?.result;
    if (!result) return [{ label: 'Please Select', value: '-1' }];
    const options = Object.keys(result).map((key) => ({
      label: key,
      value: result[key] as string,
    }));
    return [{ label: 'Please Select', value: '-1' }, ...options];
  },
};

export const packagingSelectionConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  transformRequest: () => ({
    reference: 'localepackaging',
    params: {
      moduleCode: 'BKG',
    },
  }),
  transformResponse: (data: any): { label: string; value: string }[] => {
    const result = data?.result;
    if (!result) return [{ label: 'Please Select', value: '-1' }];
    const options = Object.keys(result).map((key) => ({
      label: result[key] as string,
      value: key,
    }));
    return [{ label: 'Please Select', value: '-1' }, ...options];
  },
};

export const bookingModeOfTransportConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  debounceMs: 500,
  transformRequest: () => ({
    reference: 'bookingModeOfTransport',
    params: {
      moduleCode: 'BKG',
      officeCode: 'NYC',
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.keys(result).map((key) => {
      return { label: key, value: result[key] };
    });
  },
};

export const bookingDocumentReferenceConfig = (
  moduleCode: string,
  reference?: number
) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  debounceMs: 0,
  transformRequest: () => ({
    reference: 'bookingDocumentReference',
    params: {
      reference: reference ? reference : 0,
      object: moduleCode,
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];
    if (!Array.isArray(result) || result.length === 0) {
      return [];
    }
    return Object.keys(result).map((key: any) => {
      return { label: key, value: result[key] };
    });
  },
});

export const documentsTypeConfig = (moduleCode: string, officeCode = 'NYC') => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  debounceMs: 500,
  transformRequest: () => ({
    reference: 'documentsType',
    params: {
      moduleCode,
      officeCode,
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.keys(result).map((key) => {
      return { code: key, description: result[key] };
    });
  },
});
export const basisConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_GEN_BASIS_DATA,
  debounceMs: 500,
  transformRequest: () => null,
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    const basisOptions = (result || [])
      .filter((item: any) => item?.type === 'O')
      .map((item: any) => ({
        label: item?.basis + ' - ' + item?.description,
        value: item?.basis ?? '',
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label));
    basisOptions.unshift({ label: 'Select', value: '' });

    return basisOptions;
  },
};

export const namedAccountConfig = (customerCode: string, companyId: string, loginBean:any) => {
  const isEnabled = Boolean(customerCode && companyId);

  return {
    endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
    debounceMs: 0,

    enabled: isEnabled,

    transformRequest: () => {
      if (!isEnabled) return null;

      return {
        reference: 'selectnamedaccount',
        params: {
          CUSTOMERCODE: customerCode,
          COMPANYID: companyId,
          officeSchemaName: loginBean?.schema,
        },
      };
    },

    transformResponse: (data: any) => {
      const result = data?.result;

      if (!result || typeof result !== 'object') return [];

      return Object.keys(result).map((key) => ({
        label: key,
        value: result[key],
      }));
    },
  };
};

export const externalLotCommentsConfig = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  transformRequest: () => ({
    reference: 'lotComments',
    params: {
      OFFICEID: '4',
    },
  }),
  transformResponse: (data: any): { label: string; value: string }[] => {
    const result = data?.result;
    if (!result) return [{ label: 'Please Select', value: '-1' }];
    const options = Object.keys(result).map((key) => ({
      label: key,
      value: result[key] as string,
    }));
    return [{ label: 'Please Select', value: '-1' }, ...options];
  },
};

/**
 * Standard selection configuration helper // we can and we should use this
 */
const createStandardSelectionConfig = (reference: string, params: any) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  transformRequest: () => ({
    reference,
    params,
  }),
  transformResponse: (data: any): { label: string; value: string }[] => {
    const result = data?.result;
    if (!result) return [{ label: 'Please Select', value: '-1' }];
    const options = Object.keys(result).map((key) => ({
      label: key,
      value: result[key] as string,
    }));
    return [{ label: 'Please Select', value: '-1' }, ...options];
  },
});

const TMS_STATUS_GROUP_MAP = {
  BKG: 'EXPORT_TMS_ORDER_STATUS',
  ARN: 'IMPORT_TMS_ORDER_STATUS',
  ABKG: 'AIR_TMS_ORDER_STATUS',
} as const;

type TmsModuleCode = keyof typeof TMS_STATUS_GROUP_MAP;

export const tmsShipmentStatusConfig = (moduleCode: string) => {
  const groupName =
    TMS_STATUS_GROUP_MAP[moduleCode.toUpperCase() as TmsModuleCode] ??
    TMS_STATUS_GROUP_MAP.BKG;
  return createStandardSelectionConfig('tmsShipmentStatus', { GROUP_NAME: groupName });
};

export const getCFSLoadPortListConfig = (officeCode = 'NYC') =>
  createStandardSelectionConfig('getCFSLoadPortList', {
    toggleCode: 'THIRD_PARTY_WAREHOUSE_MAPPING',
    officeCode,
    cType: 'CFS_LOAD_PORT',
    moduleReferenceTable: 'BKG_CFS_LOAD_PORT',
  });

export const paymentMethodListConfig = (officeCode = 'NYC') =>
  createStandardSelectionConfig('paymentMethodList', {
    toggleCode: 'THIRD_PARTY_WAREHOUSE_MAPPING',
    officeCode,
    cType: 'PAYMENT_METHOD',
    moduleReferenceTable: 'BKG_PAYMENT_METHOD',
  });

export const customManifestFeeListConfig = (officeCode = 'NYC') =>
  createStandardSelectionConfig('customManifestFeeList', {
    toggleCode: 'THIRD_PARTY_WAREHOUSE_MAPPING',
    officeCode,
    cType: 'CUSTOM_MANIFEST_FEE',
    moduleReferenceTable: 'BKG_CUSTOM_MANIFEST_FEE',
  });

export const tmsSelectionConfig = (listboxName: string, moduleName = 'BKG') =>
  createStandardSelectionConfig('tmsSelection', {
    MODULE_NAME: moduleName,
    LISTBOX_NAME: listboxName,
  });

export const selectConatinerSizeTypeConfig = (typeOfMove = 'FCL') =>
  createStandardSelectionConfig('selectConatinerSizeType', {
    typeOfMove,
  });

export const shipmentStatusTypeConfig = (moduleType = 'QUO') =>
  createStandardSelectionConfig('shipmentStatusType', {
    moduleType,
  });

export const selectRankedSchedulesConfig = (officeCode = 4, moduleCode = 'QUO') =>
  createStandardSelectionConfig('selectRankedSchedules', {
    officeCode,
    moduleCode,
  });

export const alternateGatewaySelectionConfig = (moduleName = 'BKG') => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  transformRequest: () => ({
    reference: 'tmsSelection',
    params: {
      MODULE_NAME: moduleName,
      LISTBOX_NAME: 'EXPORT_ALTERNATE_GATEWAY',
      GATEWAY: 'P',
    },
  }),
  transformResponse: (data: unknown): { label: string; value: string }[] => {
    const result = (data as { result?: Record<string, string> })?.result;
    if (!result) return [{ label: 'Please Select', value: '' }];
    const options = Object.keys(result).map((key) => ({
      label: key,
      value: result[key],
    }));
    return [{ label: 'Please Select', value: '' }, ...options];
  },
});

export const deliveryAlternateGatewaySelectionConfig = (moduleName = 'BKG') => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  transformRequest: () => ({
    reference: 'tmsSelection',
    params: {
      MODULE_NAME: moduleName,
      LISTBOX_NAME: 'EXPORT_ALTERNATE_GATEWAY',
      GATEWAY: 'D',
    },
  }),
  transformResponse: (data: unknown): { label: string; value: string }[] => {
    const result = (data as { result?: Record<string, string> })?.result;
    if (!result) return [{ label: 'Please Select', value: '' }];
    const options = Object.keys(result).map((key) => ({
      label: key,
      value: result[key],
    }));
    return [{ label: 'Please Select', value: '' }, ...options];
  },
});

export const pickupACCESSORIALS = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  debounceMs: 500,
  transformRequest: () => ({
    reference: 'tmsSelection',
    params: {
      MODULE_NAME: "BKG",
      LISTBOX_NAME: "LTL_PICK_ACCESSORIALS"
    }
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

    return Object.keys(result).map((key) => {
      return { label: key, value: result[key] };
    });
  },
};

export const deliveryACCESSORIALS = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  transformRequest: () => ({
    reference: 'tmsSelection',
    params: {
      MODULE_NAME: 'BKG',
      LISTBOX_NAME: 'LTL_DEL_ACCESSORIALS',
    },
  }),
  transformResponse: (data: unknown): { label: string; value: string }[] => {
    const result = (data as { result?: Record<string, string> })?.result;
    if (!result) return [];
    return Object.keys(result).map(key => ({ label: key, value: result[key] }));
  },
};
export const containerTypeSelectionConfig = (
  typeOfMove: string
) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  debounceMs: 0,
  transformRequest: () => ({
    reference: 'selectConatinerSizeType',
    params: {
      typeOfMove: typeOfMove
    },
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [{ label: 'Please Select', value: '-1' }];
    const options = Object.keys(result).map((key) => ({
      label: key,
      value: result[key] as string,
    }));
    return [{ label: 'Please Select', value: '-1' }, ...options];
  },
});

export const organizationType = (loginBean: MinifiedLoginClientBean | null | undefined) => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SELECTION_DATA,
  debounceMs: 500,
  transformRequest: () => ({
    reference: 'customerType',
    params: {
       officeSchemaName :loginBean?.schema,
    }
  }),
  transformResponse: (data: any) => {
    const result = data?.result;
    if (!result) return [];

     const options = Object.keys(result).map((key) => ({
      label: key,
      value: result[key] as string,
    }));

    return options;
  },
});
