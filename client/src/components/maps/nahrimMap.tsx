import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Select, Card, CardBody, Text, Flex } from "@chakra-ui/react";

interface DataPoint {
  Year: number;
  Month: number;
  Day: number;
  Latitude: number;
  Longitude: number;
  RCP4_5_Avg: number; // Fixed key (no spaces)
}

const NahrimMap = () => {
  const [selectedDate, setSelectedDate] = useState("2025-03-01");
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [csvData, setCsvData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Load and parse CSV file
    Papa.parse("/src/data/Temp_PP_aveRCP_MacApr_2025_2030.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        // Sanitize keys (trim spaces)
        const cleanedData = result.data.map((row: any) =>
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
              key.trim().replace(/\./g, "_"),
              value,
            ])
          )
        );
        console.log("Sanitized CSV Data:", cleanedData);
        setCsvData(cleanedData as unknown as DataPoint[]);
      },
    });
  }, []);

  useEffect(() => {
    if (csvData.length > 0) {
      const formattedDate = selectedDate.trim();
      const filtered = csvData.filter((d) => {
        const dataDate = `${d.Year}-${String(d.Month).padStart(
          2,
          "0"
        )}-${String(d.Day).padStart(2, "0")}`;
        if (dataDate === formattedDate) return true;
        console.log(`Skipping: ${dataDate} (Expected: ${formattedDate})`);
        return false;
      });

      setFilteredData(filtered);
      console.log("Filtered Data:", filtered);
    }
  }, [selectedDate, csvData]);

  // Generate unique dates for the dropdown
  const dates = Array.from(
    new Set(
      csvData
        .filter((d) => d.Year && d.Month && d.Day) // Ensure data exists
        .map(
          (d) =>
            `${d.Year}-${String(d.Month).padStart(2, "0")}-${String(
              d.Day
            ).padStart(2, "0")}`
        )
    )
  );

  const getColor = (temp: number) => {
    return temp > 28 ? "#C43031" : temp > 26 ? "#EFCE11" : "#3FAA37";
  };

  return (
    <>
      <Flex justifyContent="center" gap={4} alignItems="center" marginBottom={4}>
        <Select
          onChange={(e) => setSelectedDate(e.target.value)}
          value={selectedDate}
          width={200}
          aria-label="Select date"
        >
          {dates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </Select>
        <Text fontSize={27} fontWeight="bold">NAHRIM</Text>
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
        {filteredData.map((point, index) =>
          point.Latitude && point.Longitude ? (
            <CircleMarker
              key={index}
              center={[point.Latitude, point.Longitude]}
              radius={10}
              fillColor={getColor(point.RCP4_5_Avg)}
              color="#000"
              weight={1}
              opacity={1}
              fillOpacity={0.9}
            >
              <Tooltip direction="top" offset={[0, -10]} permanent>
                <span className="temperature-label">{Math.round(point.RCP4_5_Avg)}°C</span>
              </Tooltip>
              <Popup>
                <strong>Temp:</strong> {Math.round(point.RCP4_5_Avg)}°C
                <br />
                <strong>Date:</strong> {point.Year}-{point.Month}-{point.Day}
                <br />
                <strong>Lat:</strong> {point.Latitude}
                <br />
                <strong>Lon:</strong> {point.Longitude}
              </Popup>
            </CircleMarker>
          ) : null
        )}
      </MapContainer>
    </>
  );
};

export default NahrimMap;