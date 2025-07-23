#!/usr/bin/env node

const { takeScreenshots } = require("./news-screenshots");
const {
  createVideoGrid,
  checkFFmpeg,
  displayGridLayout,
} = require("./create-video-grid");

const SCREENSHOT_INTERVAL = 15 * 60 * 1000; // 15 minutes

async function main() {
  if (!checkFFmpeg()) {
    return;
  }

  displayGridLayout();

  console.log(
    `Starting screenshot loop every ${
      SCREENSHOT_INTERVAL / 1000 / 60
    } minutes...`
  );
  console.log("Press Ctrl+C to stop the loop and create the video grid.");

  // Initial screenshot
  await takeScreenshots();

  const intervalId = setInterval(async () => {
    await takeScreenshots();
  }, SCREENSHOT_INTERVAL);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\nStopping screenshot loop...");
    clearInterval(intervalId);

    console.log("Creating video grid from collected screenshots...");
    await createVideoGrid();

    console.log("Process finished.");
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch(console.error);
}
