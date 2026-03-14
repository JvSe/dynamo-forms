import React from "react";
import { StyleSheet, Text, View } from "react-native";

type InputGroupProps = {
  label?: string;
  children: React.ReactNode;
};

export const InputGroup: React.FC<InputGroupProps> = ({ label, children }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
      <View style={styles.children}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginTop: 12 },
  header: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  label: { fontSize: 18, fontWeight: "600", color: "#1f2937" },
  children: { marginTop: 12, gap: 16 },
});

