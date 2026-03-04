import React, { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
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
        placeholder || "Selecione uma opção",
        "",
        labels.map((opt) => ({
          text: opt.label,
          onPress: () => handleChange(opt.value),
        }))
      );
    } else {
      Alert.alert(
        placeholder || "Selecione uma opção",
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
      <Pressable
        onPress={openSelect}
        className="h-14 px-5 border border-gray-300 rounded-md justify-center"
      >
        <Text className="text-base text-gray-800">
          {selectedLabel || "Selecione uma opção"}
        </Text>
      </Pressable>
    </View>
  );
};

