import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import puppeteer from "puppeteer";

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const htmlPath = resolve(dist, "index.html");

const server = createServer((req, res) => {
  let file = req.url === "/" ? "/index.html" : req.url;
  try {
    const content = readFileSync(resolve(dist, file.slice(1)));
    const ext = file.split(".").pop();
    const types = { html: "text/html", js: "application/javascript", css: "text/css", svg: "image/svg+xml" };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end();
  }
});

const port = 4567;
server.listen(port);

try {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle0" });
  const rootHtml = await page.$eval("#root", el => el.innerHTML);
  await browser.close();

  let html = readFileSync(htmlPath, "utf8");
  const start = '<div id="root">';
  const startIdx = html.indexOf(start);
  // Find the matching </div> before </body>
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
} finally {
  server.close();
}
