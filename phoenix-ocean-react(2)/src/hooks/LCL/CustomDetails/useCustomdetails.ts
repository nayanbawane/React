import { useCallback, useMemo, useState } from 'react';
import { CustomDetailsFormData, initialCustomDetailsValue } from 'phoenix-common-react';

const hasCustomDetailsChange = (
  prev: CustomDetailsFormData,
  next: Partial<CustomDetailsFormData>
) => Object.entries(next).some(([key, value]) => prev[key as keyof CustomDetailsFormData] !== value);

export const useCustomDetails = () => {
  const [formData, setFormData] = useState<CustomDetailsFormData>(
    initialCustomDetailsValue
  );

  const handleCustomDetails = useCallback((
    field: keyof CustomDetailsFormData,
    value: any
  ) => {
    setFormData((prev) =>
      prev[field] === value
        ? prev
        : {
            ...prev,
            [field]: value,
          }
    );
  }, []);

  const bulkUpdateCustom = useCallback((data: Partial<CustomDetailsFormData>) => {
    setFormData((prev) => (hasCustomDetailsChange(prev, data) ? { ...prev, ...data } : prev));
  }, []);

  return useMemo(() => ({
    customFormData: formData,
    handleCustomDetails,
    bulkUpdateCustom,
  }), [bulkUpdateCustom, formData, handleCustomDetails]);
};
