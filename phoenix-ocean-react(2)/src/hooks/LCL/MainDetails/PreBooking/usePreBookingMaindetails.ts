import { useState } from 'react';
import {
  getInitialPreBookingFormData,
  PreBookingFormData,
} from 'phoenix-common-react';

export const usePreBokingMainDetails = () => {
  const [formData, setFormData] = useState<PreBookingFormData>(
    getInitialPreBookingFormData()
  );

  // const handelpreBookingChange = <K extends keyof PreBookingFormData>(
  //   name: K,
  //   value: PreBookingFormData[K]
  // ) => {
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };
  const handleMainDetailsChange = (data: Partial<PreBookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };
  const resetMainDetails = () => {
    setFormData(getInitialPreBookingFormData());
  };

  return {
    preBookingFormData: formData,
    handleMainDetailsChange,
    resetMainDetails,
  };
};
