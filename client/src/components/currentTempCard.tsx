import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { WindyData, OpenWeatherMapData } from "./types";
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
  const [todayData, setTodayData] = useState<WindyData | OpenWeatherMapData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = dataSource === "OpenWeatherMap" 
          ? "http://localhost:3000/api/owmDailyData" 
          : "http://localhost:3000/api/windyDailyData";
        
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
    
    if (dataSource === "Windy") {
      const { Win_Min: min, Win_Max: max } = todayData as WindyData;
      return { min, max, avg: calculateAverage(min, max) };
    } else {
      const { OWM_Min: min, OWM_Max: max } = todayData as OpenWeatherMapData;
      return { min, max, avg: calculateAverage(min, max) };
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
        <Text fontSize="sm" color="gray.500">
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
    <Card bg="gray.800" color="gray.500" p={6} boxShadow="md" borderRadius="2xl" maxWidth="700" height="319">
      <CardBody>
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
            <Text>No data available for today</Text>
          </Center>
        )}
      </CardBody>
    </Card>
  );
};

export default CurrentTempCard;