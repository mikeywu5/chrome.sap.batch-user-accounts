# Environment variables

Copy `.env.example` → `.env` and fill values locally. `.env` is gitignored and cursorignored.

## Required for CLI

| Key | Description |
|-----|-------------|
| `SAP_URL` | SAP WebGUI page the Puppeteer CLI opens (must match the extension content-script URL pattern). |

## Optional

| Key | Description |
|-----|-------------|
| `PUPPETEER_EXECUTABLE_PATH` | Override Chrome/Chromium binary. Defaults to system Google Chrome on macOS. |

## Not in `.env`

- **Canvas API token** — paste in the extension popup when sending messages (sessionStorage only).
- **SAP user passwords in bulk** — supply via the CSV/JSON `--data` file for `change-passwords`, not via `.env`.
