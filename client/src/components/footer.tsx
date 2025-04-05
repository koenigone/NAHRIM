import { Box, Text, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  const nahrimLink = "https://www.nahrim.gov.my/";

  const circleIcons = [
    { key: 0, Icon: faCircle, iconColour: "#3FAA37" },
    { key: 1, Icon: faCircle, iconColour: "#EFCE11" },
    { key: 2, Icon: faCircle, iconColour: "#C43031" },
  ];

  return (
    <Flex justifyContent="space-between" margin={4}>
      <Box>
        <Text>Last updated: Today</Text>
      </Box>

      <Flex justifyContent="space-between" gap={2}>
        <Flex alignItems="center" gap={2} marginTop={1}>
          {circleIcons.map((icon) => (
            <FontAwesomeIcon
              key={icon.key}
              icon={icon.Icon}
              color={icon.iconColour}
              fontSize={11}
            />
          ))}
        </Flex>
        <Text>
          Data are updated daily{" "}
          <Link to={nahrimLink} target="_blank" style={{ color: "white", fontWeight: "bold" }}>
            NAHRIM
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
};

export default Footer;