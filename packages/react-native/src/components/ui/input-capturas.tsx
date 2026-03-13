import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
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
    <View className="w-full gap-3">
      {capturas.map((captura) => {
        const capturaRealizada = getCapturaStatus(captura.id);
        const isLoading = loadingCaptura === captura.id;

        return (
          <View
            key={captura.id}
            className={`border rounded-lg p-4 ${
              capturaRealizada
                ? "bg-green-50 border-green-300"
                : "bg-gray-50 border-gray-300"
            }`}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-800">
                {captura.label}
              </Text>
              {capturaRealizada && (
                <View className="bg-green-500 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-semibold">
                    Capturada
                  </Text>
                </View>
              )}
            </View>

            {capturaRealizada && (
              <View className="mb-3 bg-white p-3 rounded-lg border border-green-200">
                <Text className="text-sm text-gray-600 font-medium">
                  Coordenadas:
                </Text>
                <Text className="text-sm text-gray-800">
                  Lat: {capturaRealizada.latitude.toFixed(6)}
                </Text>
                <Text className="text-sm text-gray-800">
                  Long: {capturaRealizada.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <View className="flex-row gap-2">
              <View className="flex-1">
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
                <View className="w-24">
                  <Button
                    title="Remove"
                    color="#ef4444"
                    onPress={() => handleRemoveCapture(captura.id)}
                  />
                </View>
              )}
            </View>

            {isLoading && (
              <View className="mt-2 flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#2563eb" />
                <Text className="text-sm text-gray-600">Obtendo posição...</Text>
              </View>
            )}
          </View>
        );
      })}

      {capturas.length === 0 && (
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text className="text-gray-600 text-center">
            No captures configured
          </Text>
        </View>
      )}
    </View>
  );
};

