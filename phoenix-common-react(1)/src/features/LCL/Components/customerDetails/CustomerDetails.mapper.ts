import { formatAddress, joinLines, str, strOrNull } from "../../../../core/utils/string.utility";

export function buildBookingQuoteCustomerBean(customer: any) {
  const defaultForm = customer?.defaultForm ?? {};
  const lclForm = customer?.lclForm ?? {};
  const more = customer?.customerMoreDetails ?? {};

  const shipperNames = Array.from({ length: 5 }).reduce<Record<string, string>>(
    (acc, _, index) => {
      const lines =
        defaultForm?.customerName
          ?.split("\n")
          .filter((item: string) => item.trim() !== "") || [];

      acc[`shipperName${index === 0 ? "" : index + 1}`] =
        lines[index]?.trim() || "";

      return acc;
    },
    {}
  );

  const consigneeNames = Array.from({ length: 5 }).reduce<Record<string, string>>(
    (acc, _, index) => {
      const lines =
        more?.consigneeName
          ?.split("\n")
          .filter((item: string) => item.trim() !== "") || [];

      acc[`consigneeName${index === 0 ? "" : index}`] =
        lines[index]?.trim() || "";

      return acc;
    },
    {}
  );

  const forwarderNames = Array.from({ length: 5 }).reduce<Record<string, string>>(
    (acc, _, index) => {
      const lines =
        more?.shipperName
          ?.split("\n")
          .filter((item: string) => item.trim() !== "") || [];

      acc[`forwarderName${index === 0 ? "" : index + 1}`] =
        lines[index]?.trim() || "";

      return acc;
    },
    {}
  );

  const actualForwarderNames = Array.from({ length: 5 }).reduce<Record<string, string>>(
    (acc, _, index) => {
      const lines =
        more?.forwarderName
          ?.split("\n")
          .filter((item: string) => item.trim() !== "") || [];

      acc[`forwarderName${index === 0 ? "" : index + 1}`] =
        lines[index]?.trim() || "";

      return acc;
    },
    {}
  );

  const notifyNames = Array.from({ length: 5 }).reduce<Record<string, string>>(
    (acc, _, index) => {
      const lines =
        more?.notifyPartyName
          ?.split("\n")
          .filter((item: string) => item.trim() !== "") || [];

      const key =
        index === 0
          ? "notifyName"
          : index === 1
          ? "notifyName1"
          : `notifyName${index + 1}`; // skips notifyName2

      acc[key] = lines[index]?.trim() || "";

      return acc;
    },
    {}
  );

  const forwarder = {
      forwarderReference: str(more?.shipperReference),
      forwarderCode: str(more?.shipperCode),
      ...forwarderNames,
      forwarderAddress1: formatAddress(more?.shipperAddress).addr1,
      forwarderAddress2: formatAddress(more?.shipperAddress).addr2,
      forwarderAddress3: formatAddress(more?.shipperAddress).addr3,
      forwarderPhone: str(more?.shipperPhoneNumber),
      forwarderFax: str(more?.shipperFax),
      forwarderContact: str(more?.shipperContactName),
      forwarderNameAccount: str(more?.shipperNamedAccount),
      forwarderNamedAccountFullName: '',
      forwarderState: str(more?.shipperState),
      forwarderZip: str(more?.shipperZipCode),
      forwarderCountry: str(more?.shipperCountry)?.split("-")?.[0]?.trim() || str(more?.shipperCountry),
      forwarderCity: str(more?.shipperCity),
      forwarderEmail: str(more?.shipperEmail),
      forwarderStateId: more?.shipperStateId,
      forwarderStateName: more?.shipperStateName,
      forwarderEoriNumber: str(more?.shipperEoriNumber),
      forwarderCombinedDetails: null,
      forwarderMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    }

    const actualForwarder = {
      forwarderReference: str(more?.forwarderReference),
      forwarderCode: str(more?.forwarderCode),
      ...actualForwarderNames,
      forwarderAddress1: formatAddress(more?.forwarderAddress).addr1,
      forwarderAddress2: formatAddress(more?.forwarderAddress).addr2,
      forwarderAddress3: formatAddress(more?.forwarderAddress).addr3,
      forwarderPhone: str(more?.forwarderPhoneNumber),
      forwarderFax: str(more?.forwarderFax),
      forwarderContact: str(more?.forwarderContactName),
      forwarderNameAccount: str(more?.forwarderNamedAccount),
      forwarderNamedAccountFullName: '',
      forwarderState: str(more?.forwarderState),
      forwarderZip: str(more?.forwarderZipCode),
      forwarderCountry: str(more?.forwarderCountry)?.split("-")?.[0]?.trim() || str(more?.forwarderCountry),
      forwarderCity: str(more?.forwarderCity),
      forwarderEmail: str(more?.forwarderEmail),
      forwarderStateId: more?.forwarderStateId,
      forwarderStateName: more?.forwarderStateName,
      forwarderEoriNumber: str(more?.forwarderEoriNumber),
      forwarderCombinedDetails: null,
      forwarderMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    }

  return {
    customerType: str(more?.customerType) || 'C',
    salesRepresentative: str(lclForm?.salesRepresentative),
    customerEmail: str(lclForm?.customerEmail),
    purchaseOrderNumber: str(more?.purchaseOrder),
    shipperBean: {
      shipperReference: str(defaultForm?.customerReference),
      shipperCode: str(defaultForm?.customerCode),
      ...shipperNames,
      shipperAddress1: formatAddress(defaultForm?.customerAddress).addr1,
      shipperAddress2: formatAddress(defaultForm?.customerAddress).addr2,
      shipperAddress3: formatAddress(defaultForm?.customerAddress).addr3,
      shipperCity: str(defaultForm?.customerCity),
      shipperPhone: str(defaultForm?.telephoneNumber),
      shipperCellphone: str(defaultForm?.mobileNumber),
      shipperTelephone: str(defaultForm?.telephoneNumber),
      shipperFax: str(defaultForm?.customerFax),
      shipperContact: str(defaultForm?.customersContactName),
      customerReference: null,
      namedAccount: str(lclForm?.customerNamedAccount),
      wwaCustomer: null,
      customerAlias: null,
      creditHold: "H",
      namedAccountFullName: '',
      shipperState: str(defaultForm?.customerState),
      shipperZip: str(defaultForm?.customerZipCode),
      shipperCountry: str(defaultForm?.customerCountry)?.split("-")?.[0]?.trim() || str(defaultForm?.customerCountry),
      shipperNewName: null,
      shipperNewAddress: null,
      shipperEmail: str(defaultForm?.customerEmail),
      oldCustomerReference: null,
      customerITNo: '',
      namedAccountListMap: null,
      asAgentForBkg: null,
      asAgentForToggle: 'N',
      shipperStateId: defaultForm?.customerStateId,
      shipperStateName: defaultForm?.customerStateName,
      shipperEoriNumber: str(more?.shipperEoriNumber),
      shipperCombinedDetails: null,
      customerType: str(defaultForm?.customerType || "F"),
      shipperMpciPartyIdNumber: null,
      customerContact: str(defaultForm?.customerContact),
      customerDetailsFromBooking: true,
    },
    consigneeBean: {
      consigneeReference: str(more?.consigneeReference),
      consigneeCode: str(more?.consigneeCode),
      ...consigneeNames,
      consigneeAddress1: formatAddress(more?.consigneeAddress).addr1,
      consigneeAddress2: formatAddress(more?.consigneeAddress).addr2,
      consigneeAddress3: formatAddress(more?.consigneeAddress).addr3,
      consigneePhone: str(more?.consigneePhoneNumber),
      consigneeFax: str(more?.consigneeFax),
      consigneeContact: str(more?.consigneeContactName),
      consigeeCity: str(more?.consigneeCity),
      consigneeState: str(more?.consigneeState),
      consigneeCountry: str(more?.consigneeCountry)?.split("-")?.[0]?.trim() || str(more?.consigneeCountry),
      consigneeTelephone: null,
      consigneeZipCode: str(more?.consigneeZipCode),
      consigneeNewName: null,
      consigneeNewAddress: null,
      namedAccount: str(more?.consigneeNamedAccount),
      namedAccountFullName: '',
      consigneeEmail: str(more?.consigneeEmail),
      consigneeStateName: more?.consigneeStateName,
      consigneeStateId: more?.consigneeStateId,
      consigneeEoriNumber: str(more?.consigneeEoriNumber),
      consigneeCombinedDetails: null,
      consigneeMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    },
    forwarderBean: forwarder,
    agentBean: {
      agentReference: null,
      agentCode: str(lclForm?.agentCode),
      agentName: str(lclForm?.agentName),
      agentAddress1: null,
      agentAddress2: null,
      agentAddress3: null,
      agentPhone: null,
      agentFax: null,
      agentContact: null,
      agentNameAccount: null,
      agentNamedAccountFullName: null,
      agentName2: null,
      agentName3: null,
      agentName4: null,
      agentName5: null,
      agentState: null,
      agentZip: null,
      agentCountry: null,
      agentCity: null,
      agentEmail: str(lclForm?.agentEmail),
      agentTelephone: null,
      license: false,
    },
    actualforwarderBean: actualForwarder,
    wwaCustomer: str(more?.wwaCustomer),
    rateProfile: null,
    additinoalProfile: null,
    customerAlias: null,
    accurateProfile: str(lclForm?.accuRateProfile) || 'STANDARD',
    trackingCustomer1: strOrNull(more?.trackingCode?.split('-')?.[0]),
    trackingCustomer2: strOrNull(more?.trackingCode?.split('-')?.[1]),
    wwaReference: str(more?.wwaReference),
    billingCompany: str(lclForm?.billingCompany || "01 - SHIPCO TRANSPORT INC"),
    notifyBean: {
      notifyReference: str(more?.notifyPartyReference),
      notifyCode: str(more?.notifyPartyCode),
      ...notifyNames,
      notifyAddress1: formatAddress(more?.notifyPartyAddress).addr1,
      notifyAddress2: formatAddress(more?.notifyPartyAddress).addr2,
      notifyAddress3: formatAddress(more?.notifyPartyAddress).addr3,
      notifyPhone: str(more?.notifyPartyPhoneNumber),
      notifyFax: str(more?.notifyPartyFax),
      namedAccount: str(more?.notifyPartyNamedAccount),
      namedAccountFullName: '',
      notifyCity: str(more?.notifyPartyCity),
      notifyState: str(more?.notifyPartyState),
      notifyCountry: str(more?.notifyPartyCountry)?.split("-")?.[0]?.trim() || str(more?.notifyPartyCountry),
      notifyTelephone: null,
      notifyZipCode: str(more?.notifyPartyZipCode),
      notifyConact: str(more?.notifyPartyContactName),
      notifyNewName: null,
      notifyNewAddress: null,
      notifyEmail: str(more?.notifyPartyEmail),
      notifyStateName: more?.notifyStateName,
      notifyStateId: more?.notifyStateId,
      notifyEoriNumber: str(more?.notifyPartyEoriNumber),
      notifyCombinedDetails: null,
      notifyMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    },
    customerEoriNumber: str(lclForm?.customerEoriNumber),
    truckSellRateProfile: str(lclForm?.truckSellRateProfile),
    truckSellNamedAccount: null,
    customerMpciPartyIdNumber: null,
    enableTrackAndPrintUrlToggBtn: false,
  };
}

