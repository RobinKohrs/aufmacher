#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const FRAME_DURATION = 0.2; // 200ms per frame
const OUTPUT_FPS = 5; // 5 frames per second (200ms intervals)
const GRID_SIZE = 3; // 3x3 grid
const CELL_WIDTH = 640; // Width of each cell in pixels
const CELL_HEIGHT = 480; // Height of each cell in pixels

// Order of websites in the 3x3 grid
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

async function createVideoGrid() {
  console.log("Creating 3x3 news video grid...");

  const screenshotsDir = path.resolve(
    __dirname,
    "..",
    "graphic_output",
    "screenshots"
  );
  const outputDir = path.resolve(__dirname, "..", "graphic_output", "videos");
  const tempDir = path.resolve(outputDir, "temp_frames");

  // Create output and temp directories
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Find all timestamp directories
  const desktopDir = path.resolve(screenshotsDir, "desktop");
  const mobileDir = path.resolve(screenshotsDir, "mobile");

  // Only process device types that exist
  const deviceTypes = [];
  if (fs.existsSync(desktopDir)) deviceTypes.push("desktop");
  if (fs.existsSync(mobileDir)) deviceTypes.push("mobile");

  if (deviceTypes.length === 0) {
    console.error(
      "No screenshot directories found. Please run the screenshot script first."
    );
    return;
  }

  // Use desktop timestamps if available, otherwise mobile
  let timestamps = [];
  if (fs.existsSync(desktopDir)) {
    timestamps = fs
      .readdirSync(desktopDir)
      .filter((dir) => fs.statSync(path.join(desktopDir, dir)).isDirectory())
      .sort();
  } else if (fs.existsSync(mobileDir)) {
    timestamps = fs
      .readdirSync(mobileDir)
      .filter((dir) => fs.statSync(path.join(mobileDir, dir)).isDirectory())
      .sort();
  }

  console.log(`Found ${timestamps.length} timestamps`);

  if (timestamps.length === 0) {
    console.error("No timestamp directories found.");
    return;
  }

  // Process each device type that exists
  for (const deviceType of deviceTypes) {
    console.log(`\nProcessing ${deviceType} screenshots...`);

    const deviceDir = path.join(screenshotsDir, deviceType);
    const placeholderPath = path.join(__dirname, "black_placeholder.webp");

    // Create a black placeholder image if it doesn't exist
    if (!fs.existsSync(placeholderPath)) {
      console.log("Creating black placeholder...");
      execSync(
        `ffmpeg -f lavfi -i color=c=black:s=${CELL_WIDTH}x${CELL_HEIGHT} -frames:v 1 "${placeholderPath}"`
      );
    }

    // Clean temp directory
    const tempFiles = fs.readdirSync(tempDir);
    for (const file of tempFiles) {
      fs.unlinkSync(path.join(tempDir, file));
    }

    console.log(
      `Creating individual frames for ${timestamps.length} timestamps...`
    );

    // Create individual grid frames
    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      const frameNumber = String(i).padStart(6, "0");
      const outputFrame = path.join(tempDir, `frame_${frameNumber}.png`);

      console.log(
        `Processing frame ${i + 1}/${timestamps.length}: ${timestamp}`
      );

      // Collect input files for this frame
      const inputFiles = [];
      for (const site of WEBSITE_ORDER) {
        const screenshotPath = path.join(
          deviceDir,
          timestamp,
          `${site}_${timestamp}.webp`
        );
        if (fs.existsSync(screenshotPath)) {
          inputFiles.push(screenshotPath);
        } else {
          console.log(`  Missing: ${site} (using placeholder)`);
          inputFiles.push(placeholderPath);
        }
      }

      // Create 3x3 grid for this timestamp
      let ffmpegCmd = "ffmpeg -y";

      // Add all 9 input files
      for (const inputFile of inputFiles) {
        ffmpegCmd += ` -i "${inputFile}"`;
      }

      // Create filter for 3x3 grid layout
      let filterComplex = "";

      // Scale each input to cell size
      for (let j = 0; j < 9; j++) {
        filterComplex += `[${j}:v]scale=${CELL_WIDTH}:${CELL_HEIGHT}:force_original_aspect_ratio=decrease,pad=${CELL_WIDTH}:${CELL_HEIGHT}:(ow-iw)/2:(oh-ih)/2:black[scaled_${j}];`;
      }

      // Create rows
      filterComplex += `[scaled_0][scaled_1][scaled_2]hstack=inputs=3[row1];`;
      filterComplex += `[scaled_3][scaled_4][scaled_5]hstack=inputs=3[row2];`;
      filterComplex += `[scaled_6][scaled_7][scaled_8]hstack=inputs=3[row3];`;

      // Stack rows vertically
      filterComplex += `[row1][row2][row3]vstack=inputs=3[grid_base];`;

      // Format timestamp for display (convert ISO format to readable format)
      const displayTime = formatTimestamp(timestamp);

      // Add timestamp overlay in lower right corner (escape colons for FFmpeg)
      const escapedTime = displayTime.replace(/:/g, "\\\\:");
      filterComplex += `[grid_base]drawtext=text='${escapedTime}':fontfile=/System/Library/Fonts/Arial.ttf:fontsize=36:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5:x=w-tw-20:y=h-th-20[v]`;

      ffmpegCmd += ` -filter_complex "${filterComplex}" -map "[v]" -frames:v 1 "${outputFrame}"`;

      try {
        execSync(ffmpegCmd, { stdio: "pipe" });
      } catch (error) {
        console.error(`Error creating frame ${i}: ${error.message}`);
        continue;
      }
    }

    // Create video from frames
    console.log("\nCombining frames into video...");
    const outputFile = path.join(
      outputDir,
      `news_grid_${deviceType}_${Date.now()}.mp4`
    );

    const videoCmd = `ffmpeg -y -framerate ${OUTPUT_FPS} -i "${tempDir}/frame_%06d.png" -c:v libx264 -pix_fmt yuv420p -t ${
      timestamps.length * FRAME_DURATION
    } "${outputFile}"`;

    try {
      execSync(videoCmd, { stdio: "inherit" });
      console.log(
        `✓ ${
          deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
        } video created: ${path.basename(outputFile)}`
      );

      // Display video info
      const totalDuration = timestamps.length * FRAME_DURATION;
      console.log(
        `  Duration: ${totalDuration}s (${timestamps.length} frames × ${FRAME_DURATION}s each)`
      );
      console.log(
        `  Grid: ${GRID_SIZE}×${GRID_SIZE} (${CELL_WIDTH}×${CELL_HEIGHT} per cell)`
      );
      console.log(
        `  Total resolution: ${CELL_WIDTH * GRID_SIZE}×${
          CELL_HEIGHT * GRID_SIZE
        }`
      );

      // Get file size
      const stats = fs.statSync(outputFile);
      console.log(`  File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    } catch (error) {
      console.error(`Error creating ${deviceType} video:`, error.message);
    }
  }

  // Clean up temp directory
  console.log("\nCleaning up temporary files...");
  const tempFiles = fs.readdirSync(tempDir);
  for (const file of tempFiles) {
    fs.unlinkSync(path.join(tempDir, file));
  }
  fs.rmdirSync(tempDir);

  console.log("\n🎬 Video grid creation completed!");
  console.log(`Check the output directory: ${outputDir}`);
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

// Helper function to format timestamp for display
function formatTimestamp(timestamp) {
  try {
    // Convert from format like "2025-07-21T001808" to readable format
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(5, 7);
    const day = timestamp.substring(8, 10);
    const hour = timestamp.substring(11, 13);
    const minute = timestamp.substring(13, 15);
    const second = timestamp.substring(15, 17);

    // Create readable format: "2025-07-21 00:18:08"
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  } catch (error) {
    // Fallback to original timestamp if parsing fails
    return timestamp;
  }
}

// Display website grid layout
function displayGridLayout() {
  console.log("\n📋 3×3 Grid Layout:");
  console.log("┌─────────────┬─────────────┬─────────────┐");
  console.log("│ Der Standard│    Zeit     │  Wash Post  │");
  console.log("├─────────────┼─────────────┼─────────────┤");
  console.log("│ Die Presse  │    Krone    │ Der Spiegel │");
  console.log("├─────────────┼─────────────┼─────────────┤");
  console.log("│     ORF     │  Le Monde   │  El País    │");
  console.log("└─────────────┴─────────────┴─────────────┘");
  console.log(
    `\nFrame duration: ${FRAME_DURATION}s (${FRAME_DURATION * 1000}ms)`
  );
  console.log(`Cell resolution: ${CELL_WIDTH}×${CELL_HEIGHT}`);
  console.log(
    `Total resolution: ${CELL_WIDTH * GRID_SIZE}×${CELL_HEIGHT * GRID_SIZE}\n`
  );
}

// Main execution
if (require.main === module) {
  if (checkFFmpeg()) {
    displayGridLayout();
    createVideoGrid().catch(console.error);
  }
}

module.exports = { createVideoGrid, checkFFmpeg, displayGridLayout };
