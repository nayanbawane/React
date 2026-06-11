import { UploadDocumentBean } from "@/types";
import type { DocumentUploadFormData } from "./documentDetails.state";
import { createDefaultDocumentRows } from "./documentDetails.state";
import dayjs from "dayjs";

export interface DocumentDetailsMapContext {
    referenceNumber?: string;
    referenceObject?: string;
    transactionalFlag?: string;
    defaults?: Partial<UploadDocumentBean>;
}

const normalizeActive = (value: string): string => {
    if (value === "Yes") return "1";
    if (value === "No") return "0";
    return value || "1";
};

function getFormattedDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  return dayjs(date).format('DD-MMM-YYYY').toUpperCase();
}

export const mapDocumentDetailsToUploadDocumentBeans = (
    rows: DocumentUploadFormData[] | undefined,
    ctx: DocumentDetailsMapContext = {}
): UploadDocumentBean[] => {
    if (!rows || rows.length === 0) return [];

    const validRows = rows.filter(row => row.documentType && row.documentType.trim() !== '');
    if (validRows.length === 0) return [];

    const {
        referenceNumber = "",
        referenceObject = "BKG",
        transactionalFlag = "N",
        defaults = {},
    } = ctx;

    return validRows.map((row, index) => ({
        genericReference: defaults.genericReference ?? row.genericReference ?? "",
        documentId: row.documentId ?? defaults.documentId ?? 0,
        referenceNumber: defaults.referenceNumber || referenceNumber,
        referenceObject: defaults.referenceObject || referenceObject,
        documentFileId: row.documentFileId ?? "",
        documentType: row.documentType,
        documentTypeName: defaults.documentTypeName ?? row.documentTypeName ?? "",
        documentTypeId:row.documentTypeId ?? 0,
        documentFileName: row.documentFileName ?? "",
        documentReferenceNumber: row.documentReferenceNumber,
        documentRequiredDate: getFormattedDate(row.documentRequiredDate),
        documentRequiredTime:row.documentRequiredTime,
        documentReceivedDate: getFormattedDate(row.documentReceivedDate),
        documentReceivedTime: row.documentReceivedTime,
        documentExpirationDate:getFormattedDate( row.documentExpirationDate),
        documentCustomsOffice: row.documentCustomsOffice,
        channel: row.channel,
        documentCarrier: row.documentCarrier ?? "",
        documentShipper: row.documentShipper,
        recordOrder: index + 1,
        status: defaults.status ?? 1,
        isReadyForUpload: defaults.isReadyForUpload ?? row.readyForUpload ?? false,
        isOfficeMandatoryDocument: defaults.isOfficeMandatoryDocument ?? row.officeMandatoryDocument ?? false,
        transactionalFlag,
        agent: row.agent,
        comments: row.comments,
        isHardcopyPending: defaults.isHardcopyPending ?? row.hardcopyPending ?? false,
        fileUploaded: defaults.fileUploaded ?? row.fileUploaded ?? false,
        active: normalizeActive(row.active),
        isSystemAddedDocument: defaults.isSystemAddedDocument ?? row.systemAddedDocument ?? false,
        isFromSplitDocument: defaults.isFromSplitDocument ?? row.fromSplitDocument ?? false,
        isUploadFromEservice: defaults.isUploadFromEservice ?? row.uploadFromEservice ?? false,
        isMandatory: defaults.isMandatory ?? row.mandatory ?? false,
        isCustomRefchanged: defaults.isCustomRefchanged ?? row.customRefchanged ?? false,
        iEmailSentCount: defaults.iEmailSentCount ?? row.iEmailSentCount ?? 0,
        documentMode: row.documentMode ?? "",
        schemaId: row.schemaId ?? "",
        officeId: row.officeId ?? "",
        inputUser: row.inputUser ?? "",
        inputDate: getFormattedDate(row.inputDate) ?? "",
        updateUser: row.updateUser ?? "",
        updateDate:  getFormattedDate(row.updateDate) ?? "",
        inputLdapUser: row.inputLdapUser ?? "",
        updateLdapUser: row.updateLdapUser ?? "",
        filePath: row.filePath ?? "",
        contentType: row.contentType ?? "",
        genFileBeans: row.genFileBeans,
        documentTypeHardcopyOnly: row.documentTypeHardcopyOnly ?? "",
        documentReceivedStatus: row.documentReceivedStatus ?? "",
        inputUserFullName: row.inputUserFullName ?? "",
        oldRecordOrder: row.oldRecordOrder,
        imageSource: row.imageSource ?? "",
        documentCreationFromFileBean: row.documentCreationFromFileBean,
        selectedPages: row.selectedPages,
        eserviceUploadFlag: row.eserviceUploadFlag ?? "",
        eserviceUploadApproval: row.eserviceUploadApproval ?? "",
        oldDocumentReferenceNumber: row.oldDocumentReferenceNumber ?? "",
        oldDocumentType: row.oldDocumentType ?? "",
        requiredByDate: getFormattedDate(row.requiredByDate) ?? "",
        requiredByTime: row.requiredByTime ?? "",
        isActive: row.isActive,
        moduleName: row.moduleName ?? "",
        documentHistoryId: row.documentHistoryId ?? "",
        pickupId: row.pickupId ?? "",
        warehouseName: row.warehouseName ?? "",
        documentChannel: row.documentChannel ?? "",
        eServiceUploadFlag: row.eServiceUploadFlag ?? "",
        commonBean: row.commonBean,
        fileUploadKey: row.fileUploadKey,
        uploadedFrom: row.uploadedFrom ?? "",
        uploadThroughAPI: row.uploadThroughAPI ?? false,
        uploadFromBkgApi: row.uploadFromBkgApi ?? false,
        uploadDocumentsType: row.uploadDocumentsType ?? "",
        transactionFlagStatus: row.transactionFlagStatus ?? "",
        pngDocument: row.pngDocument ?? false,
        updateDocument: row.updateDocument ?? false,
        hardcopyOnly: row.hardcopyOnly ?? false,
        documentReceived: row.documentReceived ?? false
    }));
};

