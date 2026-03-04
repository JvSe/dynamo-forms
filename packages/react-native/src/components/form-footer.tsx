import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface FormFooterProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  isSubmitting,
  onSubmit,
}) => {
  return (
    <View className="w-full pt-4 mt-2 border-t border-gray-200">
      <Pressable
        disabled={isSubmitting}
        onPress={onSubmit}
        className={`h-14 md:h-16 w-full rounded-md items-center justify-center ${
          isSubmitting ? "bg-gray-400" : "bg-blue-600"
        }`}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white font-bold md:text-2xl">Enviar</Text>
        )}
      </Pressable>
    </View>
  );
};

