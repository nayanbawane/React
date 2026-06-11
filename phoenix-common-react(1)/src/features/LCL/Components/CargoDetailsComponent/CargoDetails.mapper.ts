import {
  initialCargoRow,
  initialDimRow,
  initialHazRow,
} from '../../../../InitialData/LCL/CargoDetails';
import {
  formatSequenceNumber,
  joinLines,
  num,
  replacePleaseSelect,
  str,
} from '../../../../core/utils/string.utility';

export function buildMultiCargoBookingQuoteNoteBeans(c: any) {
  const cargoRows = c?.cargoState?.cargoRows || [];

  return cargoRows.map((row: any, idx: number) => {
    // Build hazardous string
    const hazRows = row.hazRows || [];
    let hazString = '';
    if (hazRows.length > 0) {
      hazString = '<b>Hazardous Details:</b><br/>';
      hazRows.forEach((h: any) => {
        hazString += `Proper Shipping Name: ${h.properShippingName}<br/>HAZ: ${h.quantity}, Haz Class: ${h.imoClass}, Sub Risk: ${h.imoSubclass}, UN No.: ${h.unNumber}, Flash Point: ${h.flashpointC}, Pkg Group: ${h.pkgGroup}, Commodity: ${row.description}<br/>`;
      });
    }

    // Build dimensions string
    const dimRows = row.dimRows || [];
    let dimString = '';
    if (dimRows.length > 0) {
      dimString = dimRows
        .map(
          (d: any) =>
            `${d.pieces} @ ${d.length}x${d.width}x${d.height} ${str(d.unit).charAt(0)}`
        )
        .join(', ');
    }

    return {
      added: true,
      title: null,
      pieces: str(row.pieces),
      weight: str(row.kg),
      cube: str(row.cbm),
      weightLbs: str(row.lbs),
      cubeCbf: str(row.cbf),
      marksAndNumbers: str(row.marks),
      goodsAndDescriptions: str(row.description),
      dimensions: dimString,
      haz: hazString,
      cargoHsCode: str(row.hsCode),
      cargoLineSeq: idx + 1,
      containerSelected: false,
      overLimitCargoDims: false,
      volumeExceeded: false,
      contUnSelected: false,
      modifiedCargo: false,
    };
  });
}

