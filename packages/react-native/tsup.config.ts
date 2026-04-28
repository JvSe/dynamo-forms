import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "react",
    "react-native",
    "react-hook-form",
    "@hookform/resolvers",
    "zod",
    "@jvseen/dynamo-core",
    /** Nativo (view managers) — deve ser resolvido só na app, nunca duplicado no bundle. */
    "@shopify/flash-list",
    "@react-native-community/datetimepicker",
    "react-native-element-dropdown",
    "react-native-gesture-handler",
    "react-native-reanimated",
    "react-native-safe-area-context",
    "react-native-svg",
    "expo-image-picker",
    "expo-location",
    "date-fns",
    "svg-path-properties",
  ],
});
