import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = "https://healthmate-theta.vercel.app";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto(`${base}/demo`, { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 2500));

const info = await page.evaluate(async () => {
  const link = document.querySelector('link[rel="manifest"]');
  const apple = document.querySelector('link[rel="apple-touch-icon"]');
  let regs = [];
  try {
    regs = await navigator.serviceWorker.getRegistrations();
  } catch {
    /* no sw support */
  }
  return {
    manifestHref: link?.getAttribute("href") ?? null,
    appleIcon: apple?.getAttribute("href") ?? null,
    swCount: regs.length,
    swScope: regs[0]?.scope ?? null,
  };
});

console.log(JSON.stringify(info, null, 2));

// second online visit: the service worker now controls the page and can cache assets
await page.reload({ waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2500));

// offline smoke test
await page.setOfflineMode(true);
try {
  await page.reload({ waitUntil: "domcontentloaded", timeout: 20000 });
  await new Promise((r) => setTimeout(r, 2000));
  const text = await page.evaluate(() =>
    document.body.innerText.slice(0, 70).replace(/\n/g, " | "),
  );
  console.log(`offline reload -> "${text}"`);
} catch (e) {
  console.log(`offline reload failed: ${e.message}`);
}

await browser.close();
