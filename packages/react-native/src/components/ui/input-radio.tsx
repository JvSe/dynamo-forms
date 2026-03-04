import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

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

  const getBorderClass = () => {
    if (error) return "border-red-500 bg-red-50";
    if (success) return "border-green-500 bg-green-50";
    return "border-transparent";
  };

  return (
    <View className={`rounded-lg border-2 p-2 md:p-3 ${getBorderClass()}`}>
      {options.map((option) => {
        const checked = _value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onOptionPress(option.value)}
            className="flex-row items-center py-1"
          >
            <View className="w-5 h-5 mr-2 rounded-full border border-gray-400 items-center justify-center">
              {checked && (
                <View className="w-3 h-3 rounded-full bg-blue-600" />
              )}
            </View>
            <Text className="text-base text-gray-800">{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

