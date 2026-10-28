import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BASE_URL ?? "http://localhost:3000";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 4 });
await page.goto(`${base}/`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 800));

const header = await page.$("header");
if (header) await header.screenshot({ path: "shots/logo-header.png" });

const corner = await page.$('a[aria-label^="HealthMate"]');
if (corner) await corner.screenshot({ path: "shots/logo-corner.png" });

console.log("saved logo crops");
await browser.close();
