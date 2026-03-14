import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type InputSignatureProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

export const InputSignature: React.FC<InputSignatureProps> = ({
  value,
  onChange,
}) => {
  const [hasSignature, setHasSignature] = useState(!!value);

  useEffect(() => {
    setHasSignature(!!value);
  }, [value]);

  const handleCapture = useCallback(() => {
    // Componente simplificado: apenas marca como "assinado"
    const fakeSignature = `signed-${Date.now()}`;
    setHasSignature(true);
    onChange(fakeSignature);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setHasSignature(false);
    onChange(null);
  }, [onChange]);

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={handleCapture}
        style={[
          styles.captureArea,
          hasSignature ? styles.captureAreaFilled : styles.captureAreaEmpty,
        ]}
      >
        <Text style={styles.captureText}>
          {hasSignature ? "Assinatura registrada" : "Toque para capturar assinatura"}
        </Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={handleClear}
          disabled={!hasSignature}
          style={[
            styles.clearButton,
            hasSignature ? styles.clearButtonEnabled : styles.clearButtonDisabled,
          ]}
        >
          <Text style={styles.clearText}>Limpar</Text>
        </Pressable>
      </View>

      {hasSignature && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            ✓ Assinatura capturada (placeholder)
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  captureArea: {
    marginTop: 8,
    borderWidth: 1,
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  captureAreaEmpty: { borderColor: "#e5e7eb", backgroundColor: "#ffffff" },
  captureAreaFilled: { borderColor: "#4ade80", backgroundColor: "#f0fdf4" },
  captureText: { color: "#374151", fontSize: 16 },
  actions: { flexDirection: "row", gap: 16, marginTop: 20 },
  clearButton: {
    width: "50%",
    maxWidth: 200,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  clearButtonEnabled: { backgroundColor: "#f3f4f6" },
  clearButtonDisabled: { backgroundColor: "#e5e7eb" },
  clearText: { color: "#374151", fontWeight: "600", fontSize: 16 },
  successBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
  },
  successText: { color: "#15803d", fontSize: 14, fontWeight: "500" },
});

