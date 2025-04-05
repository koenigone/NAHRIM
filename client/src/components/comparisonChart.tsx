import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardBody } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { calculateAverage } from "./utils";
import { useDataSource } from "../../context/dataSourceContext";

const ComparisonChart = () => {
  const [data, setData] = useState<any[]>([]);
  const { dataSource } = useDataSource();

  useEffect(() => { // fetch all three data sources
    const fetchData = async () => {
      try {
        const [windyResponse, owmResponse, mmResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/windyDailyData"),
          axios.get("http://localhost:3000/api/owmDailyData"),
          axios.get("http://localhost:3000/api/mmDailyData"),
        ]);

        const windyData = windyResponse.data.data;
        const owmData = owmResponse.data.data;
        const mmData = mmResponse.data.data;

        if (windyData.length > 0 && owmData.length > 0 && mmData.length > 0) {
          const windyToday = windyData[0];
          const owmToday = owmData[0];
          const mmToday = mmData[0];

          const chartData = [
            {
              name: "Windy.com",
              average: calculateAverage(windyToday.Win_Min, windyToday.Win_Max),
              min: windyToday.Win_Min,
              max: windyToday.Win_Max,
              source: "windy",
            },
            {
              name: "OpenWeatherMap",
              average: calculateAverage(owmToday.OWM_Min, owmToday.OWM_Max),
              min: owmToday.OWM_Min,
              max: owmToday.OWM_Max,
              source: "owm",
            },
            {
              name: "METMalaysia",
              average: mmToday.MM_Current,
              min: mmToday.MM_Min,
              max: mmToday.MM_Max,
              source: "metmalaysia",
            },
          ];

          setData(chartData);
        }
      } catch (error) {
        toast.error("Error fetching comparison data:" + error);
      }
    };

    fetchData();
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
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              stroke="rgba(250, 250, 250, 0.3)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "rgba(255, 255, 255, 0.8)",
                fontSize: 12,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[0, "dataMax + 5"]}
              tick={{
                fill: "rgba(255, 255, 255, 0.8)",
                fontSize: 12,
              }}
            />
            <Tooltip
              wrapperStyle={{ fontSize: "14px" }}
              contentStyle={{
                backgroundColor: "#2D2D2D",
                border: "none",
                borderRadius: "5px",
                color: "#E0E0E0",
              }}
              formatter={(value, name) => [`${value}°C`, name]}
              labelFormatter={(label) => {
                const source = data.find((item) => item.name === label)?.source;
                return `${label} (${source})`;
              }}
            />
            <Legend />
            <Bar
              dataKey="min"
              fill="#4fd1c5"
              name="Min"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="max"
              fill="#f56565"
              name="Max"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="average"
              fill="#79c0ea"
              name="Avg"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default ComparisonChart;