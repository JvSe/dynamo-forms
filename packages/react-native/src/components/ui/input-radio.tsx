import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Option = {
  label: string;
  value: string;
};

type InputRadioProps = {
  options?: Option[];
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  success?: boolean;
};

export const InputRadio: React.FC<InputRadioProps> = ({
  options = [],
  value,
  onChange,
  error = false,
  success = false,
}) => {
  const [_value, setValue] = useState(value);

  useEffect(() => {
    setValue(value);
  }, [value]);

  const onOptionPress = (v: string) => {
    onChange(v);
    setValue(v);
  };

  const getContainerStyle = () => {
    if (error) return styles.containerError;
    if (success) return styles.containerSuccess;
    return styles.containerDefault;
  };

  return (
    <View style={[styles.container, getContainerStyle()]}>
      {options.map((option) => {
        const checked = _value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onOptionPress(option.value)}
            style={styles.optionRow}
          >
            <View style={styles.radioOuter}>
              {checked && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.label}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 2,
    padding: 12,
  },
  containerDefault: { borderColor: "transparent" },
  containerError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  containerSuccess: { borderColor: "#22c55e", backgroundColor: "#f0fdf4" },
  optionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  radioOuter: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563eb",
  },
  label: { fontSize: 16, color: "#1f2937" },
});

