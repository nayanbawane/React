import { CargoRowType, HazardousRowType } from '@/types/LCL/cargo/CargoDetails.types';
import FCLCargoDetails from './FCLCargoDetails';
import { RoutingRefs, SelectOption } from '@/types';

const FCLCargoDetailsSection = ({
  updateHazardous,
  addHazardous,
  removeHazardous,
  hazRows,
  shippingType,
  fclCargoRow,
  updateFCLCargoRows,
  containerTypeSelect,
  packagingOptions,
  imoClassOptions,
  fclhazardousSelect = [],
  onKeyDown,
  routingRef,
  isHazardous,
  onBlur,
  updateContainerData,
  onBlurField,
  rateDetails
}: {
  updateHazardous: (hIdx: number, field: string, value: unknown) => void;
  addHazardous: () => void;
  removeHazardous: (hIdx: number) => void;
  hazRows: HazardousRowType[];
  shippingType: string;
  fclCargoRow: CargoRowType
  updateFCLCargoRows: ((field: string, value: any) => void)
  containerTypeSelect: SelectOption[]
  packagingOptions?: SelectOption[],
  imoClassOptions?: SelectOption[],
  fclhazardousSelect: SelectOption[],
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement>,
    ref?: React.MutableRefObject<HTMLInputElement | null>,
    accordionId?: number,
    openOnTab?: boolean, 
    openOnShiftTab?: boolean
  ) => void;
  routingRef: RoutingRefs,
  isHazardous: boolean,
  onBlur?: (numberOfContainer: string, containerType: string, index: number, changedField: "numberOfContainer" | "containerType") => void
  updateContainerData: (numberOfContainer?: string | number | undefined, containerType?: string | undefined, rowNo?: number | undefined, changedField?: string | undefined, changedValue?: string | undefined) => void
  onBlurField?: (field: string, value: string) => void;
  rateDetails: any;
}) => {
  let formType = "QUO" as string;
  const accurateRate = rateDetails?.accurateRate;
  const triggerAccurateOrConfirm = accurateRate?.triggerAccurateOrConfirm;
  const isAccurateRatingType = rateDetails?.defaultState?.isAccurateServiceActive ?? false;

  return (
    <>
      <FCLCargoDetails
        formType={formType}
        fclCargoRow={fclCargoRow}
        isHazardous={isHazardous}
        isAccurateRatingType={isAccurateRatingType}
        hazRows={hazRows}
        shippingType={shippingType}
        onCargoChange={updateFCLCargoRows}
        onAddHazardousRow={addHazardous}
        onChangeHazardousRow={updateHazardous}
        onRemoveHazardousRow={removeHazardous}
        containerTypeSelect={containerTypeSelect}
        packagingOptions={packagingOptions}
        imoClassOptions={imoClassOptions}
        fclhazardousSelect={fclhazardousSelect}
        onKeyDown={onKeyDown}
        routingRef={routingRef}
        onBlur={onBlur}
        updateContainerData={updateContainerData}
        onBlurField={onBlurField}
        triggerAccurateOrConfirm = {triggerAccurateOrConfirm}
      />
    </>
  )
}

export default FCLCargoDetailsSection
