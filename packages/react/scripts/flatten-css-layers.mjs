/**
 * Post-process Tailwind-built CSS to remove @layer directives.
 * This allows the published CSS to be imported in projects that use Tailwind v4
 * without triggering "no matching @tailwind base directive" errors.
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

const css = fs.readFileSync(cssPath, "utf8");

const stripLayers = () => ({
  postcssPlugin: "strip-layer-rules",
  Once(root) {
    root.walkAtRules("layer", (rule) => {
      rule.replaceWith(rule.nodes);
    });
  },
});
stripLayers.postcss = true;

const result = await postcss([stripLayers]).process(css, { from: cssPath });
fs.writeFileSync(cssPath, result.css);
