import React from "react";
import Select from "react-select";
import { customStyles } from "../constants/customStyles.js";
import { languageOptions } from "../constants/languageOptions.js";

const LanguagesDropdown = ({ onSelectChange }) => {
  return (
    <Select
      placeholder={`Filter By Category`}
      options={languageOptions}
      styles={customStyles}
      defaultValue={languageOptions[0]}
      onChange={(selectedOption) => onSelectChange(selectedOption)}
    />
  );
};

export default LanguagesDropdown;
