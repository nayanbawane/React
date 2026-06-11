import { type Dispatch, type SetStateAction, useState } from 'react';
import {
  CommonToggleKeys,
  useFeatureToggle,
  initialFlags,
  initialLotRow,
} from 'phoenix-common-react';
import type { CargoFlagsType, DimensionChangePayload, LotRowData } from 'phoenix-common-react';

const NON_STACKABLE_TEXT = 'Non Stackable';

type LotInstructionFlags = Pick<CargoFlagsType, 'nonStackable' | 'instructions' | 'printDimension' | 'printDimensionQuote'>;

interface UseNonStackableInstructionButtonsParams {
  moduleCode?: 'BKG' | 'QUO' | 'PREBKG';
  lotRows: LotRowData[];
  setLotRows: Dispatch<SetStateAction<LotRowData[]>>;
}

export const useNonStackableInstructionButtons = ({
  moduleCode,
  lotRows,
  setLotRows,
}: UseNonStackableInstructionButtonsParams) => {
  const [flags, setFlags] = useState<LotInstructionFlags>({
    nonStackable: initialFlags.nonStackable,
    instructions: initialFlags.instructions,
    printDimension: initialFlags.printDimension,
    printDimensionQuote: initialFlags.printDimensionQuote,
  });
  const [nonStackableLotIdx, setNsIdx] = useState(-1);
  const { isVisible } = useFeatureToggle();

  const addNonStackableLot = () => {
    const alreadyHasNs = lotRows.some(
      (r) => r.controlFlag !== 'D' && r.type === 'Other' && r.details.toUpperCase().includes('NON STACKABLE')
    );
    if (!alreadyHasNs) {
      const newRow = {
        type: 'OTHER',
        details: NON_STACKABLE_TEXT,
        controlFlag: 'N' as const,
      };
      setLotRows((prev) => {
        const next = [...prev, newRow];
        setNsIdx(next.length - 1);
        return next;
      });
    }
  };

  const removeNonStackableLot = () => {
    setLotRows((prev) => {
      const idx = prev.findIndex(
        (r) => r.controlFlag !== 'D' && r.type === 'OTHER' && r.details.toUpperCase().includes('NON STACKABLE')
      );
      if (idx === -1) return prev;
      setNsIdx(-1);
      const row = prev[idx];
      if (row.controlFlag === 'U') {
        return prev.map((r, i) => (i === idx ? { ...r, controlFlag: 'D' as const } : r));
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleNonStackableToggle = () => {
    const isActivating = !flags.nonStackable;
    setFlags((f) => ({ ...f, nonStackable: isActivating }));
    if (isActivating) {
      addNonStackableLot();
    } else {
      removeNonStackableLot();
    }
  };
  const makeNonStackableEnable  = () => {
    if(!flags.nonStackable){
      setFlags((f) => ({ ...f, nonStackable: true }));
      addNonStackableLot();
    }
  }

  const makeNonStackableDisable = () => {
    if(flags.nonStackable){
      setFlags((f) => ({ ...f, nonStackable: false }));
      removeNonStackableLot();
    }
  }

  const handleInstructionsToggle = () => {
    setFlags((f) => ({ ...f, instructions: !f.instructions }));
  };

  const handleFlagToggle = (key: keyof LotInstructionFlags) => {
    setFlags((f) => ({ ...f, [key]: !f[key] }));
  };

  const showInstructionsBtn = isVisible(CommonToggleKeys.WMA_WAREHOUSE_AND_LOADING_INSTRUCTIONS);

  const nonStackableBtn = {
    key: 'nonStackable',
    label: 'Non Stackable',
    handler: handleNonStackableToggle,
  };

  const instructionBtns = showInstructionsBtn
    ? [{ key: 'instructions', label: 'Instructions', handler: handleInstructionsToggle }]
    : [];

  const printBtns =
    moduleCode === 'BKG'
      ? [{ key: 'printDimension', label: 'Print Dimension in Booking Confirmation', handler: () => handleFlagToggle('printDimension') }]
      : moduleCode === 'QUO'
        ? [{ key: 'printDimensionQuote', label: 'Print Dimension in Quote Confirmation', handler: () => handleFlagToggle('printDimensionQuote') }]
        : [];

  const clearNonStackable = () => {
    setFlags((f) => ({ ...f, nonStackable: false }));
    setNsIdx(-1);
  };

  const handleDimensionChange = (payload: DimensionChangePayload) => {
    const hasNonStackable = payload.allDimRows.some((r) => r.stackingType === 'NS');
    if (hasNonStackable) {
      makeNonStackableEnable();
    } else {
      makeNonStackableDisable();
    }
  };

  return {
    flags,
    nonStackableBtn,
    instructionBtns,
    printBtns,
    handleNonStackableToggle,
    handleInstructionsToggle,
    handleFlagToggle,
    handleDimensionChange,
    nonStackableLotIdx,
    clearNonStackable,
    makeNonStackableEnable,
    makeNonStackableDisable,
  };
};
