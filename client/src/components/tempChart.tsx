import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { WindyData, OpenWeatherMapData, METMalaysiaData } from "./types";
import { Card, CardBody } from "@chakra-ui/react";
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

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        let endpoint = "";
        switch (dataSource) {
          case "Windy":
            endpoint = "http://localhost:3000/api/windyWeeklyData";
            break;
          case "OpenWeatherMap":
            endpoint = "http://localhost:3000/api/owmWeeklyData";
            break;
          case "METMalaysia":
            endpoint = "http://localhost:3000/api/mmWeeklyData";
            break;
          default:
            endpoint = "http://localhost:3000/api/windyWeeklyData";
        }

        const response = await axios.get(endpoint);
        const weeklyData = response.data.data;

        const transformedChartData = weeklyData.map(
          (item: WindyData | OpenWeatherMapData | METMalaysiaData) => {
            let dbDate, minTemp, maxTemp;

            switch (dataSource) {
              case "Windy":
                dbDate = (item as WindyData).Win_Date;
                minTemp = (item as WindyData).Win_Min;
                maxTemp = (item as WindyData).Win_Max;
                break;
              case "OpenWeatherMap":
                dbDate = (item as OpenWeatherMapData).OWM_Date;
                minTemp = (item as OpenWeatherMapData).OWM_Min;
                maxTemp = (item as OpenWeatherMapData).OWM_Max;
                break;
              case "METMalaysia":
                dbDate = (item as METMalaysiaData).MM_Date;
                minTemp = (item as METMalaysiaData).MM_Min;
                maxTemp = (item as METMalaysiaData).MM_Max;
                break;
              default:
                dbDate = (item as WindyData).Win_Date;
                minTemp = (item as WindyData).Win_Min;
                maxTemp = (item as WindyData).Win_Max;
            }

            return {
              date: dbDate,
              day: getDayOfWeek(dbDate).substring(0, 3),
              formattedDate: formatDate(dbDate),
              min: minTemp,
              max: maxTemp,
              avg: calculateAverage(minTemp, maxTemp),
            };
          }
        );

        setChartData(transformedChartData);
      } catch (error) {
        toast.error(`Error fetching ${dataSource} weekly data: ${error}`);
      }
    };

    fetchChartData();
  }, [dataSource]);

  return (
    <Card
      bg="rgba(0, 0, 0, 0.49)"
      backdropFilter="blur(10px)"
      color="whiteAlpha.800"
      p={6}
      boxShadow="0 4px 20px rgba(0,0,0,0.1)"
      borderRadius="16px"
      maxWidth="700"
      height="319"
    >
      <CardBody>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              stroke="rgba(250, 250, 250, 0.3)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "rgba(255, 255, 255, 0.8)",
                fontSize: 12,
              }}
            />
            <YAxis
              unit="°C"
              tickLine={false}
              axisLine={false}
              domain={[0, 40]}
              tick={{
                fill: "rgba(255, 255, 255, 0.8)",
                fontSize: 12,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2D2D2D",
                border: "none",
                borderRadius: "5px",
              }}
              formatter={(value: number, name: string) => [
                `${value}°c`,
                name.replace(" Temp", ""),
              ]}
              labelFormatter={(label) => {
                const item = chartData.find((d) => d.day === label);
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
              dot={{ r: 5, fill: "#3dad35" }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="max"
              name="Max"
              stroke="#78c1ea"
              strokeWidth={3}
              dot={{ r: 5, fill: "#78c1ea" }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="avg"
              name="Avg"
              stroke="#94c122"
              strokeWidth={3}
              dot={{ r: 5, fill: "#94c122" }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default TemperatureChart;