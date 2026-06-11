import { LocationInformation } from 'phoenix-common-react';

type Props = {
  data?: { publicInfo?: string; privateInfo?: string };
  loading?: boolean;
};

const LocationInfo = ({ data, loading }: Props) => {
  return <LocationInformation data={data} loading={loading} />;
};

export default LocationInfo;