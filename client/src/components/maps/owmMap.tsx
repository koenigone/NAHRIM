import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getColor } from "../utils";
import { Text, Flex } from "@chakra-ui/react";
import toast from "react-hot-toast";

interface OWMDataPoint {
  name: string;
  lat: number;
  lon: number;
  temperature: number;
  humidity?: number;
  windSpeed?: number;
  weatherCondition?: string;
  date: string;
}

const OWMMap = () => {
  const [owmData, setOWMData] = useState<OWMDataPoint[]>([]);

  useEffect(() => { // retrieve map data from backend
    const fetchOWMData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/owmMapData");
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
        }
        
        const data = await response.json();
        setOWMData(data);
      } catch (error) {
        toast.error("Error retrieving map data for OpenWeatherMap");
      }
    };
  
    fetchOWMData();
  }, []);


  return (
    <>
      <Flex justifyContent="center" gap={4} alignItems="center" marginBottom={4}>
        <Text fontSize={27} fontWeight="bold">
          OpenWeatherMap
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

        {owmData.map((point, index) => (
          <CircleMarker
            key={`${point.name}-${index}`}
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
              <strong>{point.name}</strong>
              <br />
              <strong>Temp:</strong> {Math.round(point.temperature)}°C
              <br />
              <strong>Date:</strong> {point.date}
              <br />
              <strong>Lat</strong> {point.lat.toFixed(4)}
              <br />
              <strong>Lon</strong> {point.lon.toFixed(4)}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </>
  );
};

export default OWMMap;