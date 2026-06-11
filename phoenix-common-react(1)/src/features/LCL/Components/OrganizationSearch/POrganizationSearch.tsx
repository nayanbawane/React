import { Box } from '@mui/material';
import {
  PGradientButton,
  PSelect,
  PSingleValueSearchableField,
  PTextField,
} from 'phoenix-react-lib';

import POrganizationResultWidget from './POrganizationResultWidget';
import POrganizationWidgetHeader from './POrganizationWidgetHeader';
import Loader from '../Loader/Loader';
import { selectOverrideSx, sharedMenuProps } from './styles';
import styles from '../../../../styles/LCL/OrganizationSearch.module.css';
import { OrgRow, OrgSearchProfile, POrganizationSearchProps } from '@/types';
import {
  ORGANIZATION_STATUS_OPTIONS,
} from '../../../../InitialData/LCL';
import {
  ORG_SEARCH_PROFILES,
  resolveFieldProps,
} from './organizationSearchConfig';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COMMON_ENDPOINTS } from '../../../../core/api/config/common.endpoints';
import { CommonToggleKeys } from '../../../../core';
import { useApi } from '../../../../hooks/LCL/useApi';
import {
  OrganizationSearchRequest,
  OrganizationSearchResponse,
  OrganizationSearchRowCountResponse,
} from '../../../../hooks/LCL/OrganizationSerach/organizationSerachService';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import { useSelector } from 'react-redux';
import { useGetMultiPanelSuggestions } from '../../../../hooks/LCL/useGetMultiPanelSuggestions';
import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
import { useGetSuggestions } from '../../../../hooks/LCL/useGetSuggestions';
import {
  OrgSearchSessionParams,
  parseOrgSearchCustomerTypeList,
} from '../../../../hooks/LCL/suggestionHelpers';
import { useAppSelector } from '@/app/store/hooks';
import { useGetSelections } from '../../../../hooks/LCL/useGetSelections';
import { organizationType as organizationTypeConfig } from '../../../../hooks/LCL/selectionHelpers';

const NOOP_MULTI_PANEL_CONFIG = {
  endpoint: '',
  minChars: 99999,
  debounceMs: 300,
  transformRequest: (_query: string) => ({}),
  transformItem: (_item: unknown) => ({}) as Record<string, unknown>,
} as const;

