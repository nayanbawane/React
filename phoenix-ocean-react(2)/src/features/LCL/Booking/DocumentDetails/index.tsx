import {
  DocumentDetails as DocumentDetailsSection,
  type DocumentUploadFormData,
} from 'phoenix-common-react';

type Props = {
  value?: DocumentUploadFormData[];
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (formData: unknown) => void;
   getFileDownloadUrl: () => string; 
};

const DocumentDetails = ({onRegisterFields, onFieldsChange,getFileDownloadUrl }: Props) => {
  return (
    <DocumentDetailsSection
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      getFileDownloadUrl={getFileDownloadUrl}
    />
  );
};

export default DocumentDetails;
