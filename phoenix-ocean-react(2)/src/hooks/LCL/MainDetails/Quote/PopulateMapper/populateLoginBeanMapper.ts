export interface LoginClientBeanData {
  username?: string;
  ldapUser?: string;
  userName?: string;
  email?: string;
  schema?: string;
  office?: string;
  officeId?: number;
  officeTimezone?: string;
  company?: string;
  userCompanyName?: string;
  localCurrency?: string;
  timeZone?: string;
  userRole?: string;
  userRoleID?: number;
  userRegionId?: number;
  countryCode?: string;
  country?: string;
  siteId?: number;
  userAlternateOffice?: string;
  userId: number;
}

export interface LoginBean {
  officeTimezone: string;
  username: string;
  ldapUsername: string;
  userFullname: string;
  password: string;
  dataSourceName: string;
  userSchemaName: string;
  email: string;
  logFilePathName: string;
  debugModeFlag: number;
  timeZone: string;
  ipAddress: string;
  officeCode: string;
  userCompany: string;
  formInstance: string;
  localCurrency: string;
  userRegionId: number;
  countryCode: string;
  countryName: string;
  userCompanyName: string;
  userSchemaID: number;
  userOfficeID: number;
  userRoleID: number;
  userRole: string;
  userAlternateOffice: string;
  userId: number;
  userID?: number; // Added to handle phoenix use case where userID is expected instead of userId
}

export const mapLoginBean = (
  loginClientBean: LoginClientBeanData | null | undefined
): LoginBean => ({
  officeTimezone: loginClientBean?.officeTimezone ?? '',
  username: loginClientBean?.username ?? '',
  ldapUsername: loginClientBean?.ldapUser ?? '',
  userFullname: loginClientBean?.userName ?? '',
  password: '',
  dataSourceName: loginClientBean?.schema ?? '',
  userSchemaName: loginClientBean?.schema ?? '',
  email: loginClientBean?.email ?? '',
  logFilePathName: '',
  debugModeFlag: 0,
  timeZone: loginClientBean?.timeZone ?? '',
  ipAddress: '',
  officeCode: loginClientBean?.office ?? '',
  userCompany: loginClientBean?.company ?? '',
  formInstance: '',
  localCurrency: loginClientBean?.localCurrency ?? '',
  userRegionId: loginClientBean?.userRegionId ?? 0,
  countryCode: loginClientBean?.countryCode ?? '',
  countryName: loginClientBean?.country ?? '',
  userCompanyName: loginClientBean?.userCompanyName ?? '',
  userSchemaID: loginClientBean?.siteId ?? 0,
  userOfficeID: loginClientBean?.officeId ?? 0,
  userRoleID: loginClientBean?.userRoleID ?? 0,
  userRole: loginClientBean?.userRole ?? '',
  userAlternateOffice: loginClientBean?.userAlternateOffice ?? '',
  userId: loginClientBean?.userId ?? 0,
});