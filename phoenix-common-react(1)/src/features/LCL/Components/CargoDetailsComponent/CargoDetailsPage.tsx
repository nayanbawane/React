import { useState, useMemo } from 'react';
import CargoDetails from './CargoDetails';
import { CargoFlagsType, CargoRowType, LotRowType, StandardDimensionPreset } from '@/types/LCL/cargo/CargoDetails.types';

function readStandardDimensionPreset(): StandardDimensionPreset | null {
  try {
    const stored = localStorage.getItem('standardDimensionsBean');
    if (!stored) return null;
    const bean = JSON.parse(stored) as { dimensionMainList?: Array<Record<string, unknown>> };
    const first = bean?.dimensionMainList?.[0];
    if (!first) return null;
    return {
      length: String(first.length ?? ''), width: String(first.width ?? ''),
      height: String(first.height ?? ''), unit: String(first.unit ?? 'Inches'),
      pieces: String(first.pieces ?? ''), cbm: String(first.cbm ?? ''),
      cbf: String(first.cbf ?? ''), kg: String(first.kg ?? ''),
      lbs: String(first.lbs ?? ''), stackable: String(first.stackable ?? 'Yes'),
      shipmentType: String(first.shipmentType ?? ''),
      stackingType: String(first.StackingType ?? first.stackingType ?? '-1'),
    };
  } catch { return null; }
}

const INITIAL_DIM_ROW = {
  length: '', width: '', height: '', unit: 'Inches',
  pieces: '', cbm: '', cbf: '', kg: '', lbs: '', cls: '',
  packageType: '-1', stackable: 'Yes', shipmentType: 'LTL',
  stackingType: 'SD', tailerType: '',
};

const INITIAL_HAZ_ROW = {
  imoClass: '-1', imoSubclass: '-1', unNumber: '',
  imoPage: '', pkgGroup: '-1', flashpointC: '0', flashpointF: '0',
  degreeUnit: 'C', pieces: '0', packaging: '-1', weight: '0',
  properShippingName: '', technicalName: '', placard1: '', placard2: '',
  emergencyNumber: '', emergencyContact: '', quantity: '-1',
  shipperName1: '', shipperName2: '',
};

export const FCL_INITIAL_CARGO_ROW: FCLCargoRowState = {
  // numberOfContainer:["", "", ""],  
  numberOfContainer1: "",
  numberOfContainer2: "",
  numberOfContainer3: "",

  containerType1: '',
  containerType2: '',
  containerType3: '',

  descriptionOfGoods: "",
  kg: "",
  cbf: "",
  cbm: "",
  lbs: "",
  hazardous: '',
};

const INITIAL_CARGO_ROW: CargoRowType = {
  marks: '', pieces: '', packaging: '-1', description: '',
  kg: '', lbs: '', cbm: '', cbf: '', hazardous: 'Please Select',
  uom: 'M', docRef: '-1', isDimension: false,
  overLengthTransmit: false, overWeightTransmit: false,
  hsCode: '', sensitiveCargo: false,
  dimRows: [{ ...INITIAL_DIM_ROW }],
  hazRows: [{ ...INITIAL_HAZ_ROW }],
  ...FCL_INITIAL_CARGO_ROW
};



const INITIAL_LOT_ROW: LotRowType = { type: 'Please Select', details: '' };

const INITIAL_FLAGS: CargoFlagsType = {
  fortyContainer: false, fortyFiveContainer: false, fiftyThreeTrailer: false,
  overLength: false, overWeight: false, nonStackable: false, printDimension: false,
};

const STATUS_BTNS = [
  { key: 'fortyContainer', label: '40 CNTR Required' },
  { key: 'fortyFiveContainer', label: '45 CNTR Required' },
  { key: 'fiftyThreeTrailer', label: '53 Trailer Required' },
  { key: 'overLength', label: 'OverLength' },
  { key: 'overWeight', label: 'OverWeight' },
  { key: 'nonStackable', label: 'Non Stackable' },
  { key: 'printDimension', label: 'Print Dimension in Booking Confirmation' },
];

