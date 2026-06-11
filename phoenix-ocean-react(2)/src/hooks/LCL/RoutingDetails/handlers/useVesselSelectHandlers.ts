import { RoutingFormData } from 'phoenix-common-react';

export interface VesselSelectHandlersActions {
  setFormData: (updater: (prev: RoutingFormData) => RoutingFormData) => void;
  onFocusVoyage: () => void;
}

export const useVesselSelectHandlers = (
  actions: VesselSelectHandlersActions
) => {
  const { setFormData, onFocusVoyage } = actions;

  const handleVesselCodeSelect = (item: Record<string, unknown>): void => {
    const vesselCode = String(item.code ?? '');
    const displayLabel = String(item.label ?? '');
    const dashIdx = displayLabel.indexOf('-');
    const vesselName =
      dashIdx > -1 ? displayLabel.substring(dashIdx + 1).trim() : '';

    setFormData((prev) => ({
      ...prev,
      vesselCode,
      vesselName,
    }));

    onFocusVoyage();
  };

  const handlePreCarriageVesselSelect = (
    item: Record<string, unknown>
  ): void => {
    const displayLabel = String(item.label ?? '');
    const dashIdx = displayLabel.indexOf('-');
    const vesselName = dashIdx > -1 ? displayLabel.substring(dashIdx + 2) : '';

    setFormData((prev) => ({
      ...prev,
      preCarriageBy: vesselName,
    }));
  };

  return { handleVesselCodeSelect, handlePreCarriageVesselSelect };
};
