import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BASE_URL ?? "http://localhost:3000";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
});

for (const path of ["/", "/demo"]) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${base}${path}`, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));
  const text = await page.evaluate(() => document.body.innerText.slice(0, 90).replace(/\n/g, " | "));
  console.log(`\n${path} -> ${text}`);
  console.log(errors.length ? errors.join("\n") : "  no runtime errors");
  await page.close();
}

await browser.close();
