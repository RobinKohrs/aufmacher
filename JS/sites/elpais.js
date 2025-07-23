module.exports = {
  name: "elpais",
  url: "https://elpais.com",
  timezone: "Europe/Madrid",
  consentHandler: async (page) => {
    try {
      // Wait a bit for the page to fully load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("El País: Looking for consent button...");

      // Primary selectors for El País consent button
      const possibleSelectors = [
        'a.pmConsentWall-button[onclick*="acceptConsentWall"]',
        'a.pmConsentWall-button:has-text("Accept and continue")',
        'a[onclick*="acceptConsentWall"]',
        "a.pmConsentWall-button",
        'a:has-text("Accept and continue")',
        'a[class*="ConsentWall"]:has-text("Accept")',
        'a[onclick*="accept"]:has-text("continue")',
        'button:has-text("Accept and continue")',
        'a:has-text("Aceptar")',
        'button:has-text("Aceptar")',
      ];

      let buttonClicked = false;
      for (const selector of possibleSelectors) {
        try {
          console.log(`El País: Trying selector: ${selector}`);
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.click(selector);
          console.log(
            `El País: Successfully clicked button with selector: ${selector}`
          );
          buttonClicked = true;
          break;
        } catch (selectorError) {
          console.log(
            `El País: Selector ${selector} not found, trying next...`
          );
        }
      }

      if (!buttonClicked) {
        console.log(
          "El País: No consent button found, proceeding without clicking"
        );
      }

      // Wait for any overlay to disappear
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error handling consent for elpais: ${error.message}`);
    }
  },
};
