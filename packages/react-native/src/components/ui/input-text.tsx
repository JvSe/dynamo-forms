import React from "react";
import {
  TextInput,
  TextInputProps,
  Text,
  View,
  StyleSheet,
} from "react-native";

type InputControllerState = {
  error?: boolean;
  success?: boolean;
};

export type InputTextProps = TextInputProps & {
  controller?: InputControllerState;
};

export const InputText: React.FC<InputTextProps> = ({
  controller,
  style,
  ...props
}) => {
  const { error, success } = controller || {};

  const borderColor = error
    ? "#ef4444"
    : success
    ? "#10b981"
    : "#d1d5db";

  return (
    <View>
      <TextInput
        {...props}
        style={[styles.input, { borderColor }, style]}
        placeholderTextColor="#9CA3AF"
      />
      {error && (
        <Text style={styles.errorText}>Campo obrigatório ou inválido.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 16,
    height: 48,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#ef4444",
  },
});

