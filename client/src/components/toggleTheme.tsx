import { Button, useColorMode, Tooltip } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const ToggleTheme = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Tooltip label="Switch Theme" hasArrow>
      <div>
        <Button
          background="transparent"
          _hover={{ background: "transparent" }}
          _active={{ background: "transparent" }}
          leftIcon={
            colorMode === "light" ? (
              <FontAwesomeIcon
                icon={faMoon}
                fontSize={30}
                color="rgba(0, 0, 0, 0.6)"
              />
            ) : (
              <FontAwesomeIcon
                icon={faSun}
                fontSize={30}
                color="rgba(224, 224, 224, 1)"
              />
            )
          }
          onClick={toggleColorMode}
        />
      </div>
    </Tooltip>
  );
};

export default ToggleTheme;
