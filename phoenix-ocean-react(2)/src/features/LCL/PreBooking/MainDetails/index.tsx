import { PreBookingMainDetails } from 'phoenix-common-react';

const MainDetails = ({
  // mainDetail,
  onRegisterFields,
  onFieldsChange,
  showStatus,
  onPopulateData,
  onPopulateQuoteData,
  onsaveExportBooking,
  isShipmentConfirmed,
  suggestClauseIconClick,
  onResetCustomer,
}: any) => {
  return (
    <PreBookingMainDetails
      // onChange={mainDetail.handleMainDetailsChange}
      showStatus={showStatus}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      onPopulateData={onPopulateData}
      onPopulateQuoteData={onPopulateQuoteData}
      onsaveExportBooking={onsaveExportBooking}
      isShipmentConfirmed={isShipmentConfirmed}
      suggestClauseIconClick={suggestClauseIconClick}
      onResetCustomer={onResetCustomer}
    />
  );
};
export default MainDetails;
