import React, { useEffect } from 'react';

import CustomerInitialPage from './CustomerInitialPage.tsx';
import LclBookingDetails from './LclBookingDetails.tsx';
import { CustomerDetailsProps } from '../../../../types/LCL/misc/CustomerDetails.types.ts';
import PreBookingCustomerDetail from './PreBookingCustomerDetail.tsx';

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  formData,
  handlers,
  suggestions,
  moduleType,
  containerType,
  direction,
  portOfDischarge = '',
  eoriPortConditions = {},
  onRegisterFields,
  onFieldsChange,
  rateDetails,
  moreDetailsRef,
  trackingCodeRef,
  onMoreDetailsFlagValue,
  shipmentType,
  showBannerError,
  showStatus
}) => {
  useEffect(() => {
    const fields = Object.keys(formData.lclForm);
    onRegisterFields?.(fields);
  }, []);

  useEffect(() => {
    onFieldsChange?.(formData);
  }, [formData]);
  if ((moduleType === 'BKG' || moduleType === 'QUO') && containerType === 'l' &&  (direction === 'Export' || (direction === 'Import' && shipmentType === 'F'))) {
    return (
      <LclBookingDetails
        showBannerError={showBannerError}
        form={formData.lclForm}
        onFieldChange={handlers.handleLclFormChange}
        customerMoreDetails={formData.customerMoreDetails}
        onMoreDetailsChange={handlers.handleMoreDetailsChange}
        suggestions={suggestions}
        portOfDischarge={portOfDischarge}
        eoriPortConditions={eoriPortConditions}
        moduleType={moduleType}
        containerType={containerType}
        onCustomerCodeSelect={handlers.onCustomerCodeSelect}
        onShipperCodeSelect={handlers.onShipperCodeSelect}
        onConsigneeCodeSelect={handlers.onConsigneeCodeSelect}
        onForwarderCodeSelect={handlers.onForwarderCodeSelect}
        onNotifyPartyCodeSelect={handlers.onNotifyPartyCodeSelect}
        rateDetails={rateDetails}
        accuRateProfile={formData.lclForm.accuRateProfile}
        moreDetailsRef={moreDetailsRef}
        trackingCodeRef={trackingCodeRef}
        onMoreDetailsFlagValue={onMoreDetailsFlagValue}
        shipmentType={shipmentType}
      />
    );
  }

  if ((moduleType === 'BKG' || moduleType === 'QUO') && containerType === 'l' && (direction === 'Import' && shipmentType === 'L')) {
    return (
      <PreBookingCustomerDetail
        form={formData.lclForm}
        onFieldsChange={onFieldsChange}
        onRegisterFields={onRegisterFields}
        onFieldChange={handlers.handleLclFormChange}
        customerMoreDetails={formData.customerMoreDetails}
        onMoreDetailsChange={handlers.handleMoreDetailsChange}
        onCustomerCodeSelect={handlers.onCustomerCodeSelect}
        suggestions={suggestions}
        moduleType={moduleType}
        showStatus={showStatus}
      // rateDetails={rateDetails}
      />
    );
  }

  return (
    <CustomerInitialPage
      form={formData.defaultForm}
      onFieldChange={handlers.handleDefaultFormChange}
      customerMoreDetails={formData.customerMoreDetails}
      onMoreDetailsChange={handlers.handleMoreDetailsChange}
      suggestions={suggestions}
      onCustomerCodeSelect={handlers.onCustomerCodeSelect}
      onShipperCodeSelect={handlers.onShipperCodeSelect}
      onConsigneeCodeSelect={handlers.onConsigneeCodeSelect}
      onForwarderCodeSelect={handlers.onForwarderCodeSelect}
      onNotifyPartyCodeSelect={handlers.onNotifyPartyCodeSelect}
      rateDetails={rateDetails}
      accuRateProfile={formData.lclForm.accuRateProfile}
      moduleType={moduleType}
    />
  );
};

export default CustomerDetails;