import { Box, Button } from '@mui/material';
import { PTextField, PSelect, TagifyBox } from 'phoenix-react-lib';
import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
import { CommonToggleKeys } from '../../../../core/featureToggles';
import { useGetSelections } from '../../../../hooks/LCL/useGetSelections';
import { useGetSuggestions } from '../../../../hooks/LCL/useGetSuggestions';
import { externalLotCommentsConfig } from '../../../../hooks/LCL/selectionHelpers';
import { specialProvisionSuggestionConfig } from '../../../../hooks/LCL/suggestionHelpers';
import styles from '../../../../styles/LCL/ExternalLot.module.css';
import dimStyles from '../../../../styles/LCL/DimensionRow.module.css';

export default function ExternalLot({
  setInternalCmt,
  internalComment,
  lotRows,
  updateLotField,
  removeLot,
  addNewLot,
  loadingInstruction,
  setLoadingInstruction,
  warehouseInstruction,
  setWarehouseInstruction,
  showInstructions = false,
}: any) {
  const { data: lotCommentsData } = useGetSelections(externalLotCommentsConfig);
  return (
    <Box className={styles.cargoLotSection}>
      <Box className={styles.cargoLotContainer}>
        <Box className={styles.cargoLotList}>
          {lotRows.map((lot: any, lotIndex: number) => (
            <LotCommentRow
              key={lotIndex}
              row={lot}
              lotCommentsOptions={lotCommentsData}
              onChange={(field: string, value: unknown) => updateLotField(lotIndex, field, value)}
              onAdd={() => addNewLot(lotIndex)}
              onRemove={() => removeLot(lotIndex)}
            />
          ))}
        </Box>
        <Box className={styles.cargoInternalSection}>
          <Box component="label" className={styles.cargoLotLabel}>Internal Lot Comments</Box>
          <PTextField
            multiline
            rows={lotRows.length > 1 ? lotRows.length * 5 : 4}
            value={internalComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInternalCmt(e.target.value)}
          />
        </Box>
      </Box>

      {showInstructions && (
        <Box className={styles.cargoInstructionsSection}>
          <Box className={styles.cargoInstructionsField}>
            <Box component="label" className={styles.cargoLotLabel}>Loading Instruction</Box>
            <PTextField
              multiline
              rows={4}
              value={loadingInstruction}
              onChange={(e: any) => setLoadingInstruction(e.target.value)}
            />
          </Box>
          <Box className={styles.cargoInstructionsField}>
            <Box component="label" className={styles.cargoLotLabel}>Warehouse Instructions</Box>
            <PTextField
              multiline
              rows={4}
              value={warehouseInstruction}
              onChange={(e: any) => setWarehouseInstruction(e.target.value)}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

function LotCommentRow({ row, lotCommentsOptions, onChange, onAdd, onRemove }: any) {
  const { isVisible } = useFeatureToggle();

  const {
    data: spSuggestions,
    setQuery: setSpQuery,
  } = useGetSuggestions(specialProvisionSuggestionConfig);

  const spSuggestionStrings = spSuggestions.map((item: any) => item.SUGGEST_VALUE as string);
  const showSpecialProvision = isVisible(CommonToggleKeys.OCN_BKGLOTCLP_SHOW_SEPCIAL_PROVISION);
  const showOpsActionMandatory = isVisible(CommonToggleKeys.OCN_CLP_SHOW_EXTERNAL_COMMENT_ICON);
  const showWarehouseLot = isVisible(CommonToggleKeys.WMA_CARGO_RECEIVING_WAREHOUSE_LOT_COMMENTS);
  const lotOptions = lotCommentsOptions.filter((o: any) => {
    if (o.value === 'SP' || o.value === 'Special Provision (SP)') return showSpecialProvision;
    if (o.value === 'WH') return showWarehouseLot;
    return true;
  });

  const isMandatoryDetails =
    row.type === 'OTHER' || (showOpsActionMandatory && row.type === 'OPS');
  const isWarehouseRow = showWarehouseLot && row.type === 'WH';
  const isOdmRow = row.type === 'ODM';

  return (
    <Box className={styles.cargoLotRow}>
      <Box className={styles.cargoLotLeft}>
        <Box component="label" className={styles.cargoLotLabel}>
          External Lot Comments
        </Box>
        <PSelect
          id={`external-lot-type-${row.id}`}
          options={lotOptions}
          value={row.type}
          disabled={isWarehouseRow}
          onChange={(value) => {
            const val = value;
            if (showWarehouseLot && val === 'WH') {
              onChange('type', '-1');
              onChange('details', '');
              return;
            }
            onChange('type', val);
            if (val !== '-1') {
              const selectedOption = lotOptions.find(
                (o: any) => o.value === val
              );
              onChange('details', selectedOption?.label == "Please Select" ? '-1' : selectedOption?.label ?? val);
            }
          }}
          className={styles.cargoLotLeft}
        />
        {row.type === 'DSP' && (
          <Box>
            <Box component="label" className={styles.cargoLotLabel}>
              Dead Space
            </Box>
            <PTextField
              multiline
              rows={3}
              value={row.freeTextInput || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChange('freeTextInput', e.target.value);
                onChange(
                  'details',
                  lotOptions.find((o: any) => o.value === row.type)?.label +
                    '-' +
                    e.target.value
                );
              }}
              className={
                !row.freeTextInput
                  ? `${styles.freeTextInput} ${styles.mandatoryDetails}`
                  : styles.freeTextInput
              }
            />
          </Box>
        )}
        {row.type === 'SP' && (
          <Box>
            <Box component="label" className={styles.cargoLotLabel}>
              SP Items
            </Box>
            <TagifyBox
              value={
                row.freeTextInput
                  ? row.freeTextInput.split(';').filter(Boolean)
                  : []
              }
              suggestions={spSuggestionStrings}
              onSearch={setSpQuery}
              onChange={(tags: string[]) => {
                const joined = tags.join(';');
                onChange('freeTextInput', joined);
                onChange(
                  'details',
                  (lotOptions.find((o: any) => o.value === row.type)?.label ??
                    'SP') +
                    '-' +
                    joined
                );
              }}
            />
          </Box>
        )}
      </Box>
      <Box className={styles.cargoLotMid}>
        <Box component="label" className={styles.cargoLotLabel}>
          Details
        </Box>
        <PTextField
          id={`external-lot-details-${row.id}`}
          multiline
          rows={3}
          value={row.details}
          disabled={isOdmRow}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (isOdmRow) return;
            const filtered = e.target.value.replace(/[^a-zA-Z0-9\-,\n]/g, '');
            onChange('details', filtered);
          }}
          className={
            isMandatoryDetails
              ? `${styles.cargoLotMid} ${styles.mandatoryDetails}`
              : styles.cargoLotMid
          }
        />
      </Box>
      <Box className={styles.cargoLotActions}>
        <Button className={dimStyles.btnPlus} onClick={onAdd}>
          +
        </Button>
        <Button className={dimStyles.btnMinus} onClick={onRemove}>
          −
        </Button>
      </Box>
    </Box>
  );
}