export const mapCustomerFromPopulate = (quoteBean: any) => {
  const cust = quoteBean?.bookingQuoteCustomerBean;
  if (!cust) return null;
  
  const s = cust.shipperBean;
  const con = cust.consigneeBean;
  const f = cust.forwarderBean;
  const actualforwarderBean = cust.actualforwarderBean;
  const notifyBean = cust.notifyBean;

  const customerFields = {
    customerCode: s?.shipperCode,
    customerName: joinLines(
      s?.shipperName,
      s?.shipperName2,
      s?.shipperName3,
      s?.shipperName4,
      s?.shipperName5
    ),
    customerAddress: joinLines(
      s?.shipperAddress1,
      s?.shipperAddress2,
      s?.shipperAddress3
    ),
    customerContact:s?.customerContact,
    customerCity: s?.shipperCity,
    customerState: s?.shipperStateName,
    customerStateId: s?.shipperStateId,
    customerStateName: s?.shipperStateName,
    customerZipCode: s?.shipperZip,
    customerCountry: s?.shipperCountry,
    customerFax: s?.shipperFax,
    customerType: s?.customerType,
    customersContactName: s?.shipperContact,
    salesRepresentative: cust?.salesRepresentative,
    telephoneNumber: s?.shipperTelephone,
    mobileNumber: s?.shipperCellphone,
    customerEmail: cust?.customerEmail,
    customerReference: s?.shipperReference,
    truckSellRateProfile: cust?.truckSellRateProfile,
    customerNamedAccount: s?.namedAccount,
    accuRateProfile: cust?.accurateProfile,
    customerEoriNumber: cust?.customerEoriNumber,
    prepaidCollect: quoteBean?.prepaidCredit,
    controllingEntity: quoteBean?.nomination,
    rateControllingEntity: quoteBean?.rateControllingEntity,
  };

  const forwarderFields = {
    forwarderCode: actualforwarderBean?.forwarderCode,
    forwarderName: joinLines(
      actualforwarderBean?.forwarderName,
      actualforwarderBean?.forwarderName2,
      actualforwarderBean?.forwarderName3,
      actualforwarderBean?.forwarderName4,
      actualforwarderBean?.forwarderName5
    ),
    forwarderAddress: joinLines(
      actualforwarderBean?.forwarderAddress1,
      actualforwarderBean?.forwarderAddress2,
      actualforwarderBean?.forwarderAddress3
    ),
    forwarderCity: actualforwarderBean?.forwarderCity,
    forwarderStateId: actualforwarderBean?.forwarderStateId,
    forwarderState: actualforwarderBean?.forwarderStateName,
    forwarderStateName: actualforwarderBean?.forwarderStateName,
    forwarderZipCode: actualforwarderBean?.forwarderZip,
    forwarderCountry: actualforwarderBean?.forwarderCountry,
    forwarderContactName: actualforwarderBean?.forwarderContact,
    forwarderPhoneNumber: actualforwarderBean?.forwarderPhone,
    forwarderEmail: actualforwarderBean?.forwarderEmail,
    forwarderFax: actualforwarderBean?.forwarderFax,
    forwarderReference: actualforwarderBean?.forwarderReference,
  };

  const notifyFields = {
    notifyPartyCode: notifyBean?.notifyCode,
    notifyPartyName: joinLines(
      notifyBean?.notifyName,
      notifyBean?.notifyName1,
      notifyBean?.notifyName2,
      notifyBean?.notifyName3,
      notifyBean?.notifyName4,
      notifyBean?.notifyName5
    ),
    notifyPartyAddress: joinLines(
      notifyBean?.notifyAddress1,
      notifyBean?.notifyAddress2,
      notifyBean?.notifyAddress3
    ),
    notifyPartyCity: notifyBean?.notifyCity,
    notifyPartyState: notifyBean?.notifyStateName,
    notifyStateId: notifyBean?.notifyStateId,
    notifyStateName: notifyBean?.notifyStateName,
    notifyPartyZipCode: notifyBean?.notifyZipCode,
    notifyPartyCountry: notifyBean?.notifyCountry,
    notifyPartyContactName: notifyBean?.notifyConact,
    notifyPartyPhoneNumber: notifyBean?.notifyPhone,
    notifyPartyEmail: notifyBean?.notifyEmail,
    notifyPartyFax: notifyBean?.notifyFax,
    notifyPartyReference: notifyBean?.notifyReference,
  };

  return {
    defaultForm: customerFields,
    lclForm: customerFields,
    customerMoreDetails: {
      consigneeCode: con?.consigneeCode,
      consigneeName: joinLines(con?.consigneeName, con?.consigneeName1),
      consigneeAddress: joinLines(
        con?.consigneeAddress1,
        con?.consigneeAddress2,
        con?.consigneeAddress3
      ),
      consigneeCity: con?.consigeeCity,
      consigneeState: con?.consigneeStateName,
      consigneeStateId: con?.consigneeStateId,
      consigneeStateName: con?.consigneeStateName,
      consigneeZipCode: con?.consigneeZipCode,
      consigneeCountry: con?.consigneeCountry,
      consigneeContactName: con?.consigneeContact,
      consigneePhoneNumber: con?.consigneePhone,
      consigneeEmail: con?.consigneeEmail,
      consigneeFax: con?.consigneeFax,
      consigneeReference: con?.consigneeReference,

      shipperCode: f?.forwarderCode,
      shipperName: joinLines(
        f?.forwarderName,
        f?.forwarderName2,
        f?.forwarderName3,
        f?.forwarderName4,
        f?.forwarderName5
      ),
      shipperAddress: joinLines(
        f?.forwarderAddress1,
        f?.forwarderAddress2,
        f?.forwarderAddress3
      ),
      shipperCity: f?.forwarderCity,
      shipperState: f?.forwarderStateName,
      shipperStateId: f?.shipperStateId,
      shipperStateName: f?.shipperStateName,
      shipperZipCode: f?.forwarderZip,
      shipperCountry: f?.forwarderCountry,
      shipperContactName: f?.forwarderContact,
      shipperPhoneNumber: f?.forwarderPhone,
      shipperEmail: f?.forwarderEmail,
      shipperFax: f?.forwarderFax,
      shipperReference: f?.forwarderReference,
      customerType: cust?.customerType,

      trackingCode: [cust?.trackingCustomer1, cust?.trackingCustomer2]
        .filter(Boolean)
        .join('-'),
      wwaReference: cust?.wwaReference,
      purchaseOrder: cust?.purchaseOrderNumber,
      ...forwarderFields,
      ...notifyFields,
    },
  };
};



