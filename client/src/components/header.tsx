import logoNAHRIM from "/LOGO-NAHRIM.png";
import { Box, Flex, Image, Select } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import ToggleTheme from "./toggleTheme";
import ChangeUnit from "./changeUnit";

const Header = () => {
  const navigationLinks = [
    {
      key: 0,
      icon: faChevronRight,
      link: "/",
      name: "Dashboard",
    },
    {
      key: 1,
      icon: faChevronRight,
      link: "/maps",
      name: "Maps",
    },
  ];

  return (
    <Flex justifyContent="space-between" alignItems="center" p={2}>
      <Box>
        <Image src={logoNAHRIM} width="100px" alt="NAHRIM Logo" />
      </Box>

      <Flex alignItems="center">
        {navigationLinks.map((link) => (
          <Link
            key={link.key}
            to={link.link}
            style={{
              marginRight: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {link.name}{" "}
            <FontAwesomeIcon
              icon={link.icon}
              fontSize={15}
              style={{ marginLeft: "8px" }}
            />
          </Link>
        ))}

        <Select mr={4} width={150}>
          <option value={1}>METMalaysia</option>
          <option value={2}>Windy</option>
          <option value={3}>METOffice</option>
        </Select>
        
        <ChangeUnit />
        <ToggleTheme />
      </Flex>
    </Flex>
  );
};

export default Header;