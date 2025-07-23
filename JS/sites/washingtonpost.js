module.exports = {
  name: "washingtonpost",
  url: "https://www.washingtonpost.com",
  timezone: "America/New_York",
  consentHandler: async (page) => {
    try {
      // Wait a bit for the page to fully load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("Washington Post: Looking for consent button...");

      // Primary selector for Washington Post consent button
      const acceptButtonSelector = "button#onetrust-accept-btn-handler";

      try {
        await page.waitForSelector(acceptButtonSelector, { timeout: 10000 });
        await page.click(acceptButtonSelector);
        console.log("Washington Post: Successfully clicked 'I Accept' button");

        // Wait for consent overlay to disappear
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Check for additional close button that might appear
        try {
          const closeButtonSelectors = [
            'button[data-qa="close-button-container"]',
            'button:has-text("Close")',
            'button[class*="wpds-c-kSOqLF"]:has-text("Close")',
            'button svg + span:has-text("Close")',
          ];

          for (const closeSelector of closeButtonSelectors) {
            try {
              await page.waitForSelector(closeSelector, { timeout: 3000 });
              await page.click(closeSelector);
              console.log(
                `Washington Post: Clicked close button with selector: ${closeSelector}`
              );
              await new Promise((resolve) => setTimeout(resolve, 2000));
              break;
            } catch (closeError) {
              // Continue to next selector
            }
          }
        } catch (closeButtonError) {
          console.log("Washington Post: No close button found, continuing...");
        }
      } catch (selectorError) {
        console.log(
          "Washington Post: Primary consent button not found, trying fallbacks..."
        );

        // Fallback selectors
        const fallbackSelectors = [
          'button:has-text("I Accept")',
          'button:has-text("Accept")',
          '[id*="accept"]',
          '[class*="accept"]',
        ];

        let buttonClicked = false;
        for (const selector of fallbackSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            await page.click(selector);
            console.log(
              `Washington Post: Clicked fallback button: ${selector}`
            );
            buttonClicked = true;
            break;
          } catch (fallbackError) {
            console.log(`Washington Post: Fallback ${selector} not found`);
          }
        }

        if (!buttonClicked) {
          console.log(
            "Washington Post: No consent button found, proceeding without clicking"
          );
        }
      }
    } catch (error) {
      console.error(
        `Error handling consent for washingtonpost: ${error.message}`
      );
    }
  },
};
