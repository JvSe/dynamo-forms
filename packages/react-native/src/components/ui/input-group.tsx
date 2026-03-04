import React from "react";
import { Text, View } from "react-native";

type InputGroupProps = {
  label?: string;
  children: React.ReactNode;
};

export const InputGroup: React.FC<InputGroupProps> = ({ label, children }) => {
  return (
    <View className="mt-2 md:mt-3">
      <View className="p-3 md:p-4 bg-gray-50 rounded-lg border-b border-gray-200">
        {label && (
          <Text className="text-lg md:text-2xl font-semibold text-gray-800">
            {label}
          </Text>
        )}
      </View>
      <View className="mt-2 md:mt-3 gap-4 md:gap-6">{children}</View>
    </View>
  );
};

