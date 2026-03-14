import React from "react";
import { StyleSheet, Text, View } from "react-native";

type InputTitleProps = {
  titleText?: string;
  description?: string;
};

export const InputTitle: React.FC<InputTitleProps> = ({
  titleText,
  description,
}) => {
  return (
    <View style={styles.container}>
      {titleText && <Text style={styles.title}>{titleText}</Text>}
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
  },
});

