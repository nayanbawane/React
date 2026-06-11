import { RoutingDetails } from 'phoenix-common-react';
import { tempData } from '../../../LCL/PreBooking/tempData';
import { useStatus } from '@/context/statusContext';

const QuoteRoutingDetails = ({
  routing,
  onRegisterFields,
  onFieldsChange,
  rateDetails,
  mainDetailsValue,
  onTruckQuoteReset,
  showBannerError
}: any) => {
  const { showStatus, hideStatus } = useStatus();
  const {
    pickupState,
    pickupHandlers,
    termsSuggestion,
    vesselSuggestion,
    voyageInputRef,
    handleVesselCodeSelect,
    carrierSuggestion,
    handleCarrierCodeSelect,
    locationSuggestions,
    handleLocationCodeSelect,
    scheduleSearchOpen,
    handleOpenScheduleSearch,
    handleCloseScheduleSearch,
    handleScheduleBookThis,
  } = routing;

  return (
    <RoutingDetails
      key={routing.resetKey}
      showBannerError={showBannerError}
      moduleType='QUOTE'
      mainDetailsValue={mainDetailsValue}
      onTruckQuoteReset={onTruckQuoteReset}
      formData={pickupState.routingFormData}
      onChange={pickupHandlers.handleRoutingChange}
      tempData={tempData}
      pickupState={pickupState}
      pickupHandlers={pickupHandlers}
      isCFSDoor={pickupState.isCFSDoor}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      handlePickupFormDataChange={pickupHandlers.handleFormDataChange}
      termsSuggestion={termsSuggestion}
      vesselSuggestion={vesselSuggestion}
      voyageInputRef={voyageInputRef}
      handleVesselCodeSelect={handleVesselCodeSelect}
      carrierSuggestion={carrierSuggestion}
      handleCarrierCodeSelect={handleCarrierCodeSelect}
      locationSuggestions={locationSuggestions}
      handleLocationCodeSelect={handleLocationCodeSelect}
      scheduleSearchOpen={scheduleSearchOpen}
      onOpenScheduleSearch={handleOpenScheduleSearch}
      onCloseScheduleSearch={handleCloseScheduleSearch}
      onScheduleBookThis={handleScheduleBookThis}
      rateDetails={rateDetails}
      onWarning={(msg) => (msg ? showStatus('warning', [msg]) : hideStatus())}
      hideAddPickup={mainDetailsValue?.type !== 'F'}
    />
  );
};
export default QuoteRoutingDetails;