export function buildBookingQuoteCargoBean(
  c: any,
  moduleType: any,
  isNew = true,
  routing: any,
  customDetails?: any,
  loginClientBean?: any
) {
  const cargoRows = c?.cargoRows || [];
  const firstRow = cargoRows[0] || {};
  const flags = c?.flagState?.flags || {};
  const lotRows = c?.lotRows || [];
  const genAesFilingBean = customDetails || {};

  const commodity = firstRow?.description
    ?.split('\n')
    .filter((item: string) => item.trim() !== '')
    .reduce(
      (acc: { [x: string]: any }, item: string, index: number) => {
        acc[`commodity${index + 1}`] = item.trim();
        return acc;
      },
      {} as Record<string, string>
    );

  return {
    container1: 0,
    containerSize1: null,
    containerType1: null,
    container2: 0,
    containerSize2: null,
    containerType2: null,
    container3: 0,
    containerSize3: null,
    containerType3: null,
    ...commodity,
    weight: num(firstRow.kg),
    cube: num(firstRow.cbm),
    weightLbs: num(firstRow.lbs),
    cubeCbf: num(firstRow.cbf),
    hazardousCode: str(firstRow.hazardous).startsWith('Y') ? 'Y' : 'N',
    numberOfPieces: num(firstRow.pieces),
    uom: str(firstRow.uom),
    marks: str(firstRow.marks),
    actualPieces: num(firstRow.pieces),
    packaging: str(firstRow.packaging),
    genAesFilingBean: {
      referenceNumber: genAesFilingBean?.referenceNumber,
      scacCode: genAesFilingBean?.SCACCodeText || routing?.routingFormData?.carrierCode?.split('-')[0].trim() || null,
      itnNumber: genAesFilingBean?.ITNNumber,
      filingType: genAesFilingBean?.fillingType ?? 'N',
      type: moduleType,
      description: genAesFilingBean?.description,
      rowid: genAesFilingBean?.rowid,
      controlFlag: isNew ? 'N' : 'U',
      inputUser: genAesFilingBean?.inputUser ?? loginClientBean.username,
      updateUser: genAesFilingBean?.updateUser,
      oldUcrNumber: genAesFilingBean?.oldUcrNumber,
      mrnNumber: genAesFilingBean?.mrnNumber,
      oldMrnNumber: genAesFilingBean?.oldMrnNumber,
      filingBy: genAesFilingBean?.filingBy,
    },
    documentReferences: str(firstRow.docRef),
    bookingCustomerDeclaredHazardousBeanList: null,
    bookingAdditionalCargoInfoHazardousBeanList: null,
    recordSequence: 0,
    status: 0,
    bookingNumber: null,
    customerDeclaredId: null,
    commodity: null,
    controlFlag: isNew ? 'N' : 'U',
    cargoDimensionBeanList: (firstRow.dimRows || []).map((d: any) => ({
      dimensionId: null,
      length: num(d.length),
      width: num(d.width),
      height: num(d.height),
      unit: str(d.unit).charAt(0),
      pieces: num(d.pieces),
      cbm: num(d.cbm),
      cbf: num(d.cbf),
      kg: num(d.kg),
      lbs: num(d.lbs),
      stackable: str(d.stackable).charAt(0) || 'Y',
      shipmentType: str(d.shipmentType === 'FTL' ? 'F' : 'L') || 'L',
      stackingType: str(d.stackingType) || '-1',
      tmsClass: num(d.cls),
    })),
    lotComments: null,
    lotCommentsDesc: null,
    oldLotCommentDesc: '',
    lotCommentsValue: str(c?.internalComment),
    oldLotCommentsValue: '',
    externalLotComments: lotRows.map((l: any, _idx: number) => ({
      commentId: l.commentId,
      module: moduleType,
      reference: l.reference,
      code: str(l.type),
      name: str(l.details),
      value: str(l.freeTextInput),
      description: l.details,
      inputUserName: l.inputUserName,
      inputDate: l.inputDate,
      updateUserName: loginClientBean.username,
      updateDate: l.updateDate,
      transactionFlagStatus: isNew ? 'N' : 'U',
      oldCode: l.oldCode,
      oldName: l.oldName,
      oldValue: l.oldValue,
      fromQuote: l.fromQuote,
    })),
    commodityDescription6: '',
    commodityDescription7: '',
    commodityDescription8: '',
    commodityDescription9: '',
    commodityDescription10: '',
    commodityDescription11: '',
    commodityDescription12: '',
    stackable: c?.stackable,
    tmsShipmentType: c?.tmsShipmentType,
    trailerType: null,
    sensitiveCargo: c?.sensitiveCargo,
    loadingInstruction: str(c?.loadingInstruction),
    warehouseInstruction: str(c?.warehouseInstruction),
    hsCode: str(firstRow.hsCode),
    descriptionOfGood: str(firstRow.description),
    oogCode: null,
    refeerCode: null,
    socCode: null,
    noOfContainers: null,
    containerType: null,
    cargoAdditionalInfoId: null,
    temprature: null,
    length: null,
    height: null,
    width: null,
    unit: null,
    airFlow: null,
    relativeHumidity: null,
    ventSetting: null,
    dehumificationCode: null,
    genSetCode: null,
    tempratureInstruction: null,
    containerTypeAndSize: null,
    containerSize: null,
    totalKg: num(firstRow.kg),
    totalLbs: num(firstRow.lbs),
    totalCbm: num(firstRow.cbm),
    totalCbf: num(firstRow.cbf),
    hazardouValue: firstRow.hazardous ? 'Y' : 'N',
    requiredContainerType: null,
    customsNumber: null,
    cargoInsurence: 'Y',
    assuredParty: '',
    commercialValue: '',
    bookingMultiCargoHazardousList: firstRow.hazardous === 'N'
    ? [] :(firstRow.hazRows || []).map((h: any, idx: number) => ({
      rowId: '',
      referenceNumber: 0,
      shipperName1: str(h.shipperName1), 
      shipperName2: str(h.shipperName2),
      techName1: str(h.technicalName),
      techName2: null,
      noOfpieces: num(h.pieces),
      packaging: str(h.packaging),
      weight: num(h.weight),
      imcoClass: str(h.imoClass),
      unNumber: str(h.unNumber),
      imcoPage: str(h.imoPage),
      flashPointCelsius: num(h.flashpointC),
      flashpointFahrenheit: num(h.flashpointF),
      degrees: str(h.degreeUnit),
      packagingGroup: str(h.pkgGroup),
      plackard1: str(h.placard1),
      plackard2: str(h.placard2),
      emergencyPhone: str(h.emergencyNumber),
      emergencyCotact: str(h.emergencyContact),
      hazardousCode: str(h.imoClass),
      hazarDousCount: 0,
      quantity: h.quantity === "L - Limited Quantity" || h.quantity === "L" ? "L" : h.quantity === "E - Excepted Quantity" || h.quantity === "E" ? "E" : "",
      controlFlag: isNew ? 'N' : 'U',
      inputUpdateUser: loginClientBean.username,
      recordNumber: idx + 1,
      quoteCargoHazardousId: 0,
      imoSubClass: str(h.imoSubclass),
      customerDeclaredCargoId: null,
      bookingNumber: null,
      customerDeclaredHazardouId: '',
      customerDeclaredHazardousTransactionFlag: isNew ? 'N' : 'U',
      pickupId: formatSequenceNumber(idx + 1, 3),
      commodity: null,
    })),
    multiCargoDetailId: null,
    nonStackable: flags.nonStackable,
    multiCargoDimFlag: null,
    cargoHsCode: str(firstRow.hsCode),
    maxContainerSize: null,
    overLength: flags.overLength,
    dimension: flags.printDimension,
    instructions: true,
    overWeight: flags.overWeight,
  };
}

