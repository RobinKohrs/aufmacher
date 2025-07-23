#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Configuration
const GRID_SIZE = 3; // 3x3 grid
const CELL_WIDTH = 192; // Width of each cell in pixels (30% of original 640)
const CELL_HEIGHT = 144; // Height of each cell in pixels (30% of original 480)

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

// Website display names
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

async function createInteractiveSlider() {
  console.log("Creating interactive news screenshot slider...");

  const screenshotsDir = path.join(
    __dirname,
    "..",
    "graphic_output",
    "screenshots_web"
  );
  const outputDir = path.join(__dirname, "..", "graphic_output");

  // Find all timestamp directories for both desktop and mobile
  const desktopDir = path.join(screenshotsDir, "desktop");
  const mobileDir = path.join(screenshotsDir, "mobile");

  if (!fs.existsSync(desktopDir)) {
    console.error("Desktop screenshot directory not found.");
    return;
  }

  const timestamps = fs
    .readdirSync(desktopDir)
    .filter((dir) => fs.statSync(path.join(desktopDir, dir)).isDirectory())
    .sort();

  if (timestamps.length === 0) {
    console.error("No timestamp directories found.");
    return;
  }

  console.log(
    `Found ${timestamps.length} timestamp(s): ${timestamps.join(", ")}`
  );

  // Process each device type
  for (const deviceType of ["desktop", "mobile"]) {
    console.log(`\nProcessing ${deviceType} screenshots...`);

    const deviceDir = path.join(screenshotsDir, deviceType);
    if (!fs.existsSync(deviceDir)) {
      console.warn(`${deviceType} directory not found, skipping...`);
      continue;
    }

    const validTimestamps = [];

    // Check which timestamps have screenshot directories (we create placeholders for missing images)
    for (const timestamp of timestamps) {
      const timestampDir = path.join(deviceDir, timestamp);
      if (fs.existsSync(timestampDir)) {
        validTimestamps.push(timestamp);
      }
    }

    if (validTimestamps.length === 0) {
      console.warn(`No complete ${deviceType} screenshot sets found.`);
      continue;
    }

    console.log(
      `Creating ${deviceType} slider with ${validTimestamps.length} timestamp(s)...`
    );

    // Generate HTML
    const htmlContent = generateHTML(
      deviceType,
      validTimestamps,
      screenshotsDir
    );

    // Write HTML file
    const htmlFile = path.join(outputDir, `news_slider_${deviceType}.html`);
    fs.writeFileSync(htmlFile, htmlContent);

    console.log(
      `✓ ${
        deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
      } slider created: ${path.basename(htmlFile)}`
    );
  }

  console.log("\n🎛️ Interactive slider creation completed!");
  console.log(`Check the output directory: ${outputDir}`);
  console.log("Open the HTML files in your browser to use the slider.");
}

