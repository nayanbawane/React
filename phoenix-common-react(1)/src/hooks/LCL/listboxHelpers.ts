import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';
import type {
  CommonListBoxRequestBean,
  ResponseBean,
} from '../../types/LCL/misc/listbox.types';
import type { SelectOption } from '../../types/LCL/misc/commonTypes';
import { UseGetListBoxProps } from './useGetListBox';
import { MinifiedLoginClientBean } from '@/core/featureToggles/loginClientBean.types';

export const createStandardListBoxConfig = (
  listBoxName: string,
  params: Partial<CommonListBoxRequestBean> = {}
): UseGetListBoxProps<any, any> => ({
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_LISTBOX_DATA,
  transformRequest: (): CommonListBoxRequestBean => ({
    requestType: 'GET_DATA',
    listBoxName,
    moduleName: 'BKG',
    officeId: '4',
    ...params,
  }),
  transformResponse: (data: unknown): SelectOption[] => {
    const result = (data as { result?: ResponseBean[] })?.result;
    const items: SelectOption[] = [{ label: 'Please Select', value: '' }];
    if (Array.isArray(result)) {
      result.forEach((item) =>
        items.push({ label: item.key, value: item.value ?? item.key })
      );
    }
    return items;
  },
});

export const hazardousListBoxConfig = createStandardListBoxConfig(
  'bkg_hazardous_listbox'
);

export const filingByListBoxConfig = (moduleName:string , officeId:string): UseGetListBoxProps<any, any> => ({
  ...createStandardListBoxConfig('FilingBy', { moduleName, officeId }),
  transformResponse: (data: unknown): SelectOption[] => {
    const result = (data as { result?: ResponseBean[] })?.result;
    const items: SelectOption[] = [{ label: 'Please Select', value: '-1' }];
    if (Array.isArray(result)) {
      result.forEach((item) =>
        items.push({ label: item.value ?? item.key, value: item.key })
      );
    }
    return items;
  },
});

export const commissionClassListBoxConfig =
  createStandardListBoxConfig('commissionClass');

export const commodityListBoxConfig: UseGetListBoxProps<any, any> = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_LISTBOX_DATA,
  transformRequest: (): CommonListBoxRequestBean => ({
    listBoxName: 'commodity',
    moduleName: 'LOT',
    officeId: '0',
  }),
  transformResponse: (data: unknown): SelectOption[] => {
    const result = (data as { result?: ResponseBean[] })?.result;
    const items: SelectOption[] = [{ label: 'Please Select', value: '' }];
    if (Array.isArray(result)) {
      result.forEach((item) =>
        items.push({ label: item.value ?? item.key, value: item.key })
      );
    }
    return items;
  },
};

export const FCLhazardousListBoxConfigType: UseGetListBoxProps<any, any> = {
  endpoint: COMMON_ENDPOINTS.SUGGESTION_BOX.GET_LISTBOX_DATA,
  transformRequest: (): CommonListBoxRequestBean => ({
    listBoxName: 'bkg_hazardous_listbox',
    moduleName: 'BKG',
  }),
  transformResponse: (data: unknown): SelectOption[] => {
    const rawResult = (data as { result?: ResponseBean[] })?.result;

    const fclHazardousList: SelectOption[] = [
      { label: 'Please Select', value: 'Please Select' },
      { label: 'Y - Yes', value: 'Y' },
      { label: 'N - No', value: 'N' },
    ];

    const fallbackList: SelectOption[] = [
      { label: 'Limited Quantity', value: 'L' },
      { label: 'Excepted Quantity', value: 'E' },
    ];

    const items: SelectOption[] = [...fclHazardousList];

    if (Array.isArray(rawResult) && rawResult.length > 0) {
      rawResult.forEach((item) =>
        items.push({
          label: item.label ?? item.value,
          value: item.key ?? item.value,
        })
      );
    } else {
      items.push(...fallbackList);
    }

    return items;
  },
};
