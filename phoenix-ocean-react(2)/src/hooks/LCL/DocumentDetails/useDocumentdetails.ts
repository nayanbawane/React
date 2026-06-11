import { createDefaultDocumentRows, DocumentUploadFormData } from 'phoenix-common-react';
import { useState } from 'react';

export const useDocumentDetails = () => {
  const [formData, setFormData] = useState<DocumentUploadFormData[]>(createDefaultDocumentRows());

  const handleDocumentDetailsChange = (data: DocumentUploadFormData[]) => {
    setFormData(data ?? []);
  };

  return {
    documentDetailsFormData: formData,
    setFormData,
    handleDocumentDetailsChange,
  };
};