function generateHTML(deviceType, timestamps, screenshotsDir) {
  const deviceDir = path.join(screenshotsDir, deviceType);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Screenshots Slider - ${
      deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
    }</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: ${GRID_SIZE * CELL_WIDTH + 40}px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .header p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        
        .controls {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .slider-container {
            margin-bottom: 8px;
        }
        
        .slider-container label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
        }
        
        .slider {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: #ddd;
            outline: none;
            -webkit-appearance: none;
        }
        
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #007bff;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #007bff;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .timestamp-display {
            text-align: center;
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 16px;
            color: #333;
            background: #e9ecef;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
        }
        
        .grid-container {
            border: 2px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
            background: white;
        }
        
        .news-grid {
            display: grid;
            grid-template-columns: repeat(${GRID_SIZE}, ${CELL_WIDTH}px);
            grid-template-rows: repeat(${GRID_SIZE}, ${CELL_HEIGHT}px);
            gap: 0;
            width: ${GRID_SIZE * CELL_WIDTH}px; /* Fixed total width */
            height: ${GRID_SIZE * CELL_HEIGHT}px; /* Fixed total height */
        }
        
        .news-cell {
            position: relative;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${CELL_WIDTH}px; /* Fixed width */
            height: ${CELL_HEIGHT}px; /* Fixed height */
            overflow: hidden; /* Prevent content from breaking layout */
            box-sizing: border-box; /* Include border in dimensions */
        }
        
        .news-cell img {
            width: 100%;
            height: 100%;
            object-fit: cover; /* Changed from contain to cover for better fill */
            background: black;
            position: absolute;
            top: 0;
            left: 0;
        }
        
        .news-cell .label {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 500;
            text-align: center;
            z-index: 2; /* Ensure label stays on top */
        }
        
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #666;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #f8f9fa;
            z-index: 1;
        }
        
        .stats {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
            font-size: 14px;
            color: #666;
        }
        
        .stats strong {
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Desktopaufmacher</h1>
            <p>Desktop – Montagmorgen bis Mittwochabend</p>
        </div>
        
        <div class="controls">
            <div class="slider-container">
                <label for="timestamp-slider">Timeline:</label>
                <input 
                    type="range" 
                    id="timestamp-slider" 
                    class="slider"
                    min="0" 
                    max="${timestamps.length - 1}" 
                    value="0"
                    step="1"
                >
            </div>
            <div class="timestamp-display" id="timestamp-display">
                ${timestamps[0]}
            </div>
        </div>
        
        <div class="grid-container">
            <div class="news-grid" id="news-grid">
                ${WEBSITE_ORDER.map(
                  (site, index) => `
                    <div class="news-cell" data-site="${site}">
                        <div class="loading">Loading...</div>
                        <div class="label">${WEBSITE_NAMES[site]}</div>
                    </div>
                `
                ).join("")}
            </div>
        </div>
        
        <div class="stats">
            <strong>Grid Layout:</strong> ${GRID_SIZE}×${GRID_SIZE} • 
            <strong>Cell Size:</strong> ${CELL_WIDTH}×${CELL_HEIGHT} • 
            <strong>Total:</strong> ${GRID_SIZE * CELL_WIDTH}×${
    GRID_SIZE * CELL_HEIGHT
  }
        </div>
    </div>

    <script>
        const timestamps = ${JSON.stringify(timestamps)};
        const websiteOrder = ${JSON.stringify(WEBSITE_ORDER)};
        const deviceType = '${deviceType}';
        
        const slider = document.getElementById('timestamp-slider');
        const timestampDisplay = document.getElementById('timestamp-display');
        const newsGrid = document.getElementById('news-grid');
        
        let currentTimestampIndex = 0;
        let isLoading = false; // Prevent overlapping updates
        
        function updateTimestamp(index) {
            if (isLoading) return; // Prevent overlapping updates
            isLoading = true;
            
            currentTimestampIndex = index;
            const timestamp = timestamps[index];
            timestampDisplay.textContent = timestamp;
            
            console.log('Loading timestamp ' + index + ': ' + timestamp);
            
            let loadedCount = 0;
            const totalImages = websiteOrder.length;
            
            // Update all images
            websiteOrder.forEach((site, cellIndex) => {
                const cell = document.querySelector('[data-site="' + site + '"]');
                if (!cell) {
                    console.error('Cell not found for site: ' + site);
                    loadedCount++;
                    if (loadedCount === totalImages) isLoading = false;
                    return;
                }
                
                const existingImg = cell.querySelector('img');
                const loadingDiv = cell.querySelector('.loading');
                
                // Show loading state
                if (existingImg) existingImg.style.display = 'none';
                if (loadingDiv) {
                    loadingDiv.style.display = 'flex';
                    loadingDiv.textContent = 'Loading...';
                    loadingDiv.style.color = '#666';
                }
                
                // Create new image
                const img = new Image();
                const imagePath = 'screenshots_web/' + deviceType + '/' + timestamp + '/' + site + '_' + timestamp + '.webp';
                
                img.onload = function() {
                    console.log('✓ Loaded: ' + imagePath);
                    // Remove existing image
                    if (existingImg) existingImg.remove();
                    
                    // Add new image
                    img.style.display = 'block';
                    cell.insertBefore(img, cell.querySelector('.label'));
                    if (loadingDiv) loadingDiv.style.display = 'none';
                    
                    loadedCount++;
                    if (loadedCount === totalImages) isLoading = false;
                };
                
                img.onerror = function() {
                    console.warn('✗ Failed to load: ' + imagePath);
                    if (loadingDiv) {
                        loadingDiv.textContent = 'Missing';
                        loadingDiv.style.color = '#dc3545';
                        loadingDiv.style.display = 'flex';
                    }
                    
                    loadedCount++;
                    if (loadedCount === totalImages) isLoading = false;
                };
                
                // Set image source (relative path from HTML file to screenshots)
                img.src = imagePath;
            });
        }
        
        // Event listeners
        slider.addEventListener('input', function() {
            const index = parseInt(this.value);
            if (index >= 0 && index < timestamps.length) {
                updateTimestamp(index);
            } else {
                console.error('Invalid slider index: ' + index + ', max: ' + (timestamps.length - 1));
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' && currentTimestampIndex > 0) {
                currentTimestampIndex--;
                slider.value = currentTimestampIndex;
                updateTimestamp(currentTimestampIndex);
                e.preventDefault(); // Prevent page scrolling
            } else if (e.key === 'ArrowRight' && currentTimestampIndex < timestamps.length - 1) {
                currentTimestampIndex++;
                slider.value = currentTimestampIndex;
                updateTimestamp(currentTimestampIndex);
                e.preventDefault(); // Prevent page scrolling
            }
        });
        
        // Initialize slider
        slider.min = 0;
        slider.max = timestamps.length - 1;
        slider.value = 0;
        
        console.log('Initialized slider with ' + timestamps.length + ' timestamps (0-' + (timestamps.length - 1) + ')');
        
        // Initialize with first timestamp
        updateTimestamp(0);
    </script>
</body>
</html>`;
}

// Main execution
if (require.main === module) {
  createInteractiveSlider().catch(console.error);
}

module.exports = { createInteractiveSlider };
