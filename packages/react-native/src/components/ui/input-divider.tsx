import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

export const InputDivider: React.FC = ({ style, ...rest }: ViewProps) => {
  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", marginVertical: 5 },
  line: { height: 1, backgroundColor: "#d1d5db" },
});

