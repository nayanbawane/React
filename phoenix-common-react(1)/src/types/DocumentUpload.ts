/**
 * File Upload Request Types
 */

export interface FileUploadRequest {
  genericReference: string | null;
  documentId: number;
  referenceNumber: string | null;
  referenceObject: string | null;
  documentFileId: string | null;
  documentTypeId: number;
  documentFileName: string;
  documentType: string | null;
  documentTypeName: string | null;
  documentReferenceNumber: string | null;
  documentRequiredDate: string | null;
  documentRequiredTime: string | null;
  documentReceivedDate: string | null;
  documentReceivedTime: string | null;
  documentExpirationDate: string | null;
  documentCustomsOffice: string | null;
  documentCarrier: string | null;
  documentShipper: string | null;
  documentComments: string | null;
  documentMode: string | null;
  recordOrder: number;
  status: number;
  schemaId: string | null;
  officeId: string | null;
  inputUser: string | null;
  inputDate: string | null;
  updateUser: string | null;
  updateDate: string | null;
  inputLdapUser: string | null;
  updateLdapUser: string | null;
  filePath: string | null;
  contentType: string;
  genFileBeans: string | null;
  transactionalFlag: string;
  agent: string | null;
  comments: string | null;
  documentTypeHardcopyOnly: string;
  documentReceivedStatus: string;
  content: string; // Base64 encoded file content
  fileUploadKey: string; // Unique identifier for tracking uploads
  browsFileKeys: string | null;
  moduleCode: string | null;
  requiredByDate: string | null;
  requiredByTime: string | null;
  commonBean: string | null;
  imageSource: string | null;
  docDisable: boolean;
  hardcopyOnly: boolean;
  readyForUpload: boolean;
  officeMandatoryDocument: boolean;
  uploadFromEservice: boolean;
  transactionFlagStatus: string;
  uploadDocumentsType: string;
  hardcopyPending: boolean;
  documentReceived: boolean;
}

export interface FileUploadResponse {
  success: number; // 1 for success, 0 for failure
  result: any; // Additional result data if any
  message: string; // Response message
  errorCode: string | null; // Error code if any
  fileUploadKey?: string; // Preserved from request for tracking
}

export interface DocumentUploadData {
  documentType: string;
  documentReferenceNumber: string;
  documentReceivedDate: Date | string | null;
  documentReceivedTime: string;
  comments: string;
  documentMode: string;
  originDestination?: string;
  fileUploadKey?: string; // Store the upload key from API response
}