export function buildImportBookingQuoteCustomerBean(customer: any) {


  const shipperNames = Array.from({ length: 5 }).reduce<Record<string, string>>(
    (acc, _, index) => {
      const lines =
        customer?.customerName
          ?.split("\n")
          .filter((item: string) => item.trim() !== "") || [];

      acc[`shipperName${index === 0 ? "" : index + 1}`] =
        lines[index]?.trim() || "";

      return acc;
    },
    {}
  );

  const consigneeNames = Array.from({ length: 5 }).reduce<Record<string, string>>(
    (acc, _, index) => {
      const lines =
        customer?.consigneeName
          ?.split("\n")
          .filter((item: string) => item.trim() !== "") || [];

      acc[`consigneeName${index === 0 ? "" : index}`] =
        lines[index]?.trim() || "";

      return acc;
    },
    {}
  );

  const forwarderNames = Array.from({ length: 5 }).reduce<Record<string, string>>(
    (acc, _, index) => {
      const lines =
        customer?.shipperName
          ?.split("\n")
          .filter((item: string) => item.trim() !== "") || [];

      acc[`forwarderName${index === 0 ? "" : index + 1}`] =
        lines[index]?.trim() || "";

      return acc;
    },
    {}
  );

  const actualForwarderNames = Array.from({ length: 5 }).reduce<Record<string, string>>(
    (acc, _, index) => {
      const lines =
        customer?.forwarderName
          ?.split("\n")
          .filter((item: string) => item.trim() !== "") || [];

      acc[`forwarderName${index === 0 ? "" : index + 1}`] =
        lines[index]?.trim() || "";

      return acc;
    },
    {}
  );

  const notifyNames = Array.from({ length: 5 }).reduce<Record<string, string>>(
    (acc, _, index) => {
      const lines =
        customer?.notifyPartyName
          ?.split("\n")
          .filter((item: string) => item.trim() !== "") || [];

      const key =
        index === 0
          ? "notifyName"
          : index === 1
          ? "notifyName1"
          : `notifyName${index + 1}`; // skips notifyName2

      acc[key] = lines[index]?.trim() || "";

      return acc;
    },
    {}
  );


  const extractCountryCode = (country?: string | null) => {
  if (!country) return '';

  return country.split(' - ')[0]?.trim() || '';
};



  const forwarder = {
      forwarderReference: str(customer?.shipperReference),
      forwarderCode: str(customer?.shipperCode),
      ...forwarderNames,
      forwarderAddress1: formatAddress(customer?.shipperAddress).addr1,
      forwarderAddress2: formatAddress(customer?.shipperAddress).addr2,
      forwarderAddress3: formatAddress(customer?.shipperAddress).addr3,
      forwarderPhone: str(customer?.shipperPhoneNumber),
      forwarderFax: str(customer?.shipperFax),
      forwarderContact: str(customer?.shipperContactName),
      forwarderNameAccount: str(customer?.shipperNamedAccount),
      forwarderNamedAccountFullName: '',
      forwarderState: str(customer?.shipperState),
      forwarderZip: str(customer?.shipperZipCode),
forwarderCountry: extractCountryCode(customer?.shipperCountry),
      forwarderCity: str(customer?.shipperCity),
      forwarderEmail: str(customer?.shipperEmail),
      forwarderStateId: customer?.shipperStateId,
      forwarderStateName: customer?.shipperStateName,
      forwarderEoriNumber: str(customer?.shipperEoriNumber),
      forwarderCombinedDetails: null,
      forwarderMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    }

    const actualForwarder = {
      forwarderReference: str(customer?.forwarderReference),
      forwarderCode: str(customer?.forwarderCode),
      ...actualForwarderNames,
      forwarderAddress1: formatAddress(customer?.forwarderAddress).addr1,
      forwarderAddress2: formatAddress(customer?.forwarderAddress).addr2,
      forwarderAddress3: formatAddress(customer?.forwarderAddress).addr3,
      forwarderPhone: str(customer?.forwarderPhoneNumber),
      forwarderFax: str(customer?.forwarderFax),
      forwarderContact: str(customer?.forwarderContactName),
      forwarderNameAccount: str(customer?.forwarderNamedAccount),
      forwarderNamedAccountFullName: '',
      forwarderState: str(customer?.forwarderState),
      forwarderZip: str(customer?.forwarderZipCode),

      forwarderCountry: extractCountryCode(customer?.forwarderCountry),
      forwarderCity: str(customer?.forwarderCity),
      forwarderEmail: str(customer?.forwarderEmail),
      forwarderStateId: customer?.forwarderStateId,
      forwarderStateName: customer?.forwarderStateName,
      forwarderEoriNumber: str(customer?.forwarderEoriNumber),
      forwarderCombinedDetails: null,
      forwarderMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    }

  return {
    customerType: str(customer?.customerType) || 'C',
    salesRepresentative: str(customer?.salesRepresentative),
    customerEmail: str(customer?.customerEmail),
    purchaseOrderNumber: str(customer?.purchaseOrder),
    shipperBean: {
      shipperReference: str(customer?.customerReference),
      shipperCode: str(customer?.customerCode),
      ...shipperNames,
      shipperAddress1: formatAddress(customer?.customerAddress).addr1,
      shipperAddress2: formatAddress(customer?.customerAddress).addr2,
      shipperAddress3: formatAddress(customer?.customerAddress).addr3,
      shipperCity: str(customer?.customerCity),
      shipperPhone: str(customer?.telephoneNumber),
      shipperCellphone: str(customer?.mobileNumber),
      shipperTelephone: str(customer?.telephoneNumber),
      shipperFax: str(customer?.customerFax),
      shipperContact: str(customer?.customersContactName),
      customerReference: null,
      namedAccount: str(customer?.customerNamedAccount),
      wwaCustomer: null,
      customerAlias: null,
      creditHold: "H",
      namedAccountFullName: '',
      shipperState: str(customer?.customerState),
      shipperZip: str(customer?.customerZipCode),
  shipperCountry: extractCountryCode(customer?.customerCountry),
      shipperNewName: null,
      shipperNewAddress: null,
      shipperEmail: str(customer?.customerEmail),
      oldCustomerReference: null,
      customerITNo: '',
      namedAccountListMap: null,
      asAgentForBkg: null,
      asAgentForToggle: 'N',
      shipperStateId: customer?.customerStateId,
      shipperStateName: customer?.customerStateName,
      shipperEoriNumber: str(customer?.eoriNumber),
      shipperCombinedDetails: null,
      customerType: str("F"),
      shipperMpciPartyIdNumber: null,
      customerContact: null,
      customerDetailsFromBooking: true,
    },
    consigneeBean: {
      consigneeReference: str(customer?.consigneeReference),
      consigneeCode: str(customer?.consigneeCode),
      ...consigneeNames,
      consigneeAddress1: formatAddress(customer?.consigneeAddress).addr1,
      consigneeAddress2: formatAddress(customer?.consigneeAddress).addr2,
      consigneeAddress3: formatAddress(customer?.consigneeAddress).addr3,
      consigneePhone: str(customer?.consigneePhoneNumber),
      consigneeFax: str(customer?.consigneeFax),
      consigneeContact: str(customer?.consigneeContactName),
      consigeeCity: str(customer?.consigneeCity),
      consigneeState: str(customer?.consigneeState),
consigneeCountry: extractCountryCode(customer?.consigneeCountry),
      consigneeTelephone: null,
      consigneeZipCode: str(customer?.consigneeZipCode),
      consigneeNewName: null,
      consigneeNewAddress: null,
      namedAccount: str(customer?.consigneeNamedAccount),
      namedAccountFullName: '',
      consigneeEmail: str(customer?.consigneeEmail),
      consigneeStateName: customer?.consigneeStateName,
      consigneeStateId: customer?.consigneeStateId,
      consigneeEoriNumber: str(customer?.consigneeEoriNumber),
      consigneeCombinedDetails: null,
      consigneeMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    },
    forwarderBean: forwarder,
    agentBean: {
      agentReference: null,
      agentCode: str(customer?.agentCode),
      agentName: str(customer?.agentName),
      agentAddress1: null,
      agentAddress2: null,
      agentAddress3: null,
      agentPhone: null,
      agentFax: null,
      agentContact: null,
      agentNameAccount: null,
      agentNamedAccountFullName: null,
      agentName2: null,
      agentName3: null,
      agentName4: null,
      agentName5: null,
      agentState: null,
      agentZip: null,
      agentCountry: null,
      agentCity: null,
      agentEmail: str(customer?.agentEmail),
      agentTelephone: null,
      license: false,
    },
    actualforwarderBean: actualForwarder,
    wwaCustomer: str(customer?.wwaCustomer),
    rateProfile: null,
    additinoalProfile: null,
    customerAlias: null,
    accurateProfile: str(customer?.accuRateProfile) || 'STANDARD',
    trackingCustomer1: strOrNull(customer?.trackingCode?.split('-')?.[0]),
    trackingCustomer2: strOrNull(customer?.trackingCode?.split('-')?.[1]),
    wwaReference: str(customer?.wwaReference),
    billingCompany: "",
    notifyBean: {
      notifyReference: str(customer?.notifyPartyReference),
      notifyCode: str(customer?.notifyPartyCode),
      ...notifyNames,
      notifyAddress1: formatAddress(customer?.notifyPartyAddress).addr1,
      notifyAddress2: formatAddress(customer?.notifyPartyAddress).addr2,
      notifyAddress3: formatAddress(customer?.notifyPartyAddress).addr3,
      notifyPhone: str(customer?.notifyPartyPhoneNumber),
      notifyFax: str(customer?.notifyPartyFax),
      namedAccount: str(customer?.notifyPartyNamedAccount),
      namedAccountFullName: '',
      notifyCity: str(customer?.notifyPartyCity),
      notifyState: str(customer?.notifyPartyState),
  notifyCountry: extractCountryCode(customer?.notifyPartyCountry),
      notifyTelephone: null,
      notifyZipCode: str(customer?.notifyPartyZipCode),
      notifyConact: str(customer?.notifyPartyContactName),
      notifyNewName: null,
      notifyNewAddress: null,
      notifyEmail: str(customer?.notifyPartyEmail),
      notifyStateName: customer?.notifyStateName,
      notifyStateId: customer?.notifyStateId,
      notifyEoriNumber: str(customer?.notifyPartyEoriNumber),
      notifyCombinedDetails: null,
      notifyMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    },
    customerEoriNumber: str(customer?.customerEoriNumber),
    truckSellRateProfile: str(customer?.truckSellRateProfile),
    truckSellNamedAccount: null,
    customerMpciPartyIdNumber: null,
    enableTrackAndPrintUrlToggBtn: false,
  };
}