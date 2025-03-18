import { useEffect, useState } from 'react';
import axios from 'axios';
import { WindyData } from './types';
import { Card, CardBody, useColorModeValue } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const TemperatureChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const gridColor = useColorModeValue('#e2e8f0', '#2d3748');

  const calculateAverage = (min:number, max:number) => {
    return ((min + max) / 2);
  }

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/windyWeeklyData');
        const windyTableData = response.data.data;

        const transformedChartData = windyTableData.map((item: WindyData) => {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return {
            day: days[new Date(item.Win_Date).getDay()],
            min: item.Win_Min,
            max: item.Win_Max,
            avg: Math.round(calculateAverage(item.Win_Min, item.Win_Max))
          };
        });

        setChartData(transformedChartData);
      } catch (error) {
        toast.error('Error fetching weekly chart data:' + error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card bg={bgColor} p={6} boxShadow="md" borderRadius="2xl" maxWidth="700" maxHeight="319">
      <CardBody>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis unit="°C" tickLine={false} axisLine={false} domain={[0, 40]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2D2D2D",
                border: "none",
                borderRadius: "5px",
                color: '#E0E0E0',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="min" stroke="#3dad35" strokeWidth={3} dot={{ r: 5, fill: '#1874bb' }} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="max" stroke="#1874bb" strokeWidth={3} dot={{ r: 5, fill: '#3dad35' }} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="avg" stroke="#94c122" strokeWidth={3} dot={{ r: 5, fill: '#1874bb' }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default TemperatureChart;