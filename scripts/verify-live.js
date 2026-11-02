const puppeteer = require("puppeteer-core");
const path = require("path");

const ARTIFACT_DIR = path.resolve("C:/Users/Administrator/.gemini/antigravity/brain/75a67e3c-f4a8-49af-a936-a5200f66a03c");

async function verifyLiveSite() {
  console.log("Connecting to browser...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  
  // 1. Check home page
  console.log("Checking http://localhost:3000...");
  const res = await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
  console.log("HTTP Status:", res.status());

  await new Promise((r) => setTimeout(r, 1000));

  // Check title
  const title = await page.title();
  console.log("Page Title:", title);

  // Check badges & texts
  const bodyText = await page.evaluate(() => document.body.innerText);
  const hasGDPR = bodyText.includes("DSGVO") || bodyText.includes("GDPR");
  const hasEN16931 = bodyText.includes("EN 16931");
  const hasXRechnung = bodyText.includes("XRechnung");

  console.log("GDPR Badge Verified:", hasGDPR);
  console.log("EN 16931 Badge Verified:", hasEN16931);
  console.log("XRechnung Verified:", hasXRechnung);

  // Take fresh full verification screenshot
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "live_verified_homepage.png"),
    fullPage: false,
  });

  console.log("Screenshot saved: live_verified_homepage.png");
  await browser.close();
}

verifyLiveSite().catch((e) => {
  console.error("Live test failed:", e);
  process.exit(1);
});

