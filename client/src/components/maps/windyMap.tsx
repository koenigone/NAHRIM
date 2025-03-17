import { Card, CardBody, useColorModeValue, Text } from "@chakra-ui/react";

const WindyMap = () => {

  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Card bg={bgColor} boxShadow="md" borderRadius="2xl" maxWidth="442" height="690">
      <CardBody>
          <Text>Windy map</Text>
      </CardBody>
    </Card>
  );
};

export default WindyMap;