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

await mkdir("shots", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });
await page.goto(`${base}/demo`, { waitUntil: "networkidle0" });
await page.evaluate((p) => localStorage.setItem("healthmate.profile.v1", JSON.stringify(p)), PROFILE);
await page.reload({ waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1200));

await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    b.textContent?.includes("Hỏi HealthMate"),
  );
  btn?.click();
});
await new Promise((r) => setTimeout(r, 700));

await page.evaluate(() => {
  const chips = [...document.querySelectorAll("button")].filter((b) =>
    b.textContent?.includes("Phở bò có được không?"),
  );
  chips[0]?.click();
});
await new Promise((r) => setTimeout(r, 900));

await page.screenshot({ path: "shots/app-coach.png" });
console.log("saved shots/app-coach.png");

await browser.close();