function POrganizationSearch({
  formData,
  onChange,
  viewState,
  viewHandlers,
  searchResults,
  onSelect,
  configKey = 'default',
  codeFieldConfig,
  aliasFieldConfig,
  stateFieldConfig,
  countryFieldConfig,
  taxIdFieldConfig,
  salesPersonFieldConfig,
  moduleType = 'BKG',
}: POrganizationSearchProps) {
  const { viewMode, clearKey } = viewState;
  const {
    handleGoSearch,
    handleClearAll,
    handleOrgCodeSelect,
    handleBackToSearch,
  } = viewHandlers;

  const loginClientBean = useSelector(selectLoginClientBean);
  const direction = useSelector(
    (state: { quoteBooking?: { mainDetails?: { direction?: string } } }) =>
      state.quoteBooking?.mainDetails?.direction ?? ''
  );

    const {
        data: organizationSearchData,
        loading: isOrganizationSearchDataFetching,
        execute: executeOrganizationSearchDataFetch,
    } = useApi<OrganizationSearchRequest, OrganizationSearchResponse>({
        endpoint: COMMON_ENDPOINTS.ORGANIZATION_SEARCH.GET_ORGANIZATION_SEARCH_PAGINATION_DATA,
        onError: (err) => {
            console.error('Failed to fetch organization search data:', err.message);
        },
    });

    const {
        data: organizationSearchRowCount,
        loading: isOrganizationSearchRowCountFetching,
        execute: executeOrganizationSearchRowCountFetch,
    } = useApi<OrganizationSearchRequest, OrganizationSearchRowCountResponse>({
        endpoint: COMMON_ENDPOINTS.ORGANIZATION_SEARCH.GET_ROW_COUNT,
        onError: (err) => {
            console.error('Failed to fetch organization search data:', err.message);
        },
    });

      const PreBookingMainDetails = useAppSelector(
    (state) => state.preBooking.mainDetails
  );

  const { isVisible, getToggleValue } = useFeatureToggle();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [selectedState, setSelectedState] = useState<any>(null);


  const sessionParams = useMemo<OrgSearchSessionParams>(
    () => ({
      countryCode: loginClientBean?.countryCode ?? '',
      office: loginClientBean?.office ?? '',
      officeSchemaName: loginClientBean?.schema ?? '',
      user: loginClientBean?.ldapUser ?? '',
      loginBean: loginClientBean as any,
    }),
    [loginClientBean]
  );

  const isImportQuote = moduleType === 'QUO' && direction === 'Import';

  const custType = useMemo(
    () =>
      parseOrgSearchCustomerTypeList(
        getToggleValue(
          isImportQuote
            ? CommonToggleKeys.IMPORT_QUO_CUST_MULTIPANEL_SUGGESTION
            : moduleType === 'QUO'
              ? CommonToggleKeys.QUO_CUST_MULTIPANEL_SUGGESTION
              : CommonToggleKeys.BKG_CUST_MULTIPANEL_SUGGESTION
        )
      ),
    [getToggleValue, moduleType, isImportQuote]
  );

  const shipperTypeList = useMemo(
    () =>
      parseOrgSearchCustomerTypeList(
        getToggleValue(
          moduleType === 'QUO'
            ? CommonToggleKeys.QUO_SHIP_MULTIPANEL_SUGGESTION
            : CommonToggleKeys.BKG_SHIP_MULTIPANEL_SUGGESTION
        )
      ),
    [getToggleValue, moduleType]
  );

  const consigneeTypeList = useMemo(
    () =>
      parseOrgSearchCustomerTypeList(
        getToggleValue(
          moduleType === 'QUO'
            ? CommonToggleKeys.QUO_CONS_MULTIPANEL_SUGGESTION
            : CommonToggleKeys.BKG_CONS_MULTIPANEL_SUGGESTION
        )
      ),
    [getToggleValue, moduleType]
  );

  const forwarderTypeList = useMemo(
    () =>
      parseOrgSearchCustomerTypeList(
        getToggleValue(CommonToggleKeys.BKG_FORW_MULTIPANEL_SUGGESTION)
      ),
    [getToggleValue]
  );
  let isAgentBooking = false;
  let isCrossTread = false;

  if (PreBookingMainDetails.agentBooking) {
    isAgentBooking = true;
  }
  if(PreBookingMainDetails.routed === 'CT'){
    isCrossTread = true;
  }

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
  const customerTypeList = isPreBKG ? DEFAULT_CUSTOMER_TYPES : custType;


  

  const profiles = useMemo(
    () =>
      ORG_SEARCH_PROFILES({
        moduleType,
        sessionParams,
        customerTypeList,
        shipperTypeList,
        consigneeTypeList,
        forwarderTypeList,
      }),
    [
      moduleType,
      configKey,
      sessionParams,
      customerTypeList,
      shipperTypeList,
      consigneeTypeList,
      forwarderTypeList,
    ]
  );

  const profile = profiles[configKey] as OrgSearchProfile;

  const { data: allOrgTypeOptions } = useGetSelections((organizationTypeConfig(loginClientBean)));

  const filterMap: Partial<Record<string, readonly string[]>> = {
    customer: customerTypeList,
    shipper: shipperTypeList,
    forwarder: forwarderTypeList,
    consignee: consigneeTypeList,
    notifyParty: forwarderTypeList,
  };
  const allowedTypes = filterMap[configKey];

  const orgTypeOptions = useMemo(() => {
    const pleaseSelect = { label: 'Please Select', value: '-1' };

    const filtered = allowedTypes
      ? allOrgTypeOptions.filter((opt) => allowedTypes.includes(opt.value))
      : allOrgTypeOptions;

    return [pleaseSelect, ...filtered];
  }, [allOrgTypeOptions, allowedTypes]);

  const resolvedCodeConfig = codeFieldConfig ?? profile.codeField;
  const resolvedAliasConfig = aliasFieldConfig ?? profile.aliasField;
  const resolvedStateConfig = stateFieldConfig ?? profile.stateField;
  const resolvedCountryConfig = countryFieldConfig ?? profile.countryField;
  const resolvedTaxIdConfig = taxIdFieldConfig ?? profile.taxIdField;
  const resolvedSalesPersonConfig =
    salesPersonFieldConfig ?? profile.salesPersonField;

  const isSearching = isOrganizationSearchDataFetching || isOrganizationSearchRowCountFetching;

  const [localSearchResults, setLocalSearchResults] = useState<OrgRow[]>([]);
  const [searchKey, setSearchKey] = useState(0);
  const pendingNavigation = useRef(false);

  useEffect(() => {
    if (
      pendingNavigation.current &&
      !isOrganizationSearchDataFetching &&
      !isOrganizationSearchRowCountFetching
    ) {
      pendingNavigation.current = false;
      handleGoSearch();
    }
  }, [isOrganizationSearchDataFetching, isOrganizationSearchRowCountFetching]);

  useEffect(() => {
    if (organizationSearchData?.result) {
      setLocalSearchResults(
        organizationSearchData.result.map((item, index) => ({
          id: item.organizationCode ?? String(index),
          organizationResultDetail: item,
          expandData: item,
        }))
      );
    }
  }, [organizationSearchData?.result]);

  const organizationSearchCriteriaBean = (upperLimit = 100, lowerLimit = 0): OrganizationSearchRequest => {
  return {
      organizationSearchCriteriaBean: {
        code: formData.organizationCode ?? '',
        name: formData.organizationName ?? '',
        alias: formData.alias ?? '',
        address: formData.address ?? '',
        city: formData.city ?? '',
        state: selectedState?.[resolvedStateConfig.sections[0].displayFields[0]] ?? '',
        country: selectedCountry?.[resolvedCountryConfig.sections[0].displayFields[0]] ?? '',
        postalCode: formData.postalCode ?? '',
        email: formData.email ?? '',
        organnizationType: formData.organizationType ?? '-1',
        status: formData.organizationStatus ?? '',
        salesRep: formData.salesPerson ?? '',
        cSTIOfficeCode: '',
        webService: '',
        schemaName: loginClientBean?.schema ?? '',
        CvType: '',
        fromDate: '',
        toDate: '',
        taxId: '',
        einNumber: '',
        orgVatIdNo: formData.taxId ?? '',
        kingdeeStatus: null,
        handlingSchema: '',
        isAccountsReceivable: '',
        moduleCode: 'BKG',
        inClause:
         {
          CUSTOMER_TYPE: allowedTypes?.flat() ?? []
        },
      },
      officeParam: {
        moduleType: 'BKG',
        isUsRouting: 'No',
        codeLabel: 'Pickup Cargo At Code',
        officeSchemaName: loginClientBean?.schema ?? '',
      },
      loginbean: {
        officeId: loginClientBean?.officeId ?? '',
        schema: loginClientBean?.schema ?? '',
        company: loginClientBean?.company ?? '',
        userId: loginClientBean?.userId ?? '',
        siteId: loginClientBean?.siteId ?? '',
        DATE_FORMAT: loginClientBean?.officeSettingMap?.DATE_FORMAT?.[0] ?? '',
        INTERVAL1_TARGET:
          loginClientBean?.officeSettingMap?.INTERVAL1_TARGET?.[0] ?? '',
        INTERVAL1_TARGET_TYPE:
          loginClientBean?.officeSettingMap?.INTERVAL1_TARGET_TYPE?.[0] ?? '',
        INTERVAL2_TARGET:
          loginClientBean?.officeSettingMap?.INTERVAL2_TARGET?.[0] ?? '',
        INTERVAL2_TARGET_TYPE:
          loginClientBean?.officeSettingMap?.INTERVAL2_TARGET_TYPE?.[0] ?? '',
        INTERVAL3_TARGET:
          loginClientBean?.officeSettingMap?.INTERVAL3_TARGET?.[0] ?? '',
        INTERVAL3_TARGET_TYPE:
          loginClientBean?.officeSettingMap?.INTERVAL3_TARGET_TYPE?.[0] ?? '',
        INTERVAL4_TARGET:
          loginClientBean?.officeSettingMap?.INTERVAL4_TARGET?.[0] ?? '',
        INTERVAL4_TARGET_TYPE:
          loginClientBean?.officeSettingMap?.INTERVAL4_TARGET_TYPE?.[0] ?? '',
        INTERVAL5_TARGET:
          loginClientBean?.officeSettingMap?.INTERVAL5_TARGET?.[0] ?? '',
        INTERVAL5_TARGET_TYPE:
          loginClientBean?.officeSettingMap?.INTERVAL5_TARGET_TYPE?.[0] ?? '',
        INVOICE_DUE_DATE_WITH_END_MONTH_LOGIC: isVisible(
          CommonToggleKeys.INVOICE_DUE_DATE_WITH_END_MONTH_LOGIC
        ),
        ORG_DASH_INVOICE_DTL_CAL_INVOICE_DUE_DATE_AGING: isVisible(
          CommonToggleKeys.ORG_DASH_INVOICE_DTL_CAL_INVOICE_DUE_DATE_AGING
        ),
        USER_LOCALE_SEARCH: isVisible(CommonToggleKeys.USER_LOCALE_SEARCH),
        VENDOR_PROFILE_LOCALE: isVisible(
          CommonToggleKeys.VENDOR_PROFILE_LOCALE
        ),
        TAX_ID_PROFILE_LOCALE: isVisible(
          CommonToggleKeys.TAX_ID_PROFILE_LOCALE
        ),
        KINGDEE_RECORD_EXTRACTION: isVisible(
          CommonToggleKeys.KINGDEE_RECORD_EXTRACTION
        ),
      },
      lowerLimit: lowerLimit,
      upperLimit: upperLimit,
    };
  };
  const callAPI = async () => {
    setSearchKey(k => k + 1);
     await executeOrganizationSearchRowCountFetch(
      organizationSearchCriteriaBean()
    );

    executeOrganizationSearchDataFetch(
      organizationSearchCriteriaBean(100, 0)
    );
  };

  const handlePageChange = (lower: number, upper: number) => {
  executeOrganizationSearchDataFetch(
    organizationSearchCriteriaBean(upper, lower)
  );
};

  //  Code field: multi-panel

  const codeMultiPanelSuggestionConfig =
    resolvedCodeConfig?.useMultiPanelSuggestions &&
    resolvedCodeConfig.suggestionConfig
      ? resolvedCodeConfig.suggestionConfig
      : NOOP_MULTI_PANEL_CONFIG;

  const { result: codeMultiPanelResult, setQuery: setCodeMultiPanelQuery } =
    useGetMultiPanelSuggestions(codeMultiPanelSuggestionConfig);

  const singlePanelCodeSuggestionConfig = resolvedCodeConfig?.useApiSuggestions
    ? resolvedCodeConfig.suggestionConfig
    : undefined;

  const {
    data: pickupCargoAtcodeOrgCodeSuggestions,
    setQuery: setPickupCargoAtcodeOrgCodeQuery,
  } = useGetSuggestions(singlePanelCodeSuggestionConfig);

  // Other field suggestions

  const aliasSuggestionConfig = resolvedAliasConfig?.useApiSuggestions
    ? resolvedAliasConfig?.suggestionConfig
    : undefined;

  const taxIdSuggestionConfig = resolvedTaxIdConfig?.useApiSuggestions
    ? resolvedTaxIdConfig?.suggestionConfig
    : undefined;

  const countrySuggestionConfig = resolvedCountryConfig?.useApiSuggestions
    ? resolvedCountryConfig?.suggestionConfig
    : undefined;

  const stateSuggestionConfig = resolvedStateConfig?.useApiSuggestions
    ? resolvedStateConfig?.suggestionConfig
    : undefined;

  const salesPersonSuggestionConfig =
    resolvedSalesPersonConfig?.useApiSuggestions
      ? resolvedSalesPersonConfig?.suggestionConfig
      : undefined;

  const countrycode = formData.country ?? '';

  useEffect(() => {
    if (countrycode) {
      setOrganizationStateQuery(countrycode);
    }
  }, [countrycode]);

  const {
    data: organizationAliasSuggestions,
    setQuery: setOrganizationAliasQuery,
  } = useGetSuggestions(aliasSuggestionConfig);
  const {
    data: organizationTaxIdSuggestions,
    setQuery: setOrganizationTaxIdQuery,
  } = useGetSuggestions(taxIdSuggestionConfig);
  const {
    data: organizationCountrySuggestions,
    setQuery: setOrganizationCountryQuery,
  } = useGetSuggestions(countrySuggestionConfig);
  const {
    data: organizationStateSuggestions,
    setQuery: setOrganizationStateQuery,
  } = useGetSuggestions(stateSuggestionConfig(countrycode));
  const {
    data: organizationSalesPersonSuggestions,
    setQuery: setOrganizationSalesPersonQuery,
  } = useGetSuggestions(salesPersonSuggestionConfig);

  // Merge API data into field

  const codeFieldProps = useMemo(() => {
    if (resolvedCodeConfig?.useMultiPanelSuggestions) {
      return {
        ...resolveFieldProps(resolvedCodeConfig),
        data: codeMultiPanelResult.data,
        data1: codeMultiPanelResult.data1,
        data2: codeMultiPanelResult.data2,
      };
    }
    if (
      resolvedCodeConfig?.useApiSuggestions &&
      pickupCargoAtcodeOrgCodeSuggestions
    ) {
      return {
        ...resolveFieldProps(resolvedCodeConfig),
        data: pickupCargoAtcodeOrgCodeSuggestions,
      };
    }
    return resolveFieldProps(resolvedCodeConfig);
  }, [
    resolvedCodeConfig,
    codeMultiPanelResult,
    pickupCargoAtcodeOrgCodeSuggestions,
  ]);

  const aliasFieldProps = useMemo(() => {
    if (
      resolvedAliasConfig?.useApiSuggestions &&
      organizationAliasSuggestions
    ) {
      return {
        ...resolveFieldProps(resolvedAliasConfig),
        data: organizationAliasSuggestions,
      };
    }
    return resolveFieldProps(resolvedAliasConfig);
  }, [resolvedAliasConfig, organizationAliasSuggestions]);

  const taxIdFieldProps = useMemo(() => {
    if (
      resolvedTaxIdConfig?.useApiSuggestions &&
      organizationTaxIdSuggestions
    ) {
      return {
        ...resolveFieldProps(resolvedTaxIdConfig),
        data: organizationTaxIdSuggestions,
      };
    }
    return resolveFieldProps(resolvedTaxIdConfig);
  }, [resolvedTaxIdConfig, organizationTaxIdSuggestions]);

  const countryFieldProps = useMemo(() => {
    if (
      resolvedCountryConfig?.useApiSuggestions &&
      organizationCountrySuggestions
    ) {
      return {
        ...resolveFieldProps(resolvedCountryConfig),
        data: organizationCountrySuggestions,
      };
    }
    return resolveFieldProps(resolvedCountryConfig);
  }, [resolvedCountryConfig, organizationCountrySuggestions]);

  const stateFieldProps = useMemo(() => {
    if (
      resolvedStateConfig?.useApiSuggestions &&
      organizationStateSuggestions
    ) {
      return {
        ...resolveFieldProps(resolvedStateConfig),
        data: organizationStateSuggestions,
      };
    }
    return resolveFieldProps(resolvedStateConfig);
  }, [resolvedStateConfig, organizationStateSuggestions]);

  const salesPersonFieldProps = useMemo(() => {
    if (
      resolvedSalesPersonConfig?.useApiSuggestions &&
      organizationSalesPersonSuggestions
    ) {
      return {
        ...resolveFieldProps(resolvedSalesPersonConfig),
        data: organizationSalesPersonSuggestions,
      };
    }
    return resolveFieldProps(resolvedSalesPersonConfig);
  }, [resolvedSalesPersonConfig, organizationSalesPersonSuggestions]);

  return (
    <>
      {viewMode === 'search' ? (
        <Box className={styles.searchView}>
          <Box className={styles.orgSectionRow}>
            <Box className={styles.sectionBodyWithMargin}>
              <Box className={styles.sectionLabelGrid}>
                <Box
                  className={`${styles.sectionLabel} ${styles.sectionLabelOrg}`}
                >
                  Organization
                </Box>
                <Box className={styles.orgSubGrid}>
                  <Box className={styles.orgFieldsLeft}>
                    {resolvedCodeConfig && (
                      <PSingleValueSearchableField
                        key={clearKey}
                        label="Code"
                        labelSx={{ lineHeight: '13px' }}
                        {...codeFieldProps}
                        showTooltip={true}
                        usePortal
                        onChange={(val) => {
                          if (resolvedCodeConfig.useMultiPanelSuggestions) {
                            setCodeMultiPanelQuery(val);
                          } else {
                            setPickupCargoAtcodeOrgCodeQuery(val);
                          }
                          onChange('organizationCode', val);
                        }}
                        onSelect={(item) => handleOrgCodeSelect(item)}
                      />
                    )}
                    <PTextField
                      label="Name"
                      value={formData.organizationName}
                      onChange={(e) =>
                        onChange('organizationName', e.target.value)
                      }
                      size="small"
                      className={styles.whiteField}
                      labelSx={{ pb: 0 }}
                    />
                  </Box>
                  <Box className={styles.orgFieldsRight}>
                    {resolvedAliasConfig && (
                      <PSingleValueSearchableField
                        key={clearKey + 2}
                        label="Alias"
                        labelSx={{ lineHeight: '13px' }}
                        {...aliasFieldProps}
                        showTooltip={true}
                        onChange={(val) => {
                          setOrganizationAliasQuery(val);
                        }}
                        usePortal
                        onSelect={(item) =>
                          onChange(
                            'alias',
                            String(
                              item[
                                resolvedAliasConfig.displayValueField ?? 'alias'
                              ]
                            )
                          )
                        }
                      />
                    )}
                    {resolvedTaxIdConfig && (
                      <PSingleValueSearchableField
                        key={clearKey + 4}
                        label="Tax ID"
                        labelSx={{ lineHeight: '13px' }}
                        {...taxIdFieldProps}
                        showTooltip={true}
                        usePortal
                        onChange={(val) => {
                          setOrganizationTaxIdQuery(val);
                        }}
                        onSelect={(item) =>
                          onChange(
                            'taxId',
                            String(
                              item[
                                resolvedTaxIdConfig.displayValueField ?? 'taxId'
                              ]
                            )
                          )
                        }
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className={styles.sectionRow}>
            <Box className={styles.sectionBody}>
              <Box className={styles.sectionLabelGrid}>
                <Box
                  className={`${styles.sectionLabel} ${styles.sectionLabelAddress}`}
                >
                  Address
                </Box>
                <Box className={styles.orgSubGrid}>
                  <Box className={styles.addressFieldsLeft}>
                    <Box className={styles.addressSpanTwo}>
                      <PTextField
                        label="Address"
                        value={formData.address}
                        onChange={(e) => onChange('address', e.target.value)}
                        size="small"
                        multiline
                        rows={2.2}
                        className={styles.whiteAutoHeightField}
                        labelSx={{ pb: 0 }}
                      />
                    </Box>
                    <Box className={styles.statePostalBox}>
                      {resolvedStateConfig && (
                        <PSingleValueSearchableField
                          key={clearKey + 3}
                          label="State"
                          labelSx={{ lineHeight: '13px' }}
                          {...stateFieldProps}
                          showTooltip={true}
                          usePortal
                          onChange={(val) => {
                            setOrganizationStateQuery(val);
                          }}
                          onSelect={(item) =>{
                            setSelectedState(item);
                            onChange(
                              'state',
                              String(
                                item[
                                  resolvedStateConfig.sections[0]
                                    .displayFields[1]
                                ]
                              )
                            )
                          }}
                        />
                      )}
                      <PTextField
                        label="Postal Code"
                        value={formData.postalCode}
                        onChange={(e) => onChange('postalCode', e.target.value)}
                        size="small"
                        className={styles.postalCodeField}
                        labelSx={{ pb: 0 }}
                      />
                    </Box>
                  </Box>
                  <Box className={styles.addressFieldsRight}>
                    <PTextField
                      label="City"
                      value={formData.city}
                      onChange={(e) => onChange('city', e.target.value)}
                      size="small"
                      className={styles.whiteField}
                      labelSx={{ pb: 0 }}
                    />
                    {resolvedCountryConfig && (
                      <PSingleValueSearchableField
                        key={clearKey + 1}
                        label="Country"
                        labelSx={{ lineHeight: '13px' }}
                        {...countryFieldProps}
                        showTooltip={true}
                        usePortal
                        onChange={(val) => {
                          setOrganizationCountryQuery(val);
                        }}
                        onSelect={(item) =>{
                            setSelectedCountry(item);

                          onChange(
                            'country',
                            String(
                              item[
                                resolvedCountryConfig.sections[0]
                                  .displayFields[1]
                              ]
                            )
                          )
                        }}
                      />
                    )}
                    <PTextField
                      label="Email"
                      value={formData.email}
                      onChange={(e) => onChange('email', e.target.value)}
                      size="small"
                      className={styles.whiteField}
                      labelSx={{ pb: 0, lineHeight: '17px' }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box>
            <Box className={styles.sectionRow}>
              <Box className={styles.sectionLabelGridType}>
                <Box
                  className={`${styles.sectionLabel} ${styles.sectionLabelType}`}
                >
                  Type
                </Box>
                <Box className={styles.selectWrapper}>
                  <PSelect
                    label="Organization Type"
                    options={orgTypeOptions}
                    value={formData.organizationType}
                    onChange={(e) => onChange('organizationType', e as string)}
                    sx={selectOverrideSx}
                    labelSx={{ pb: 0 }}
                    MenuProps={sharedMenuProps}
                  />
                </Box>
              </Box>
            </Box>

            <Box className={styles.sectionRow}>
              <Box className={styles.sectionLabelGridType}>
                <Box
                  className={`${styles.sectionLabel} ${styles.sectionLabelStatus}`}
                >
                  Status
                </Box>
                <Box className={styles.selectWrapper}>
                  <PSelect
                    label="Organization Status"
                    options={ORGANIZATION_STATUS_OPTIONS}
                    value={formData.organizationStatus}
                    onChange={(e) =>
                      onChange('organizationStatus', e as string)
                    }
                    size="small"
                    sx={selectOverrideSx}
                    MenuProps={sharedMenuProps}
                  />
                </Box>
              </Box>
            </Box>

            <Box className={styles.miscSectionRow}>
              <Box className={styles.sectionLabelGridMisc}>
                <Box
                  className={`${styles.sectionLabel} ${styles.sectionLabelMisc}`}
                >
                  Miscellaneous
                </Box>
                {resolvedSalesPersonConfig && (
                  <PSingleValueSearchableField
                    key={clearKey + 5}
                    id="salesPerson"
                    label="Sales Person"
                    labelSx={{ lineHeight: '13px' }}
                    {...salesPersonFieldProps}
                    showTooltip={true}
                    onChange={(val) => {
                      setOrganizationSalesPersonQuery(val);
                      onChange('salesPerson', val);
                    }}
                    onSelect={(item) =>
                      onChange(
                        'salesPerson',
                        String(
                          item[
                            resolvedSalesPersonConfig.displayValueField ??
                              'name'
                          ]
                        )
                      )
                    }
                  />
                )}
              </Box>
            </Box>

            <Box className={styles.actionsRow}>
              <Box className={styles.actionsGrid}>
                <Box />
                <Box className={styles.buttonsBox}>
                  {isSearching ? (
                    <Loader />
                  ) : (
                    <PGradientButton
                      onClick={() => {
                        pendingNavigation.current = true;
                        callAPI();
                      }}
                      title="Go"
                    />
                  )}
                  <PGradientButton
                    onClick={handleClearAll}
                    sx={{ minWidth: '80px' }}
                    title="Clear All"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box className={styles.resultsView}>
          <POrganizationWidgetHeader
            title="Organization"
            actionLabel="Back to Search"
            onAction={handleBackToSearch}
          />
          {localSearchResults.length === 0 ? (
            <Box className={styles.noResultsText}>No Organization found</Box>
          ) : (
            <Box className={styles.resultsWrapper}>
              <POrganizationResultWidget
                key={searchKey}
                rows={localSearchResults}
                rowCount={organizationSearchRowCount?.result}
                onSelect={(row) => {
                  onSelect?.(row.organizationResultDetail);
                }}
                onPageChange={handlePageChange}
              />
            </Box>
          )}
        </Box>
      )}
    </>
  );
}

export default POrganizationSearch;
