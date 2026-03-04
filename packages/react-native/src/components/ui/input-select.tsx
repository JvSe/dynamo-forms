import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const DEFAULT_PRIMARY = "#2563eb";

type InputSelectProps = {
  options: { label: string; value: string }[];
  placeholder?: string;
  onChange: (value: any) => void;
  value: any;
  error?: boolean;
  success?: boolean;
};

export const InputSelectNew: React.FC<InputSelectProps> = ({
  options,
  placeholder,
  onChange,
  value,
  error = false,
  success = false,
}) => {
  const [_value, setValue] = useState(value);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    setValue(value);
  }, [value]);

  const handleChange = (val: any) => {
    setValue(val);
    onChange(val);
  };

  const getBorderColor = () => {
    if (error) return "#ef4444";
    if (success) return "#10b981";
    if (isFocus) return DEFAULT_PRIMARY;
    return "gray";
  };

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, { borderColor: getBorderColor() }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={options}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder || "Selecione uma opção" : "..."}
        searchPlaceholder="Pesquisar..."
        value={_value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          handleChange(item.value);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
  },
  dropdown: {
    height: 56,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 12,
  },
  placeholderStyle: {
    fontSize: 18,
  },
  selectedTextStyle: {
    fontSize: 18,
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
  inputSearchStyle: {
    height: 48,
    fontSize: 18,
  },
});