export function buildBookingQuoteMultiCargoBeanList(c: any, _moduleType: any, isNew = true, loginClientBean?: any) {
  const cargoRows = c?.cargoRows || c?.cargoState?.cargoRows || [];
  const flags = c?.flags || c?.flagState?.flags || {};

  return cargoRows.map((row: any, rowIdx: number) => ({
    container1: 0,
    containerSize1: null,
    containerType1: null,
    container2: 0,
    containerSize2: null,
    containerType2: null,
    container3: 0,
    containerSize3: null,
    containerType3: null,
    commodity1: str(row.description),
    commodity2: '',
    commodity3: '',
    commodity4: '',
    commodity5: '',
    weight: num(row.kg),
    cube: num(row.cbm),
    weightLbs: num(row.lbs),
    cubeCbf: num(row.cbf),
    hazardousCode: str(row.hazardous).startsWith('Y') ? 'Y' : 'N',
    numberOfPieces: num(row.pieces),
    uom: str(row.uom),
    marks: str(row.marks),
    actualPieces: num(row.pieces),
    packaging: str(row.packaging),
    genAesFilingBean: {
      referenceNumber: null,
      scacCode: null,
      itnNumber: null,
      filingType: null,
      type: null,
      description: null,
      rowid: null,
      controlFlag: isNew ? 'N' : 'U',
      inputUser: null,
      updateUser: null,
      oldUcrNumber: null,
      mrnNumber: null,
      oldMrnNumber: null,
      filingBy: null,
    },
    documentReferences: str(row.docRef),
    bookingCustomerDeclaredHazardousBeanList: null,
    bookingAdditionalCargoInfoHazardousBeanList: null,
    recordSequence: rowIdx + 1,
    status: 0,
    bookingNumber: null,
    customerDeclaredId: null,
    commodity: null,
    controlFlag: isNew ? 'N' : 'U',
    cargoDimensionBeanList: (row.dimRows || []).map((d: any) => ({
      dimensionId: null,
      length: num(d.length),
      width: num(d.width),
      height: num(d.height),
      unit: str(d.unit).charAt(0),
      pieces: num(d.pieces),
      cbm: num(d.cbm),
      cbf: num(d.cbf),
      kg: num(d.kg),
      lbs: num(d.lbs),
      stackable: str(d.stackable).charAt(0) || 'Y',
      shipmentType: str(d.shipmentType === 'FTL' ? 'F' : 'L') || 'L',
      stackingType: str(d.stackingType) || '-1',
      tmsClass: num(d.cls),
    })),
    lotComments: null,
    lotCommentsDesc: null,
    oldLotCommentDesc: '',
    lotCommentsValue: null,
    oldLotCommentsValue: null,
    externalLotComments: [],
    commodityDescription6: null,
    commodityDescription7: null,
    commodityDescription8: null,
    commodityDescription9: null,
    commodityDescription10: null,
    commodityDescription11: null,
    commodityDescription12: null,
    stackable: flags.nonStackable ? 'N' : 'Y',
    tmsShipmentType: 'LTL',
    trailerType: null,
    sensitiveCargo: row.sensitiveCargo ? 'Y' : 'N',
    loadingInstruction: null,
    warehouseInstruction: null,
    hsCode: str(row.hsCode),
    descriptionOfGood: str(row.description),
    oogCode: null,
    refeerCode: null,
    socCode: null,
    noOfContainers: null,
    containerType: null,
    cargoAdditionalInfoId: null,
    temprature: null,
    length: null,
    height: null,
    width: null,
    unit: null,
    airFlow: null,
    relativeHumidity: null,
    ventSetting: null,
    dehumificationCode: null,
    genSetCode: null,
    tempratureInstruction: null,
    containerTypeAndSize: null,
    containerSize: null,
    totalKg: num(row.kg),
    totalLbs: num(row.lbs),
    totalCbm: num(row.cbm),
    totalCbf: num(row.cbf),
    hazardouValue: row.hazardous ? 'Y' : 'N',
    requiredContainerType: null,
    customsNumber: null,
    cargoInsurence: null,
    assuredParty: null,
    commercialValue: null,
    bookingMultiCargoHazardousList:  row.hazardous  === 'N'
    ? [] :(row.hazRows || []).map((h: any, idx: number) => ({
      rowId: '', 
      referenceNumber: 0, 
      shipperName1: str(h.shipperName1), 
      shipperName2: str(h.shipperName2),
      techName1: str(h.technicalName), 
      techName2: null, 
      noOfpieces: num(h.pieces), 
      packaging: replacePleaseSelect(str(h.packaging)),
      weight: num(h.weight), 
      imcoClass: replacePleaseSelect(str(h.imoClass)), 
      unNumber: str(h.unNumber), 
      imcoPage: str(h.imoPage),
      flashPointCelsius: num(h.flashpointC), 
      flashpointFahrenheit: num(h.flashpointF), 
      degrees: str(h.degreeUnit),
      packagingGroup: replacePleaseSelect(str(h.pkgGroup)), 
      plackard1: str(h.placard1), 
      plackard2: str(h.placard2),
      emergencyPhone: str(h.emergencyNumber), 
      emergencyCotact: str(h.emergencyContact), 
      hazardousCode: replacePleaseSelect(str(h.imoClass)),
      hazarDousCount: 0, 
      quantity: replacePleaseSelect(str(h.quantity)) === 'L - Limited Quantity' ? 'L' : replacePleaseSelect(str(h.quantity)) === 'E - Excepted Quantity' ? 'E' : '', 
      controlFlag: isNew ? 'N' : 'U',
      inputUpdateUser: loginClientBean?.username, 
      recordNumber: idx + 1, 
      quoteCargoHazardousId: 0,
      imoSubClass: replacePleaseSelect(str(h.imoSubclass)), 
      customerDeclaredCargoId: null,
      bookingNumber: null, 
      customerDeclaredHazardouId: '',
      customerDeclaredHazardousTransactionFlag: isNew ? 'N' : 'U',
      pickupId: formatSequenceNumber(idx + 1, 3),
      commodity: null,
    })),
    multiCargoDetailId: null,
    nonStackable: flags.nonStackable,
    multiCargoDimFlag: null,
    cargoHsCode: str(row.hsCode),
    maxContainerSize: null,
    overLength: flags.overLength,
    dimension: flags.printDimension,
    instructions: false,
    overWeight: flags.overWeight,
  }));
}

