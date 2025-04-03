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
import { Card, CardBody, useColorModeValue } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { calculateAverage } from "./utils";
import { useDataSource } from "../../context/dataSourceContext";

const ComparisonChart = () => {
  const [data, setData] = useState<any[]>([]);
  const gridColor = useColorModeValue("#e2e8f0", "#2d3748");
  const { dataSource } = useDataSource();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const windyResponse = await axios.get(        // windy data
          "http://localhost:3000/api/windyDailyData"
        );
        const windyData = windyResponse.data.data;

        const owmResponse = await axios.get(          // openWeatherMap data
          "http://localhost:3000/api/owmDailyData"
        );
        const owmData = owmResponse.data.data;

        if (windyData.length > 0 && owmData.length > 0) {
          const windyToday = windyData[0];
          const owmToday = owmData[0];
          
          const chartData = [
            {
              name: "Windy.com",
              average: windyToday.Win_Min != null && windyToday.Win_Max != null ? calculateAverage(windyToday.Win_Min, windyToday.Win_Max) : "N/A",
              min: windyToday.Win_Min ?? 0,
              max: windyToday.Win_Max ?? 0,
              source: "windy",
            },
            {
              name: "OpenWeatherMap",
              average: owmToday.OWM_Min != null && owmToday.OWM_Max != null ? calculateAverage(owmToday.OWM_Min, owmToday.OWM_Max) : "N/A",
              min: owmToday.OWM_Min ?? 0,
              max: owmToday.OWM_Max ?? 0,
              source: "owm",
            }
          ];

          setData(chartData);
        }
      } catch (error) {
        toast.error("Error fetching comparison data:" + error);
      }
    };

    fetchData();
  }, [dataSource]); // refetch when data source changes

  return (
    <Card
      bg="gray.800"
      p={6}
      boxShadow="md"
      borderRadius="2xl"
      maxWidth="700"
      height="319"
    >
      <CardBody>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              domain={[0, 'dataMax + 5']}
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
              labelFormatter={(label) => `Source: ${label}`}
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