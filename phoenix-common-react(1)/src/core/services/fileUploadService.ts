/**
 * File Upload Service
 * Handles file uploads to object storage API
 */

import { ApiService } from '../api/client';
import { COMMON_ENDPOINTS } from '../api/config/common.endpoints';
import { FileUploadRequest, FileUploadResponse } from '../../types/DocumentUpload';
import { AxiosRequestConfig } from 'axios';

/**
 * Generates a unique file upload key combining filename and timestamp
 * @param fileName - The name of the file being uploaded
 * @returns A unique key for tracking the upload
 */
export const generateFileUploadKey = (fileName: string): string => {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const random = uuid.replace(/-/g, '');
  return `${fileName}${timestamp}${random}`;
};

/**
 * Converts a File object to Base64 string
 * @param file - The File object to convert
 * @returns Promise resolving to Base64 encoded string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data:application/octet-stream;base64, prefix
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Gets the MIME type of a file
 * @param file - The File object
 * @returns The content type
 */
export const getContentType = (file: File): string => {
  return file.type || 'application/octet-stream';
};

/**
 * Creates a file upload request object from a File
 * @param file - The File object to upload
 * @param content - Base64 encoded file content
 * @param documentType - Document type
 * @param documentReferenceNumber - Reference number for the document
 * @param documentMode - Document mode (PRI/PUB)
 * @param comments - Additional comments
 * @param documentReceivedDate - Date when document was received
 * @param documentReceivedTime - Time when document was received
 * @param originDestination - Origin or Destination indicator
 * @returns FileUploadRequest object ready to send to API
 */
export const createFileUploadRequest = (
  file: File,
  content: string,
  documentType?: string,
  documentReferenceNumber?: string,
  documentMode?: string,
  comments?: string,
  documentReceivedDate?: string | null,
  documentReceivedTime?: string,
  _originDestination?: string
): FileUploadRequest => {
  const fileUploadKey = generateFileUploadKey(file.name);

  return {
    genericReference: null,
    documentId: 0,
    referenceNumber: null,
    referenceObject: null,
    documentFileId: null,
    documentTypeId: 0,
    documentFileName: file.name,
    documentType: documentType || null,
    documentTypeName: null,
    documentReferenceNumber: documentReferenceNumber || null,
    documentRequiredDate: null,
    documentRequiredTime: null,
    documentReceivedDate: documentReceivedDate || null,
    documentReceivedTime: documentReceivedTime || '',
    documentExpirationDate: null,
    documentCustomsOffice: null,
    documentCarrier: null,
    documentShipper: null,
    documentComments: null,
    documentMode: documentMode || null,
    recordOrder: 0,
    status: 1,
    schemaId: null,
    officeId: null,
    inputUser: null,
    inputDate: null,
    updateUser: null,
    updateDate: null,
    inputLdapUser: null,
    updateLdapUser: null,
    filePath: null,
    contentType: getContentType(file),
    genFileBeans: null,
    transactionalFlag: 'N',
    agent: null,
    comments: comments || null,
    documentTypeHardcopyOnly: 'N',
    documentReceivedStatus: 'N',
    content,
    fileUploadKey,
    browsFileKeys: null,
    moduleCode: null,
    requiredByDate: null,
    requiredByTime: null,
    commonBean: null,
    imageSource: null,
    docDisable: false,
    hardcopyOnly: false,
    readyForUpload: false,
    officeMandatoryDocument: false,
    uploadFromEservice: false,
    transactionFlagStatus: 'N',
    uploadDocumentsType: '0--null--null--null',
    hardcopyPending: false,
    documentReceived: false,
  };
};

/**
 * Uploads a file to object storage
 * @param file - The File object to upload
 * @param documentType - Document type
 * @param documentReferenceNumber - Reference number for the document
 * @param documentMode - Document mode (PRI/PUB)
 * @param comments - Additional comments
 * @param documentReceivedDate - Date when document was received
 * @param documentReceivedTime - Time when document was received
 * @param originDestination - Origin or Destination indicator
 * @returns Promise resolving to FileUploadResponse with fileUploadKey
 * @throws Error if upload fails
 */
export const uploadFile = async (
  file: File,
  documentType?: string,
  documentReferenceNumber?: string,
  documentMode?: string,
  comments?: string,
  documentReceivedDate?: string | null,
  documentReceivedTime?: string,
  originDestination?: string
): Promise<FileUploadResponse> => {
  try {
    // Convert file to base64
    const base64Content = await fileToBase64(file);

    // Create request payload
    const requestPayload = createFileUploadRequest(
      file,
      base64Content,
      documentType,
      documentReferenceNumber,
      documentMode,
      comments,
      documentReceivedDate,
      documentReceivedTime,
      originDestination
    );

    // Get the upload key for reference
    const uploadKey = requestPayload.fileUploadKey;

    // Make API call - for binary files, we might need to adjust content-type
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await ApiService.post<FileUploadResponse>(
      COMMON_ENDPOINTS.OBJECT_STORAGE.UPLOAD,
      requestPayload,
      config
    );

    const responseData = response.data;

    // Check if upload was successful
    if (responseData.success !== 1) {
      throw new Error(
        responseData.message || responseData.errorCode || 'File upload failed'
      );
    }

    // Return response with preserved fileUploadKey
    return {
      ...responseData,
      fileUploadKey: uploadKey,
    };
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};
