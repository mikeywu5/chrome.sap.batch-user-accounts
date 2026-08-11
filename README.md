# Batch SAP User Accounts — Chrome Extension

Batch manage SAP user accounts from a spreadsheet-like UI and optionally send credential messages via Canvas LMS Conversations, all from a Chrome extension popup or side panel.

## Highlights

- Paste from Excel/Sheets into a Handsontable grid; header auto-detection and mapping
- Batch operations in SAP via content script:
  - Modify Users (e.g., update email)
  - Change Passwords
- Email context table (System, Client, Server, Web URL)
- Canvas LMS Conversations integration to send messages to selected rows
- Root-only ignored build artifacts and Webpack multi-entry build

## Screenshots

Coming soon.

## Requirements

- Chrome 121+ (Manifest V3)
- SAP Web GUI page access
- Canvas LMS account with a Personal Access Token (for sending)

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
4. Select rows and choose an action:

- Modify users: requires SAP Login and a valid email
- Change passwords: requires SAP Login and Password
- Export as CSV for auditing/backups

1. Messaging: fill in the Email Context table, enter your Canvas base URL and API token, then click Send Emails.

### Message Dry‑Run & Preview

When Dry‑run is enabled, the extension will assemble the message per selected row and show a preview modal without sending. You can copy the content or close to continue.

## Canvas Messaging Setup

The extension calls the Canvas LMS REST API directly from the popup. No OAuth flow is required; instead, provide:

- Canvas base URL, e.g. `https://yourcanvas.example.com`
- A Personal Access Token (PAT) with permission to send Conversations messages

How to use:

1. In the Email Context section, set Web URL to your Canvas base URL (or type it in the Canvas base URL field).
2. Paste your Personal Access Token into the Canvas API Key field. For safety, the token is stored only in sessionStorage (cleared when the browser session ends).
3. Select rows and click Send Emails. Each selected student will receive a Canvas Inbox message.

Notes:

- Recipient resolution uses the Search Recipients API and may require a shared context. If needed, put a course id in the System field (e.g. `123` or `course_123`) to set the context for lookups.
- If Dry‑run is enabled, no API calls are made.

## CLI (Puppeteer)

Drive the same batch actions from a terminal instead of the extension popup.

```bash
npm install
npm run build
cp .env.example .env   # set SAP_URL locally; .env is ignored by git/Cursor

# Open SAP with the unpacked extension loaded
npm run cli -- open --url "$SAP_URL" --keep-open

# Modify users from a CSV/TSV/JSON file
npm run cli -- modify --data ./users.csv

# Change passwords
npm run cli -- change-passwords --data ./users.csv --contains Initial
```

CSV headers are normalized (`SAP Login` → `sapLogin`, `Student Email` → `studentEmail`, etc.). The CLI launches system Chrome when available, loads this folder as an unpacked extension, and sends `MODIFY_SAP_USERS` / `CHANGE_SAP_PASSWORDS` through a content-script bridge.

## Development

- Build once: `npm run build`
- Watch mode: `npm run dev`
- Clean root bundles: `npm run clean`
- CLI: `npm run cli -- --help`
- Webpack entries: `popup.js`, `content.js` output to `popup.bundle.js`, `content.bundle.js`

## Project Structure

- `manifest.json` — Extension manifest (MV3, side panel, host permissions for Canvas API)
- `popup.html` / `popup.js` / `popup.css` — UI and logic (Handsontable, Canvas messaging, dry‑run)
- `content.js` — SAP page automation (inputs, events)
- `domHelpers.js` — DOM query helpers and typing/event simulation
- `LoginFields.js`, `LoginField.js`, `LoginSAP.js` — data models and field mapping
- `background.js` — service worker
- `webpack.config.js` — multi‑entry bundling

## Canvas LTI Assignment App

This repository now includes a deployable React app under [canvas-lti/README.md](canvas-lti/README.md) for Canvas Assignment embedding.

Location:

- [canvas-lti](canvas-lti)

Quick usage:

1. Place two CSV files under `canvas-lti/public/data`:
  - Student table CSV (same heading style as this extension table)
  - Context CSV with two columns: key,value
2. Build and deploy with Nginx:
  - `cd canvas-lti`
  - `npm install`
  - `npm run build`
3. Embed in Canvas as External Tool URL or iframe.

The app supports query params such as `?sapLogin=LEARN-100` or `?studentEmail=student@school.edu`.

## Troubleshooting

- Content script not running: confirm SAP URL matches manifest `content_scripts.matches`.
- SAP fields not updating: use the improved input simulation (beforeinput, composition events) and robust setter fallback.
- Canvas send fails: verify base URL and token; ensure your user is allowed to message recipients (shared context) and that the token has sufficient permissions.
- Nothing happens on buttons: open DevTools for the popup and for the SAP tab; see console logs.

## License

MIT
