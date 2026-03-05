import { readFileSync, writeFileSync, rmSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, "../dist");
const ssrDir = resolve(__dirname, "../dist-ssr");
const htmlPath = resolve(dist, "index.html");
const ssrBundle = resolve(ssrDir, "entry-server.js");

const { render } = await import(ssrBundle);
const rootHtml = render();

rmSync(ssrDir, { recursive: true, force: true });

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
