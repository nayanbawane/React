import { PreBookingRoutingDetailsPage } from 'phoenix-common-react';
import { tempData } from '../tempData';

const PreBookingRoutingDetails = ({
  routing,
  isAgentBooking,
  onRegisterFields,
  onFieldsChange,
  moduleType,
  rateDetails,
  showStatus,
}: any) => {
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
    validateLocationOnTab,
    validateTermsOnTab,
    validateVesselOnTab,
  } = routing;

  return (
    <PreBookingRoutingDetailsPage
      rateDetails={rateDetails}
      isAgentBooking={isAgentBooking}
      showStatus={showStatus}
      moduleType={moduleType}
      key={routing.resetKey}
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
      validateLocationOnTab={validateLocationOnTab}
      validateTermsOnTab={validateTermsOnTab}
      validateVesselOnTab={validateVesselOnTab}
    />
  );
};
export default PreBookingRoutingDetails;
