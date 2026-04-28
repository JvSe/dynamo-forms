import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { FormStep } from "@jvseen/dynamo-core";

interface StepIndicatorProps {
  steps: FormStep[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <View
      style={styles.outer}
      accessibilityLabel="Form progress"
      accessibilityRole="header"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}
      >
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <View key={step.id} style={styles.segment}>
              <View style={styles.stepBlock}>
                <View
                  style={[
                    styles.bubble,
                    isCompleted && styles.bubbleDone,
                    isCurrent && !isCompleted && styles.bubbleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Text style={styles.bubbleCheck}>{"\u2713"}</Text>
                  ) : (
                    <Text
                      style={[
                        styles.bubbleText,
                        isCurrent && !isCompleted && styles.bubbleTextOnPrimary,
                      ]}
                    >
                      {i + 1}
                    </Text>
                  )}
                </View>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.stepLabel,
                    isCurrent ? styles.stepLabelCurrent : styles.stepLabelMuted,
                  ]}
                >
                  {step.title}
                </Text>
              </View>
              {!isLast && (
                <View
                  style={styles.connectorWrap}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <View
                    style={[
                      styles.connector,
                      isCompleted && styles.connectorDone,
                    ]}
                  />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: "100%",
    paddingVertical: 8,
  },
  scroll: {
    maxHeight: 88,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 16,
  },
  segment: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepBlock: {
    alignItems: "center",
    maxWidth: 88,
  },
  bubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
  bubbleDone: {
    backgroundColor: "#2563eb",
  },
  bubbleCurrent: {
    backgroundColor: "#2563eb",
    borderWidth: 2,
    borderColor: "rgba(37, 99, 235, 0.25)",
  },
  bubbleText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  bubbleTextOnPrimary: {
    color: "#ffffff",
  },
  bubbleCheck: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
  stepLabelCurrent: {
    color: "#111827",
  },
  stepLabelMuted: {
    color: "#6b7280",
  },
  connectorWrap: {
    paddingTop: 16,
    paddingHorizontal: 6,
    minWidth: 32,
  },
  connector: {
    height: 2,
    borderRadius: 1,
    backgroundColor: "#e5e7eb",
  },
  connectorDone: {
    backgroundColor: "#2563eb",
  },
});
