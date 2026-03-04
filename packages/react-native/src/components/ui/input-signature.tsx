import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

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
    <View className="w-full">
      <Pressable
        onPress={handleCapture}
        className={`mt-2 border h-[150px] md:h-[250px] rounded-lg overflow-hidden items-center justify-center ${
          hasSignature ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"
        }`}
      >
        <Text className="text-gray-700 text-base md:text-lg">
          {hasSignature ? "Assinatura registrada" : "Toque para capturar assinatura"}
        </Text>
      </Pressable>

      <View className="flex-row gap-2 md:gap-4 mt-3 md:mt-5">
        <Pressable
          onPress={handleClear}
          disabled={!hasSignature}
          className={`w-1/2 max-w-[200px] md:max-w-[300px] h-10 md:h-14 items-center justify-center rounded-md ${
            hasSignature ? "bg-gray-100" : "bg-gray-200"
          }`}
        >
          <Text className="text-gray-700 font-semibold md:text-lg">Limpar</Text>
        </Pressable>
      </View>

      {hasSignature && (
        <View className="mt-2 md:mt-4 p-2 md:p-4 bg-green-50 rounded-lg">
          <Text className="text-green-700 text-sm md:text-lg font-medium">
            ✓ Assinatura capturada (placeholder)
          </Text>
        </View>
      )}
    </View>
  );
};

