module.exports = {
  name: "krone",
  url: "https://www.krone.at",
  timezone: "Europe/Vienna",
  consentHandler: async (page) => {
    try {
      // Wait a bit for the page to fully load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("Krone: Looking for consent button...");

      // Try common consent button selectors for Austrian sites
      const possibleSelectors = [
        'button[id*="accept"]',
        'button[class*="accept"]',
        'button:has-text("Akzeptieren")',
        'button:has-text("Alle akzeptieren")',
        'button:has-text("Einverstanden")',
        'button:has-text("Zustimmen")',
        'button[aria-label*="akzeptieren"]',
        ".sp_choice_type_11",
        "button.sp_choice_type_11",
        'button[id*="consent"]',
        'button[class*="consent"]',
      ];

      let buttonClicked = false;
      for (const selector of possibleSelectors) {
        try {
          console.log(`Krone: Trying selector: ${selector}`);
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.click(selector);
          console.log(
            `Krone: Successfully clicked button with selector: ${selector}`
          );
          buttonClicked = true;
          break;
        } catch (selectorError) {
          console.log(`Krone: Selector ${selector} not found, trying next...`);
        }
      }

      if (!buttonClicked) {
        console.log(
          "Krone: No consent button found, proceeding without clicking"
        );
      }

      // Wait for any overlay to disappear
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error handling consent for krone: ${error.message}`);
    }
  },
};
