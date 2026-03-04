import React from "react";
import { Pressable, Text, View } from "react-native";

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

  const getBorderClass = () => {
    if (error) return "border-red-500 bg-red-50";
    if (success) return "border-green-500 bg-green-50";
    return "border-transparent";
  };

  return (
    <View
      className={`w-full gap-3 md:gap-4 rounded-lg border-2 p-2 md:p-3 ${getBorderClass()}`}
    >
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        const isDisabled =
          !isSelected && maxSelect > 0 && value.length >= maxSelect;

        return (
          <Pressable
            key={option.value}
            onPress={() => !isDisabled && handleToggle(option.value)}
            className="flex-row items-center gap-2"
          >
            <View
              className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
                isSelected ? "bg-blue-600 border-blue-600" : "border-gray-400"
              }`}
            >
              {isSelected && (
                <Text className="text-white text-xs font-bold">✓</Text>
              )}
            </View>
            <Text className="text-base text-gray-800">{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

