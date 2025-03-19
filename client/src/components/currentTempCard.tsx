import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { WindyData } from "./types";
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
import { calculateAverage } from "./utils";

const CurrentTempCard = () => {
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState<WindyData | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/windyDailyData"
        );
        const windyTableData = response.data.data;

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

  const getTemperatureColor = (temp: number) => {
    const maxTemp = 50;
    const ratio = temp / maxTemp;
    const red = Math.round(255 * ratio);
    const green = Math.round(255 * (1 - ratio));
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <Card
      bg="gray.800"
      color="gray.500"
      p={6}
      boxShadow="md"
      borderRadius="2xl"
      maxWidth="700"
      height="319"
      position="relative"
      overflow="hidden"
    >
      <CardBody>
        {loading ? (
          <Flex direction="column" align="center" justify="center">
            <Skeleton height="24px" width="120px" mb={4} />
            <Flex mt={4} justify="space-between" width="100%">
              <Flex direction="column" align="center">
                <SkeletonCircle size="170px" />
                <Skeleton height="18px" width="50px" mt={2} />
              </Flex>
              <Flex direction="column" align="center">
                <SkeletonCircle size="170px" />
                <Skeleton height="18px" width="50px" mt={2} />
              </Flex>
              <Flex direction="column" align="center">
                <SkeletonCircle size="170px" />
                <Skeleton height="18px" width="50px" mt={2} />
              </Flex>
            </Flex>
          </Flex>
        ) : todayData ? (
          <Flex direction="column" align="center" justify="center">
            <Text fontSize="2xl" fontWeight="bold" mb={4}>
              <FontAwesomeIcon icon={faTemperature1} /> Today
            </Text>
            <Flex mt={4} justify="space-between" width="100%">
              <Flex direction="column" align="center">
                <CircularProgress
                  value={(todayData.Win_Min / 50) * 100}
                  size="170px"
                  thickness="8px"
                  trackColor="transparent"
                  color={getTemperatureColor(todayData.Win_Min)}
                >
                  <CircularProgressLabel>
                    <Text fontSize="3xl" fontWeight="bold">
                      {todayData.Win_Min}°c
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Min
                    </Text>
                  </CircularProgressLabel>
                </CircularProgress>
              </Flex>
              <Flex direction="column" align="center">
                <CircularProgress
                  value={(todayData.Win_Max / 50) * 100}
                  size="170px"
                  thickness="8px"
                  trackColor="transparent"
                  color={getTemperatureColor(todayData.Win_Max)}
                >
                  <CircularProgressLabel>
                    <Text fontSize="4xl" fontWeight="bold">
                      {todayData.Win_Max}°c
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Max
                    </Text>
                  </CircularProgressLabel>
                </CircularProgress>
              </Flex>
              <Flex direction="column" align="center">
                <CircularProgress
                  value={
                  (calculateAverage(todayData.Win_Min, todayData.Win_Max) / 50) * 100}
                  size="170px"
                  thickness="8px"
                  trackColor="transparent"
                  color={getTemperatureColor(
                    calculateAverage(todayData.Win_Min, todayData.Win_Max)
                  )}
                >
                  <CircularProgressLabel>
                    <Text fontSize="3xl" fontWeight="bold">
                      {calculateAverage(todayData.Win_Min, todayData.Win_Max)}°c
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Avg
                    </Text>
                  </CircularProgressLabel>
                </CircularProgress>
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