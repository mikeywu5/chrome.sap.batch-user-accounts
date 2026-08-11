#!/usr/bin/env node
/**
 * CLI driver for Batch SAP User Accounts.
 * Launches Chrome with the unpacked extension and triggers the same batch
 * actions the popup uses (modify users / change passwords).
 *
 * Examples:
 *   npm run cli -- open --url "$SAP_URL"
 *   npm run cli -- modify --url "$SAP_URL" --data ./users.csv
 *   npm run cli -- change-passwords --data ./users.csv --contains Initial
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CLI_MESSAGE_SOURCE = "sap-batch-cli";
const CLI_RESULT_SOURCE = "sap-batch-cli-result";

function loadDotEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  try {
    // Optional dependency; ignore if not installed yet.
    // eslint-disable-next-line import/no-extraneous-dependencies
    require("dotenv").config({ path: envPath });
  } catch (_) {
    const text = fs.readFileSync(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function printHelp() {
  console.log(`Usage:
  sap-batch <command> [options]

Commands:
  open                 Launch Chrome with the extension and open SAP URL
  modify               Batch-modify selected SAP users (email/contact fields)
  change-passwords     Batch-change SAP passwords

Options:
  --url <url>          SAP WebGUI URL (or SAP_URL / SAP_WEBGUI_URL in .env)
  --data <file>        CSV/TSV/JSON file of user rows
  --contains <text>    Password-state filter for change-passwords (default: Initial)
  --headed             Show the browser window (default)
  --headless           Run headless (may break SAP UI / extension flows)
  --keep-open          Leave the browser open after the action finishes
  --timeout <ms>       Per-action timeout (default: 600000)
  --chrome-path <path> Chrome executable (default: macOS Google Chrome / env)
  --help               Show this help

Row fields (CSV header or JSON keys):
  sapLogin, studentEmail, sapPassword, firstName, lastName, section

Environment:
  SAP_URL / SAP_WEBGUI_URL   Default SAP page
  PUPPETEER_EXECUTABLE_PATH Chrome binary override
`);
}

function parseArgs(argv) {
  const args = {
    command: null,
    url: null,
    data: null,
    contains: "Initial",
    headed: true,
    keepOpen: false,
    timeout: 600000,
    chromePath: null,
    help: false,
  };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }
    if (token === "--headed") {
      args.headed = true;
      continue;
    }
    if (token === "--headless") {
      args.headed = false;
      continue;
    }
    if (token === "--keep-open") {
      args.keepOpen = true;
      continue;
    }
    if (token === "--url") {
      args.url = argv[++i];
      continue;
    }
    if (token === "--data") {
      args.data = argv[++i];
      continue;
    }
    if (token === "--contains") {
      args.contains = argv[++i];
      continue;
    }
    if (token === "--timeout") {
      args.timeout = Number(argv[++i]);
      continue;
    }
    if (token === "--chrome-path") {
      args.chromePath = argv[++i];
      continue;
    }
    if (token.startsWith("-")) {
      throw new Error(`Unknown option: ${token}`);
    }
    positional.push(token);
  }
  args.command = positional[0] || null;
  return args;
}

function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const HEADER_ALIASES = {
  saplogin: "sapLogin",
  login: "sapLogin",
  user: "sapLogin",
  studentemail: "studentEmail",
  email: "studentEmail",
  sisloginid: "studentEmail",
  sappassword: "sapPassword",
  password: "sapPassword",
  pass: "sapPassword",
  firstname: "firstName",
  first: "firstName",
  lastname: "lastName",
  last: "lastName",
  section: "section",
};

function mapHeader(header) {
  return HEADER_ALIASES[normalizeHeader(header)] || null;
}

function parseDelimited(text) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  if (!lines.length) return [];
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const split = (line) => {
    if (delimiter === "\t") return line.split("\t");
    const cells = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (ch === "," && !inQuotes) {
        cells.push(current);
        current = "";
        continue;
      }
      current += ch;
    }
    cells.push(current);
    return cells;
  };
  const headers = split(lines[0]).map((h) => mapHeader(h));
  return lines.slice(1).map((line) => {
    const cells = split(line);
    const row = {};
    headers.forEach((key, idx) => {
      if (!key) return;
      row[key] = String(cells[idx] ?? "").trim();
    });
    return row;
  });
}

function loadRows(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Data file not found: ${abs}`);
  }
  const text = fs.readFileSync(abs, "utf8");
  if (abs.endsWith(".json")) {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error("JSON data file must be an array of row objects");
    }
    return parsed.map((row) => {
      const normalized = {};
      Object.entries(row || {}).forEach(([key, value]) => {
        const mapped = mapHeader(key) || key;
        normalized[mapped] = value == null ? "" : String(value).trim();
      });
      return normalized;
    });
  }
  return parseDelimited(text);
}

function resolveChromePath(explicit) {
  if (explicit) return explicit;
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

async function launchBrowser(args) {
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch (err) {
    throw new Error(
      "puppeteer is not installed. Run: npm install puppeteer dotenv"
    );
  }
  const executablePath = resolveChromePath(args.chromePath);
  const userDataDir = path.join(ROOT, ".puppeteer-profile");
  fs.mkdirSync(userDataDir, { recursive: true });

  const launchOptions = {
    headless: args.headed ? false : "new",
    defaultViewport: null,
    userDataDir,
    args: [
      `--disable-extensions-except=${ROOT}`,
      `--load-extension=${ROOT}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-popup-blocking",
    ],
  };
  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = (await browser.pages())[0] || (await browser.newPage());
  return { browser, page };
}

async function waitForCliReady(page, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const ready = await page.evaluate(() => {
      return (
        document.documentElement.getAttribute("data-sap-batch-cli") === "ready"
      );
    });
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    "Extension content script did not become ready. Confirm the URL matches the SAP WebGUI pattern in manifest.json and that npm run build has been run."
  );
}

async function sendCliAction(page, message, timeoutMs) {
  const requestId = `cli-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return page.evaluate(
    ({ message, requestId, CLI_MESSAGE_SOURCE, CLI_RESULT_SOURCE, timeoutMs }) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          window.removeEventListener("message", onMessage);
          reject(new Error(`CLI action timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        function onMessage(event) {
          const data = event?.data;
          if (!data || data.source !== CLI_RESULT_SOURCE) return;
          if (data.requestId !== requestId) return;
          clearTimeout(timer);
          window.removeEventListener("message", onMessage);
          resolve(data);
        }
        window.addEventListener("message", onMessage);
        window.postMessage(
          {
            source: CLI_MESSAGE_SOURCE,
            requestId,
            ...message,
          },
          "*"
        );
      });
    },
    { message, requestId, CLI_MESSAGE_SOURCE, CLI_RESULT_SOURCE, timeoutMs }
  );
}

function resolveUrl(args) {
  return (
    args.url ||
    process.env.SAP_URL ||
    process.env.SAP_WEBGUI_URL ||
    null
  );
}

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.command) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  const command = args.command;
  if (!["open", "modify", "change-passwords"].includes(command)) {
    throw new Error(`Unknown command: ${command}`);
  }

  const url = resolveUrl(args);
  if (!url) {
    throw new Error("Missing SAP URL. Pass --url or set SAP_URL in .env");
  }

  let rows = [];
  if (command !== "open") {
    if (!args.data) {
      throw new Error(`Command "${command}" requires --data <file>`);
    }
    rows = loadRows(args.data).filter((row) => row && Object.keys(row).length);
    if (!rows.length) {
      throw new Error("No data rows found in --data file");
    }
  }

  const contentBundle = path.join(ROOT, "bundle", "content.bundle.js");
  if (!fs.existsSync(contentBundle)) {
    throw new Error(
      "Missing bundle/content.bundle.js. Run: npm run build"
    );
  }

  console.log(`Launching Chrome with extension: ${ROOT}`);
  const { browser, page } = await launchBrowser(args);
  try {
    console.log(`Opening ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await waitForCliReady(page, 60000);

    if (command === "open") {
      console.log("Browser ready with extension loaded.");
      if (!args.keepOpen) {
        console.log("Use --keep-open to leave the session running.");
      }
    } else if (command === "modify") {
      const data = rows.filter(
        (row) =>
          row.sapLogin &&
          row.studentEmail &&
          /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.studentEmail)
      );
      if (!data.length) {
        throw new Error(
          "No rows with both sapLogin and a valid studentEmail"
        );
      }
      console.log(`Running MODIFY_SAP_USERS for ${data.length} row(s)...`);
      const response = await sendCliAction(
        page,
        { type: "MODIFY_SAP_USERS", data },
        args.timeout
      );
      console.log(JSON.stringify(response, null, 2));
      if (!response.success) process.exitCode = 1;
    } else if (command === "change-passwords") {
      const data = rows.filter((row) => row.sapLogin && row.sapPassword);
      if (!data.length) {
        throw new Error("No rows with both sapLogin and sapPassword");
      }
      console.log(
        `Running CHANGE_SAP_PASSWORDS for ${data.length} row(s)...`
      );
      const response = await sendCliAction(
        page,
        {
          type: "CHANGE_SAP_PASSWORDS",
          data,
          passwordStateContains: args.contains,
        },
        args.timeout
      );
      console.log(JSON.stringify(response, null, 2));
      if (!response.success) process.exitCode = 1;
    }

    if (args.keepOpen || command === "open") {
      console.log("Keeping browser open. Press Ctrl+C to exit.");
      await new Promise(() => {});
    }
  } finally {
    if (!(args.keepOpen || command === "open")) {
      await browser.close();
    }
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
