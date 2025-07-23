module.exports = {
  name: "spiegel",
  url: "https://www.spiegel.de",
  timezone: "Europe/Berlin",
  screenshot: "pre-consent", // Take screenshot before consent handler
  consentHandler: async (page) => {
    // The main screenshot script now handles Spiegel separately to capture the pre-consent state.
    // This handler is intentionally left empty.
    console.log("  -> Spiegel consent handler intentionally skipped.");
    return;
  },
};
