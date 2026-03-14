import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";

type Captura = {
  id: string;
  label: string;
};

type CapturaWithLocation = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

type InputCapturasProps = {
  capturas: Captura[];
  value?: CapturaWithLocation[];
  onChange: (value: CapturaWithLocation[]) => void;
};

export const InputCapturas: React.FC<InputCapturasProps> = ({
  capturas = [],
  value = [],
  onChange,
}) => {
  const [loadingCaptura, setLoadingCaptura] = useState<string | null>(null);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão Necessária",
          "É necessário permitir o acesso à localização para capturar as coordenadas."
        );
        return false;
      }
      return true;
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível solicitar permissão de localização."
      );
      return false;
    }
  };

  const handleCapturarLocalizacao = async (captura: Captura) => {
    setLoadingCaptura(captura.id);

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoadingCaptura(null);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const { latitude, longitude } = location.coords;

      const novaCapturaComLocalizacao: CapturaWithLocation = {
        id: captura.id,
        label: captura.label,
        latitude,
        longitude,
      };

      const capturaExistente = value.find((c) => c.id === captura.id);

      if (capturaExistente) {
        const novasCapturas = value.map((c) =>
          c.id === captura.id ? novaCapturaComLocalizacao : c
        );
        onChange(novasCapturas);
      } else {
        onChange([...value, novaCapturaComLocalizacao]);
      }
    } catch (error) {
      console.error("Erro ao capturar localização:", error);
      Alert.alert(
        "Erro",
        "Não foi possível obter a localização. Verifique se o GPS está ativado."
      );
    } finally {
      setLoadingCaptura(null);
    }
  };

  const handleRemoveCapture = (capturaId: string) => {
    Alert.alert("Remove Capture", "Are you sure you want to remove this location?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const novasCapturas = value.filter((c) => c.id !== capturaId);
          onChange(novasCapturas);
        },
      },
    ]);
  };

  const getCapturaStatus = (capturaId: string) => {
    return value.find((c) => c.id === capturaId);
  };

  return (
    <View style={styles.wrapper}>
      {capturas.map((captura) => {
        const capturaRealizada = getCapturaStatus(captura.id);
        const isLoading = loadingCaptura === captura.id;

        return (
          <View
            key={captura.id}
            style={[
              styles.card,
              capturaRealizada ? styles.cardDone : styles.cardPending,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>{captura.label}</Text>
              {capturaRealizada && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Capturada</Text>
                </View>
              )}
            </View>

            {capturaRealizada && (
              <View style={styles.coordsBox}>
                <Text style={styles.coordsTitle}>Coordenadas:</Text>
                <Text style={styles.coordsText}>
                  Lat: {capturaRealizada.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordsText}>
                  Long: {capturaRealizada.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              <View style={styles.actionsMain}>
                <Button
                  title={
                    isLoading
                      ? "Capturando..."
                      : capturaRealizada
                      ? "Recapturar"
                      : "Capturar Localização"
                  }
                  onPress={() => handleCapturarLocalizacao(captura)}
                  disabled={isLoading}
                />
              </View>

              {capturaRealizada && !isLoading && (
                <View style={styles.removeWrap}>
                  <Button
                    title="Remove"
                    color="#ef4444"
                    onPress={() => handleRemoveCapture(captura.id)}
                  />
                </View>
              )}
            </View>

            {isLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingText}>Obtendo posição...</Text>
              </View>
            )}
          </View>
        );
      })}

      {capturas.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No captures configured</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%", gap: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  cardPending: { backgroundColor: "#f9fafb", borderColor: "#d1d5db" },
  cardDone: { backgroundColor: "#f0fdf4", borderColor: "#86efac" },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardLabel: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
  badge: { backgroundColor: "#22c55e", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  badgeText: { color: "#ffffff", fontSize: 12, fontWeight: "600" },
  coordsBox: {
    marginBottom: 12,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  coordsTitle: { fontSize: 14, color: "#4b5563", fontWeight: "500" },
  coordsText: { fontSize: 14, color: "#1f2937" },
  actions: { flexDirection: "row", gap: 8 },
  actionsMain: { flex: 1 },
  removeWrap: { width: 96 },
  loadingRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { fontSize: 14, color: "#4b5563" },
  empty: { padding: 16, backgroundColor: "#f3f4f6", borderRadius: 8 },
  emptyText: { color: "#4b5563", textAlign: "center" },
});

