#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const SCALE_PERCENTAGE = 30; // Downscale to 30% of original size
const QUALITY = 80; // WebP quality (0-100)

// Order of websites
const WEBSITE_ORDER = [
  "derstandard",
  "zeit",
  "washingtonpost",
  "diepresse",
  "krone",
  "spiegel",
  "orf",
  "lemonde",
  "elpais",
];

async function createWebOptimizedImages() {
  console.log("Creating web-optimized images...");
  console.log(
    `Downscaling to ${SCALE_PERCENTAGE}% and converting to WebP format`
  );

  const screenshotsDir = path.resolve(
    __dirname,
    "..",
    "graphic_output",
    "screenshots"
  );
  const outputDir = path.resolve(
    __dirname,
    "..",
    "graphic_output",
    "screenshots_web"
  );

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Process desktop directory
  const desktopDir = path.join(screenshotsDir, "desktop");
  const outputDesktopDir = path.join(outputDir, "desktop");

  if (!fs.existsSync(desktopDir)) {
    console.error("Desktop screenshots directory not found.");
    return;
  }

  // Create output desktop directory
  if (!fs.existsSync(outputDesktopDir)) {
    fs.mkdirSync(outputDesktopDir, { recursive: true });
  }

  // Get all timestamp directories
  const timestamps = fs
    .readdirSync(desktopDir)
    .filter((dir) => fs.statSync(path.join(desktopDir, dir)).isDirectory())
    .sort();

  console.log(`Found ${timestamps.length} timestamps to process`);

  let processedCount = 0;
  let totalImages = timestamps.length * WEBSITE_ORDER.length;

  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i];
    const timestampDir = path.join(desktopDir, timestamp);
    const outputTimestampDir = path.join(outputDesktopDir, timestamp);

    console.log(`Processing ${i + 1}/${timestamps.length}: ${timestamp}`);

    // Create output timestamp directory
    if (!fs.existsSync(outputTimestampDir)) {
      fs.mkdirSync(outputTimestampDir, { recursive: true });
    }

    // Process each website's screenshot
    for (const site of WEBSITE_ORDER) {
      const inputFile = path.join(timestampDir, `${site}_${timestamp}.webp`);
      const outputFile = path.join(
        outputTimestampDir,
        `${site}_${timestamp}.webp`
      );

      try {
        if (fs.existsSync(inputFile)) {
          // Use FFmpeg to downscale and convert to WebP
          const ffmpegCmd = `ffmpeg -y -i "${inputFile}" -vf "scale=iw*${SCALE_PERCENTAGE}/100:ih*${SCALE_PERCENTAGE}/100" -quality ${QUALITY} "${outputFile}"`;

          execSync(ffmpegCmd, { stdio: "pipe" });
          processedCount++;

          // Get file sizes for comparison
          const inputStats = fs.statSync(inputFile);
          const outputStats = fs.statSync(outputFile);
          const compressionRatio = (
            ((inputStats.size - outputStats.size) / inputStats.size) *
            100
          ).toFixed(1);

          console.log(
            `  ✓ ${site}: ${(inputStats.size / 1024).toFixed(1)}KB → ${(
              outputStats.size / 1024
            ).toFixed(1)}KB (${compressionRatio}% smaller)`
          );
        } else {
          console.log(`  ⚠ ${site}: Original file not found`);

          // Create a small black placeholder for missing files
          const placeholderCmd = `ffmpeg -y -f lavfi -i color=c=black:s=192x144 -frames:v 1 -quality ${QUALITY} "${outputFile}"`;
          execSync(placeholderCmd, { stdio: "pipe" });
          console.log(`  ✓ ${site}: Created black placeholder`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${site}: ${error.message}`);
      }
    }
  }

  // Calculate statistics
  const originalTotalSize = calculateDirectorySize(desktopDir);
  const optimizedTotalSize = calculateDirectorySize(outputDesktopDir);
  const totalSavings = (
    ((originalTotalSize - optimizedTotalSize) / originalTotalSize) *
    100
  ).toFixed(1);

  console.log("\n📊 Processing Complete!");
  console.log(`Processed: ${processedCount}/${totalImages} images`);
  console.log(
    `Original size: ${(originalTotalSize / (1024 * 1024)).toFixed(1)} MB`
  );
  console.log(
    `Optimized size: ${(optimizedTotalSize / (1024 * 1024)).toFixed(1)} MB`
  );
  console.log(`Total savings: ${totalSavings}% smaller`);
  console.log(`Output directory: ${outputDir}`);
}

function calculateDirectorySize(dirPath) {
  let totalSize = 0;

  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach((file) => {
        calculateSize(path.join(currentPath, file));
      });
    }
  }

  if (fs.existsSync(dirPath)) {
    calculateSize(dirPath);
  }

  return totalSize;
}

// Helper function to check if FFmpeg is available
function checkFFmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch (error) {
    console.error("❌ FFmpeg not found. Please install FFmpeg first:");
    console.error("  macOS: brew install ffmpeg");
    console.error("  Ubuntu: sudo apt install ffmpeg");
    console.error("  Windows: Download from https://ffmpeg.org/");
    return false;
  }
}

// Main execution
if (require.main === module) {
  if (checkFFmpeg()) {
    createWebOptimizedImages().catch(console.error);
  }
}

module.exports = { createWebOptimizedImages };
