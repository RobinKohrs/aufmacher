module.exports = {
  name: "zeit",
  url: "https://zeit.de",
  timezone: "Europe/Berlin",
  consentHandler: async (page) => {
    try {
      // Step 1: Handle the initial Sourcepoint consent banner
      console.log("Zeit: Looking for initial consent banner...");
      const initialConsentButtonSelector =
        'button[title="Agree and continue"], button[aria-label="Agree and continue"], .sp_choice_type_11, button.sp_choice_type_11, [data-testid="banner-accept-all-button"]';

      try {
        await page.waitForSelector(initialConsentButtonSelector, {
          timeout: 10000,
          visible: true,
        });
        await page.click(initialConsentButtonSelector);
        console.log("Zeit: Clicked initial consent button.");
      } catch (e) {
        console.log(
          "Zeit: Initial consent button not found or failed to click, trying iframe..."
        );
        await page.waitForSelector('iframe[id*="sp_"]', { timeout: 3000 });
        const frames = await page.frames();
        const consentFrame = frames.find(
          (frame) =>
            frame.name().includes("sp_") || frame.url().includes("sourcepoint")
        );
        if (consentFrame) {
          await consentFrame.click('button[title="Agree and continue"]');
          console.log("Zeit: Clicked initial consent button in iframe.");
        } else {
          throw new Error("Could not find consent iframe.");
        }
      }

      // Wait a moment for the page to react after the first banner is gone
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 2: Handle the second footer ad banner (<dialog> element)
      console.log("Zeit: Looking for the second footer ad banner...");

      const dialogSelector = 'dialog[data-tp="footerbar"]';
      const closeButtonSelector = `${dialogSelector} button[aria-label="schließen"][data-tp-action="click"][data-tp-type="close"]`;

      try {
        // Wait for the close button inside the dialog to be visible and ready
        await page.waitForSelector(closeButtonSelector, {
          timeout: 15000,
          visible: true,
        });
        console.log("Zeit: Found the close button in the footer dialog.");

        // Try clicking it with multiple methods to be sure
        let clicked = false;
        try {
          // Method 1: Puppeteer's click
          await page.click(closeButtonSelector);
          console.log(
            "Zeit: Successfully clicked the close button with page.click()."
          );
          clicked = true;
        } catch (e) {
          console.warn(
            `Zeit: page.click() failed: ${e.message}. Trying JavaScript click.`
          );
        }

        if (!clicked) {
          // Method 2: JavaScript click
          const jsClicked = await page.evaluate((selector) => {
            const button = document.querySelector(selector);
            if (button) {
              button.click();
              return true;
            }
            return false;
          }, closeButtonSelector);

          if (jsClicked) {
            console.log(
              "Zeit: Successfully clicked the close button with page.evaluate()."
            );
          } else {
            console.error(
              "Zeit: Failed to click the close button with all methods."
            );
          }
        }
      } catch (error) {
        console.error(
          `Zeit: Did not find the footer ad banner's close button within 15 seconds. It might not have appeared. Proceeding anyway. Error: ${error.message}`
        );
      }

      // Final wait for everything to settle
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error handling consent for zeit: ${error.message}`);
    }
  },
};
