import React, { useEffect } from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";

interface ValidationModalProps {
  visible: boolean;
  onTimeout?: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  visible,
  onTimeout,
}) => {
  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        onTimeout?.();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [visible, onTimeout]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        onTimeout?.();
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-lg md:rounded-xl p-6 md:p-10 items-center gap-4 md:gap-6">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-base md:text-xl text-gray-700">
            Verificando campos...
          </Text>
        </View>
      </View>
    </Modal>
  );
};

