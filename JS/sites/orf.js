const orf = {
  name: "orf",
  url: "https://orf.at/",
  consentHandler: async (page) => {
    console.log("Handling consent for orf...");
    try {
      const acceptButtonSelector = "#didomi-notice-agree-button";
      console.log(`Waiting for selector: ${acceptButtonSelector}`);
      await page.waitForSelector(acceptButtonSelector, {
        visible: true,
        timeout: 15000,
      });
      await page.click(acceptButtonSelector);
      console.log("Successfully clicked the consent button for orf.at.");
    } catch (error) {
      console.error(
        "Could not find or click the consent button for orf.at, continuing without consent.",
        error.message
      );
    }
  },
};

module.exports = orf;
