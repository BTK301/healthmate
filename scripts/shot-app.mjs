import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BASE_URL ?? "http://localhost:3000";

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

const tabs = ["overview", "plan", "schedule", "alerts", "profile"];
const labels = {
  overview: "Tổng quan",
  plan: "Thực đơn",
  schedule: "Lịch",
  alerts: "Cảnh báo",
  profile: "Hồ sơ",
};

await mkdir("shots", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
});

async function shoot(label, width, height) {
  const page = await browser.newPage();
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 2,
    isMobile: width < 640,
    hasTouch: width < 640,
  });
  await page.goto(`${base}/demo`, { waitUntil: "networkidle0" });
  await page.evaluate((p) => {
    localStorage.setItem("healthmate.profile.v1", JSON.stringify(p));
  }, PROFILE);
  await page.reload({ waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1600));

  for (const tab of tabs) {
    const ok = await page.evaluate((text) => {
      const btn = [...document.querySelectorAll("button")].find(
        (b) => b.textContent?.trim() === text,
      );
      if (btn) btn.click();
      return Boolean(btn);
    }, labels[tab]);
    if (!ok) continue;
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({
      path: `shots/${label}-${tab}.png`,
      fullPage: true,
    });
    console.log(`saved shots/${label}-${tab}.png`);
  }

  await page.close();
}
await shoot("app-desktop", 1440, 960);
await shoot("app-mobile", 390, 844);

await browser.close();
