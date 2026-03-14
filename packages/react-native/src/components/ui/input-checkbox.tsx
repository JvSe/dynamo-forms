import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Option = {
  label: string;
  value: string;
};

type InputCheckboxProps = {
  options?: Option[];
  value?: string[];
  maxSelect?: number;
  onChange: (value: string[]) => void;
  error?: boolean;
  success?: boolean;
};

export const InputCheckbox: React.FC<InputCheckboxProps> = ({
  options = [],
  value = [],
  maxSelect = 0,
  onChange,
  error = false,
  success = false,
}) => {
  const handleToggle = (optionValue: string) => {
    const isSelected = value.includes(optionValue);

    if (isSelected) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      if (maxSelect === 0 || value.length < maxSelect) {
        onChange([...value, optionValue]);
      }
    }
  };

  const getContainerStyle = () => {
    if (error) return styles.containerError;
    if (success) return styles.containerSuccess;
    return styles.containerDefault;
  };

  return (
    <View style={[styles.container, getContainerStyle()]}>
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        const isDisabled =
          !isSelected && maxSelect > 0 && value.length >= maxSelect;

        return (
          <Pressable
            key={option.value}
            onPress={() => !isDisabled && handleToggle(option.value)}
            style={styles.optionRow}
          >
            <View
              style={[
                styles.checkbox,
                isSelected ? styles.checkboxSelected : styles.checkboxUnselected,
              ]}
            >
              {isSelected && (
                <Text style={styles.checkmark}>✓</Text>
              )}
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
    width: "100%",
    gap: 12,
    borderRadius: 8,
    borderWidth: 2,
    padding: 12,
  },
  containerDefault: { borderColor: "transparent" },
  containerError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  containerSuccess: { borderColor: "#22c55e", backgroundColor: "#f0fdf4" },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxUnselected: { borderColor: "#9ca3af" },
  checkboxSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  checkmark: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
  label: { fontSize: 16, color: "#1f2937" },
});

