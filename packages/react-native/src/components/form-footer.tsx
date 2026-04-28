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
  multiStep: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onBack: () => void;
  /**
   * Final submit: full form validation + onSubmit.
   * Use on the last step of a multi-step form, or on any single-step form.
   */
  onSubmit: () => void;
};

export type BackButtonProps = {
  onBack: () => void;
  disabled: boolean;
};

export type ActionsButtonProps = {
  submit?: React.ComponentType<SubmitButtonProps>;
  back?: React.ComponentType<BackButtonProps>;
};

export type FooterComponentsMap = ActionsButtonProps;

interface FormFooterProps {
  isSubmitting: boolean;
  multiStep?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  /** Full validation + submit (same as web form submit on last / single step). */
  onSubmit: () => void;
  actionsButton?: ActionsButtonProps;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  isSubmitting,
  multiStep = false,
  isFirstStep = true,
  isLastStep = true,
  onNext,
  onBack,
  onSubmit,
  actionsButton,
}) => {
  const handleBack = onBack ?? (() => {});
  const handleNext = onNext ?? (() => {});

  const renderBack = () => {
    if (actionsButton?.back) {
      const Back = actionsButton.back;
      return <Back onBack={handleBack} disabled={isSubmitting} />;
    }
    return (
      <Pressable
        disabled={isSubmitting}
        onPress={handleBack}
        style={({ pressed }) => [
          styles.buttonFlex,
          styles.backButton,
          styles.button,
          (isSubmitting || pressed) && styles.opaque70,
        ]}
      >
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    );
  };

  const renderPrimarySubmit = () => {
    if (actionsButton?.submit) {
      const Submit = actionsButton.submit;
      return (
        <Submit
          isSubmitting={isSubmitting}
          multiStep={multiStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={onSubmit}
        />
      );
    }
    return (
      <Pressable
        disabled={isSubmitting}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.buttonFlex,
          styles.button,
          isSubmitting ? styles.buttonPrimaryDisabled : styles.buttonPrimary,
          pressed && !isSubmitting && styles.pressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </Pressable>
    );
  };

  const renderNext = () => {
    if (actionsButton?.submit) {
      const Submit = actionsButton.submit;
      return (
        <Submit
          isSubmitting={isSubmitting}
          multiStep={multiStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={onSubmit}
        />
      );
    }
    return (
      <Pressable
        disabled={isSubmitting}
        onPress={handleNext}
        style={({ pressed }) => [
          styles.buttonFlex,
          styles.button,
          isSubmitting ? styles.buttonPrimaryDisabled : styles.buttonPrimary,
          pressed && !isSubmitting && styles.pressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Next</Text>
        )}
      </Pressable>
    );
  };

  if (multiStep) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {!isFirstStep && renderBack()}
          {isLastStep ? renderPrimarySubmit() : renderNext()}
        </View>
      </View>
    );
  }

  if (actionsButton?.submit) {
    const Submit = actionsButton.submit;
    return (
      <View style={styles.container}>
        <Submit
          isSubmitting={isSubmitting}
          multiStep={false}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={onSubmit}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        disabled={isSubmitting}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.buttonFull,
          isSubmitting ? styles.buttonPrimaryDisabled : styles.buttonPrimary,
          !isSubmitting && pressed && styles.pressed,
        ]}
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
  row: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  buttonFlex: {
    flex: 1,
  },
  button: {
    height: 56,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonFull: {
    height: 56,
    width: "100%",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    backgroundColor: "#e5e7eb",
  },
  backText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPrimary: {
    backgroundColor: "#2563eb",
  },
  buttonPrimaryDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
  },
  pressed: { opacity: 0.9 },
  opaque70: { opacity: 0.7 },
});
