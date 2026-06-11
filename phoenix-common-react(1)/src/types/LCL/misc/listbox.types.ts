export interface CommonListBoxRequestBean {
  requestType?: string;
  listBoxName?: string;
  moduleName?: string;
  groupName?: string;
  officeId?: string;
  schemaName?: string;
  officeMap?: Record<string, string>;
}

export interface ResponseBean {
  key: string;
  value: string | null;
}
