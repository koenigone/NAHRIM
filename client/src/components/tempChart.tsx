import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { WindyData, OpenWeatherMapData } from "./types";
import { Card, CardBody, useColorModeValue } from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { calculateAverage, getDayOfWeek, formatDate } from "./utils";
import { useDataSource } from "../../context/dataSourceContext";

const TemperatureChart = () => {
  const { dataSource } = useDataSource();
  const [chartData, setChartData] = useState<any[]>([]);
  const gridColor = useColorModeValue("#e2e8f0", "#2d3748");

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const endpoint = dataSource === "Windy" 
          ? "http://localhost:3000/api/windyWeeklyData" 
          : "http://localhost:3000/api/owmWeeklyData";

        const response = await axios.get(endpoint);
        const weeklyData = response.data.data;

        const transformedChartData = weeklyData.map((item: WindyData | OpenWeatherMapData) => {
          const dbDate = dataSource === "Windy" 
            ? (item as WindyData).Win_Date 
            : (item as OpenWeatherMapData).OWM_Date;

          // Get temperatures from the correct fields
          const minTemp = dataSource === "Windy" 
            ? (item as WindyData).Win_Min 
            : (item as OpenWeatherMapData).OWM_Min;
          const maxTemp = dataSource === "Windy" 
            ? (item as WindyData).Win_Max 
            : (item as OpenWeatherMapData).OWM_Max;

          return {
            date: dbDate,
            day: getDayOfWeek(dbDate).substring(0, 3),
            formattedDate: formatDate(dbDate),
            min: minTemp,
            max: maxTemp,
            avg: calculateAverage(minTemp, maxTemp),
          };
        });
        
        setChartData(transformedChartData);
      } catch (error) {
        toast.error(`Error fetching ${dataSource} weekly data: ${error}`);
      }
    };

    fetchChartData();
  }, [dataSource]);

  return (
    <Card
      bg="gray.800"
      p={6}
      boxShadow="md"
      borderRadius="2xl"
      maxWidth="700"
      maxHeight="319"
    >
      <CardBody>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis
              unit="°C"
              tickLine={false}
              axisLine={false}
              domain={[0, 40]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2D2D2D",
                border: "none",
                borderRadius: "5px",
                color: "#E0E0E0",
              }}
              formatter={(value: number, name: string) => [
                `${value}°c`,
                name.replace(' Temp', '')
              ]}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.day === label);
                return item ? `${item.day}, ${item.formattedDate}` : label;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="min"
              name="Min"
              stroke="#3dad35"
              strokeWidth={3}
              dot={{ r: 5, fill: "#1874bb" }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="max"
              name="Max"
              stroke="#1874bb"
              strokeWidth={3}
              dot={{ r: 5, fill: "#3dad35" }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="avg"
              name="Avg"
              stroke="#94c122"
              strokeWidth={3}
              dot={{ r: 5, fill: "#1874bb" }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default TemperatureChart;