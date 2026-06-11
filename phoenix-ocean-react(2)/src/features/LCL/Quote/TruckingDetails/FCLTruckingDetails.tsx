import { FCLTruckingDetails } from 'phoenix-common-react';

const FCLQuoteTruckingDetailPage = ({
  trucking,
  onRegisterFields,
  onFieldsChange,
}: any) => {
    const { 
        formData,
        handleTruckingChange,
        pickupCodeSuggestion,
        truckerCodeSuggestion,
        timeSuggestion,
        chargeDescriptionSuggestion,
        currencySuggestion,
        onAdd,
        onRemove,
        datePickerOnBlurHandler,
        error,
        handleTruckingChargeChange,
        handleTimeSelection,
        pickUpDateRef,
        dateSelectionHandler,
        datePickerKeyDownHandler,
        timePickerOnBlurHandler,
        handlePickupCodeSelect,
        handleTruckerCodeSelect,
        pickupTimeToRef,
        pickupTimeRef,
        chargeDescriptionRefs,
        handleOrganizationSearch,
        openSearch,
        toggleSearch,
        handleCurrencySelection,
        handleChargeDescriptionSelection
    } = trucking
  return (
    <FCLTruckingDetails
      formData={formData}
      onChange={handleTruckingChange}
      onChargesChange={handleTruckingChargeChange}
      pickupCodeSuggestion={pickupCodeSuggestion}
      truckerCodeSuggestion={truckerCodeSuggestion}
      timeSuggestion={timeSuggestion}
      chargeDescriptionSuggestion={chargeDescriptionSuggestion}
      currencySuggestion={currencySuggestion}
      onAdd={onAdd}
      onRemove={onRemove}
      datePickerOnBlurHandler={datePickerOnBlurHandler}
      error={error}
      handleTimeSelection={handleTimeSelection}
      dateSelectionHandler={dateSelectionHandler}
      datePickerKeyDownHandler={datePickerKeyDownHandler}
      pickUpDateRef={pickUpDateRef}
      timePickerOnBlurHandler={timePickerOnBlurHandler}
      handlePickupCodeSelect={handlePickupCodeSelect}
      handleTruckerCodeSelect={handleTruckerCodeSelect}
      pickupTimeRef={pickupTimeRef}
      pickupTimeToRef={pickupTimeToRef}
      chargeDescriptionRefs={chargeDescriptionRefs}
      handleOrganizationSearch={handleOrganizationSearch}
      openSearch={openSearch}
      toggleSearch={toggleSearch}
      handleCurrencySelection={handleCurrencySelection}
      handleChargeDescriptionSelection={handleChargeDescriptionSelection}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
    />
  );
};
export default FCLQuoteTruckingDetailPage;
