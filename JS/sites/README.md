# Newspaper Sites - Modular Structure

This directory contains individual newspaper site configurations, making it easy to test and maintain each site's consent handling logic separately.

## Structure

Each newspaper has its own file with the following structure:

```javascript
module.exports = {
  name: "sitename",
  url: "https://example.com",
  timezone: "Europe/Vienna",
  consentHandler: async (page) => {
    // Site-specific consent handling logic
  },
};
```

## Available Sites

- `derstandard.js` - Der Standard (Austria)
- `zeit.js` - Die Zeit (Germany)
- `washingtonpost.js` - Washington Post (USA)
- `diepresse.js` - Die Presse (Austria)
- `krone.js` - Kronen Zeitung (Austria)
- `spiegel.js` - Der Spiegel (Germany)
- `nzz.js` - Neue Zürcher Zeitung (Switzerland)
- `lemonde.js` - Le Monde (France)
- `elpais.js` - El País (Spain)

## Testing Individual Sites

You can test a single site using the test script:

```bash
# Test a site with desktop viewport
node test-single-site.js nzz

# Test a site with mobile viewport
node test-single-site.js zeit mobile

# Test a site with desktop viewport (explicit)
node test-single-site.js derstandard desktop
```

## Testing Features

- **Headless disabled**: The test script runs with `headless: false` so you can see what's happening
- **Console logging**: Detailed logs show which selectors are being tried
- **Screenshot output**: Test screenshots are saved to `../graphic_output/screenshots/test/`
- **Viewport support**: Test both desktop and mobile viewports

## Example Usage

```bash
# Test NZZ (the one that was having issues)
node test-single-site.js nzz

# Test Zeit with the new second banner handling
node test-single-site.js zeit

# Test all sites can be loaded
node test-single-site.js derstandard
node test-single-site.js diepresse
node test-single-site.js krone
# ... etc
```

## Main Script

The main script (`news-screenshots.js`) automatically imports all sites from `sites/index.js`, so it will use all the modular configurations.

## Adding New Sites

1. Create a new file for the site (e.g., `mynewspaper.js`)
2. Export the site configuration with the required structure
3. Add the require statement to `index.js`
4. Test the new site with `node test-single-site.js mynewspaper`

## Debugging Tips

- Use the test script with headless disabled to see the browser in action
- Check console logs for which selectors are being tried
- Each site has detailed logging showing the consent handling process
- Test screenshots help verify if consent popups were properly dismissed
