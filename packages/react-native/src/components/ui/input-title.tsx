import React from "react";
import { Text, View } from "react-native";

type InputTitleProps = {
  titleText?: string;
  description?: string;
};

export const InputTitle: React.FC<InputTitleProps> = ({
  titleText,
  description,
}) => {
  return (
    <View className="w-full mb-6 md:mb-8">
      {titleText && (
        <Text className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
          {titleText}
        </Text>
      )}
      {description && (
        <Text className="text-base md:text-lg text-gray-600 leading-6 md:leading-7">
          {description}
        </Text>
      )}
    </View>
  );
};

