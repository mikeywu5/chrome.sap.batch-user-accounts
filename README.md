# Batch SAP User Accounts — Chrome Extension

Batch manage SAP user accounts from a spreadsheet-like UI and optionally send credential emails via Gmail, all from a Chrome extension popup or side panel.

## Highlights

- Paste from Excel/Sheets into a Handsontable grid; header auto-detection and mapping
- Batch operations in SAP via content script:
  - Modify Users (e.g., update email)
  - Change Passwords
- Email context table (System, Client, Server, Web URL)
- Gmail integration to send emails to selected rows
- Root-only ignored build artifacts and Webpack multi-entry build

## Screenshots

Coming soon.

## Requirements

- Chrome 121+ (Manifest V3)
- SAP Web GUI page access
- Optional: Google account with Gmail enabled (for sending)

## Installation (Unpacked)

1. Build the bundles (or run in watch mode during dev):

   Run these in your terminal:

   ```bash
   npm install
   npm run build    # or: npm run dev
   ```

1. Open Chrome > `chrome://extensions/` > enable Developer mode
1. Click "Load unpacked" and select this project folder
1. Pin the extension (optional) for quick access

## Using the Extension

1. Navigate to the SAP Users page (Menu > Tools > Administration > User Maintenance > Users).
2. Open the extension popup (or the side panel) and paste your user data (tab-separated) into the table.
3. Verify column mapping (headers are auto-normalized using patterns; edit as needed).
1. Select rows and choose an action:

- Modify users: requires SAP Login and a valid email
- Change passwords: requires SAP Login and Password
- Export as CSV for auditing/backups

1. Email sending: fill in the Email Context table, then click Send Emails.

### Email Dry‑Run & Preview

When Dry‑run is enabled, the extension will assemble the email per selected row and show a preview modal without sending. You can copy the content or close to continue.

## Gmail OAuth Setup

The extension uses chrome.identity and the Gmail API (gmail.send scope).

1. Create a Google Cloud project and enable the Gmail API.
2. Configure an OAuth Client ID of type "Chrome App":

- Application type: Chrome App
- App ID: Use this extension's ID once loaded unpacked (from chrome://extensions). For development, you can also use the extension key to make the ID stable.
1. Replace `manifest.json` `oauth2.client_id` with your client ID (format: `XXXXXXXXXXXX-abcdef.apps.googleusercontent.com`).
1. In OAuth consent screen, add the scope `https://www.googleapis.com/auth/gmail.send`.
1. Reload the extension.

Notes:

- For testing, you may see an unverified app screen unless you complete verification.
- Tokens are obtained via chrome.identity.getAuthToken; users can revoke access in their Google Account.

## Development

- Build once: `npm run build`
- Watch mode: `npm run dev`
- Clean root bundles: `npm run clean`
- Webpack entries: `popup.js`, `content.js` output to `popup.bundle.js`, `content.bundle.js`

## Project Structure

- `manifest.json` — Extension manifest (MV3, identity/gmail scopes, side panel)
- `popup.html` / `popup.js` / `popup.css` — UI and logic (Handsontable, Gmail, dry‑run)
- `content.js` — SAP page automation (inputs, events)
- `domHelpers.js` — DOM query helpers and typing/event simulation
- `LoginFields.js`, `LoginField.js`, `LoginSAP.js` — data models and field mapping
- `background.js` — service worker
- `webpack.config.js` — multi‑entry bundling

## Troubleshooting

- Content script not running: confirm SAP URL matches manifest `content_scripts.matches`.
- SAP fields not updating: use the improved input simulation (beforeinput, composition events) and robust setter fallback.
- Gmail send fails: ensure correct OAuth client ID and scope; check chrome://identity-internals.
- Nothing happens on buttons: open DevTools for the popup and for the SAP tab; see console logs.

## License

MIT
