import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type SubmitButtonProps = {
  isSubmitting: boolean;
  onSubmit: () => void;
};

export type BackButtonProps = {
  onBack: () => void;
  disabled: boolean;
};

export type ActionsButtonProps = {
  /** Custom component for the primary action (Submit). */
  submit?: React.ComponentType<SubmitButtonProps>;
  /** Custom component for the Back button (e.g. in multi-step flows). */
  back?: React.ComponentType<BackButtonProps>;
};

interface FormFooterProps {
  isSubmitting: boolean;
  onSubmit: () => void;
  /** Custom components for submit and back buttons. Pass submit and/or back to override one or both. */
  actionsButton?: ActionsButtonProps;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  isSubmitting,
  onSubmit,
  actionsButton,
}) => {
  if (actionsButton?.submit) {
    const Submit = actionsButton.submit;
    return (
      <View style={styles.container}>
        <Submit isSubmitting={isSubmitting} onSubmit={onSubmit} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        disabled={isSubmitting}
        onPress={onSubmit}
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    height: 56,
    width: "100%",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

