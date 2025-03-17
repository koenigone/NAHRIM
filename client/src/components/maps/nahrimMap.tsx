import { Card, CardBody, useColorModeValue, Text } from "@chakra-ui/react";

const NahrimMap = () => {

  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Card bg={bgColor} boxShadow="md" borderRadius="2xl" maxWidth="442" height="690">
      <CardBody>
          <Text>Nahrim map</Text>
      </CardBody>
    </Card>
  );
};

export default NahrimMap;