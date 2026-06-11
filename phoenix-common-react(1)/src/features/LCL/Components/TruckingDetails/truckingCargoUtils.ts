import type { InternalCargoRowData } from '../../../../types/LCL/misc/TruckingDetails.types';
import type {
  TmsOrderMainBean,
  TmsOrderDimensionBean,
  TmsOrderHazardousBean,
  Commodity,
} from './CarrierSelectDetails/CarrierSelectDetails.types';

const UNIT_TO_CODE: Record<string, 'I' | 'F' | 'C' | 'M'> = {
  Inches: 'I',
  Feet: 'F',
  Centimeters: 'C',
  Meters: 'M',
};

export function buildTmsCargoDetails(
  cargoRows: InternalCargoRowData[],
  moduleCode: string,
): TmsOrderMainBean {
  const commodityDescription = cargoRows
    .map(r => r.description)
    .filter(Boolean)
    .join(', ');

  const totalPieces = cargoRows.reduce((sum, r) => sum + (parseFloat(r.pieces) || 0), 0);
  const totalKg = cargoRows.reduce((sum, r) => sum + (parseFloat(r.kg) || 0), 0);
  const totalLbs = cargoRows.reduce((sum, r) => sum + (parseFloat(r.lbs) || 0), 0);
  const isHazardous = cargoRows.some(r => r.hazardous === 'Y - Yes');
  const isStackable = cargoRows.every(r => r.dimRows[0]?.stackingType !== 'NS');

  const tmsOrderDimensionBeans: TmsOrderDimensionBean[] = [];
  const commodities: Commodity[] = [];

  for (const row of cargoRows) {
    for (const dim of row.dimRows) {
      tmsOrderDimensionBeans.push({
        length: parseFloat(dim.length) || 0,
        width: parseFloat(dim.width) || 0,
        height: parseFloat(dim.height) || 0,
        unit: UNIT_TO_CODE[dim.unit] ?? 'I',
        pieces: parseFloat(dim.pieces) || 0,
        kg: parseFloat(dim.kg) || 0,
        lbs: parseFloat(dim.lbs) || 0,
        tmsClass: parseFloat(dim.cls) || 0,
        cbm: parseFloat(dim.cbm) || 0,
        cbf: parseFloat(dim.cbf) || 0,
      });
      commodities.push({
        packagingType: dim.packageType === '-1' ? '' : (dim.packageType ?? ''),
        additionalMarkings: row.marks ?? '',
      });
    }
  }

  const tmsOrderHazardousBean: TmsOrderHazardousBean[] = cargoRows.flatMap(row =>
    row.hazRows.map(haz => ({
      unNumber: haz.unNumber,
      imcoClass: haz.imoClass,
      packagingGroup: haz.pkgGroup,
      emergencyCotact: haz.emergencyContact,
    })),
  );

  return {
    moduleCode,
    tmsOrderCargoAndPricingBean: {
      commodityDescription,
      totalNumberOfPieces: String(totalPieces),
      totalWeightKg: String(totalKg),
      totalWeightLbs: String(totalLbs),
      hazardous: isHazardous ? 'YES' : 'NO',
      stackable: isStackable,
      rate: '',
      priceFuelSurcharge: 0,
      priceAccessorials: [],
      priceTotal: 0,
      tmsOrderHazardousBean,
      tmsOrderDimensionBeans,
    },
    bookDomesticShipmentInputBean: {
      commodities,
    },
  };
}
