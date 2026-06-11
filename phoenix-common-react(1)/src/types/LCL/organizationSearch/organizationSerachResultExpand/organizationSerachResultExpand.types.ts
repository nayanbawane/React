export interface ContactDetail {
  id: string;
  label: string;
  name: string;
  designation: string;
  telephone: string;
  mobile: string;
  email: string;
}

export interface AgingDetail {
  label: string;
  amount: string;
  status: string;
}

export interface AccountingData {
  onHold: string;
  statementCycle: string;
  paymentIndicator: string;
  arStatement: string;
  billToCode: string;
  creditLimit: string;
  collectionOffice: string;
  creditOver30: string;
  terms: string;
  chaserStatus: string;
  allAmountsCurrency: string;
  agingDetails: AgingDetail[];
}

export interface SalesData {
  typeAccountClass: string;
  agentField: string;
  vesselSchedule: string;
  salesPerson: string;
  salesDateAssigned: string;
  blField: string;
  callCycle: string;
  bookingCycle: string;
  accuRateProfile: string;
  truckSellRateProfile: string;
}

export interface MiscData {
  agent: string;
  einNumber: string;
  einType: string;
  broker: string;
  nvoccBond: string;
  uninvoicedCount: string;
  fmcNumber: string;
  inTransitCount: string;
  inputBy: string;
  inputDate: string;
  updateBy: string;
  updateDate: string;
}

export interface ShipmentMetric {
  value: string;
  indicator: string;
  percent: string;
}

export interface ShipmentStatistic {
  type: string;
  bookingCount: ShipmentMetric;
  bookingVolume: ShipmentMetric;
  bookingWeight: ShipmentMetric;
  bolCount: ShipmentMetric;
  bolVolume: ShipmentMetric;
  bolWeight: ShipmentMetric;
  anCount: ShipmentMetric;
  anVolume: ShipmentMetric;
  anWeight: ShipmentMetric;
}

export interface OrganizationExpandData {
  contacts: ContactDetail[];
  accounting: AccountingData;
  sales: SalesData;
  misc: MiscData;
  shipments: ShipmentStatistic[];
}
