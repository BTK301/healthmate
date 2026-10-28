import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BASE_URL ?? "http://localhost:3000";

const PROFILE = {
  name: "Nam", sex: "male", age: 32, heightCm: 172, weightKg: 74,
  activity: "light", goal: "lose", occupation: "office",
  conditionIds: ["hypertension"], drugIds: ["ibuprofen"], allergies: [],
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
});

for (const [name, w, h] of [["weight-mobile", 390, 844], ["weight-desktop", 1440, 960]]) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: w < 640, hasTouch: w < 640 });
  await page.goto(`${base}/demo`, { waitUntil: "networkidle0" });
  await page.evaluate((p) => {
    localStorage.setItem("healthmate.profile.v1", JSON.stringify(p));
    localStorage.removeItem("healthmate.weights.v1");
    localStorage.removeItem("healthmate.diary.v1");
  }, PROFILE);
  await page.reload({ waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1600));
  await page.screenshot({ path: `shots/${name}.png`, fullPage: true });
  console.log(`${name} ${errors.length ? "ERR: " + errors.join(" | ") : "ok"}`);
  await page.close();
}

await browser.close();
