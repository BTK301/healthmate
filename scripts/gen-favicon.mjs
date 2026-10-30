import puppeteer from "puppeteer-core";
import { writeFile } from "node:fs/promises";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="22" fill="#1f3a68"/>
  <g fill="#ffffff">
    <rect x="28" y="26" width="11" height="44" rx="3"/>
    <rect x="57" y="26" width="11" height="44" rx="3"/>
    <rect x="36" y="42" width="24" height="11" rx="3"/>
  </g>
</svg>`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 32, height: 32, deviceScaleFactor: 1 });
await page.setContent(`<body style="margin:0">${svg(32)}</body>`, { waitUntil: "load" });
const png = await page.screenshot({ omitBackground: true, type: "png" });
await browser.close();

// ICO wrapper around a PNG payload (supported by every modern browser)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count

const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0); // width
entry.writeUInt8(32, 1); // height
entry.writeUInt8(0, 2); // palette
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bits per pixel
entry.writeUInt32LE(png.length, 8); // size
entry.writeUInt32LE(22, 12); // offset

await writeFile("src/app/favicon.ico", Buffer.concat([header, entry, png]));
console.log(`src/app/favicon.ico written (${22 + png.length} bytes)`);
