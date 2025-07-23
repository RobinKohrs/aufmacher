module.exports = {
  name: "lemonde",
  url: "https://www.lemonde.fr",
  timezone: "Europe/Paris",
  consentHandler: async (page) => {
    try {
      // Wait a bit for the page to fully load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("Le Monde: Looking for consent button...");

      // Primary selectors for Le Monde consent button
      const possibleSelectors = [
        'button[data-gdpr-expression="acceptAll"]',
        'button.gdpr-lmd-button--big[data-gdpr-expression="acceptAll"]',
        "button.gdpr-lmd-button.gdpr-lmd-button--big",
        'button:has-text("Accepter et continuer")',
        'button[class*="gdpr-lmd-button"]:has-text("Accepter")',
        'button[data-gdpr-expression="acceptAll"]:has-text("Accepter")',
        "button.gdpr-lmd-button--slate-darker",
        'button[class*="gdpr"]:has-text("continuer")',
        'button:has-text("Accepter")',
        'button[class*="gdpr"]',
      ];

      let buttonClicked = false;
      for (const selector of possibleSelectors) {
        try {
          console.log(`Le Monde: Trying selector: ${selector}`);
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.click(selector);
          console.log(
            `Le Monde: Successfully clicked button with selector: ${selector}`
          );
          buttonClicked = true;
          break;
        } catch (selectorError) {
          console.log(
            `Le Monde: Selector ${selector} not found, trying next...`
          );
        }
      }

      if (!buttonClicked) {
        console.log(
          "Le Monde: No consent button found, proceeding without clicking"
        );
      }

      // Wait for any overlay to disappear
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error handling consent for lemonde: ${error.message}`);
    }
  },
};
