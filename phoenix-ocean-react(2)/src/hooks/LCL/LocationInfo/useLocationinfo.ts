import { LocationInformationData } from 'phoenix-common-react';
import { useState } from 'react';

const initialLocationInfo: LocationInformationData = {
  publicInfo: '',
  privateInfo: '',
};

export const useLocationinfo = () => {
  const [formData, setFormData] = useState<LocationInformationData>(initialLocationInfo);

  const handleLocationInfoChange = (data: LocationInformationData) => {
    setFormData(data);
  };

  return {
    locationInfoFormData: formData,
    handleLocationInfoChange,
  };
};