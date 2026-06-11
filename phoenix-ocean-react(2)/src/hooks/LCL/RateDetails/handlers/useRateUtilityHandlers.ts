import {
  BookingQuoteChargeBeanFull,
  CargoRowsState,
  CommonToggleKeys,
  LoginClientBeanRaw,
  useFeatureToggle,
} from 'phoenix-common-react';

export interface RateUtilityDeps {
  ratingType: string;
  loginClientBean?: LoginClientBeanRaw;
  cargoFormData?: CargoRowsState;
  moduleType?: string;
  featureToggle: ReturnType<typeof useFeatureToggle>;
}

export const useRateUtilityHandlers = (deps: RateUtilityDeps) => {
  const { ratingType, loginClientBean, cargoFormData, moduleType, featureToggle } =
    deps;
  const { isVisible } = featureToggle;

  const isRateOverrideAllow = (_relayFlag?: string): boolean => {
    if (ratingType === 'M' || ratingType === 'G') return true;
    const roleValue = (loginClientBean as any)?.userSettings
      ?.BKG_RATE_OVER_RIDE_ROLE as string | undefined;
    if (!roleValue?.trim()) return true;
    return roleValue.toUpperCase() === 'Y';
  };

  const getTotalWeight = (): number =>
    cargoFormData?.cargoRows?.reduce(
      (sum, row) => sum + Number(row.kg || 0),
      0
    ) ?? 0;

  const getTotalCube = (): number =>
    cargoFormData?.cargoRows?.reduce(
      (sum, row) => sum + Number(row.cbm || 0),
      0
    ) ?? 0;

  const getTotalPieces = (): number =>
    cargoFormData?.cargoRows?.reduce(
      (sum, row) => sum + Number((row as any).pieces || 0),
      0
    ) ?? 0;  

  const getPiecesForBasis = (
  basis: string,
  updatedRow: BookingQuoteChargeBeanFull,
): number => {
  const extractFromEquipment = (equipmentDetails: string | undefined): number => {
    const equipmentValue = equipmentDetails ?? '';
    const match = equipmentValue.match(/^(\d+)\s*X\s*(.+)$/i);
    return match ? Number(match[1]) : 0;
  };
  // if (updatedRow) {
    if (basis === 'PC' && updatedRow) {      
      return extractFromEquipment(updatedRow.equipmentDetails);
    } else{
      return getTotalPieces();
    }
  // }
};

  const getUOM = (): string => 'M';

  const getModuleType = (): 'O' | 'A' => 'O';

  const shouldTriggerAutoVat = (): boolean => {
    const chkAutoAssignVat = isVisible(CommonToggleKeys.CHK_AUTO_ASSIGN_VAT ?? 'CHK_AUTO_ASSIGN_VAT');
    const screenToggle =
      moduleType === 'Q'
        ? isVisible(CommonToggleKeys.AUTO_VAT_OCEAN_QUOTE_SCREEN ?? 'AUTO_VAT_OCEAN_QUOTE_SCREEN')
        : isVisible(CommonToggleKeys.AUTO_VAT_OCEAN_BOOKING_SCREEN ?? 'AUTO_VAT_OCEAN_BOOKING_SCREEN');

    if (!chkAutoAssignVat || !screenToggle) return false;

    const autoVatEnabled = isVisible(CommonToggleKeys.AUTOVAT_CHARGE_ENABLE);
    const ocnApplyEuVat = isVisible(CommonToggleKeys.OCN_APPLY_EU_VAT ?? 'OCN_APPLY_EU_VAT');
    const ocnApplyEuVatSs = isVisible(CommonToggleKeys.OCN_APPLY_EU_VAT_SS ?? 'OCN_APPLY_EU_VAT_SS');

    if (autoVatEnabled || (ocnApplyEuVat && !ocnApplyEuVatSs)) return true;

    return ratingType === 'M' || ocnApplyEuVatSs;
  };

  return {
    isRateOverrideAllow,
    getTotalWeight,
    getTotalCube,
    getTotalPieces,
    getUOM,
    getModuleType,
    shouldTriggerAutoVat,
    getPiecesForBasis
  };
};
