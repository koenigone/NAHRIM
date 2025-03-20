import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Text, Flex } from "@chakra-ui/react";

interface WindyDataPoint {
  lat: number;
  lon: number;
  temperature: number;
  date: string;
}

const WindyMap = () => {
  const [windyData, setWindyData] = useState<WindyDataPoint[]>([]);

  useEffect(() => {
    const fetchWindyData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/windyMapData");
        if (!response.ok) {
          // Log the full response for debugging
          console.error("Response not OK:", response.status, response.statusText);
          const text = await response.text();
          console.error("Response text:", text);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Data:", data);
        setWindyData(data);
      } catch (error) {
        console.error("Error fetching Windy data:", error);
      }
    };
  
    fetchWindyData();
  }, []);

  const getColor = (temp: number) => {
    return temp > 28 ? "#C43031" : temp > 26 ? "#EFCE11" : "#3FAA37";
  };

  return (
    <>
      <Flex
        justifyContent="center"
        gap={4}
        alignItems="center"
        marginBottom={4}
      >
        <Text fontSize={27} fontWeight="bold">
          Windy.com
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

        {windyData.map((point, index) => (
          <CircleMarker
            key={index}
            center={[point.lat, point.lon]}
            radius={10}
            fillColor={getColor(point.temperature)}
            color="#000"
            weight={1}
            opacity={1}
            fillOpacity={0.9}
          >
            <Tooltip direction="top" offset={[0, -10]} permanent>
              <span className="temperature-label">
                {Math.round(point.temperature)}°C
              </span>
            </Tooltip>
            <Popup>
              <strong>Temp:</strong> {Math.round(point.temperature)}°C
              <br />
              <strong>Date:</strong> {point.date}
              <br />
              <strong>Lat:</strong> {point.lat}
              <br />
              <strong>Lon:</strong> {point.lon}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </>
  );
};

export default WindyMap;