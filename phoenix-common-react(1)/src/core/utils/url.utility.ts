// URL parameter key constants.

export const UrlParam = {
  UPLOAD_FILE: 'uploadFile',
  GENERATE: 'generate',
  UPLOAD_FILE_ID: 'uploadFileId',
  FILE_TYPE_TXT: '&fileType=txt',
  VERSION: 'version',
} as const;

export type UrlParamKey = keyof typeof UrlParam;
export type UrlParamValue = typeof UrlParam[UrlParamKey];
