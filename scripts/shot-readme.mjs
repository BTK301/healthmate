import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "docs/screenshots";

const PROFILE = {
  name: "Nam",
  sex: "male",
  age: 32,
  heightCm: 172,
  weightKg: 74,
  activity: "light",
  goal: "lose",
  occupation: "office",
  conditionIds: ["hypertension"],
  drugIds: ["ibuprofen"],
  allergies: [],
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
    width,
    height,
    deviceScaleFactor: 1.5,
    isMobile: mobile,
    hasTouch: mobile,
  });
  return page;
}

// landing
{
  const page = await open(1440, 900);
  await page.goto(`${base}/`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 2200));
  await page.screenshot({ path: `${out}/01-landing.png` });
  await page.close();
  console.log("01-landing");
}

async function appShot(tabLabel, file, width = 1440, height = 900, mobile = false) {
  const page = await open(width, height, mobile);
  await page.goto(`${base}/demo`, { waitUntil: "networkidle0" });
  await page.evaluate((p) => {
    localStorage.setItem("healthmate.profile.v1", JSON.stringify(p));
    localStorage.removeItem("healthmate.diary.v1");
  }, PROFILE);
  await page.reload({ waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1400));

  // log two meals so the diary feature is visible in the screenshots
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "Thực đơn",
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 700));
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")].filter(
      (b) => b.textContent?.trim() === "Đã ăn",
    );
    buttons[0]?.click();
    buttons[2]?.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  if (tabLabel) {
    await page.evaluate((text) => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === text);
      btn?.click();
    }, tabLabel);
    await new Promise((r) => setTimeout(r, 900));
  } else {
    // logging left us on the plan tab — go back to the overview
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find(
        (b) => b.textContent?.trim() === "Tổng quan",
      );
      btn?.click();
    });
    await new Promise((r) => setTimeout(r, 900));
  }

  await page.screenshot({ path: `${out}/${file}` });
  await page.close();
  console.log(file);
}

await appShot(null, "02-overview.png");
await appShot("Thực đơn", "03-meal-plan.png");
await appShot("Cảnh báo", "04-alerts.png");
await appShot("Lịch", "05-schedule.png");
await appShot(null, "06-mobile.png", 390, 844, true);

// coach
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
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: `${out}/07-coach.png` });
  await page.close();
  console.log("07-coach");
}

await browser.close();
