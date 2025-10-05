import { Flex, Grid, GridItem } from "@chakra-ui/react";
import TemperatureChart from "../../components/tempChart";
import ForecastCard from "../../components/forecastCard";
import CurrentTempCard from "../../components/currentTempCard";
import ComparisonChart from "../../components/comparisonChart";

const DataDashboard = () => {
  return (
    <Flex direction="column" align="center" justify="center" p={{ base: 2, md: 4, lg: 8 }}>
      <Grid
        templateColumns={{
          base: "1fr",
          md: "1fr",
          lg: "repeat(2, 1fr)",
          xl: "repeat(2, 1fr)",
        }}
        gap={{ base: 4, md: 6, lg: 8 }}
        width="100%"
        maxWidth="1980px"
      >
        <GridItem>
          <CurrentTempCard />
        </GridItem>

        <GridItem>
          <ForecastCard />
        </GridItem>

        <GridItem>
          <TemperatureChart />
        </GridItem>

        <GridItem>
          <ComparisonChart />
        </GridItem>
      </Grid>
    </Flex>
  );
};

export default DataDashboard;