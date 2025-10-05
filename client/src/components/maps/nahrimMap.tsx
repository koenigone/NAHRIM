import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  MapContainer,
  TileLayer,
  Popup,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getColor } from "../utils";
import { Select, Text, Flex } from "@chakra-ui/react";

interface DataPoint {
  Year: number;
  Month: number;
  Day: number;
  Latitude: number;
  Longitude: number;
  RCP4_5_Avg: number;
}

const NahrimMap = () => {
  const [selectedDate, setSelectedDate] = useState("2025-03-01");
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [csvData, setCsvData] = useState<DataPoint[]>([]);

  useEffect(() => { // load and parse CSV file
    Papa.parse("/src/data/Temp_PP_aveRCP_MacApr_2025_2030.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        const cleanedData = result.data.map((row: any) =>
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
              key.trim().replace(/\./g, "_"),
              value,
            ])
          )
        );
        setCsvData(cleanedData as unknown as DataPoint[]);
      },
    });
  }, []);

  useEffect(() => {
    if (csvData.length > 0) {
      const formattedDate = selectedDate.trim();
      const filtered = csvData.filter((d) => {
        const dataDate = `${d.Year}-${String(d.Month).padStart(2, "0")}-${String(d.Day).padStart(2, "0")}`;
        if (dataDate === formattedDate) {
          return true;
        }
        return false;
      });

      setFilteredData(filtered);
    }
  }, [selectedDate, csvData]);

  // generate unique dates for the dropdown
  const dates = Array.from(
    new Set(
      csvData
        .filter((d) => d.Year && d.Month && d.Day) // make sure data exists within the file
        .map((d) => `${d.Year}-${String(d.Month).padStart(2, "0")}-${String(d.Day).padStart(2, "0")}`)
    )
  );

  return (
    <>
      <Flex
        justifyContent="center"
        gap={4}
        alignItems="center"
        marginBottom={4}
      >
        <Select
          onChange={(e) => setSelectedDate(e.target.value)}
          value={selectedDate}
          width={200}
          color="white"
          sx={{
            "& > option": {
              background: "gray.700",
              color: "white",
            },
            "& > option:hover": {
              background: "gray.600 !important",
            },
          }}
          aria-label="Select date"
        >
          {dates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </Select>
        <Text fontSize={30} fontWeight="bold">
          NAHRIM
        </Text>
      </Flex>
      <MapContainer
        center={[5.4, 100.3]}
        zoom={11}
        style={{ width: "542px", height: "1030px", borderRadius: "10px" }}
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
                <span className="temperature-label">
                  {Math.round(point.RCP4_5_Avg)}°C
                </span>
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