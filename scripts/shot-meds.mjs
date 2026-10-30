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

const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });

await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
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

const click = (text, exact = true) =>
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

// meds tab
await click("Thuốc");
await new Promise((r) => setTimeout(r, 900));

// mark the first dose as taken
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) =>
    x.className?.includes?.("border-line") && x.textContent?.includes("08:00"),
  );
  b?.click();
});
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: "shots/meds.png", fullPage: true });
console.log("saved meds");

const headline = await page.evaluate(() => document.querySelector("h1")?.textContent?.trim());
console.log(`headline: ${headline}`);

// scan sheet
await click("Quét đơn");
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: "shots/meds-scan.png" });
console.log("saved meds-scan");

await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.getAttribute("aria-label") === "Đóng");
  b?.click();
});
await new Promise((r) => setTimeout(r, 500));

// add medication sheet
await click("Thêm thuốc");
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: "shots/meds-add.png" });
console.log("saved meds-add");

console.log(errors.length ? errors.join("\n") : "no runtime errors");
await browser.close();
