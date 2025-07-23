module.exports = {
  name: "derstandard",
  url: "https://derstandard.at",
  timezone: "Europe/Vienna",
  consentHandler: async (page) => {
    console.log("Der Standard: Looking for consent button...");
    const consentSelectors = [
      'button[title="Einverstanden"]',
      "button.sp_choice_type_11",
      'button:has-text("Zustimmen")',
      'button:has-text("Alle akzeptieren")',
      'button[aria-label="Alle akzeptieren"]',
    ];

    let clicked = false;
    for (const selector of consentSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.click(selector);
        console.log(
          `Der Standard: Successfully clicked consent button with selector: ${selector}`
        );
        clicked = true;
        break;
      } catch (error) {
        console.log(
          `Der Standard: Selector ${selector} not found, trying next...`
        );
      }
    }

    if (!clicked) {
      console.log(
        "Der Standard: Could not find consent button via main page, trying iframe..."
      );
      try {
        await page.waitForSelector('iframe[id*="sp_"]', { timeout: 3000 });
        const frames = await page.frames();
        const consentFrame = frames.find(
          (frame) =>
            frame.name().includes("sp_") || frame.url().includes("sourcepoint")
        );
        if (consentFrame) {
          await consentFrame.click("button::-p-text(Einverstanden)");
          console.log(
            "Der Standard: Successfully clicked consent button in iframe."
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (iframeError) {
        console.log(
          `Der Standard: Consent iframe not found or failed to click. Proceeding without consent.`
        );
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for page to settle
  },
};
