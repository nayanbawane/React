import { type Dispatch, type SetStateAction } from 'react';
import type { CargoFlagsType, DimensionChangePayload, FlagState, FlagHandlers, LotRowData } from 'phoenix-common-react';
import { useNonStackableInstructionButtons } from './useNonStackableInstructionButtons';
import { useContainerFlagButtons } from './useContainerFlagButtons';

interface UseCargoHeaderButtonsParams {
  moduleCode?: 'BKG' | 'QUO' | 'PREBKG';
  lotRows: LotRowData[];
  setLotRows: Dispatch<SetStateAction<LotRowData[]>>;
}

export const useCargoHeaderButtons = ({
  moduleCode,
  lotRows,
  setLotRows,
}: UseCargoHeaderButtonsParams) => {
  const lotInstruction = useNonStackableInstructionButtons({ moduleCode, lotRows, setLotRows });
  const containerFlag = useContainerFlagButtons();

  const flags: CargoFlagsType = {
    ...containerFlag.flags,
    ...lotInstruction.flags,
  };

  // Preserves original button order: containers → nonStackable → print → instructions
  const statusBtns = [
    ...containerFlag.containerBtns,
    lotInstruction.nonStackableBtn,
    ...lotInstruction.printBtns,
    ...lotInstruction.instructionBtns,
  ];

  const handleSimpleToggle = (key: keyof CargoFlagsType) => {
    if (key === 'instructions' || key === 'nonStackable') {
      lotInstruction.handleFlagToggle(key as 'nonStackable' | 'instructions');
    } else {
      containerFlag.handleSimpleToggle(key as keyof typeof containerFlag.flags);
    }
  };

  const handleDimensionChange = (payload: DimensionChangePayload) => {
    containerFlag.handleDimensionChange(payload);
    lotInstruction.handleDimensionChange(payload);
  };

  return {
    flagState: { flags, statusBtns } as FlagState,
    flagHandlers: {
      handleContainerExclusiveToggle: containerFlag.handleContainerExclusiveToggle,
      handleSimpleToggle,
      handleNonStackableToggle: lotInstruction.handleNonStackableToggle,
      handleDimensionChange,
    } as FlagHandlers,
    nonStackableLotIdx: lotInstruction.nonStackableLotIdx,
    clearNonStackable: lotInstruction.clearNonStackable,
  };
};
