import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

type ImageItem = {
  id: string;
  uri: string;
};

type InputUploadProps = {
  fieldId: string;
  fieldLabel: string;
  onPhotosSelected: (imageUris: string[]) => void;
  title?: string;
  description?: string;
  maxImages?: number;
  error?: boolean;
  success?: boolean;
};

export const InputUpload: React.FC<InputUploadProps> = ({
  fieldId,
  fieldLabel,
  onPhotosSelected,
  title = "Selecionar Fotos",
  description = "Escolha como você quer adicionar fotos",
  maxImages = 5,
  error = false,
  success = false,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);

  const addImage = async (uri: string) => {
    const newImage: ImageItem = {
      id: `${fieldId}-${Date.now().toString()}-${Math.random().toString()}`,
      uri,
    };

    setImages((prev) => {
      const updated = [...prev, newImage];
      onPhotosSelected(updated.map((img) => img.uri));
      return updated;
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      onPhotosSelected(updated.map((img) => img.uri));
      return updated;
    });
  };

  const canAddMoreImages = images.length < maxImages;

  const getDropzoneStyle = () => {
    if (error) return styles.dropzoneError;
    if (success) return styles.dropzoneSuccess;
    if (canAddMoreImages) return styles.dropzoneDefault;
    return styles.dropzoneDisabled;
  };

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        Alert.alert(
          "Permissões necessárias",
          "Precisamos de permissão para acessar a câmera e a galeria de fotos."
        );
        return false;
      }
    }
    return true;
  };

  const takePhoto = async () => {
    if (!canAddMoreImages) {
      Alert.alert(
        "Limite atingido",
        `O limite máximo é de ${maxImages} ${
          maxImages === 1 ? "imagem" : "imagens"
        }.`
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("[InputUpload] Erro ao abrir câmera:", error);
      Alert.alert("Erro", "Não foi possível abrir a câmera.");
    }
  };

  const pickFromGallery = async () => {
    if (!canAddMoreImages) {
      Alert.alert(
        "Limite atingido",
        `O limite máximo é de ${maxImages} ${
          maxImages === 1 ? "imagem" : "imagens"
        }.`
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("[InputUpload] Erro ao abrir galeria:", error);
      Alert.alert("Erro", "Não foi possível abrir a galeria.");
    }
  };

  const handleAddImagePress = () => {
    Alert.alert(
      title,
      description,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Câmera", onPress: takePhoto },
        { text: "Galeria", onPress: pickFromGallery },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{fieldLabel}</Text>

      <Pressable
        style={[styles.dropzone, getDropzoneStyle()]}
        onPress={handleAddImagePress}
      >
        <Text style={styles.dropzoneText}>
          {canAddMoreImages
            ? "Add image"
            : `Máximo ${maxImages} imagens`}
        </Text>
      </Pressable>

      {images.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.listTitle}>Arquivos enviados:</Text>
          <View style={styles.listInner}>
            {images.map((image) => (
              <View key={image.id} style={styles.item}>
                <View style={styles.itemThumb}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>Foto adicionada</Text>
                  <Text style={styles.itemSub}>
                    Will be saved when the form is submitted
                  </Text>
                </View>

                <View style={styles.itemAction}>
                  <TouchableOpacity
                    onPress={() => removeImage(image.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: { marginBottom: 8, fontSize: 16, color: "#1f2937" },
  dropzone: {
    width: "100%",
    padding: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 6,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dropzoneDefault: { backgroundColor: "#f3f4f6", borderColor: "#d1d5db" },
  dropzoneError: { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
  dropzoneSuccess: { backgroundColor: "#f0fdf4", borderColor: "#22c55e" },
  dropzoneDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    opacity: 0.6,
  },
  dropzoneText: { fontWeight: "600", fontSize: 18 },
  list: { marginTop: 24 },
  listTitle: { fontSize: 16, fontWeight: "500", color: "#374151", marginBottom: 12 },
  listInner: { gap: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#f3f4f6",
  },
  thumbImage: { width: "100%", height: "100%" },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: "500", color: "#1f2937" },
  itemSub: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  itemAction: { marginRight: 12 },
  removeButton: { padding: 8, alignItems: "center", justifyContent: "center" },
  removeText: { color: "#ef4444", fontSize: 14 },
});

