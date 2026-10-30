import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "docs/screenshots";

const PROFILE = {
  name: "Nam", sex: "male", age: 32, heightCm: 172, weightKg: 74,
  activity: "light", goal: "lose", occupation: "office",
  conditionIds: ["hypertension"], drugIds: ["ibuprofen", "metformin"], allergies: [],
};

await mkdir(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
});

async function open(width, height, mobile = false) {
  const page = await browser.newPage();
  await page.setViewport({
    width, height, deviceScaleFactor: 1.5, isMobile: mobile, hasTouch: mobile,
  });
  return page;
}

const click = (page, text) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.trim() === t);
    b?.click();
    return Boolean(b);
  }, text);

// 01 landing
{
  const page = await open(1440, 900);
  await page.goto(`${base}/`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 2200));
  await page.screenshot({ path: `${out}/01-landing.png` });
  await page.close();
  console.log("01-landing");
}

async function appShot(file, { clicks = [], width = 1440, height = 900, mobile = false, logMeals = false } = {}) {
  const page = await open(width, height, mobile);
  await page.goto(`${base}/demo`, { waitUntil: "networkidle0" });
  await page.evaluate((p) => {
    localStorage.setItem("healthmate.profile.v1", JSON.stringify(p));
    localStorage.removeItem("healthmate.diary.v1");
    localStorage.removeItem("healthmate.meds.v1");
    localStorage.removeItem("healthmate.doses.v1");
  }, PROFILE);
  await page.reload({ waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1400));

  if (logMeals) {
    await click(page, "Bữa ăn");
    await new Promise((r) => setTimeout(r, 700));
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")].filter((b) => b.textContent?.trim() === "Đã ăn");
      buttons[0]?.click();
      buttons[2]?.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await click(page, "Hôm nay");
    await new Promise((r) => setTimeout(r, 800));
  }

  for (const c of clicks) {
    await click(page, c);
    await new Promise((r) => setTimeout(r, 800));
  }

  await page.screenshot({ path: `${out}/${file}` });
  await page.close();
  console.log(file);
}

await appShot("02-overview.png", { logMeals: true });
await appShot("03-meals.png", { clicks: ["Bữa ăn"] });
await appShot("04-treatment.png", { clicks: ["Điều trị"] });
await appShot("05-interactions.png", { clicks: ["Điều trị", "Tương tác"] });
await appShot("06-mobile.png", { width: 390, height: 844, mobile: true, logMeals: true });

// 07 coach
{
  const page = await open(1440, 900);
  await page.goto(`${base}/demo`, { waitUntil: "networkidle0" });
  await page.evaluate((p) => localStorage.setItem("healthmate.profile.v1", JSON.stringify(p)), PROFILE);
  await page.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Hỏi HealthMate"));
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.evaluate(() => {
    const chip = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Phở bò có được không?"));
    chip?.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: `${out}/07-coach.png` });
  await page.close();
  console.log("07-coach");
}

await browser.close();
