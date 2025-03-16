import { Select, Tooltip } from "@chakra-ui/react";

const ChangeUnit = () => {
  return (
    <Tooltip label="Change unit C/F°" hasArrow>
      <Select placeholder={"Unit"} mr={4} width={88}>
        <option value={1}>C°</option>
        <option value={2}>F°</option>
      </Select>
    </Tooltip>
  );
};

export default ChangeUnit;
