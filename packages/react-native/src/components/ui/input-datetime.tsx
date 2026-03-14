import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

  const getBorderStyle = () => {
    if (error) return styles.containerError;
    if (success) return styles.containerSuccess;
    return styles.containerDefault;
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[styles.container, getBorderStyle()]}
      >
        <Text style={styles.text}>{formatDisplayValue()}</Text>
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

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  container: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  containerDefault: { borderColor: "#d1d5db" },
  containerError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  containerSuccess: { borderColor: "#22c55e", backgroundColor: "#f0fdf4" },
  text: { fontSize: 16, color: "#1f2937" },
});

