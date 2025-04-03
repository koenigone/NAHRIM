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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOWMData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3000/api/owmMapData");
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Fetched OpenWeatherMap Data:", data);
        setOWMData(data);
      } catch (error) {
        console.error("Error fetching OpenWeatherMap data:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchOWMData();
  }, []);

  const getColor = (temp: number) => {
    return temp > 28 ? "#C43031" : temp > 26 ? "#EFCE11" : "#3FAA37";
  };

  const getWeatherIcon = (condition?: string) => {
    if (!condition) return "☁️";
    const conditions = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Fog: "🌫️",
      Drizzle: "🌦️"
    };
    return conditions[condition as keyof typeof conditions] || "☁️";
  };

  if (isLoading) return <Text>Loading weather data...</Text>;
  if (error) return <Text color="red.500">Error: {error}</Text>;

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
                {Math.round(point.temperature)}°C {getWeatherIcon(point.weatherCondition)}
              </span>
            </Tooltip>
            <Popup>
              <strong>{point.name}</strong>
              <br />
              <strong>Temp:</strong> {Math.round(point.temperature)}°C
              <br />
              <strong>Condition:</strong> {point.weatherCondition || "N/A"} {getWeatherIcon(point.weatherCondition)}
              <br />
              <strong>Humidity:</strong> {point.humidity || "N/A"}%
              <br />
              <strong>Wind:</strong> {point.windSpeed || "N/A"} m/s
              <br />
              <strong>Date:</strong> {point.date}
              <br />
              <strong>Coordinates:</strong> {point.lat.toFixed(4)}, {point.lon.toFixed(4)}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </>
  );
};

export default OWMMap;