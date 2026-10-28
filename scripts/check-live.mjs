import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = "https://healthmate-theta.vercel.app";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
});

const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
await page.goto(`${base}/`, { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: "shots/live-landing.png" });

const title = await page.title();
const h1 = await page.evaluate(() => document.querySelector("h1")?.textContent?.trim());

await page.goto(`${base}/demo`, { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate((p) => localStorage.setItem("healthmate.profile.v1", JSON.stringify(p)), {
  name: "Nam", sex: "male", age: 32, heightCm: 172, weightKg: 74,
  activity: "light", goal: "lose", occupation: "office",
  conditionIds: ["hypertension"], drugIds: ["ibuprofen"], allergies: [],
});
await page.reload({ waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2000));
await page.screenshot({ path: "shots/live-demo.png" });

const kcal = await page.evaluate(() =>
  [...document.querySelectorAll("h1")].map((n) => n.textContent?.trim()).join(" | "),
);

console.log(`title: ${title}`);
console.log(`h1: ${h1}`);
console.log(`demo headings: ${kcal}`);
console.log(errors.length ? errors.join("\n") : "no runtime errors");

await browser.close();
