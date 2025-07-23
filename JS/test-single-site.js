#!/usr/bin/env node

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Import all sites
const sites = require("./sites");

// Function to test a single site
async function testSingleSite(siteName, viewport = "desktop", headless = true) {
  console.log(`Testing ${siteName} with ${viewport} viewport...`);

  // Find the site configuration
  const site = sites.find((s) => s.name === siteName);
  if (!site) {
    console.error(
      `Site '${siteName}' not found. Available sites: ${sites
        .map((s) => s.name)
        .join(", ")}`
    );
    return;
  }

  const outputDir = path.join(
    __dirname,
    "..",
    "graphic_output",
    "screenshots",
    "test"
  );
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Define viewport configurations
  const viewportConfig =
    viewport === "mobile"
      ? {
          viewport: { width: 375, height: 812 },
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
          clip: { x: 0, y: 0, width: 375, height: 812 },
        }
      : {
          viewport: { width: 1440, height: 1080 }, // 4:3 aspect ratio
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          clip: { x: 0, y: 0, width: 1440, height: 1080 },
        };

  const browser = await puppeteer.launch({
    headless: headless, // Will be true by default now
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();

  try {
    console.log(`Testing ${site.name} (${site.url})...`);

    // Clear cookies for a fresh session
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCookies");

    // Set viewport and user agent
    await page.setViewport(viewportConfig.viewport);
    await page.setUserAgent(viewportConfig.userAgent);

    // Add stealth measures to avoid bot detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
      window.chrome = { runtime: {} };
    });

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.resourceType() === "font") {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(site.url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // --- DEBUG: Screenshot before consent handling ---
    const preConsentTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const preConsentFilename = `${site.name}_${viewport}_pre-consent_${preConsentTimestamp}.webp`;
    const preConsentFilepath = path.join(outputDir, preConsentFilename);
    await page.screenshot({
      path: preConsentFilepath,
      type: "webp",
      quality: 80,
      fullPage: false,
      clip: viewportConfig.clip,
    });
    console.log(`📸 Pre-consent screenshot saved: ${preConsentFilename}`);
    // --- END DEBUG ---

    await site.consentHandler(page);

    console.log(`Consent handling completed, waiting before screenshot...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Final screenshot
    const finalTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const finalFilename = `${site.name}_${viewport}_final_${finalTimestamp}.webp`;
    const finalFilepath = path.join(outputDir, finalFilename);
    await page.screenshot({
      path: finalFilepath,
      type: "webp",
      quality: 80,
      fullPage: false,
      clip: viewportConfig.clip,
    });
    console.log(`📸 Final screenshot saved: ${finalFilename}`);
  } catch (error) {
    console.error(`Error testing ${siteName}:`, error);
  } finally {
    await page.close().catch((e) => {});
    await browser.close().catch((e) => {});
  }
}

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "Usage: node test-single-site.js <site-name> [viewport] [headless]"
    );
    console.log(`Available sites: ${sites.map((s) => s.name).join(", ")}`);
    console.log("Available viewports: desktop, mobile (default: desktop)");
    console.log("Headless: true, false (default: true - runs headless)");
    console.log("\nExamples:");
    console.log(
      "  node test-single-site.js zeit              # Zeit with desktop, headless (default)"
    );
    console.log(
      "  node test-single-site.js zeit mobile false # Zeit with mobile, visible browser"
    );
    return;
  }

  const siteName = args[0];
  const viewport = args[1] || "desktop";
  const headless = args[2] !== "false"; // Default to true unless "false" is passed

  if (!["desktop", "mobile"].includes(viewport)) {
    console.error("Invalid viewport. Use 'desktop' or 'mobile'");
    return;
  }

  console.log(`Running in ${headless ? "headless" : "visible"} mode`);
  await testSingleSite(siteName, viewport, headless);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSingleSite };
