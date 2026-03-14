import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.text}>Checking fields...</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  box: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  text: { fontSize: 16, color: "#374151" },
});

