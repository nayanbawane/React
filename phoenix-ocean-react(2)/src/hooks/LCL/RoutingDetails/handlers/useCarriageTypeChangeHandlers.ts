import { RoutingFormData } from 'phoenix-common-react';

export interface CarriageTypeChangeHandlersActions {
  setFormData: (updater: (prev: RoutingFormData) => RoutingFormData) => void;
  onNavigateToPreviousSection: () => void;
}

export const useCarriageTypeChangeHandlers = (
  actions: CarriageTypeChangeHandlersActions
) => {
  const { setFormData, onNavigateToPreviousSection } = actions;

  const handleCarriageTypeChange = (value: string): void => {
    setFormData((prev) => ({ ...prev, preCarriageType: value }));
  };

  const handleCarriageTypeKeyDown = (e: KeyboardEvent): void => {
    if (e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      onNavigateToPreviousSection();
    }
  };

  return { handleCarriageTypeChange, handleCarriageTypeKeyDown };
};
