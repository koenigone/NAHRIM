import { Flex, Grid, GridItem } from "@chakra-ui/react";
import TemperatureChart from "../../components/tempChart";
import ForecastCard from "../../components/forecastCard";
import CurrentTempCard from "../../components/currentTempCard";
import ComparisonChart from "../../components/comparisonChart";

const DataDashboard = () => {
  return (
    <Flex direction="column" align="center" justify="center" p={4}>
      <Grid
        templateColumns="repeat(2, 1fr)"
        gap={4}
        width="100%"
        maxWidth="1400px"
      >
        <GridItem><CurrentTempCard /></GridItem>
        <GridItem><ForecastCard /></GridItem>
        <GridItem><TemperatureChart /></GridItem>
        <GridItem><ComparisonChart /></GridItem>
      </Grid>
    </Flex>
  );
};

export default DataDashboard;
