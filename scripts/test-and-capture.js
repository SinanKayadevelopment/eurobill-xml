const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const ARTIFACT_DIR = path.resolve("C:/Users/Administrator/.gemini/antigravity/brain/75a67e3c-f4a8-49af-a936-a5200f66a03c");

async function runTests() {
  console.log("Launching Edge Chromium...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1440, height: 960 },
  });

  const page = await browser.newPage();

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));

  // Step 1: Default German XML Viewer
  console.log("Capturing Step 1: XML Viewer & German XRechnung 3.0...");
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "step1_xml_viewer_german.png"),
    fullPage: false,
  });

  // Step 2: Switch to French and Load French Factur-X
  console.log("Switching Language to FR and loading Factur-X...");
  const frBtn = await page.$("button[title='Français']");
  if (frBtn) await frBtn.click();
  await new Promise((r) => setTimeout(r, 800));

  // Click Load Sample French Factur-X
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.innerText, b);
    if (text.includes("Factur-X")) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "step2_french_facturx.png"),
    fullPage: false,
  });

  // Step 3: Switch to Tab 2 (Generator)
  console.log("Switching to E-Invoice Generator Tab...");
  const tabButtons = await page.$$("main button");
  for (const b of tabButtons) {
    const text = await page.evaluate((el) => el.innerText, b);
    if (text.includes("Générateur") || text.includes("Generator")) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "step3_generator_form_preview.png"),
    fullPage: false,
  });

  // Step 4: Toggle Live XML Tab in Generator
  console.log("Toggling Live EN 16931 XML code preview...");
  const xmlTabBtn = await page.$$("button");
  for (const b of xmlTabBtn) {
    const text = await page.evaluate((el) => el.innerText, b);
    if (text.includes("XML")) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "step4_live_xml_code.png"),
    fullPage: false,
  });

  // Step 5: Open Pricing / Paywall Modal
  console.log("Opening Paywall Modal...");
  const pricingBtn = await page.$$("header button");
  for (const b of pricingBtn) {
    const text = await page.evaluate((el) => el.innerText, b);
    if (text.includes("Tarifs") || text.includes("Preise") || text.includes("Pricing")) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "step5_paywall_modal.png"),
    fullPage: false,
  });

  console.log("All screenshots captured successfully!");
  await browser.close();
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

