import type { RefObject } from "react";
import { FlatList } from "react-native";
import type { DynamicFieldConfig } from "@jvse/dynamo-core";
import { findFirstErrorFieldId } from "@jvse/dynamo-core";

export const scrollToFirstError = (
  flatListRef: RefObject<FlatList<DynamicFieldConfig> | null>,
  fieldPositionsRef: { current: Map<string, number> },
  fields: DynamicFieldConfig[],
  errors: Record<string, any>
): boolean => {
  const errorFieldIds = Object.keys(errors);
  if (errorFieldIds.length === 0) return false;

  const firstErrorFieldId = findFirstErrorFieldId(fields, errorFieldIds);
  if (!firstErrorFieldId || !flatListRef.current) return false;

  const fieldY = fieldPositionsRef.current.get(firstErrorFieldId);
  if (fieldY !== undefined) {
    const scrollOffset = Math.max(0, fieldY - 100);
    setTimeout(() => {
      try {
        flatListRef.current?.scrollToOffset({ offset: scrollOffset, animated: true });
      } catch {
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToOffset({ offset: scrollOffset, animated: true });
          } catch {}
        }, 300);
      }
    }, 200);
    return true;
  }

  let firstErrorIndex: number | null = null;
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (field.id === firstErrorFieldId) {
      firstErrorIndex = i;
      break;
    }
    if (field.type === "group" && field.config.children) {
      if (findFirstErrorFieldId(field.config.children, errorFieldIds) === firstErrorFieldId) {
        firstErrorIndex = i;
        break;
      }
    }
  }
  if (firstErrorIndex !== null) {
    setTimeout(() => {
      try {
        flatListRef.current?.scrollToIndex({ index: firstErrorIndex!, animated: true, viewOffset: 50 });
      } catch {
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({ index: firstErrorIndex!, animated: true, viewOffset: 50 });
          } catch {}
        }, 300);
      }
    }, 200);
    return true;
  }
  return false;
};
