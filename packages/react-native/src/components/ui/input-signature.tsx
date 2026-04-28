import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { DrawPad, type DrawPadHandle } from "./draw-pad/index.js";

const normalizeValue = (v: string | null | undefined): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

const isDisplayableUri = (s: string): boolean =>
  s.startsWith("data:image/") ||
  s.startsWith("file://") ||
  s.startsWith("http://") ||
  s.startsWith("https://");

type InputSignatureProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

export const InputSignature: React.FC<InputSignatureProps> = ({
  value,
  onChange,
}) => {
  const initialNorm = normalizeValue(value);
  const [signature, setSignature] = useState<string | null>(initialNorm);
  const [hasSignature, setHasSignature] = useState(!!initialNorm);

  const lastSentRef = useRef<string | null>(null);
  const drawPadRef = useRef<DrawPadHandle>(null);
  const pathLength = useSharedValue(0);
  const playing = useSharedValue(false);
  const signed = useSharedValue(false);

  useEffect(() => {
    const nv = normalizeValue(value);
    if (nv === lastSentRef.current) return;
    lastSentRef.current = nv;
    setSignature(nv);
    setHasSignature(!!nv);
  }, [value]);

  const handleSignature = useCallback(
    (next: string) => {
      lastSentRef.current = next;
      setSignature(next);
      setHasSignature(true);
      onChange(next);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    lastSentRef.current = null;
    setSignature(null);
    setHasSignature(false);
    drawPadRef.current?.erase();
    onChange(null);
  }, [onChange]);

  const isPreview = !!signature && isDisplayableUri(signature);

  return (
    <View style={styles.wrapper}>
      <View style={styles.canvas}>
        {isPreview ? (
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewText}>
              Assinatura capturada — toque em Limpar para redesenhar
            </Text>
          </View>
        ) : (
          <DrawPad
            ref={drawPadRef}
            stroke="#383838"
            strokeWidth={3}
            onSubmit={handleSignature}
            pathLength={pathLength}
            playing={playing}
            signed={signed}
            outputFormat="png"
          />
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleClear}
          disabled={!hasSignature}
          style={[
            styles.clearButton,
            hasSignature ? styles.clearEnabled : styles.clearDisabled,
          ]}
        >
          <Text style={styles.clearText}>Limpar</Text>
        </Pressable>
      </View>

      {hasSignature && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ Assinatura capturada com sucesso</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  canvas: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
  },
  previewText: { color: "#15803d", fontSize: 14, textAlign: "center", paddingHorizontal: 16 },
  actions: { flexDirection: "row", marginTop: 12 },
  clearButton: {
    width: "50%",
    maxWidth: 200,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  clearEnabled: { backgroundColor: "#f3f4f6" },
  clearDisabled: { backgroundColor: "#e5e7eb" },
  clearText: { color: "#374151", fontWeight: "600", fontSize: 16 },
  successBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
  },
  successText: { color: "#15803d", fontSize: 14, fontWeight: "500" },
});
