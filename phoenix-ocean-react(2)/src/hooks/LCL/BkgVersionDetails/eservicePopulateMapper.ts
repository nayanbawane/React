import { updateBookingMainDetails } from 'phoenix-common-react';
import type { CargoRowType, HazardousRowType, PickupDeliveryFormData } from 'phoenix-common-react';
import type { EServiceChangedMainBean } from './ReactEserviceVerifyHandler';
import type { AppDispatch } from '@/app/store/store';

export interface EserviceHookHandlers {
  handleRoutingChange: <K extends string>(field: K, value: unknown) => void;
  updateCargoField: (index: number, field: string, value: unknown) => void;
  getCargoRows: () => CargoRowType[];
  addNewCargo: () => void;
  removeCargo: (index: number) => void;
  handleCustomerPartyChange: (field: string, value: string) => void;
  handlePickupBatchChange?: (fields: Partial<PickupDeliveryFormData>) => void;
  handleLclFormChange?: (field: string, value: string) => void;
  handlePickupNeededChange?: (value: string) => void;
  addHazardousWithValues?: (cargoIndex: number, fields: Partial<HazardousRowType>) => void;
  updateHazardous?: (cargoIndex: number, hazIndex: number, field: string, value: unknown) => void;
}

const PICKUP_FIELD_MAP: Partial<Record<string, keyof PickupDeliveryFormData>> = {
  PICKUP_COMPANY_NAME: 'name',
  PICKUP_ADDRESS:      'streetAddress',
  PICKUP_CITY:         'city',
  PICKUP_STATE:        'state',
  PICKUP_ZIP_CODE:     'zipCode',
  PICKUP_COUNTRY:      'country',
  PICKUP_PHONE_NUMBER: 'contactPhone1',
  PICKUP_EMAIL:        'contactEmail1',
  PICKUP_CONTACT_NAME: 'contactName1',
  PICKUP_REFERENCE:    'pickupReference',
  PICKUP_INSTRUCTIONS: 'instructions',
  PICKUP_DATE:         'estimatedPickupDate',
  PICKUP_TIME_FROM:    'timeFrom',
  PICKUP_TIME_TO:      'timeTo',
};

const CARGO_FIELD_MAP: Partial<Record<string, keyof CargoRowType>> = {
  MARKS_NUMBERS:         'marks',
  NO_OF_PACKAGES:        'pieces',
  DESC_OF_PACKAGE_GOODS: 'description',
  KGS_WEIGHT:            'kg',
  CBM_MEASUREMENT:       'cbm',
  LBS_WEIGHT:            'lbs',
  CBF_MEASUREMENT:       'cbf',
  PACKAGING:             'packaging',
};

const HAZ_FIELD_MAP: Partial<Record<string, keyof HazardousRowType>> = {
  HAZARDOUS_CLASS:        'imoClass',
  SUBRISK:                'imoSubclass',
  UN_NUMBER:              'unNumber',
  PROPER_SHIPPING_NUMBER: 'properShippingName',
  PACKAGING_GROUP:        'pkgGroup',
  QUANTITY:               'quantity',
  COMMODITY:              'commodity',
};

