import { RoutingDetails } from 'phoenix-common-react';
import { tempData } from '../../../LCL/PreBooking/tempData';
import { useStatus } from '@/context/statusContext';
import type { useBookingMainDetails } from '@/hooks/LCL/MainDetails/Booking/useBookingMainDetails';
import type { useCustomerDetails } from '@/hooks/LCL/CustomerDetails/useCustomerdetails';
import type { useRateDetails } from '@/hooks/LCL/RateDetails/useRateDetails';
import type { useRouting } from '@/hooks/LCL/RoutingDetails/useRoutingDetails';

type Props = {
  mainDetail: ReturnType<typeof useBookingMainDetails>;
  customerDetail: ReturnType<typeof useCustomerDetails>;
  routing: ReturnType<typeof useRouting>;
  rateDetail: ReturnType<typeof useRateDetails>;
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (formData: unknown) => void;
};

const BookingRoutingDetails = ({
  routing,
  onRegisterFields,
  onFieldsChange,
  rateDetails,
  accessorialOptions,
  mainDetailsValue,
  disableRoutingFields,
  showBannerError,
  doorAccessorialOptions
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
      showBannerError={showBannerError}
      moduleType="BKG"
      rateDetails={rateDetails}
      mainDetailsValue={mainDetailsValue}
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
      accessorialOptions={accessorialOptions}
      doorAccessorialOptions = {doorAccessorialOptions}
      onWarning={(msg) => (msg ? showStatus('warning', [msg]) : hideStatus())}
      disableRoutingFields={disableRoutingFields}
    />
  );
};
export default BookingRoutingDetails;
