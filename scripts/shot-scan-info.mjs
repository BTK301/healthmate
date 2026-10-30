import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BASE_URL ?? "http://localhost:3000";

const PROFILE = {
  name: "Nam", sex: "male", age: 32, heightCm: 172, weightKg: 74,
  activity: "light", goal: "lose", occupation: "office",
  conditionIds: ["hypertension"], drugIds: ["ibuprofen"], allergies: [],
};

await mkdir("shots", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
});

const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

await page.setRequestInterception(true);
page.on("request", (req) => {
  if (req.url().endsWith("/api/scan")) {
    void req.respond({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        source: "llm",
        items: [
          { name: "Ibuprofen 400mg", dose: "1 viên", timesPerDay: 2 },
          { name: "Metformin 500mg", dose: "1 viên", timesPerDay: 2 },
          { name: "Atorvastatin 10mg", dose: "1 viên", timesPerDay: 1 },
          { name: "Nexium 20mg", dose: "1 viên", timesPerDay: 1 },
        ],
      }),
    });
    return;
  }
  void req.continue();
});

await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await page.goto(`${base}/demo`, { waitUntil: "networkidle0" });
await page.evaluate((p) => {
  localStorage.setItem("healthmate.profile.v1", JSON.stringify(p));
  localStorage.removeItem("healthmate.meds.v1");
  localStorage.removeItem("healthmate.doses.v1");
}, PROFILE);
await page.reload({ waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1400));

const click = (text) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.trim() === t);
    b?.click();
    return Boolean(b);
  }, text);

await click("Thuốc");
await new Promise((r) => setTimeout(r, 800));
await click("Quét đơn");
await new Promise((r) => setTimeout(r, 700));

const input = await page.$('input[type="file"]');
await input.uploadFile("public/icon-192.png");
await new Promise((r) => setTimeout(r, 1800));

await page.screenshot({ path: "shots/meds-scan-info.png" });
console.log("saved meds-scan-info");

const info = await page.evaluate(() => document.body.innerText.includes("Kháng viêm không steroid"));
console.log(`shows class info: ${info}`);
console.log(errors.length ? errors.join("\n") : "no runtime errors");

await browser.close();