export const mapUploadDocumentBeansToDocumentDetails = (
    beans: UploadDocumentBean[] | undefined
): DocumentUploadFormData[] => {
    if (!beans || beans.length === 0) return createDefaultDocumentRows();

    return beans.map((bean) => ({
        genericReference: bean.genericReference ?? "",
        documentId: bean.documentId ?? 0,
        referenceNumber: bean.referenceNumber ?? "",
        referenceObject: bean.referenceObject ?? "",
        documentFileId: bean.documentFileId ?? "",
        documentType: bean.documentTypeName ?? bean.documentType ?? "",
        documentTypeId: bean.documentTypeId ?? 0,
        documentFileName: bean.documentFileName ?? "",
        documentReferenceNumber: bean.documentReferenceNumber ?? "",
        documentRequiredDate: bean.documentRequiredDate ?? "",
        documentRequiredTime: bean.documentRequiredTime ?? "",
        documentReceivedDate: bean.documentReceivedDate ?? "",
        documentReceivedTime: bean.documentReceivedTime ?? "",
        documentExpirationDate: bean.documentExpirationDate ?? "",
        documentCustomsOffice: bean.documentCustomsOffice ?? "",
        channel: bean.channel ?? "",
        documentCarrier: bean.documentCarrier ?? "",
        documentShipper: bean.documentShipper ?? "",
        documentMode: bean.documentMode ?? "",
        recordOrder: bean.recordOrder,
        status: bean.status ?? 1,
        schemaId: bean.schemaId ?? "",
        officeId: bean.officeId ?? "",
        inputUser: bean.inputUser ?? "",
        inputDate: bean.inputDate ?? "",
        updateUser: bean.updateUser ?? "",
        updateDate: bean.updateDate ?? "",
        inputLdapUser: bean.inputLdapUser ?? "",
        updateLdapUser: bean.updateLdapUser ?? "",
        filePath: bean.filePath ?? "",
        contentType: bean.contentType ?? "",
        genFileBeans: bean.genFileBeans,
        transactionalFlag: bean.transactionalFlag ?? "",
        agent: bean.agent ?? "",
        comments: bean.comments ?? "",
        documentTypeHardcopyOnly: bean.documentTypeHardcopyOnly ?? "",
        documentReceivedStatus: bean.documentReceivedStatus ?? "",
        inputUserFullName: bean.inputUserFullName ?? "",
        oldRecordOrder: bean.oldRecordOrder,
        fileUploaded: bean.fileUploaded ?? false,
        imageSource: bean.imageSource ?? "",
        active: bean.active === "1" ? "Yes" : bean.active === "0" ? "No" : bean.active ?? "Yes",
        documentCreationFromFileBean: bean.documentCreationFromFileBean,
        selectedPages: bean.selectedPages,
        eserviceUploadFlag: bean.eserviceUploadFlag ?? "",
        eserviceUploadApproval: bean.eserviceUploadApproval ?? "",
        oldDocumentReferenceNumber: bean.oldDocumentReferenceNumber ?? "",
        oldDocumentType: bean.oldDocumentType ?? "",
        requiredByDate: bean.requiredByDate ?? "",
        requiredByTime: bean.requiredByTime ?? "",
        isActive: bean.isActive ?? false,
        iEmailSentCount: bean.iEmailSentCount ?? 0,
        moduleName: bean.moduleName ?? "",
        documentHistoryId: bean.documentHistoryId ?? "",
        pickupId: bean.pickupId ?? "",
        warehouseName: bean.warehouseName ?? "",
        documentChannel: bean.documentChannel ?? "",
        eServiceUploadFlag: bean.eServiceUploadFlag ?? "",
        commonBean: bean.commonBean,
        fileUploadKey: bean.fileUploadKey,
        uploadedFrom: bean.uploadedFrom ?? "",
        mandatory: bean.isMandatory ?? false,
        officeMandatoryDocument: bean.isOfficeMandatoryDocument ?? false,
        uploadFromEservice: bean.isUploadFromEservice ?? false,
        systemAddedDocument: bean.isSystemAddedDocument ?? false,
        uploadThroughAPI: bean.uploadThroughAPI ?? false,
        uploadFromBkgApi: bean.uploadFromBkgApi ?? false,
        fromSplitDocument: bean.isFromSplitDocument ?? false,
        customRefchanged: bean.isCustomRefchanged ?? false,
        uploadDocumentsType: bean.uploadDocumentsType ?? "",
        transactionFlagStatus: bean.transactionFlagStatus ?? "",
        readyForUpload: bean.isReadyForUpload ?? false,
        hardcopyPending: bean.isHardcopyPending ?? false,
        pngDocument: bean.pngDocument ?? false,
        updateDocument: bean.updateDocument ?? false,
        hardcopyOnly: bean.hardcopyOnly ?? false,
        documentReceived: bean.documentReceived ?? false,
        documentTypeName: bean.documentTypeName ?? ""
    }));
};