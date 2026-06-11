import { BookingFormState, createDefaultMainDetailsState, useFeatureToggle } from 'phoenix-common-react';
import { useState } from 'react';

export const useBookingMainDetails = (loginBean?: any | null) => {
    const featureToggle = useFeatureToggle();
      const { isVisible } = featureToggle;
  
  const [formData, setFormData] = useState<BookingFormState>(() =>
    createDefaultMainDetailsState(loginBean,isVisible)
  );

  const handleMainDetailsChange = (data: Partial<BookingFormState>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return {
    mainDetailsValue: formData,
    handleMainDetailsChange,
  };
};
