import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, "../dist");
const htmlPath = resolve(dist, "index.html");
const ssrBundle = resolve(dist, "entry-server.js");

const { render } = await import(ssrBundle);
const rootHtml = render();

unlinkSync(ssrBundle);

let html = readFileSync(htmlPath, "utf8");
const start = '<div id="root">';
const startIdx = html.indexOf(start);
const bodyEnd = html.indexOf("</body>");
const endIdx = html.lastIndexOf("</div>", bodyEnd);
if (startIdx >= 0 && endIdx > startIdx) {
  html = html.slice(0, startIdx + start.length) + rootHtml + html.slice(endIdx);
  writeFileSync(htmlPath, html);
  console.log(`Pre-rendered ${rootHtml.length} chars into index.html`);
} else {
  console.error("Could not find root div boundaries");
  process.exit(1);
}
