import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = "https://healthmate-theta.vercel.app";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();
page.on("response", (r) => {
  if (r.status() >= 400) console.log(`${r.status()} ${r.url()}`);
});
await page.goto(`${base}/demo`, { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 2000));
await browser.close();
