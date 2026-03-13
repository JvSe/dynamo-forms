import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type InputDateTimeProps = {
  value?: Date;
  onChange: (date: Date) => void;
  dateType?: "date" | "time" | "datetime";
  placeholder?: string;
  mode?: "date" | "time";
  error?: boolean;
  success?: boolean;
};

export const InputDateTime: React.FC<InputDateTimeProps> = ({
  value,
  onChange,
  dateType = "date",
  placeholder = "Select a date",
  mode = dateType === "time" ? "time" : "date",
  error = false,
  success = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(value || new Date());

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setCurrentDate(selectedDate);
      onChange(selectedDate);
    }
  };

  const formatDisplayValue = () => {
    if (!value || isNaN(value.getTime())) return placeholder;

    switch (dateType) {
      case "date":
        return format(value, "dd/MM/yyyy", { locale: ptBR });
      case "time":
        return format(value, "HH:mm", { locale: ptBR });
      case "datetime":
        return format(value, "dd/MM/yyyy HH:mm", { locale: ptBR });
      default:
        return format(value, "dd/MM/yyyy", { locale: ptBR });
    }
  };

  const getBorderClass = () => {
    if (error) return "border-red-500 bg-red-50";
    if (success) return "border-green-500 bg-green-50";
    return "border-gray-300";
  };

  return (
    <View className="w-full">
      <Pressable
        onPress={() => setShowPicker(true)}
        className={`border px-3 py-2 rounded-md ${getBorderClass()}`}
      >
        <Text className="text-base text-gray-800">{formatDisplayValue()}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={currentDate}
          mode={mode}
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

