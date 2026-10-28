import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const mark = (size, inset) => {
  const s = size;
  const i = inset;
  const w = s - i * 2;
  const bar = w * 0.16;
  const gap = w * 0.12;
  const top = i + w * 0.22;
  const h = w * 0.56;
  const leftX = i + w * 0.2;
  const rightX = leftX + bar + gap + w * 0.06;
  const radius = bar * 0.28;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <rect width="${s}" height="${s}" fill="#1f3a68"/>
    <g fill="#ffffff">
      <rect x="${leftX}" y="${top}" width="${bar}" height="${h}" rx="${radius}"/>
      <rect x="${rightX}" y="${top}" width="${bar}" height="${h}" rx="${radius}"/>
      <rect x="${leftX}" y="${top + h / 2 - bar / 2}" width="${rightX + bar - leftX}" height="${bar}" rx="${radius}"/>
    </g>
  </svg>`;
};

// full-bleed version: iOS applies its own corner radius
const fullBleed = (size) => mark(size, 0);

await mkdir("public", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars"],
});

async function render(svg, size, path) {
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(
    `<body style="margin:0;padding:0;overflow:hidden">${svg}</body>`,
    { waitUntil: "load" },
  );
  await page.screenshot({ path, omitBackground: true });
  await page.close();
  console.log(`saved ${path} (${size}px)`);
}

// standard icons — rounded square baked in, transparent outside the radius
const rounded = (size) => {
  const r = size * 0.22;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><clipPath id="c"><rect width="${size}" height="${size}" rx="${r}"/></clipPath></defs>
    <g clip-path="url(#c)">${mark(size, 0)}</g>
  </svg>`;
};

await render(rounded(192), 192, "public/icon-192.png");
await render(rounded(512), 512, "public/icon-512.png");
// maskable: keep the letterform inside the 80% safe zone
await render(fullBleed(512), 512, "public/icon-maskable-512.png");
await render(fullBleed(180), 180, "public/apple-touch-icon.png");

await browser.close();
