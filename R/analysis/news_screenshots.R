# Simple News Website Screenshot Script
# Takes screenshots of news websites every 30 minutes

# Install packages if needed
if (!require("webshot", quietly = TRUE)) {
    install.packages("webshot")
}
if (!require("here", quietly = TRUE)) {
    install.packages("here")
}

library(webshot)
library(here)

# Install PhantomJS if needed
if (!webshot:::is_phantomjs_installed()) {
    webshot::install_phantomjs()
}

# Websites to capture
websites = list(
    derstandard = "https://derstandard.at",
    nytimes = "https://nytimes.com",
    zeit = "https://zeit.de"
)

# Create output directory
output_dir = here("graphic_output", "screenshots")
if (!dir.exists(output_dir)) {
    dir.create(output_dir, recursive = TRUE)
}

# JavaScript to dismiss cookie banners and consent modals
dismiss_banners_js = "
// Wait for banners to load
setTimeout(function() {
  // Common selectors for cookie/consent banners
  var selectors = [
    // DerStandard specific
    'button[title=\"Einverstanden\"]',
    'button[aria-label=\"Einverstanden\"]',
    '.sp_choice_type_11',
    '.message-button.primary',
    // Generic cookie banner buttons
    'button[id*=\"accept\"]',
    'button[id*=\"cookie\"]',
    'button[class*=\"accept\"]',
    'button[class*=\"cookie\"]',
    'button[class*=\"consent\"]',
    'button[class*=\"agree\"]',
    '[id*=\"cookie-accept\"]',
    '[class*=\"cookie-accept\"]',
    '[data-testid*=\"accept\"]',
    // Common close buttons
    '.close', '.dismiss', '.reject-all'
  ];
  
  for (var i = 0; i < selectors.length; i++) {
    var elements = document.querySelectorAll(selectors[i]);
    for (var j = 0; j < elements.length; j++) {
      try {
        if (elements[j].offsetParent !== null) { // element is visible
          elements[j].click();
          console.log('Clicked banner element:', selectors[i]);
          break;
        }
      } catch(e) {}
    }
  }
  
  // Also try pressing Escape key
  document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
}, 2000);
"

# Function to take screenshot
take_screenshot = function(url, site_name) {
    timestamp = format(Sys.time(), "%Y%m%d_%H%M%S")
    filename = paste0(site_name, "_", timestamp, ".png")
    filepath = file.path(output_dir, filename)

    cat("Capturing", site_name, "...\n")

    tryCatch(
        {
            webshot(
                url = url,
                file = filepath,
                vwidth = 1920,
                vheight = 1080,
                cliprect = "viewport",
                delay = 6, # Longer delay to handle banners
                eval = dismiss_banners_js # Execute JS to dismiss banners
            )
            cat("✓ Saved:", filename, "\n")
        },
        error = function(e) {
            cat("✗ Error:", e$message, "\n")
        }
    )
}

# Function to capture all websites
capture_all = function() {
    cat("=== Taking screenshots ===\n")
    cat("Time:", format(Sys.time(), "%Y-%m-%d %H:%M:%S"), "\n\n")

    for (site in names(websites)) {
        take_screenshot(websites[[site]], site)
    }

    cat("\n=== Done ===\n\n")
}

# Run continuous capture every 30 minutes
run_continuous = function(minutes = 30) {
    cat("Starting continuous capture every", minutes, "minutes\n")
    cat("Press Ctrl+C to stop\n\n")

    while (TRUE) {
        capture_all()
        cat("Waiting", minutes, "minutes...\n")
        Sys.sleep(minutes * 60)
    }
}

# Take single screenshot (for testing)
capture_all()

# Uncomment to run continuous capture:
# run_continuous(30)
