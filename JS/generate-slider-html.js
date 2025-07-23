#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Configuration
const GRID_SIZE = 3; // 3x3 grid
const CELL_WIDTH = 480; // Adjusted for 4:3 aspect ratio
const CELL_HEIGHT = 360; // Adjusted for 4:3 aspect ratio

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

const WEBSITE_NAMES = {
  derstandard: "Der Standard",
  zeit: "Die Zeit",
  washingtonpost: "Washington Post",
  diepresse: "Die Presse",
  krone: "Kronen Zeitung",
  spiegel: "Der Spiegel",
  orf: "ORF",
  lemonde: "Le Monde",
  elpais: "El País",
};

function generateSliderHTML() {
  console.log("Generating interactive slider HTML file...");

  const screenshotsDir = path.resolve(
    __dirname,
    "..",
    "graphic_output",
    "screenshots"
  );
  const outputDir = path.resolve(__dirname, "..");
  const deviceType = "desktop";
  const deviceDir = path.join(screenshotsDir, deviceType);

  if (!fs.existsSync(deviceDir)) {
    console.error(`Error: Screenshot directory not found at ${deviceDir}`);
    process.exit(1);
  }

  const timestamps = fs
    .readdirSync(deviceDir)
    .filter((dir) => fs.statSync(path.join(deviceDir, dir)).isDirectory())
    .sort();

  const validTimestamps = timestamps.filter((timestamp) => {
    return WEBSITE_ORDER.every((site) => {
      const imgPath = path.join(
        deviceDir,
        timestamp,
        `${site}_${timestamp}.webp`
      );
      return fs.existsSync(imgPath);
    });
  });

  if (validTimestamps.length === 0) {
    console.error("No complete sets of desktop screenshots found.");
    process.exit(1);
  }

  console.log(`Found ${validTimestamps.length} complete timestamp sets.`);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Screenshots Timeline</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f0f2f5; color: #1c1e21; }
        .container { max-width: ${
          GRID_SIZE * (CELL_WIDTH + 2)
        }px; margin: 20px auto; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 20px; }
        h1 { margin: 0 0 5px 0; }
        .controls { padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 20px; text-align: center; }
        input[type="range"] { width: 100%; cursor: pointer; }
        #timestamp-display { margin-top: 10px; font-family: 'SF Mono', 'Menlo', monospace; font-size: 1.1em; background: #e9ecef; padding: 5px 10px; border-radius: 4px; }
        .grid { display: grid; grid-template-columns: repeat(${GRID_SIZE}, 1fr); border: 1px solid #ddd; }
        .cell { position: relative; width: 100%; padding-top: ${
          (CELL_HEIGHT / CELL_WIDTH) * 100
        }%; /* 4:3 Aspect ratio */ border: 1px solid #ddd; }
        .cell img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .cell .label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 5px; font-size: 12px; text-align: center; }
        /* Preloader styles */
        #loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.95); z-index: 10; display: flex; align-items: center; justify-content: center; flex-direction: column; }
        .spinner { border: 8px solid #f3f3f3; border-top: 8px solid #3498db; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        #loader p { margin-top: 20px; font-size: 1.2em; color: #333; }
        #main-content { display: none; }
    </style>
</head>
<body>

    <div id="loader">
        <div class="spinner"></div>
        <p>Preloading images... <span id="progress-text"></span></p>
    </div>

    <div id="main-content">
        <div class="container">
            <div class="header">
                <h1>News Screenshots Timeline</h1>
                <p>Use the slider or arrow keys to navigate through timestamps.</p>
            </div>
            <div class="controls">
                <input type="range" id="slider" min="0" max="${
                  validTimestamps.length - 1
                }" value="0" step="1">
                <div id="timestamp-display"></div>
            </div>
            <div class="grid" id="grid"></div>
        </div>
    </div>

    <script>
        const timestamps = ${JSON.stringify(validTimestamps)};
        const sites = ${JSON.stringify(WEBSITE_ORDER)};
        const siteNames = ${JSON.stringify(WEBSITE_NAMES)};
        
        const slider = document.getElementById('slider');
        const timestampDisplay = document.getElementById('timestamp-display');
        const grid = document.getElementById('grid');
        const loader = document.getElementById('loader');
        const mainContent = document.getElementById('main-content');
        const progressText = document.getElementById('progress-text');

        function updateGrid(index) {
            const timestamp = timestamps[index];
            slider.value = index;
            timestampDisplay.textContent = new Date(timestamp.replace('T', ' ')).toLocaleString();

            let gridHTML = '';
            for (const site of sites) {
                const imagePath = \`graphic_output/screenshots/desktop/\${timestamp}/\${site}_\${timestamp}.webp\`;
                gridHTML += \`
                    <div class="cell">
                        <img src="\${imagePath}" alt="\${siteNames[site]}">
                        <div class="label">\${siteNames[site]}</div>
                    </div>
                \`;
            }
            grid.innerHTML = gridHTML;
        }

        function preloadImages() {
            const imagePaths = [];
            for (const ts of timestamps) {
                for (const site of sites) {
                    imagePaths.push(\`graphic_output/screenshots/desktop/\${ts}/\${site}_\${ts}.webp\`);
                }
            }

            let loadedCount = 0;
            const totalImages = imagePaths.length;
            progressText.textContent = \`(\${loadedCount} / \${totalImages})\`;

            if (totalImages === 0) {
                showApp();
                return;
            }

            imagePaths.forEach(src => {
                const img = new Image();
                img.src = src;
                const onFinish = () => {
                    loadedCount++;
                    progressText.textContent = \`(\${loadedCount} / \${totalImages})\`;
                    if (loadedCount === totalImages) {
                        showApp();
                    }
                };
                img.onload = onFinish;
                img.onerror = onFinish; // Treat errors as loaded to not block the app
            });
        }

        function showApp() {
            loader.style.display = 'none';
            mainContent.style.display = 'block';
            updateGrid(0); // Display the first set of images
        }

        slider.addEventListener('input', (e) => updateGrid(parseInt(e.target.value, 10)));

        document.addEventListener('keydown', (e) => {
            let currentIndex = parseInt(slider.value, 10);
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                updateGrid(currentIndex - 1);
            } else if (e.key === 'ArrowRight' && currentIndex < timestamps.length - 1) {
                updateGrid(currentIndex + 1);
            }
        });

        // Start preloading
        preloadImages();
    <\/script>
</body>
</html>
  `;

  const outputFile = path.join(outputDir, "interactive_slider.html");
  fs.writeFileSync(outputFile, html);
  console.log(`\n✅ Success! Slider HTML file created at:\n${outputFile}`);
  console.log("\nJust open that file in your browser to use it.");
}

generateSliderHTML();