function CargoDetailsPage({
  shippingType
}: { shippingType: string }) {
  const [activeTab, setActiveTab] = useState('actual');
  const standardDimensionPreset = useMemo(() => readStandardDimensionPreset() ?? {
    length: '100', width: '80', height: '60', unit: 'Centimeters',
    pieces: '5', cbm: '0.48', cbf: '16.95', kg: '50', lbs: '110.23',
    stackable: 'Yes', shipmentType: 'LTL', stackingType: 'OD',
  }, []);
  const hasStandardDimensions = true;
  const [flags, setFlags] = useState<CargoFlagsType>({ ...INITIAL_FLAGS });
  const [cargoRows, setCargoRows] = useState<CargoRowType[]>([{ ...INITIAL_CARGO_ROW }]);
  const [customsRows, setCustomsRows] = useState<CargoRowType[]>([{ ...INITIAL_CARGO_ROW }]);
  const [lotRows, setLotRows] = useState<LotRowType[]>([{ ...INITIAL_LOT_ROW }]);
  const [internalComment, setInternalCmt] = useState('');
  const [loadingInstruction, setLoadingInstruction] = useState('');
  const [warehouseInstruction, setWarehouseInstruction] = useState('');
  const [cbmDialogOpen, setCbmDialogOpen] = useState(false);

  // const [fclCargoRows, setFCLCargoRows] = useState<FCLCargoRowState>({ ...FCL_INITIAL_CARGO_ROW });

  const statusBtns = STATUS_BTNS.map(({ key, label }) => ({
    key,
    label,
    handler: () => setFlags((f) => ({ ...f, [key]: !f[key as keyof CargoFlagsType] })),
  }));
  return (
    <CargoDetails
      shippingType={shippingType}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      cargoState={{ cargoRows }}
      cargoHandlers={{
        updateCargoField: (idx, field, value) =>
          setCargoRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r))),
        addNewCargo: () => setCargoRows((rows) => [...rows, { ...INITIAL_CARGO_ROW }]),
        removeCargo: (idx) => setCargoRows((rows) => rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows),
        updateDimension: (cIdx, dIdx, field, value) =>
          setCargoRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, dimRows: r.dimRows.map((d, j) => j === dIdx ? { ...d, [field]: value } : d),
          })),
        addDimension: (cIdx) =>
          setCargoRows((rows) => rows.map((r, i) => i === cIdx ? { ...r, dimRows: [...r.dimRows, { ...INITIAL_DIM_ROW }] } : r)),
        removeDimension: (cIdx, dIdx) =>
          setCargoRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, dimRows: r.dimRows.length > 1 ? r.dimRows.filter((_, j) => j !== dIdx) : r.dimRows,
          })),
        updateHazardous: (cIdx, hIdx, field, value) => {
          setCargoRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, hazRows: r.hazRows.map((h, j) => j === hIdx ? { ...h, [field]: value } : h),
          }))
        },
        addHazardous: (cIdx) => {
          const lastRow = cargoRows[0].hazRows[cargoRows[0].hazRows.length - 1];
          if (!lastRow?.imoClass || lastRow.imoClass.trim() === "" || lastRow?.imoClass === "Please Select") {
            alert("Please select IMO class.")
            return;
          }
          setCargoRows((rows) => rows.map((r, i) => i === cIdx ? { ...r, hazRows: [...r.hazRows, { ...INITIAL_HAZ_ROW }] } : r))
        },
        removeHazardous: (cIdx, hIdx) =>
          setCargoRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, hazRows: r.hazRows.length > 1 ? r.hazRows.filter((_, j) => j !== hIdx) : r.hazRows,
          })),
        applyStandardDimensions: (cIdx) =>
          standardDimensionPreset && setCargoRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, useStandardDimensions: true,
            dimRows: [{ ...INITIAL_DIM_ROW, ...standardDimensionPreset }],
          })),
        clearStandardDimensions: (cIdx) =>
          setCargoRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, useStandardDimensions: false,
            dimRows: [{ ...INITIAL_DIM_ROW }],
          })),
      }}
      customsState={{ customsRows }}
      customsHandlers={{
        updateCustomsField: (idx, field, value) =>
          setCustomsRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r))),
        addNewCustoms: () => setCustomsRows((rows) => [...rows, { ...INITIAL_CARGO_ROW }]),
        removeCustoms: (idx) => setCustomsRows((rows) => rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows),
        updateCustomsDimension: (cIdx, dIdx, field, value) =>
          setCustomsRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, dimRows: r.dimRows.map((d, j) => j === dIdx ? { ...d, [field]: value } : d),
          })),
        addCustomsDimension: (cIdx) =>
          setCustomsRows((rows) => rows.map((r, i) => i === cIdx ? { ...r, dimRows: [...r.dimRows, { ...INITIAL_DIM_ROW }] } : r)),
        removeCustomsDimension: (cIdx, dIdx) =>
          setCustomsRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, dimRows: r.dimRows.length > 1 ? r.dimRows.filter((_, j) => j !== dIdx) : r.dimRows,
          })),
        updateCustomsHazardous: (cIdx, hIdx, field, value) =>
          setCustomsRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, hazRows: r.hazRows.map((h, j) => j === hIdx ? { ...h, [field]: value } : h),
          })),
        addCustomsHazardous: (cIdx) =>
          setCustomsRows((rows) => rows.map((r, i) => i === cIdx ? { ...r, hazRows: [...r.hazRows, { ...INITIAL_HAZ_ROW }] } : r)),
        removeCustomsHazardous: (cIdx, hIdx) =>
          setCustomsRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, hazRows: r.hazRows.length > 1 ? r.hazRows.filter((_, j) => j !== hIdx) : r.hazRows,
          })),
        applyStandardDimensions: (cIdx) =>
          standardDimensionPreset && setCustomsRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, useStandardDimensions: true,
            dimRows: [{ ...INITIAL_DIM_ROW, ...standardDimensionPreset }],
          })),
        clearStandardDimensions: (cIdx) =>
          setCustomsRows((rows) => rows.map((r, i) => i !== cIdx ? r : {
            ...r, useStandardDimensions: false,
            dimRows: [{ ...INITIAL_DIM_ROW }],
          })),
      }}
      lotState={{ lotRows }}
      lotHandlers={{
        updateLotField: (idx, field, value) =>
          setLotRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r))),
        addNewLot: (afterIdx) =>
          setLotRows((rows) => { const next = [...rows]; next.splice(afterIdx + 1, 0, { ...INITIAL_LOT_ROW }); return next; }),
        removeLot: (idx) =>
          setLotRows((rows) => rows.length > 1 ? rows.filter((_, i) => i !== idx) : [{ ...INITIAL_LOT_ROW }]),
      }}
      instructionState={{ internalComment, loadingInstruction, warehouseInstruction }}
      instructionHandlers={{ setInternalCmt, setLoadingInstruction, setWarehouseInstruction }}
      flagState={{ flags, statusBtns }}
      flagHandlers={{
        handleContainerExclusiveToggle: (key) =>
          setFlags((f) => ({ ...f, fortyContainer: false, fortyFiveContainer: false, fiftyThreeTrailer: false, [key]: !f[key] })),
        handleSimpleToggle: (key) => setFlags((f) => ({ ...f, [key]: !f[key] })),
        handleNonStackableToggle: () => setFlags((f) => ({ ...f, nonStackable: !f.nonStackable })),
      }}
      cbmDialogState={{ cbmDialogOpen, maxCbm: null }}
      cbmDialogHandlers={{
        onCbmConfirm: () => setCbmDialogOpen(false),
        onCbmCancel: () => setCbmDialogOpen(false),
      }}
      standardDimensionPreset={standardDimensionPreset ?? undefined}
      hasStandardDimensions={hasStandardDimensions}
    />
  );
}

export default CargoDetailsPage;
