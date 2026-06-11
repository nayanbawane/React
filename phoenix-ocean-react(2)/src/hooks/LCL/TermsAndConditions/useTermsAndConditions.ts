import { useState } from 'react';

export const useTermsAndConditions = () => {
  const [info, setInfo] = useState<string>('Work in progress, will be updated soon.');

  const handleTermsChange = (newInfo: string) => {
    setInfo(newInfo);
  };

  return {
    termsInfo: info,
    handleTermsChange,
  };
};