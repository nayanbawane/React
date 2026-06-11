import { useDocumentDetails } from '@/hooks/LCL/DocumentDetails/useDocumentdetails';
import { DocumentDetails as DocumentDetailsSection } from 'phoenix-common-react';

type Props = {
  documentDetails: ReturnType<typeof useDocumentDetails>;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: unknown) => void;
  getFileDownloadUrl: () => string; 
};

const DocumentDetails = ({
  documentDetails,
  onRegisterFields,
  onFieldsChange,
  getFileDownloadUrl
}: Props) => {
  return (
    <DocumentDetailsSection
      value={documentDetails.documentDetailsFormData}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      moduleType='QUO'
      getFileDownloadUrl={getFileDownloadUrl}
    />
  );
};

export default DocumentDetails;
