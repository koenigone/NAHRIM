import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import forecastbgImg from "../assets/cloudbg.png";
import { WindyData } from "./types";
import {
  Card,
  CardBody,
  Text,
  Flex,
  Box,
  Center,
  SimpleGrid,
  Tooltip,
  Image,
  Skeleton,
} from "@chakra-ui/react";
import {
  calculateAverage,
  getMonthName,
  getDayOfWeek,
  formatDate,
  formatDateFull,
} from "./utils";

const WeatherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState<WindyData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WindyData[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/windyWeeklyData"
        );
        const windyTableData = response.data.data;

        const today = new Date().toISOString().split("T")[0]; // get today
        const todayData = windyTableData.find(
          (data: WindyData) => data.Win_Date === today
        );
        setTodayData(todayData || null);

        // filter data for Monday to Friday
        setWeeklyData(windyTableData.slice(0, 5)); // First 5 days
      } catch (error) {
        toast.error("Error fetching chart forecast chart:" + error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  return (
    <Card
      bg="gray.800"
      p={6}
      color="gray.500"
      boxShadow="md"
      borderRadius="2xl"
      maxWidth="700"
      height="319"
      position="relative"
    >
      <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={0}>
        <Image
          src={forecastbgImg}
          alt="Cloud background"
          opacity={0.1}
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </Box>

      <CardBody position="relative" zIndex={1}>
        {loading ? (
          <Flex direction="column" align="center" justify="center">
            <Skeleton height="24px" width="150px" mb={4} />
            <SimpleGrid columns={5} spacing={4} mb={4}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Box key={index} textAlign="center">
                  <Skeleton height="18px" width="50px" mb={2} />
                  <Skeleton height="24px" width="40px" />
                </Box>
              ))}
            </SimpleGrid>
            <Flex
              direction="row"
              align="center"
              justify="space-between"
              px={4}
              width="100%"
            >
              <Box>
                <Skeleton height="28px" width="100px" mb={2} />
                <Skeleton height="36px" width="80px" />
                <Skeleton height="18px" width="50px" mt={2} />
              </Box>
              <Box textAlign="right">
                <Skeleton height="28px" width="150px" mb={4} />
                <Skeleton height="24px" width="100px" />
              </Box>
            </Flex>
          </Flex>
        ) : todayData ? (
          <Flex direction="column">
            <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">
              {getMonthName(todayData.Win_Date)}
            </Text>

            <SimpleGrid columns={5} spacing={4} mb={4}>
              {weeklyData.map((data, index) => (
                <Box key={index} textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    {formatDate(data.Win_Date)}
                  </Text>
                  <Tooltip label="Average" bg="gray.500" hasArrow>
                    <Text fontSize="lg" fontWeight="bold">
                      {calculateAverage(data.Win_Min, data.Win_Max)}°c
                    </Text>
                  </Tooltip>
                </Box>
              ))}
            </SimpleGrid>

            <Flex direction="row" align="center" justify="space-between" px={4}>
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  Penang
                </Text>
                <Text fontSize="4xl" fontWeight="bold" mt={2}>
                  {todayData.Win_Current}°c
                </Text>
                <Text fontSize="lg" color="gray.500" mt={2}>
                  Now
                </Text>
              </Box>

              <Box textAlign="right">
                <Box mb={4}>
                  <Text fontSize="3xl" fontWeight="bold" color="gray.500">
                    {formatDateFull(todayData.Win_Date)}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.500">
                    {getDayOfWeek(todayData.Win_Date)}
                  </Text>
                </Box>
              </Box>
            </Flex>
          </Flex>
        ) : (
          <Center>
            <Text>No data available</Text>
          </Center>
        )}
      </CardBody>
    </Card>
  );
};

export default WeatherDashboard;