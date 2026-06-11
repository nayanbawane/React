import { PSelect, PSingleValueSearchableField } from "phoenix-react-lib";
import React from "react";
import { updateBookingMainDetails } from "../../../../app/slices/LCL/Booking/bookingSlice";
import type { BookingFormState } from "../BookingMainDetails/mainDetails.state";
import "./yiyun-cfs-details.style.css";
import {
  customManifestFeeListConfig,
  getCFSLoadPortListConfig,
  paymentMethodListConfig,
  useGetSelections,
  useGetSuggestions,
  userReferenceSuggestionConfig,
} from "../../../../hooks/LCL";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {selectLoginClientBean} from "../../../../core/featureToggles/featureToggle.selectors";

interface Props {
}

export const YiyunCfsIntegrationDetails: React.FC<Props> = ({
}) => {
  const dispatch = useAppDispatch();
  const formState = useAppSelector((state) => state.booking.mainDetails);
  const loginClientBean = useAppSelector(selectLoginClientBean);

  const userReferenceSuggConfigParam : Record<string,unknown> = {
    schemaOffice : loginClientBean?.office,
    handlingOffice : formState?.handlingOffice || loginClientBean?.office,
    schemaName : loginClientBean?.schema,
  }

  const { data: cfsLoadPortData } = useGetSelections(getCFSLoadPortListConfig());
  const { data: paymentMethodData } = useGetSelections(paymentMethodListConfig());
  const { data: customsFeeData } = useGetSelections(customManifestFeeListConfig());

  const cfsLoadPortOptions = cfsLoadPortData.map((item: any) => ({
    label: item.label,
    value: item.value,
  }));

  const paymentMethodOptions = paymentMethodData.map((item: any) => ({
    label: item.label,
    value: item.value,
  }));

  const customsFeeOptions = customsFeeData.map((item: any) => ({
    label: item.label,
    value: item.value,
  }));

  const {
    data: specialHandlingSuggestions,
    setQuery: setSpecialHandlingQuery,
  } = useGetSuggestions(userReferenceSuggestionConfig(userReferenceSuggConfigParam as Record<string, unknown>));

  const handleChange = (
    field: "cfsLoadPort" | "paymentMethodCode" | "customManifestFeeCollectBy" | "specialHandlingCode",
    val: string
  ) => {
    dispatch(updateBookingMainDetails({ [field]: val } as Partial<BookingFormState>));
  };

  return (
    <div className="main-details-container">
      <div className="main-details-grid grid-cols-20">
        <div className="col-span-4">
          <PSelect
            label="CFS Load Port"
            placeholder="Please Select"
            value={formState.cfsLoadPort}
            onChange={(val) => handleChange("cfsLoadPort", val)}
            options={cfsLoadPortOptions}
          />
        </div>

        <div className="col-span-4">
          <PSelect
            label="Payment Method"
            placeholder="Please Select"
            value={formState.paymentMethodCode}
            onChange={(val) => handleChange("paymentMethodCode", val)}
            options={paymentMethodOptions}
          />
        </div>

        <div className="col-span-4">
          <PSelect
            label="Customs Manifest Fee Collect By"
            placeholder="Please Select"
            value={formState.customManifestFeeCollectBy}
            onChange={(val) =>
              handleChange("customManifestFeeCollectBy", val)
            }
            options={customsFeeOptions}
          />
        </div>

        <div className="col-span-4">
          <PSingleValueSearchableField
            label="Special Handling Code"
            data={specialHandlingSuggestions}
            displayFields={["code", "name"]}
            columnHeaders={["Code", "Name"]}
            onChange={(val) => setSpecialHandlingQuery(val)}
            onSelect={(item) =>
              handleChange("specialHandlingCode", item.code)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default YiyunCfsIntegrationDetails;
