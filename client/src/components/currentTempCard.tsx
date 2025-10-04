import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { WindyData, OpenWeatherMapData, METMalaysiaData } from "./types";
import {
  Card,
  CardBody,
  Text,
  Flex,
  Center,
  CircularProgress,
  CircularProgressLabel,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTemperature1 } from "@fortawesome/free-solid-svg-icons";
import { calculateAverage, formatTemp } from "./utils";
import { useDataSource } from "../../context/dataSourceContext";

const CurrentTempCard = () => {
  const { dataSource } = useDataSource();
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState<
    WindyData | OpenWeatherMapData | METMalaysiaData | null
  >(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = "";
        switch (dataSource) {
          case "Windy":
            endpoint = "/api/windyDailyData";
            break;
          case "OpenWeatherMap":
            endpoint = "/api/owmDailyData";
            break;
          case "METMalaysia":
            endpoint = "/api/mmDailyData";
            break;
          default:
            endpoint = "/api/windyDailyData";
        }

        const { data } = await axios.get(endpoint);
        if (data?.data?.length) setTodayData(data.data[0]);
      } catch (error) {
        toast.error(`Error fetching ${dataSource} data`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataSource]);

  const getTemperatureColor = (temp: number) => {
    const ratio = Math.min(temp / 50, 1);
    return `rgb(${Math.round(255 * ratio)}, ${Math.round(255 * (1 - ratio))}, 0)`;
  };

  const getTemps = () => {
    if (!todayData) return { min: 0, max: 0, avg: 0 };

    switch (dataSource) {
      case "Windy":
        const windyData = todayData as WindyData;
        return {
          min: windyData.Win_Min,
          max: windyData.Win_Max,
          avg: calculateAverage(windyData.Win_Min, windyData.Win_Max),
        };
      case "OpenWeatherMap":
        const owmData = todayData as OpenWeatherMapData;
        return {
          min: owmData.OWM_Min,
          max: owmData.OWM_Max,
          avg: calculateAverage(owmData.OWM_Min, owmData.OWM_Max),
        };
      case "METMalaysia":
        const mmData = todayData as METMalaysiaData;
        return {
          min: mmData.MM_Min,
          max: mmData.MM_Max,
          avg: calculateAverage(mmData.MM_Min, mmData.MM_Max),
        };
      default:
        return { min: 0, max: 0, avg: 0 };
    }
  };

  const renderTempCircle = (value: number, label: string, size = "3xl") => (
    <CircularProgress
      value={(value / 50) * 100}
      size="170px"
      thickness="8px"
      trackColor="transparent"
      color={getTemperatureColor(value)}
    >
      <CircularProgressLabel>
        <Text fontSize={size} fontWeight="bold">
          {formatTemp(value)}
        </Text>
        <Text fontSize="sm" color="whiteAlpha.800">
          {label}
        </Text>
      </CircularProgressLabel>
    </CircularProgress>
  );

  const renderSkeleton = () => (
    <Flex direction="column" align="center" justify="center">
      <Skeleton height="24px" width="120px" mb={4} />
      <Flex mt={4} justify="space-between" width="100%">
        {[...Array(3)].map((_, i) => (
          <Flex key={i} direction="column" align="center">
            <SkeletonCircle size="170px" />
            <Skeleton height="18px" width="50px" mt={2} />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );

  if (loading) return renderSkeleton();

  const { min, max, avg } = getTemps();

  return (
    <Card
      bg="rgba(0, 0, 0, 0.49)"
      backdropFilter="blur(10px)"
      color="whiteAlpha.800"
      p={6}
      boxShadow="0 4px 20px rgba(0,0,0,0.1)"
      borderRadius="16px"
      w="100%"
      maxW={{ base: "100%",  sm: "650", md: "700px", lg: "1000px", xl: "1200px" }}
      maxH={{ base: "250px", sm: "280px", md: "300px", lg: "319px", xl: "500px" }}
      mx="auto"
    >
      <CardBody h="100%">
        {todayData ? (
          <Flex direction="column" align="center" justify="center">
            <Text fontSize="2xl" fontWeight="bold" mb={4}>
              <FontAwesomeIcon icon={faTemperature1} /> Today ({dataSource})
            </Text>
            <Flex mt={4} justify="space-between" width="100%">
              <Flex direction="column" align="center">
                {renderTempCircle(min, "Min")}
              </Flex>
              <Flex direction="column" align="center">
                {renderTempCircle(max, "Max", "4xl")}
              </Flex>
              <Flex direction="column" align="center">
                {renderTempCircle(avg, "Avg")}
              </Flex>
            </Flex>
          </Flex>
        ) : (
          <Center>
            <Text color="whiteAlpha.800">No data available for today</Text>
          </Center>
        )}
      </CardBody>
    </Card>
  );
};

export default CurrentTempCard;