import logoNAHRIM from "/LOGO-NAHRIM.png";
import { Box, Flex, Image, Select } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDataSource } from "../../context/dataSourceContext";
import { DataSource } from "../../context/dataSourceContext";
import {
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import ToggleTheme from "./toggleTheme";

const Header = () => {
  const { dataSource, setDataSource } = useDataSource();
  
  const handleDataSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDataSource(value as DataSource);
  };

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

        <Select 
          mr={4} 
          width={150}
          value={dataSource}
          color="whiteAlpha.800"
          sx={{
            "& > option": {
              background: "gray.700",
              color: "white",
            },
            "& > option:hover": {
              background: "gray.600 !important",
            },
          }}
          bg="transparent"
          onChange={handleDataSourceChange}
        >
          <option value="METMalaysia">METMalaysia</option>
          <option value="Windy">Windy</option>
          <option value="OpenWeatherMap">OpenWeatherMap</option>
        </Select>
        
        <ToggleTheme />
      </Flex>
    </Flex>
  );
};

export default Header;