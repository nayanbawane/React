// ─── TMS Shipment Status History ──────────────────────────────────────────────

export interface ShipmentStatusInputBean {
  shipmentIDs: string[];
  moduleCode: string;
}

export interface ShipmentActivityHistoryBean {
  activityDescription: string;
  activityDate: string; // "dd-MMM-yyyy HH:mm:ss"
}

export interface ShipmentStatusResultBean {
  activityHistory: ShipmentActivityHistoryBean[];
}

// ─── Status / Events ──────────────────────────────────────────────────────────

export interface ShipmentEvent {
  eventName?: string;
  comment?: string;
  commentParams: Record<string, string>;
}

export interface ShipmentStatusUpdateBean {
  objectCode: string;
  referenceNumber: string;
  shipmentType: string;
  userSchemaId: number;
  officeId: number;
  eventList: ShipmentEvent[];
  relatedType: string[];
  relatedRerefence: string[];
  deletedType: string[];
  deletedReference: string[];
  documentHistoryId: number;
  statusLocationUncode: string;
  isCobProcess: boolean;
}
