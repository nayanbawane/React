import { useCallback, useMemo, useState } from 'react';
import type { FillingDetailsFormData } from 'phoenix-common-react';
import { initialFillingDetailsFormData, useGetListBox, filingByListBoxConfig } from 'phoenix-common-react';

export const useFillingDetails = (officeId:string,moduleCode:string) => {
  const [formData, setFormData] = useState<FillingDetailsFormData>(
    initialFillingDetailsFormData
  );

  const { data: fillingByOptions } = useGetListBox(
    filingByListBoxConfig(moduleCode, officeId)
  );

  const handleFieldChange = useCallback(
    (field: keyof FillingDetailsFormData, value: string) => {
      setFormData((prev) =>
        prev[field] === value ? prev : { ...prev  , [field]: value }
      );
    },
    []
  );

  const bulkUpdate = useCallback((data: Partial<FillingDetailsFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  return useMemo(
    () => ({
      fillingDetailsFormData: formData,
      fillingByOptions,
      handleFieldChange,
      bulkUpdate,
    }),
    [formData, fillingByOptions, handleFieldChange, bulkUpdate]
  );
};
