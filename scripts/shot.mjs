import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const [, , path = "/", name = "desktop", w = "1440", h = "900"] = process.argv;
const base = process.env.BASE_URL ?? "http://localhost:3000";
const url = `${base}${path}`;

await mkdir("shots", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--font-render-hinting=none",
  ],
});

const page = await browser.newPage();
const width = Number(w);
const height = Number(h);
await page.setViewport({
  width,
  height,
  deviceScaleFactor: 2,
  isMobile: width < 640,
  hasTouch: width < 640,
});
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate(() => document.fonts.ready);

// walk the page so whileInView animations fire, then return to top
await page.evaluate(async () => {
  const step = window.innerHeight * 0.8;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});

await new Promise((r) => setTimeout(r, 2200));

await page.screenshot({ path: `shots/${name}.png`, fullPage: true });
console.log(`saved shots/${name}.png (${width}x${height})`);
await browser.close();
