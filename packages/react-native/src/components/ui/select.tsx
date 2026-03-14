import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type InputSelectProps = {
  options?: { label: string; value: string }[];
  placeholder?: string;
  onChange: (value: any) => void;
  value: any;
};

export const InputSelect: React.FC<InputSelectProps> = ({
  options,
  placeholder,
  onChange,
  value,
}) => {
  const [_value, _setValue] = useState(value);
  const insets = useSafeAreaInsets();

  const handleChange = (selected: any) => {
    _setValue(selected);
    onChange(selected);
  };

  const openSelect = () => {
    const labels = options || [];
    if (!labels.length) return;

    if (Platform.OS === "ios") {
      Alert.alert(
        placeholder || "Select an option",
        "",
        labels.map((opt) => ({
          text: opt.label,
          onPress: () => handleChange(opt.value),
        }))
      );
    } else {
      Alert.alert(
        placeholder || "Select an option",
        "",
        labels.map((opt) => ({
          text: opt.label,
          onPress: () => handleChange(opt.value),
        }))
      );
    }
  };

  const selectedLabel =
    options?.find((opt) => opt.value === _value)?.label || placeholder;

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom:
          Platform.OS === "ios" ? insets.bottom : insets.bottom + 12,
      }}
    >
      <Pressable onPress={openSelect} style={styles.trigger}>
        <Text style={styles.triggerText}>
          {selectedLabel || "Select an option"}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    height: 56,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    justifyContent: "center",
  },
  triggerText: { fontSize: 16, color: "#1f2937" },
});

