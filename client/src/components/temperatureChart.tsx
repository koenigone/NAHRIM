import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardBody, useColorModeValue } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WindyData {
  Win_Date: string;
  Win_Min: number;
  Win_Max: number;
}

const TemperatureChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/windy');
        const windyTableData = response.data.data;

        const transformedChartData = windyTableData.map((item: WindyData) => {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return {
            day: days[new Date(item.Win_Date).getDay()],
            min: item.Win_Min,
            max: item.Win_Max,
          };
        });

        setChartData(transformedChartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const bgColor = useColorModeValue('white', 'gray.800');
  const gridColor = useColorModeValue('#e2e8f0', '#2d3748');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card bg={bgColor} p={6} boxShadow="sm" borderRadius="2xl" maxWidth="610" maxHeight="319">
      <CardBody>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis unit="°C" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'transparent',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="min" stroke="#1874bb" strokeWidth={3} dot={{ r: 5, fill: '#1874bb' }} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="max" stroke="#3dad35" strokeWidth={3} dot={{ r: 5, fill: '#3dad35' }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default TemperatureChart;