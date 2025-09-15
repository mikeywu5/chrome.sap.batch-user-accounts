# Batch User Accounts Chrome Extension

## Features

- Batch manage user accounts from a popup
- Simple background and content scripts

## Getting Started

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder
4. Log in to your SAP site as usual.
5. Navigate to the appropriate Users SAP webpage by navigating the SAP Menu > Tools > Administration > User Maintenance > Users.
6. Once on the Users page, click the Chrome extension icon and then click the "Activate User Script" button in the popup to run the script on the page.

## Development

- Edit scripts in this folder as needed
- Install dependencies: `npm install handsontable style-loader css-loader babel-loader @babel/core @babel/preset-env webpack webpack-cli`
- Build the popup script: `npx webpack --config webpack.config.js`
- Load the extension folder in Chrome as usual

## Folder Structure

- `manifest.json`: Extension manifest
- `background.js`: Background service worker
- `content.js`: Content script
- `popup.html`/`popup.js`: Popup UI

---
Replace icons as needed for your project.
