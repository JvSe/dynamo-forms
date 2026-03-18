/**
 * Post-process Tailwind-built CSS to:
 * 1. Remove @layer directives (allows import in projects with Tailwind v4)
 * 2. Scope :root/:host theme variables to [data-dynamo-root] (evita sobrescrever o projeto externo)
 */
import postcss from "postcss";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, "..", "dist", "styles.css");

if (!fs.existsSync(cssPath)) {
  console.error("flatten-css-layers: dist/styles.css not found. Run build:css first.");
  process.exit(1);
}

let css = fs.readFileSync(cssPath, "utf8");

const stripLayers = () => ({
  postcssPlugin: "strip-layer-rules",
  Once(root) {
    root.walkAtRules("layer", (rule) => {
      rule.replaceWith(rule.nodes);
    });
  },
});
stripLayers.postcss = true;

let result = await postcss([stripLayers]).process(css, { from: cssPath });
css = result.css;

// Escopa variáveis de tema de :root,:host para [data-dynamo-root]
// para não interferir no projeto que importa o pacote
css = css.replace(/:root,:host/g, "[data-dynamo-root]");

fs.writeFileSync(cssPath, css);
