import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
      style={styles.container}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        onLayout?.(height);
      }}
    >
      <Text style={styles.title}>{formName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    paddingBottom: 8,
  },
});

