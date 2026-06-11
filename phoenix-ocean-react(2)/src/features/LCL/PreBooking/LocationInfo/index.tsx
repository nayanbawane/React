import { LocationInformation } from 'phoenix-common-react';

const PreBookingLocationInfo = ({ locationInfo }: any) => {
  return (
    <LocationInformation
      onRegisterFields={(fields: string[]) =>
        console.warn('Registered fields in LocationInfo:', fields)
      }
      onFieldsChange={locationInfo.handleLocationInfoChange}
    />
  );
};

export default PreBookingLocationInfo;
