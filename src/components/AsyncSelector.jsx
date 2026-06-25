import AsyncSelect from "react-select/async";
import { get } from "../utils/axios";

const AsyncSelector = (props) => {
  const { apiUrl, placeholder, selection, onSelect } = props;

  const loadOptionItems = async (inputValue) => {
    return new Promise((resolve) => {
      resolve(fetchOptionItems(inputValue));
    });
  };

  const fetchOptionItems = async (term) => {
    const query =
      term && term.length >= 2 ? `?query=${term}&per_page=20` : "?per_page=20";

    try {
      const res = await get(`${apiUrl}${query}`);
      if (res.status) {
        return res.data.data.map((breed) => ({
          label: breed.name,
          value: breed.id,
        }));
      }
    } catch (error) {
      console.error("Error fetching breeds:", error);
    }
    return [];
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptionItems}
      placeholder={placeholder}
      value={selection}
      onChange={onSelect}
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          borderColor: "#e8e8e8",
          minHeight: "44px", // Reduce height here
          height: "44px", // Reduce height here
          fontFamily: "Cabin",
          fontSize: "0.875rem",
          boxShadow: "none",
          outline: "none",
          "&:hover": {
            borderColor: "#e8e8e8", // Prevent blue border on hover
          },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? "#1967d2" : "white", // Set your desired hover color
          color: state.isFocused ? "white" : "#8a8a8a", // Optional: set text color
          paddingTop: 2,
          paddingBottom: 2,
          fontFamily: "Cabin",
        }),
        menu: (base) => ({
          ...base,
          borderRadius: "0px", // Rounded corners
          zIndex: 100, // Ensure it appears above other elements
          marginTop: 0,
        }),
        menuList: (base) => ({
          ...base,
          maxHeight: "180px",
          overflowY: "auto",
        }),
        valueContainer: (base) => ({
          ...base,
          paddingTop: 2,
          paddingBottom: 2,
        }),
        input: (base) => ({
          ...base,
          marginTop: -50,
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: "44px",
        }),
        singleValue: (base) => ({
          ...base,
          color: "#868686", // font color for selected value
        }),
      }}
    />
  );
};

export default AsyncSelector;
