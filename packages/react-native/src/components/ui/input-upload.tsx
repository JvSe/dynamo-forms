import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
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

  const getBorderClass = () => {
    if (error) return "border-red-500 bg-red-50";
    if (success) return "border-green-500 bg-green-50";
    if (canAddMoreImages) return "bg-gray-100 border-gray-300";
    return "bg-gray-50 border-gray-200 opacity-60";
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
        { text: "Cancelar", style: "cancel" },
        { text: "Câmera", onPress: takePhoto },
        { text: "Galeria", onPress: pickFromGallery },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="w-full">
      <Text className="mb-2 text-base text-gray-800">{fieldLabel}</Text>

      <Pressable
        className={`w-full p-4 md:p-6 border-2 border-dashed rounded-md flex gap-2 md:gap-3 items-center justify-center ${getBorderClass()}`}
        onPress={handleAddImagePress}
      >
        <Text className="text-primary font-semibold md:text-xl">
          {canAddMoreImages
            ? "Adicionar imagem"
            : `Máximo ${maxImages} imagens`}
        </Text>
      </Pressable>

      {images.length > 0 && (
        <View className="mt-4 md:mt-6">
          <Text className="text-sm md:text-lg font-medium text-gray-700 mb-3 md:mb-4">
            Arquivos enviados:
          </Text>
          <View className="gap-3 md:gap-4">
            {images.map((image) => (
              <View
                key={image.id}
                className="flex-row items-center p-3 md:p-5 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <View className="w-12 h-12 md:w-20 md:h-20 rounded-lg overflow-hidden mr-3 md:mr-5 bg-gray-100 relative">
                  <Image
                    source={{ uri: image.uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-sm md:text-lg font-medium text-gray-800">
                    Foto adicionada
                  </Text>
                  <Text className="text-xs md:text-base text-gray-500 mt-1 md:mt-2">
                    Será salva ao enviar o formulário
                  </Text>
                </View>

                <View className="mr-2 md:mr-3">
                  <TouchableOpacity
                    onPress={() => removeImage(image.id)}
                    className="w-6 h-6 md:w-10 md:h-10 items-center justify-center"
                  >
                    <Text className="text-red-500 text-xs md:text-base">
                      Remover
                    </Text>
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