export function eservicePopulateFromBean(
  bean: EServiceChangedMainBean,
  dispatch: AppDispatch,
  hooks: EserviceHookHandlers,
): void {
  const map = bean.changeFieldMap;
  if (!map) return;

  const {
    handleRoutingChange,
    updateCargoField,
    getCargoRows,
    addNewCargo,
    removeCargo,
  } = hooks;

 
  const normalise = (v: string | null): string | null =>
    v === null ? null : v.replace(/\\n/g, '\n');

  const getValue = (key: string): string | null => {
    const entry = map[key];
    if (!entry) return null;
    if (!entry.status || entry.status.toUpperCase() !== 'A') return null;
    return normalise(entry.staffValue ?? entry.newValue ?? null);
  };


  const vessel = getValue('VESSEL');
  if (vessel !== null) handleRoutingChange('vesselName', vessel);

  const voyage = getValue('VOYAGE');
  if (voyage !== null) handleRoutingChange('voyage', voyage);

  const porEtd = getValue('PLACE_OF_RECEIPT_ETD');
  if (porEtd !== null) handleRoutingChange('placeOfReceiptEtd', porEtd ? new Date(porEtd) : null);

  const polEts = getValue('PORT_OF_LOADING_ETS');
  if (polEts !== null) handleRoutingChange('portOfLoadingEts', polEts ? new Date(polEts) : null);

  const podEta = getValue('PORT_OF_DISCHARGE_ETA');
  if (podEta !== null) handleRoutingChange('portOfDischargeEta', podEta ? new Date(podEta) : null);

  const plodEta = getValue('PLACE_OF_DELIVERY_ETA');
  if (plodEta !== null) handleRoutingChange('placeOfDeliveryEta', plodEta ? new Date(plodEta) : null);

  const cfsCutoffDate = getValue('CFS_CUT_OFF_DATE');
  if (cfsCutoffDate !== null) handleRoutingChange('cfsCutoffDate', cfsCutoffDate ? new Date(cfsCutoffDate) : null);

  const cfsCutoffTime = getValue('CFS_CUT_OFF_TIME');
  if (cfsCutoffTime !== null) handleRoutingChange('cfsCutoffTime', cfsCutoffTime);

  const freightTerms = getValue('FREIGHT_TERMS') ?? getValue('FREIGHTTERMS');
  if (freightTerms !== null) handleRoutingChange('terms', freightTerms);

  const placeOfDelivery = getValue('PLACE_OF_DELIVERY');
  if (placeOfDelivery !== null) handleRoutingChange('placeOfDeliveryName', placeOfDelivery);


  const customerRef = getValue('CUSTOMER_REFERENCE');
  if (customerRef !== null) dispatch(updateBookingMainDetails({ userReference: customerRef }));

  const PARTY_FIELD_MAP: Record<string, string> = {
    SHIP_NAME:          'shipperName',
    SHIP_ADDRESS:       'shipperAddress',
    SHIP_CITY:          'shipperCity',
    SHIP_STATE:         'shipperState',
    SHIP_COUNTRY:       'shipperCountry',
    SHIP_ZIP:           'shipperZipCode',
    SHIP_PHONE:         'shipperPhoneNumber',
    SHIP_EMAIL:         'shipperEmail',
    SHIP_FAX:           'shipperFax',
    SHIP_EORI:          'shipperEoriNumber',
    SHIP_CONTACT:       'shipperContactName',
    SHIP_NAMED_ACCOUNT: 'shipperNamedAccount',

    CONS_NAME:          'consigneeName',
    CONS_ADDRESS:       'consigneeAddress',
    CONS_CITY:          'consigneeCity',
    CONS_STATE:         'consigneeState',
    CONS_COUNTRY:       'consigneeCountry',
    CONS_ZIP:           'consigneeZipCode',
    CONS_PHONE:         'consigneePhoneNumber',
    CONS_EMAIL:         'consigneeEmail',
    CONS_FAX:           'consigneeFax',
    CONS_EORI:          'consigneeEoriNumber',
    CONS_CONTACT:       'consigneeContactName',
    CONS_NAMED_ACCOUNT: 'consigneeNamedAccount',

    NOTI_NAME:          'notifyPartyName',
    NOTI_ADDRESS:       'notifyPartyAddress',
    NOTI_CITY:          'notifyPartyCity',
    NOTI_STATE:         'notifyPartyState',
    NOTI_COUNTRY:       'notifyPartyCountry',
    NOTI_ZIP:           'notifyPartyZipCode',
    NOTI_PHONE:         'notifyPartyPhoneNumber',
    NOTI_EMAIL:         'notifyPartyEmail',
    NOTI_FAX:           'notifyPartyFax',
    NOTI_EORI:          'notifyPartyEoriNumber',
    NOTI_CONTACT:       'notifyPartyContactName',
    NOTI_NAMED_ACCOUNT: 'notifyPartyNamedAccount',

    FORW_NAME:          'forwarderName',
    FORW_ADDRESS:       'forwarderAddress',
    FORW_CITY:          'forwarderCity',
    FORW_STATE:         'forwarderState',
    FORW_COUNTRY:       'forwarderCountry',
    FORW_ZIP:           'forwarderZipCode',
    FORW_PHONE:         'forwarderPhoneNumber',
    FORW_EMAIL:         'forwarderEmail',
    FORW_FAX:           'forwarderFax',
    FORW_EORI:          'forwarderEoriNumber',
    FORW_CONTACT:       'forwarderContactName',
    FORW_NAMED_ACCOUNT: 'forwarderNamedAccount',
  };

  Object.entries(PARTY_FIELD_MAP).forEach(([gwtKey, reactField]) => {
    const value = getValue(gwtKey);
    if (value !== null) hooks.handleCustomerPartyChange(reactField, value);
  });

  
  const deletePositions = [
    ...new Set(
      Object.values(map)
        .filter(e => /^CARGO(?:_IDENTIFIER)?~D~/.test(e.identifier ?? ''))
        .map(e => {
          const m = e.identifier!.match(/^CARGO(?:_IDENTIFIER)?~D~(.+)$/);
          return m ? parseInt(m[1], 10) : NaN;
        })
        .filter(n => !isNaN(n)),
    ),
  ].sort((a, b) => b - a);

  if (deletePositions.length > 0) {
    deletePositions.forEach(pos => {
      const idx = pos - 1;
      if (idx >= 0 && idx < getCargoRows().length) removeCargo(idx);
    });
  }

  const rows = getCargoRows();

  Object.entries(map).forEach(([key, entry]) => {
    if (!entry.status || entry.status.toUpperCase() !== 'A') return;

    const cargoUpdateMatch = key.match(/^(.+?)~CARGO(?:_IDENTIFIER)?~U~(.+)$/);
    if (cargoUpdateMatch) {
      const fieldCode = cargoUpdateMatch[1].toUpperCase();
      const pos = parseInt(cargoUpdateMatch[2], 10);
      const reactField = CARGO_FIELD_MAP[fieldCode];

      if (!reactField || isNaN(pos)) return;
      const rowIndex = pos - 1; 
      if (rowIndex < 0 || rowIndex >= rows.length) return;
      const value = normalise(entry.staffValue ?? entry.newValue ?? null);
      if (value !== null) updateCargoField(rowIndex, reactField as string, value);
      return;
    }

   
    if (key === 'PACKAGING') {
      const reactField = CARGO_FIELD_MAP['PACKAGING']!;
      const value = normalise(entry.staffValue ?? entry.newValue ?? null);
      if (value !== null && rows.length > 0) updateCargoField(0, reactField as string, value);
    }
  });

  const insertIds = [
    ...new Set(
      Object.values(map)
        .filter(e => /^CARGO(?:_IDENTIFIER)?~N~/.test(e.identifier ?? ''))
        .map(e => (e.identifier!.match(/^CARGO(?:_IDENTIFIER)?~N~(.+)$/) ?? [])[1] as string)
        .filter(Boolean),
    ),
  ].sort();

  if (insertIds.length > 0) {
    const baseIndex = rows.length; 

    insertIds.forEach((rowId, offset) => {
      addNewCargo();

      const newIndex = baseIndex + offset;
      Object.entries(CARGO_FIELD_MAP).forEach(([fieldCode, reactField]) => {
        const entry = map[`${fieldCode}~CARGO~N~${rowId}`]
                   ?? map[`${fieldCode}~CARGO_IDENTIFIER~N~${rowId}`];
        if (!entry || entry.status?.toUpperCase() !== 'A') return;
        const value = normalise(entry.staffValue ?? entry.newValue ?? null);
        if (value !== null) updateCargoField(newIndex, reactField as string, value);
      });
    });
  }

  if (hooks.addHazardousWithValues) {
    const HAZ_RE = /^HAZ_FIELD~([NUD])~(\d+)-(\d+)$/;

    if (hooks.updateHazardous) {
      const currentRows = getCargoRows();
      Object.entries(map).forEach(([key, entry]) => {
        if (!entry.status || entry.status.toUpperCase() !== 'A') return;
        const m = key.match(/^(.+?)~HAZ_FIELD~U~(\d+)-(\d+)$/);
        if (!m) return;
        const fieldCode = m[1].toUpperCase();
        const cargoIdx = parseInt(m[2], 10) - 1;
        const hazIdx   = parseInt(m[3], 10) - 1;
        const reactField = HAZ_FIELD_MAP[fieldCode];
        if (!reactField || cargoIdx < 0 || hazIdx < 0 || cargoIdx >= currentRows.length) return;
        let value = normalise(entry.staffValue ?? entry.newValue ?? null);
        if (value === null) return;
        if (fieldCode === 'PROPER_SHIPPING_NUMBER') {
          value = value.replace(/<br>/gi, '').replace(/<BR\/>/gi, '');
        }
        hooks.updateHazardous(cargoIdx, hazIdx, reactField as string, value);
      });
    }

    const hazInsertIds = [
      ...new Set(
        Object.values(map)
          .map(e => e.identifier ?? '')
          .filter(id => HAZ_RE.test(id) && id.includes('~N~'))
          .map(id => { const m = id.match(HAZ_RE)!; return `${m[2]}-${m[3]}`; }),
      ),
    ].sort();

    if (hazInsertIds.length > 0) {
      const byCargoPos = new Map<number, number[]>();
      hazInsertIds.forEach(compositeId => {
        const [cStr, hStr] = compositeId.split('-');
        const cPos = parseInt(cStr, 10);
        const hPos = parseInt(hStr, 10);
        if (!byCargoPos.has(cPos)) byCargoPos.set(cPos, []);
        byCargoPos.get(cPos)!.push(hPos);
      });

      byCargoPos.forEach((hazPositions, cargoPos) => {
        const cargoIdx = cargoPos - 1;
        if (cargoIdx < 0 || cargoIdx >= getCargoRows().length) return;

        hazPositions.sort((a, b) => a - b).forEach((hazPos) => {
          const idSuffix = `~HAZ_FIELD~N~${cargoPos}-${hazPos}`;
          const fields: Partial<HazardousRowType> = {};

          Object.entries(HAZ_FIELD_MAP).forEach(([fieldCode, reactField]) => {
            const entry = map[`${fieldCode}${idSuffix}`];
            if (!entry || entry.status?.toUpperCase() !== 'A') return;
            let value = normalise(entry.staffValue ?? entry.newValue ?? null);
            if (value === null) return;
            if (fieldCode === 'PROPER_SHIPPING_NUMBER') {
              value = value.replace(/<br>/gi, '').replace(/<BR\/>/gi, '');
            }
            if (fieldCode === 'COMMODITY') {
              const commodityMap: Record<string, string> = {
                'Calcium Hypochlorite':       'CALHYP',
                'Trichloroisocyanuric Acid':  'TRICYA',
                'Thiourea':                   'THIOUR',
              };
              value = commodityMap[value] ?? '-1';
            }
            (fields as Record<string, unknown>)[reactField as string] = value;
          });

          const flashEntry = map[`FLASHPOINT${idSuffix}`];
          const fcEntry    = map[`FC${idSuffix}`];
          if (flashEntry && flashEntry.status?.toUpperCase() === 'A') {
            const rawFlash = normalise(flashEntry.newValue ?? flashEntry.staffValue ?? null);
            const unit = (fcEntry?.staffValue ?? fcEntry?.newValue ?? 'C').toUpperCase();
            if (rawFlash !== null) {
              const numVal = parseInt(rawFlash, 10);
              if (!isNaN(numVal)) {
                if (unit === 'C') {
                  fields.flashpointC = String(numVal);
                  fields.flashpointF = String(Math.round(numVal * 1.8 + 32));
                  fields.degreeUnit  = 'C';
                } else {
                  fields.flashpointF = String(numVal);
                  fields.flashpointC = String(Math.round((numVal - 32) * 0.5556));
                  fields.degreeUnit  = 'F';
                }
              }
            }
          }

          hooks.addHazardousWithValues!(cargoIdx, fields);
        });
      });
    }
  }

  const prepaidCollectRaw = getValue('PREPAID_COLLECT');
  if (prepaidCollectRaw !== null && hooks.handleLclFormChange) {
    const pcVal = prepaidCollectRaw.length > 1
      ? prepaidCollectRaw.charAt(0).toUpperCase()
      : prepaidCollectRaw.toUpperCase();
    hooks.handleLclFormChange('prepaidCollect', pcVal);
  }


  const pickupEntry = map['PICKUP'] ?? map['PICKUP~'];
  const pickupNeededRaw = pickupEntry && pickupEntry.status?.toUpperCase() === 'A'
    ? (pickupEntry.staffValue ?? pickupEntry.newValue ?? null)
    : null;

  if (pickupNeededRaw !== null && hooks.handlePickupNeededChange) {
    hooks.handlePickupNeededChange(pickupNeededRaw);
  }

  if (hooks.handlePickupBatchChange) {
    const pickupUpdates: Partial<PickupDeliveryFormData> = {};

    Object.entries(map).forEach(([key, entry]) => {
      if (!entry.status || entry.status.toUpperCase() !== 'A') return;
      const pickupKeyMatch = key.match(/^(.+?)~PICKUP(?:_IDENTIFIER)?~[UN]~/);
      if (!pickupKeyMatch) return;

      const fieldCode = pickupKeyMatch[1].toUpperCase();
      const reactField = PICKUP_FIELD_MAP[fieldCode];
      if (!reactField) return;

      const rawValue = entry.staffValue ?? entry.newValue ?? null;
      if (rawValue === null) return;
      const value = normalise(rawValue)!;

      if (reactField === 'estimatedPickupDate') {
        (pickupUpdates as Record<string, unknown>)[reactField as string] = value ? new Date(value) : null;
      } else {
        (pickupUpdates as Record<string, unknown>)[reactField as string] = value;
      }
    });

    if (Object.keys(pickupUpdates).length > 0) {
      hooks.handlePickupBatchChange(pickupUpdates);
    }
  }
}
