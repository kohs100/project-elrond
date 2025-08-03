import MapCanvas from '../components/MapCanvas';
import { useSearchParams } from 'react-router-dom';

const FullMap = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mapid = searchParams.get("mapid");

  if (mapid) {
    return <MapCanvas mapName={mapid} />;
  } else {
    setSearchParams("d1_e456");
    return <></>
  }

}

export default FullMap