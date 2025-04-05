import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import forecastbgImg from "../assets/cloudbg.png";
import { WindyData, OpenWeatherMapData, METMalaysiaData } from "./types";
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
import { useDataSource } from "../../context/dataSourceContext";

const WeatherDashboard = () => {
  const { dataSource } = useDataSource();
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState<WindyData | OpenWeatherMapData | METMalaysiaData | null>(null);
  const [weeklyData, setWeeklyData] = useState<(WindyData | OpenWeatherMapData | METMalaysiaData)[]>([]);

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
  
        // fetch data from backend
        const response = await axios.get(endpoint);
        const tableData = response.data.data;
        const metResponse = await axios.get("http://localhost:3000/api/mmWeeklyData");
        const metTableData = metResponse.data.data;
        const today = new Date().toISOString().split("T")[0];

        // find today's data based on the selected data source
        const todayData = tableData.find((data: any) => {
          switch (dataSource) {
            case "Windy":
              return data.Win_Date === today;
            case "OpenWeatherMap":
              return data.OWM_Date === today;
            case "METMalaysia":
              return data.MM_Date === today;
            default:
              return data.Win_Date === today;
          }
        });
  
        const todayMetData = metTableData.find(
          (data: METMalaysiaData) => data.MM_Date === today
        );
  
        setTodayData(todayData || todayMetData || null);
        setWeeklyData(tableData.slice(0, 5));
      } catch (error) {
        toast.error(`Error fetching ${dataSource} data`);
      } finally {
        setLoading(false);
      }
    };
  
    fetchChartData();
  }, [dataSource]);

  // since METMalaysia doesn't provide current data, use
  // min and max to get the average and display it
  const getCurrentTemp = () => {
    if (!todayData) return 0;
    return "Win_Current" in todayData
      ? (todayData as WindyData).Win_Current
      : "OWM_Current" in todayData
      ? (todayData as OpenWeatherMapData).OWM_Current
      : calculateAverage(todayData.MM_Min, todayData.MM_Max);
  };

  const getDateField = (
    data: WindyData | OpenWeatherMapData | METMalaysiaData
  ) => {
    return "Win_Date" in data
      ? data.Win_Date
      : "OWM_Date" in data
      ? data.OWM_Date
      : data.MM_Date;
  };

  const getMinTemp = (
    data: WindyData | OpenWeatherMapData | METMalaysiaData
  ) => {
    return "Win_Min" in data
      ? data.Win_Min
      : "OWM_Min" in data
      ? data.OWM_Min
      : data.MM_Min;
  };

  const getMaxTemp = (
    data: WindyData | OpenWeatherMapData | METMalaysiaData
  ) => {
    return "Win_Max" in data
      ? data.Win_Max
      : "OWM_Max" in data
      ? data.OWM_Max
      : data.MM_Max;
  };

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
          </Flex>
        ) : todayData ? (
          <Flex direction="column">
            <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">
              {getMonthName(getDateField(todayData))}
            </Text>

            <SimpleGrid columns={5} spacing={4} mb={4}>
              {weeklyData.map((data, index) => (
                <Box key={index} textAlign="center">
                  <Text fontSize="sm">{formatDate(getDateField(data))}</Text>
                  <Tooltip label="Average" bg="gray.500" hasArrow>
                    <Text fontSize="lg" fontWeight="bold">
                      {calculateAverage(getMinTemp(data), getMaxTemp(data))}°c
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
                  {getCurrentTemp()}°c
                </Text>
                <Text fontSize="lg" color="whiteAlpha.700" mt={2}>
                  Now
                </Text>
              </Box>

              <Box textAlign="right">
                <Box mb={4}>
                  <Text fontSize="3xl" fontWeight="bold">
                    {formatDateFull(getDateField(todayData))}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="bold">
                    {getDayOfWeek(getDateField(todayData))}
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