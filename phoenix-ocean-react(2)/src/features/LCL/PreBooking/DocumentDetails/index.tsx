import { DocumentDetails } from 'phoenix-common-react';
import { tempData } from '../tempData';

const PreBookingDocumentDetails = ({ documentDetails }: any) => {
  return (
    <DocumentDetails
      value={documentDetails.documentDetailsFormData}
      tempData={tempData}
      onRegisterFields={(fields: string[]) =>
        console.warn('Registered fields in DocumentDetails:', fields)
      }
      onFieldsChange={documentDetails.handleDocumentDetailsChange}
    />
  );
};

export default PreBookingDocumentDetails;
