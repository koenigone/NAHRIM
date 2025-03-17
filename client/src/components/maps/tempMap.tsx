import { Card, CardBody, useColorModeValue, Text } from "@chakra-ui/react";

const MOMap = () => {

  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Card bg={bgColor} boxShadow="md" borderRadius="2xl" maxWidth="442" height="690">
      <CardBody>
          <Text>temp map</Text>
      </CardBody>
    </Card>
  );
};

export default MOMap;