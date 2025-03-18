import { useEffect, useState } from 'react';
import axios from 'axios';
import { WindyData } from './types';
import { Card, CardBody, useColorModeValue, Text, Flex, CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTemperature1 } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const CurrentTempCard = () => {
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [todayData, setTodayData] = useState<WindyData | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/windyDailyData');
        const windyTableData = response.data.data;

        // Assuming the API returns an array, take the first item (today's data)
        if (windyTableData.length > 0) {
          setTodayData(windyTableData[0]);
        }
      } catch (error) {
        toast.error("Error fetching today's data" + error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const bgColor = useColorModeValue("white", "gray.800");

  // Calculate the average temperature
  const calculateAverage = (min: number, max: number) => {
    return  Math.round((min + max) / 2);
  };

  // Function to determine the color based on temperature
  const getTemperatureColor = (temp: number) => {
    const maxTemp = 50;
    const ratio = temp / maxTemp;
    const red = Math.round(255 * ratio);
    const green = Math.round(255 * (1 - ratio));
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <Card bg={bgColor} color="gray.500" p={6} boxShadow="md" borderRadius="2xl" maxWidth="700" height="319" position="relative" overflow="hidden">
      <CardBody>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text>Error fetching data</Text>
        ) : todayData ? (
          <Flex direction="column" align="center" justify="center">
            <Text fontSize="2xl" fontWeight="bold" mb={4}>
              <FontAwesomeIcon icon={faTemperature1} /> {getDayOfWeek(todayData.Win_Date)}
            </Text>
            <Flex mt={4} justify="space-between" width="100%">
              <Flex direction="column" align="center">
                <CircularProgress
                  value={(todayData.Win_Min / 50) * 100}
                  size="170px"
                  thickness="8px"
                  trackColor='transparent'
                  color={getTemperatureColor(todayData.Win_Min)}
                >
                  <CircularProgressLabel>
                    <Text fontSize="3xl" fontWeight="bold">{todayData.Win_Min}°c</Text>
                    <Text fontSize="sm" color="gray.500">Min</Text>
                  </CircularProgressLabel>
                </CircularProgress>
              </Flex>
              <Flex direction="column" align="center">
                <CircularProgress
                  value={(todayData.Win_Max / 50) * 100}
                  size="170px"
                  thickness="8px"
                  trackColor='transparent'
                  color={getTemperatureColor(todayData.Win_Max)}
                >
                  <CircularProgressLabel>
                    <Text fontSize="4xl" fontWeight="bold">{todayData.Win_Max}°c</Text>
                    <Text fontSize="sm" color="gray.500">Max</Text>
                  </CircularProgressLabel>
                </CircularProgress>
              </Flex>
              <Flex direction="column" align="center">
                <CircularProgress
                  value={(calculateAverage(todayData.Win_Min, todayData.Win_Max) / 50) * 100}
                  size="170px"
                  thickness="8px"
                  trackColor='transparent'
                  color={getTemperatureColor(calculateAverage(todayData.Win_Min, todayData.Win_Max))}
                >
                  <CircularProgressLabel>
                    <Text fontSize="3xl" fontWeight="bold">
                      {calculateAverage(todayData.Win_Min, todayData.Win_Max)}°c
                    </Text>
                    <Text fontSize="sm" color="gray.500">Avg</Text>
                  </CircularProgressLabel>
                </CircularProgress>
              </Flex>
            </Flex>
          </Flex>
        ) : (
          <Text>No data available for today</Text>
        )}
      </CardBody>
    </Card>
  );
};

export default CurrentTempCard;