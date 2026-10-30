import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BASE_URL ?? "http://localhost:3000";

const PROFILE = {
  name: "Nam", sex: "male", age: 32, heightCm: 172, weightKg: 74,
  activity: "light", goal: "lose", occupation: "office",
  conditionIds: ["hypertension"], drugIds: ["ibuprofen", "metformin"], allergies: [],
};

await mkdir("shots", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
});

async function shoot(name, w, h, steps) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: w < 640, hasTouch: w < 640 });
  await page.goto(`${base}/demo`, { waitUntil: "networkidle0" });
  await page.evaluate((p) => {
    localStorage.setItem("healthmate.profile.v1", JSON.stringify(p));
    localStorage.removeItem("healthmate.meds.v1");
    localStorage.removeItem("healthmate.doses.v1");
    localStorage.removeItem("healthmate.diary.v1");
  }, PROFILE);
  await page.reload({ waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1500));

  for (const s of steps) {
    if (s.click) {
      await page.evaluate((t) => {
        const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.trim() === t);
        b?.click();
      }, s.click);
      await new Promise((r) => setTimeout(r, 800));
    }
    if (s.wait) await new Promise((r) => setTimeout(r, s.wait));
  }

  await page.screenshot({ path: `shots/${name}.png`, fullPage: true });
  console.log(`${name} ${errors.length ? "ERR " + errors.join(" | ") : "ok"}`);
  await page.close();
}

await shoot("today-desktop", 1440, 1000, []);
await shoot("today-treatment", 1440, 1000, [{ click: "Điều trị" }]);
await shoot("today-mobile", 390, 844, []);

await browser.close();
