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
page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });

await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });
await page.goto(`${base}/demo`, { waitUntil: "networkidle0" });
await page.evaluate((p) => {
  localStorage.setItem("healthmate.profile.v1", JSON.stringify(p));
  localStorage.removeItem("healthmate.diary.v1");
}, PROFILE);
await page.reload({ waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1400));

const clickText = (text, exact = true) =>
  page.evaluate(
    (t, ex) => {
      const b = [...document.querySelectorAll("button")].find((x) =>
        ex ? x.textContent?.trim() === t : x.textContent?.includes(t),
      );
      b?.click();
      return Boolean(b);
    },
    text,
    exact,
  );

// 1. plan tab -> log two meals
await clickText("Thực đơn");
await new Promise((r) => setTimeout(r, 800));
await page.evaluate(() => {
  const buttons = [...document.querySelectorAll("button")].filter(
    (b) => b.textContent?.trim() === "Đã ăn",
  );
  buttons[0]?.click();
  buttons[2]?.click();
});
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: "shots/diary-plan.png", fullPage: true });
console.log("saved diary-plan");

// 2. overview after logging
await clickText("Tổng quan");
await new Promise((r) => setTimeout(r, 900));
const heading = await page.evaluate(() => document.querySelector("h1")?.textContent?.trim());
await page.screenshot({ path: "shots/diary-overview.png", fullPage: true });
console.log(`saved diary-overview — heading: ${heading}`);

// 3. add food sheet
await clickText("Thêm món");
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: "shots/diary-add.png" });
console.log("saved diary-add");

// 4. coach knows the remaining calories
await page.evaluate(() => {
  const close = [...document.querySelectorAll("button")].find(
    (b) => b.getAttribute("aria-label") === "Đóng",
  );
  close?.click();
});
await new Promise((r) => setTimeout(r, 500));
await clickText("Hỏi HealthMate", false);
await new Promise((r) => setTimeout(r, 600));
await clickText("Hôm nay tôi ăn bao nhiêu calo?", false);
await new Promise((r) => setTimeout(r, 800));
const answer = await page.evaluate(() => {
  const bubbles = [...document.querySelectorAll("div")].filter((d) =>
    d.className?.includes?.("bg-canvas/80"),
  );
  return bubbles.at(-1)?.textContent?.trim();
});
await page.screenshot({ path: "shots/diary-coach.png" });
console.log(`coach answer: ${answer}`);
console.log(errors.length ? errors.join("\n") : "no runtime errors");

await browser.close();
