import { useEffect, useState } from 'react';
import axios from 'axios';
import { WindyData } from './types';
import { Card, CardBody, useColorModeValue, Text, Flex, Box, SimpleGrid } from "@chakra-ui/react";

const WeatherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [todayData, setTodayData] = useState<WindyData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WindyData[]>([]);
  const bgColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/windyWeeklyData');
        const windyTableData = response.data.data;

        const today = new Date().toISOString().split("T")[0]; // get today
        const todayData = windyTableData.find((data: WindyData) => data.Win_Date === today);
        setTodayData(todayData || null);

        // filter data for Monday to Friday
        setWeeklyData(windyTableData.slice(0, 5)); // First 5 days
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  return (
    <Card bg={bgColor} p={6} color="gray.500" boxShadow="md" borderRadius="2xl" maxWidth="700" height="319">
      <CardBody>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text>Error fetching data</Text>
        ) : (
          <Flex direction="column" gap={2}>
            <SimpleGrid columns={5} spacing={4} mb={4}>
              {weeklyData.map((data, index) => (
                <Box key={index} textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][index]}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {data.Win_Current}°c
                  </Text>
                  <Box>
                  <Text fontSize="14px" color="gray.500" fontWeight="bold">
                    {data.Win_Max}°
                  </Text>

                  <Text fontSize="13px" color="gray.400" fontWeight="bold">
                    {data.Win_Min}°
                  </Text>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>

            {todayData && (
              <Flex direction="row" align="center" justify="space-between">
                <Box>
                  <Text fontSize="2xl" fontWeight="bold">
                    Today
                  </Text>
                  <Text fontSize="4xl" fontWeight="bold" mt={2}>
                    {todayData.Win_Current}°C
                  </Text>
                  <Text fontSize="lg" color="gray.500" mt={2}>
                    Sunny
                  </Text>
                </Box>

                <Box textAlign="right">
                  <Box mb={4}>
                    <Text fontSize="sm" color="gray.500">Humidity</Text>
                    <Text fontSize="lg" fontWeight="bold">NULL</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Wind Speed</Text>
                    <Text fontSize="lg" fontWeight="bold">NULL</Text>
                  </Box>
                </Box>
              </Flex>
            )}
          </Flex>
        )}
      </CardBody>
    </Card>
  );
};

export default WeatherDashboard;