#!/usr/bin/env node

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Import all site configurations
const sites = require("./sites");

async function takeScreenshots() {
  console.log("Starting news website screenshots...");

  const outputDir = path.join(__dirname, "..", "graphic_output", "screenshots");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Define viewport configurations
  const viewports = [
    {
      name: "desktop",
      viewport: { width: 1440, height: 1080 }, // 4:3 aspect ratio
      clip: { x: 0, y: 0, width: 1440, height: 1080 },
    },
  ];

  const browser = await puppeteer.launch({
    headless: true,
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

  // Helper function to get timezone-specific timestamp
  function getTimestamp(timezone) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const year = parts.find((p) => p.type === "year").value;
    const month = parts.find((p) => p.type === "month").value;
    const day = parts.find((p) => p.type === "day").value;
    const hour = parts.find((p) => p.type === "hour").value;
    const minute = parts.find((p) => p.type === "minute").value;
    const second = parts.find((p) => p.type === "second").value;

    return `${year}-${month}-${day}T${hour}${minute}${second}`;
  }

  // Generate a single Austrian timestamp for the entire run
  const runTimestamp = getTimestamp("Europe/Vienna");

  for (const viewport of viewports) {
    for (const site of sites) {
      const page = await browser.newPage();

      try {
        console.log(`Taking ${viewport.name} screenshot of ${site.name}...`);

        // Set viewport and user agent for the device type
        await page.setViewport(viewport.viewport);
        await page.setUserAgent(viewport.userAgent);

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

        // Create folder structure ahead of time
        const viewportFolderName =
          viewport.name === "mobile" ? "mobile" : "desktop";
        const timestampFolder = path.join(
          outputDir,
          viewportFolderName,
          runTimestamp
        );
        if (!fs.existsSync(timestampFolder)) {
          fs.mkdirSync(timestampFolder, { recursive: true });
        }

        const filename = `${site.name}_${runTimestamp}.webp`;
        const filepath = path.join(timestampFolder, filename);

        // Take screenshot before consent if configured
        if (site.screenshot === "pre-consent") {
          console.log(`  -> Taking 'pre-consent' screenshot for ${site.name}.`);
          await page.screenshot({
            path: filepath,
            type: "webp",
            quality: 80,
            fullPage: false,
            clip: viewport.clip,
          });
        }

        await site.consentHandler(page);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Take screenshot after consent for all other sites
        if (site.screenshot !== "pre-consent") {
          console.log(
            `  -> Taking 'post-consent' screenshot for ${site.name}.`
          );
          await page.screenshot({
            path: filepath,
            type: "webp",
            quality: 80,
            fullPage: false,
            clip: viewport.clip,
          });
        }

        console.log(
          `✓ Screenshot saved: ${viewportFolderName}/${runTimestamp}/${filename}`
        );
      } catch (error) {
        console.error(
          `Error taking ${viewport.name} screenshot of ${site.name}: ${error.message}`
        );
      } finally {
        await page.close().catch((e) => {});
      }
    }
  }

  await browser.close().catch((e) => {});
  console.log("All screenshots completed!");
}

if (require.main === module) {
  takeScreenshots().catch(console.error);
}

module.exports = { takeScreenshots };
