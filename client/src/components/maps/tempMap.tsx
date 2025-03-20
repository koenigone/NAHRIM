import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Text, Flex } from "@chakra-ui/react";

// interface WindyDataPoint {
//   lat: number;
//   lon: number;
//   temperature: number;
//   date: string;
// }

const TempMap = () => {
  // const getColor = (temp: number) => {
  //   return temp > 28 ? "#C43031" : temp > 26 ? "#EFCE11" : "#3FAA37";
  // };

  return (
    <>
      <Flex
        justifyContent="center"
        gap={4}
        alignItems="center"
        marginBottom={4}
      >
        <Text fontSize={27} fontWeight="bold">
          TempMap
        </Text>
      </Flex>

      <MapContainer
        center={[5.4, 100.3]}
        zoom={11}
        style={{ width: "442px", height: "630px", borderRadius: "10px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, 
            &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; 
            <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </>
  );
};

export default TempMap;
