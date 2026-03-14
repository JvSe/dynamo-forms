import React from "react";
import { StyleSheet, View } from "react-native";

export const InputDivider: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", marginVertical: 24 },
  line: { height: 1, backgroundColor: "#d1d5db" },
});