export const mapCargoFromPopulate = (quoteBean: any) => {
  const multiList = quoteBean?.bookingQuoteMultiCargoBeanList ?? [];
  const cargoBean = quoteBean?.bookingQuoteCargoBean;

  const cargoRows = multiList.map((c: any) => ({
    ...initialCargoRow,
    marks: c.marks ?? '',
    pieces: String(c.numberOfPieces ?? ''),
    packaging: c.packaging ?? '-1',
    description: joinLines(
      c.commodity1,
      c.commodity2,
      c.commodity3,
      c.commodity4,
      c.commodity5
    ),
    kg: String(c.weight ?? ''),
    lbs: String(c.weightLbs ?? ''),
    cbm: String(c.cube ?? ''),
    cbf: String(c.cubeCbf ?? ''),
    hazardous:c.hazardousCode,
    uom: c.uom ?? 'M',
    docRef: c.documentReferences ?? '-1',
    isDimension: c.dimension ?? false,
    overLengthTransmit: c.overLengthTransmit ?? false,
    overWeightTransmit: c.overWeightTransmit ?? false,
    hsCode: c.cargoHsCode ?? '',
    sensitiveCargo: c.sensitiveCargo ?? false,
    ...(c.cargoDimensionBeanList?.length > 0 && {
    dimRows: mapDimRows(c.cargoDimensionBeanList),
  }),
    hazRows: mapHazRows(c.bookingMultiCargoHazardousList),
  }));

  return {
    cargoRows: cargoRows.length ? cargoRows : [{ ...initialCargoRow }],
    internalComment: cargoBean?.lotCommentsValue ?? '',
    lotRows: (cargoBean.externalLotComments ?? []).map((item: any) => ({
      type: item.code ?? '-1',
      details: item.description ?? '',
      commentId: item.commentId,
      module: item.module,
      reference: item.reference,
      code: item.code,
      name: item.name,
      freeTextInput: item.value,
      description: item.description,
      inputUserName: item.inputUserName,
      inputDate: item.inputDate,
      updateUserName: item.updateUserName,
      updateDate: item.updateDate,
      transactionFlagStatus: item.transactionFlagStatus,
      oldCode: item.oldCode,
      oldName: item.oldName,
      oldValue: item.oldValue,
      oldDescription: item.oldDescription,
      fromQuote: item.fromQuote,
    })),
    sensitiveCargo: cargoBean?.sensitiveCargo,
    stackable: cargoBean?.stackable,
    tmsShipmentType: cargoBean?.tmsShipmentType,
    genAesFilingBean: buildGenAesFilingBean(cargoBean?.genAesFilingBean),
  };
};

