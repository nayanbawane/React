import { FCLQuoteRoutingDetails } from 'phoenix-common-react';
import { tempData } from '../../../LCL/PreBooking/tempData';
import { useStatus } from '@/context/statusContext';

const FCLQuoteRoutingDetailPage = ({
  routing,
  onRegisterFields,
  onFieldsChange,
  rateDetails,
  mainDetailsValue,
}: any) => {
  const { showStatus, hideStatus } = useStatus();
  const { 
    pickupState,
    pickupHandlers,
    vesselSuggestion,
    handleVesselCodeSelect,
    locationSuggestions,
    handleLocationCodeSelect,
    handlePreCarriageBySelect,
    scheduleSearchOpen,
    handleOpenScheduleSearch,
    handleCloseScheduleSearch,
    handleScheduleBookThis,
    routingRef,
    carriageListBoxAddKeyDownHandler,
    datePickerKeyDownHandler,
    dateSelectionHandler,
    datePickerOnBlurHandler,
    error,
    voyageInputRef,
    validateVesselOnTab,
    validateLocationOnTab,
    skipNextBlurValidation,
    setSkipNextBlurValidation
  } = routing;

  return (
    <FCLQuoteRoutingDetails
      key={routing.resetKey}
      formData={pickupState.routingFormData}
      onChange={pickupHandlers.handleRoutingChange}
      tempData={tempData}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      vesselSuggestion={vesselSuggestion}
      handleVesselCodeSelect={handleVesselCodeSelect}
      locationSuggestions={locationSuggestions}
      handleLocationCodeSelect={handleLocationCodeSelect}
      handlePreCarriageBySelect={handlePreCarriageBySelect}
      scheduleSearchOpen={scheduleSearchOpen}
      onOpenScheduleSearch={handleOpenScheduleSearch}
      onCloseScheduleSearch={handleCloseScheduleSearch}
      onScheduleBookThis={handleScheduleBookThis}
      rateDetails={rateDetails}
      routingRef={routingRef}
      carriageListBoxAddKeyDownHandler={carriageListBoxAddKeyDownHandler}
      datePickerKeyDownHandler={datePickerKeyDownHandler}
      dateSelectionHandler={dateSelectionHandler}
      datePickerOnBlurHandler={datePickerOnBlurHandler}
      error={error}
      voyageInputRef={voyageInputRef}
      mainDetailsValue={mainDetailsValue}
      onWarning={(msg) => (msg ? showStatus('warning', [msg]) : hideStatus())}
      showStatus={showStatus}
      validateLocationOnTab={validateLocationOnTab}
      validateVesselOnTab={validateVesselOnTab}
      skipNextBlurValidation={skipNextBlurValidation}
      setSkipNextBlurValidation={setSkipNextBlurValidation}
    />
  );
};
export default FCLQuoteRoutingDetailPage;
