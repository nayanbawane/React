import React, { createContext, useContext, useState } from 'react';

type LocationContextType = {
  locationData: any;
  setLocationData: (data: any) => void;
};

export const LocationContext = createContext<LocationContextType >(
  {} as LocationContextType);
export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [locationData, setLocationData] = useState<any>("");

  return (
    <LocationContext.Provider value={{ locationData, setLocationData }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within LocationProvider');
  }
  return context;
};
