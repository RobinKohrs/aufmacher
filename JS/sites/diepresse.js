module.exports = {
  name: "diepresse",
  url: "https://diepresse.com",
  timezone: "Europe/Vienna",
  screenshot: "pre-consent", // Take screenshot before consent handler
  consentHandler: async (page) => {
    try {
      // Wait a bit for the page to fully load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("Die Presse: Looking for consent button...");

      // Primary selector for Die Presse consent button
      const acceptButtonSelector = "button#didomi-notice-agree-button";

      try {
        await page.waitForSelector(acceptButtonSelector, { timeout: 10000 });
        await page.click(acceptButtonSelector);
        console.log(
          "Die Presse: Successfully clicked 'Alle akzeptieren' button"
        );

        // Wait for consent overlay to disappear
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (selectorError) {
        console.log(
          "Die Presse: Primary consent button not found, trying fallbacks..."
        );

        // Fallback selectors
        const fallbackSelectors = [
          'button:has-text("Alle akzeptieren")',
          'button:has-text("Accept")',
          'button[class*="didomi-dismiss-button"]',
          'button[aria-label*="akzeptieren"]',
          '[id*="didomi"][id*="agree"]',
        ];

        let buttonClicked = false;
        for (const selector of fallbackSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            await page.click(selector);
            console.log(`Die Presse: Clicked fallback button: ${selector}`);
            buttonClicked = true;
            break;
          } catch (fallbackError) {
            console.log(`Die Presse: Fallback ${selector} not found`);
          }
        }

        if (!buttonClicked) {
          console.log(
            "Die Presse: No consent button found, proceeding without clicking"
          );
        }
      }
    } catch (error) {
      console.error(`Error handling consent for diepresse: ${error.message}`);
    }
  },
};
