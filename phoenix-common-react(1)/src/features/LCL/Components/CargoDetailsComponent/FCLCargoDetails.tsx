// import { FCL_QUOTEBOOKING_CONTAINER_TYPE_OPTION, FCL_QUOTEBOOKING_HAZARDOUS_OPTIONS } from '../../../../../InitialData'
import { Box, Stack } from '@mui/material'
import styles from "../../../../styles/LCL/FCLCargoDetails.module.css";
import HazardousSection from './HazardousSection';
import { FCLCargoProps } from '@/types/LCL/cargo/CargoDetails.types';
import { AutoTextarea, PDatePicker, PNumberField, PSelect } from 'phoenix-react-lib';

const FCLCargoDetails: React.FC<FCLCargoProps> = ({
  formType,
  fclCargoRow,
  isHazardous,
  hazRows,
  onCargoChange,
  onAddHazardousRow,
  onRemoveHazardousRow,
  onChangeHazardousRow,
  shippingType,
  containerTypeSelect,
  packagingOptions,
  imoClassOptions,
  fclhazardousSelect,
  onKeyDown,
  routingRef,
  onBlur,
  updateContainerData,
  onBlurField,
  isAccurateRatingType,
  triggerAccurateOrConfirm
}) => {
  return (
    <>
      <Box className={styles.cargoContainer}>
        {/* Row 1 */}
        <Box className={styles.numberOfContainer1}>
          <PNumberField
            maxLength={3}
            name="numberOfContainer1"
            value={fclCargoRow.numberOfContainer1 ?? ""}
            label="Number Of Container"
            required={formType === "QUO" ? false : true}
            inputModeType="numeric"
            onChange={(val: string) => onCargoChange("numberOfContainer1", val)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown?.(e, routingRef.etaDestinationDateRef, 3, false, true)}
            onBlur={(e) => {
              const freshVal = (e.target as HTMLInputElement).value;
              updateContainerData(
                freshVal,
                fclCargoRow.containerType1,
                1,
                "numberOfContainer1", 
                freshVal
              );
              onBlur?.(freshVal, fclCargoRow.containerType1, 1, 'numberOfContainer');
            }}
          />
        </Box>

        <Box className={[styles.containerType1, styles.contentSpace]}>
          <PSelect
            label="Container Type"
            value={fclCargoRow.containerType1}
            name="containerType1"
            required={true}
            options={containerTypeSelect}
            onChange={(val: string) => {
              onCargoChange("containerType1", val);
              updateContainerData(
                fclCargoRow.numberOfContainer1, 
                val,                            
                1,
                "containerType1",
                val
              );
            }}
            onBlur={(e: React.KeyboardEvent<HTMLInputElement>) => onBlur?.(fclCargoRow.numberOfContainer1, fclCargoRow.containerType1, 1, 'containerType')}

          />
        </Box>

        {/* Row 2 */}
        <Box className={styles.numberOfContainer2}>
          <PNumberField
            maxLength={6}
            name="numberOfContainer2"
            value={fclCargoRow.numberOfContainer2 ?? ""}
            required={false}
            onChange={(val: string) => onCargoChange("numberOfContainer2", val)}
            onBlur={(e) => {
              const freshVal = (e.target as HTMLInputElement).value;
              updateContainerData(
                freshVal,
                fclCargoRow.containerType2,
                2,
                "numberOfContainer2",
                freshVal
              );
              onBlur?.(freshVal, fclCargoRow.containerType2, 2, 'numberOfContainer');
            }}
          />
        </Box>

        <Box className={[styles.containerType2, styles.contentSpace]}>
          <PSelect
            value={fclCargoRow.containerType2}
            name="containerType2"
            required={false}
            options={containerTypeSelect}
            onChange={(val: string) => {
              onCargoChange("containerType2", val);
              updateContainerData(
                fclCargoRow.numberOfContainer2, 
                val,                            
                2,
                "containerType2",
                val
              );
            }}
            onBlur={(e: React.KeyboardEvent<HTMLInputElement>) => onBlur?.(fclCargoRow.numberOfContainer2, fclCargoRow.containerType2, 2, 'containerType')}

          />
        </Box>

        {/* Row 3 */}
        <Box className={styles.numberOfContainer3}>
          <PNumberField
            maxLength={6}
            name="numberOfContainer3"
            value={fclCargoRow.numberOfContainer3 ?? ""}
            required={false}
            onChange={(val: string) => onCargoChange("numberOfContainer3", val)}
            onBlur={(e) => {
              const freshVal = (e.target as HTMLInputElement).value;
              updateContainerData(
                freshVal,
                fclCargoRow.containerType3,
                3,
                "numberOfContainer3",
                freshVal
              );
              onBlur?.(freshVal, fclCargoRow.containerType3, 3, 'numberOfContainer');
            }}
          />
        </Box>

        <Box className={[styles.containerType3, styles.contentSpace]}>
          <PSelect
            value={fclCargoRow.containerType3}
            name="containerType3"
            required={false}
            options={containerTypeSelect}
            onChange={(val: string) => {
              onCargoChange("containerType3", val);
              updateContainerData(
                fclCargoRow.numberOfContainer3, 
                val,                            
                3,
                "containerType3",
                val
              );
            }}
            onBlur={(e: React.KeyboardEvent<HTMLInputElement>) => onBlur?.(fclCargoRow.numberOfContainer3, fclCargoRow.containerType3, 3, 'containerType')}

          />
        </Box>

        {/* Description */}
        <Box className={[styles.descriptionOfGoods, styles.contentSpace]}>
          <AutoTextarea
            id="descriptionOfGoods"
            value={fclCargoRow.descriptionOfGoods}
            label="Description of Goods"
            name="descriptionOfGoods"
            charPerLine={35}
            totalLines={5}
            height="68px"
            onChange={(e) => onCargoChange("descriptionOfGoods", e.target.value)}
            autoSize={false}
            maxLength={175}
            upperCase={true}
          />
        </Box>

        {/* KG */}
        <Box className={[styles.kg, styles.contentSpace]}>
          <PNumberField
            id="kg"
            label="Kg"
            value={fclCargoRow.kg ?? ""}
            name="kg"
            maxLength={12}
            inputModeType="decimal"
            onChange={(val: string) => onCargoChange("kg", val)}
            onBlur={() => {
              onBlurField?.('kg', fclCargoRow.kg);
              if (isAccurateRatingType) triggerAccurateOrConfirm?.();
            }}
          />
        </Box>

        {/* CBM */}
        <Box className={[styles.cbm, styles.contentSpace]}>
          <PNumberField
            id="cbm"
            label="Cbm"
            value={fclCargoRow.cbm ?? ""}
            name="cbm"
            maxLength={12}
            inputModeType="decimal"
            onChange={(val: string) => onCargoChange("cbm", val)}
            onBlur={() => {
              onBlurField?.('cbm', fclCargoRow.cbm);
              if (isAccurateRatingType) triggerAccurateOrConfirm?.();
            }}
          />
        </Box>

        {/* LBS */}
        <Box className={[styles.lbs, styles.contentSpace]}>
          <PNumberField
            label="Lbs"
            value={fclCargoRow.lbs ?? ""}
            name="lbs"
            maxLength={12}
            onChange={(val: string) => onCargoChange("lbs", val)}
          />
        </Box>

        {/* CBF */}
        <Box className={[styles.cbf, styles.contentSpace]}>
          <PNumberField
            label="Cbf"
            value={fclCargoRow.cbf ?? ""}
            name="cbf"
            maxLength={12}
            onChange={(val: string) => onCargoChange("cbf", val)}
          />
        </Box>

        {/* Hazardous */}
        <Box className={[styles.hazardous, styles.contentSpace]}>
          <PSelect
            value={fclCargoRow.hazardous}
            label="Hazardous"
            name="hazardous"
            required={formType === "QUO" ? false : true}
            options={fclhazardousSelect}
            onChange={(val: string) => onCargoChange("hazardous", val)}
          />
        </Box>

      </Box>
      {isHazardous && (
        <>
          <div style={{ height: "10px" }} />
          <HazardousSection
            rows={hazRows}
            shippingType={shippingType}
            onAdd={onAddHazardousRow}
            onChange={(hazIndex: number, field: string, value: string | number) => onChangeHazardousRow(hazIndex, field, value)}
            onRemove={(rowIndex: number) => onRemoveHazardousRow(rowIndex)}
            packagingOptions={packagingOptions}
            imoClassOptions={imoClassOptions}
          />
        </>
      )}
    </>
  )
}

export default FCLCargoDetails