const buildGenAesFilingBean = (genAesFilingBean?: any) => {
  return {
    referenceNumber: genAesFilingBean?.referenceNumber,
    scacCode: genAesFilingBean?.scacCode,
    itnNumber: genAesFilingBean?.itnNumber,
    filingType: genAesFilingBean?.filingType ?? 'N',
    type: genAesFilingBean?.type,
    description: genAesFilingBean?.description,
    rowid: genAesFilingBean?.rowid,
    controlFlag: genAesFilingBean?.controlFlag,
    inputUser: genAesFilingBean?.inputUser,
    updateUser: genAesFilingBean?.updateUser,
    oldUcrNumber: genAesFilingBean?.oldUcrNumber,
    mrnNumber: genAesFilingBean?.mrnNumber,
    oldMrnNumber: genAesFilingBean?.oldMrnNumber,
    filingBy: genAesFilingBean?.filingBy,
  };
};

const mapHazardous = (code: string | null): string => {
  if (code === 'Y') return 'Y - Yes';
  if (code === 'N') return 'N - No';
  return 'Please Select';
};

const mapDimUnit = (code: string | null): string => {
  const map: Record<string, string> = {
    I: 'Inches',
    C: 'Centimeters',
    F: 'Feet',
    M: 'Meters',
  };
  return map[code ?? ''] ?? 'Inches';
};

const mapShipmentType = (code: string | null): string => {
  const map: Record<string, string> = { L: 'LTL', F: 'FTL' };
  return map[code ?? ''] ?? code ?? 'LTL';
};

const mapDimRows = (dims: any[]) => {
  if (!dims?.length) return [];
  return dims.map((d) => ({
    ...initialDimRow,
    length: String(d.length ?? ''),
    width: String(d.width ?? ''),
    height: String(d.height ?? ''),
    unit: mapDimUnit(d.unit),
    pieces: String(d.pieces ?? ''),
    cbm: String(d.cbm ?? ''),
    cbf: String(d.cbf ?? ''),
    kg: String(d.kg ?? ''),
    lbs: String(d.lbs ?? ''),
    cls: String(d.tmsClass ?? ''),
    stackable: d.stackable === 'Y' ? 'Yes' : 'No',
    shipmentType: mapShipmentType(d.shipmentType),
    stackingType: d.stackingType ?? '',
  }));
};

const mapHazRows = (list: any[]) => {
  if (!list?.length) return [{ ...initialHazRow }];
  return list.map((h) => ({
    ...initialHazRow,
    imoClass: h.hazardousCode || 'Please Select',
    imoSubclass: h.imoSubClass ?? 'Please Select',
    unNumber: h.unNumber ?? '',
    imcoPage: h.imcoPage ?? '',
    pkgGroup: h.packagingGroup ?? 'Please Select',
    flashpointC: String(h.flashPointCelsius ?? '0'),
    flashpointF: String(h.flashpointFahrenheit ?? '0'),
    degreeUnit: h.degreeUnit ?? 'C',
    pieces: String(h.noOfpieces ?? '0'),
    packaging: h.packaging ?? '',
    weight: String(h.weight ?? '0'),
    properShippingName: h.shipperName1 ?? '',
    technicalName: h.techName1 ?? '',
    placard1: h.plackard1 ?? '',
    placard2: h.plackard2 ?? '',
    emergencyNumber: h.emergencyPhone ?? '',
    emergencyContact: h.emergencyCotact ?? '',
    quantity:
      h.quantity === 'L'
        ? 'L - Limited Quantity'
        : h.quantity === 'E'
          ? 'E - Excepted Quantity'
          : 'Please Select',
    shipperName1: h.shipperName1 ?? '',
    shipperName2: h.shipperName2 ?? '',
  }));
};
