import React from "react";
import { View, Text } from "react-native";

interface FormHeaderProps {
  formName: string;
  onLayout?: (height: number) => void;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  formName,
  onLayout,
}) => {
  return (
    <View
      className="w-full pb-4 mb-4 border-b border-gray-300"
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        onLayout?.(height);
      }}
    >
      <Text className="text-xl md:text-3xl font-bold pb-2">{formName}</Text>
      <Text className="text-gray-600 text-base md:text-lg">
        Preencha os campos solicitados para continuar.
      </Text>
    </View>
  );
};

