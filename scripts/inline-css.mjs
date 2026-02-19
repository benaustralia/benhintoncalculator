import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
let html = readFileSync(resolve(dist, "index.html"), "utf8");

const linkMatch = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
if (linkMatch) {
  const cssPath = resolve(dist, linkMatch[1].replace(/^\//, ""));
  const css = readFileSync(cssPath, "utf8");
  html = html.replace(linkMatch[0], `<style>${css}</style>`);
  writeFileSync(resolve(dist, "index.html"), html);
  unlinkSync(cssPath);
  console.log(`Inlined CSS (${(css.length / 1024).toFixed(1)}KB) into index.html`);
}
