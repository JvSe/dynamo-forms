#!/usr/bin/env node
/**
 * Instala as peer dependencies nativas do @jvseen/dynamo-react-native.
 *
 * Uso:
 *   node node_modules/@jvseen/dynamo-react-native/install-peers.js
 *
 * Ou adicione ao postinstall do seu app:
 *   "postinstall": "node node_modules/@jvseen/dynamo-react-native/install-peers.js"
 */

const { execSync } = require("child_process");
const { existsSync } = require("fs");
const path = require("path");

// Peer deps nativas que precisam de linking — sempre obrigatórias
const REQUIRED_PEERS = [
  "@shopify/flash-list@>=1.6.0",
  "react-native-gesture-handler@>=2.0.0",
  "react-native-reanimated@>=3.0.0",
  "react-native-safe-area-context@>=4.0.0",
  "react-native-svg@>=13.0.0",
];

// Peer deps opcionais (apenas se usar os field types correspondentes)
const OPTIONAL_PEERS = [
  "@react-native-community/datetimepicker@>=7.0.0", // campo datetime
  "expo-image-picker@>=15.0.0",                      // campo upload
  "expo-location@>=15.0.0",                          // campo mult_capturas
  "react-native-element-dropdown@>=2.0.0",           // campo select
];

function detectPackageManager() {
  if (existsSync(path.resolve(process.cwd(), "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.resolve(process.cwd(), "yarn.lock"))) return "yarn";
  return "npm";
}

function buildInstallCommand(pm, packages) {
  switch (pm) {
    case "pnpm":
      return `pnpm add ${packages.join(" ")}`;
    case "yarn":
      return `yarn add ${packages.join(" ")}`;
    default:
      return `npm install ${packages.join(" ")}`;
  }
}

const pm = detectPackageManager();

console.log("\n@jvseen/dynamo-react-native — instalando peer dependencies nativas...\n");
console.log(`Gerenciador detectado: ${pm}\n`);

const requiredCmd = buildInstallCommand(pm, REQUIRED_PEERS);
console.log(`Obrigatórias:\n  ${requiredCmd}\n`);
execSync(requiredCmd, { stdio: "inherit" });

console.log(`\nOpcionais (instale conforme os field types que você usa):`);
OPTIONAL_PEERS.forEach((p) => {
  const cmd = buildInstallCommand(pm, [p]);
  console.log(`  ${cmd}`);
});

console.log("\n✅ Peer dependencies obrigatórias instaladas.\n");
