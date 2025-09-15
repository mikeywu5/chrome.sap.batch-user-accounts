// Utility to block/unblock UI buttons during async actions
function setUiBlocked(blocked) {
  const btns = [
    document.getElementById("modifyUsersBtn"),
    document.getElementById("changePasswordsBtn"),
    document.getElementById("exportTableBtn"),
  ];
  btns.forEach((btn) => {
    if (btn) btn.disabled = !!blocked;
  });
  const overlayId = "block-ui-overlay";
  let overlay = document.getElementById(overlayId);
  if (blocked) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = overlayId;
      overlay.style.position = "fixed";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.background = "rgba(255,255,255,0.4)";
      overlay.style.zIndex = 9999;
      overlay.style.cursor = "wait";
      document.body.appendChild(overlay);
    }
  } else {
    if (overlay) overlay.remove();
  }
}
// Setup handler for Open as Side Panel button

import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";
import { LoginFields, LoginFieldValue } from "./LoginFields";
import { LoginSAP, LoginSAPFields } from "./LoginSAP";
import { waitFor, findInputByLabel, waitForElement } from "./domHelpers";
// Utility: Convert 2D array to CSV string
var hot = null;
var metaHot = null;
// Persist last selection range(s)
let lastSelectionRanges = null;

function arrayToCSV(data, headers) {
  const escape = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  let csv = "";
  if (headers) csv += headers.map(escape).join(",") + "\n";
  csv += data.map((row) => row.map(escape).join(",")).join("\n");
  return csv;
}

// Export table as CSV
document.getElementById("exportTableBtn").addEventListener("click", () => {
  const data = hot.getData();
  const csv = arrayToCSV(data, fields.headers);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sap_user_table.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

const fields = new LoginFields();

document.addEventListener("DOMContentLoaded", () => {
  // Handsontable callback: set column headers
  function afterGetColHeader(col, TH) {
    if (typeof col === "number" && TH) {
      // Use fields for header name
      const key = fields.headers[col];
      if (fields[key] && fields[key].name) {
        TH.innerText = fields[key].name;
      } else {
        TH.innerText = key;
      }
    }
  }

  async function modifyButtonHandler(e) {
    // Prevent button click from clearing selection
    e.preventDefault();
    e.stopPropagation();
    setUiBlocked(true);
    // Only rows with SAP Login and valid student email
    const asObjects = buildSelectedLogins((row) => {
      const sap = row["sapLogin"] && String(row["sapLogin"]).trim();
      const email = row["studentEmail"] && String(row["studentEmail"]).trim();
      // Simple email regex
      const validEmail = email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      return !!sap && !!validEmail;
    });
    console.log(asObjects);
    // Get the active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["content.bundle.js"],
        },
        () => {
          // Send the LoginSAP instance (as array of objects) to the content script and wait for response
          chrome.tabs.sendMessage(
            tab.id,
            {
              type: "MODIFY_SAP_USERS",
              data: asObjects,
            },
            async (response) => {
              setUiBlocked(false);
              if (!(response && response.success)) {
                alert("Batch modify failed or was cancelled.");
              }
            }
          );
        }
      );
    } else {
      setUiBlocked(false);
    }
  }

  // Helper: parse a full name into { first, last }

  // Shared: build LoginSAP for the current selection (or all rows) and map to array of objects
  /**
   * Build LoginSAP for the current selection (or all rows) and map to array of objects.
   * @param {(row: object) => boolean} filterFn - Function to filter rows. Return true to include, false to exclude.
   * @returns {object[]} Filtered array of row objects.
   */
  function buildSelectedLogins(filterFn) {
    // Read current selection; if none, use last stored selection
    let selected = hot.getSelected();
    if (!selected || selected.length === 0) {
      if (lastSelectionRanges && lastSelectionRanges.length) {
        selected = lastSelectionRanges.slice();
      }
    }
    let selectedRows = [];
    if (selected && selected.length > 0) {
      selected.forEach((sel) => {
        const [startRow, , endRow] = sel;
        for (
          let r = Math.min(startRow, endRow);
          r <= Math.max(startRow, endRow);
          r++
        ) {
          if (!selectedRows.includes(r)) selectedRows.push(r);
        }
      });
    }
    selectedRows = Array.from(new Set(selectedRows)).filter(
      (r) => r >= 0 && r < hot.countRows()
    );
    const tableData =
      selectedRows.length > 0
        ? selectedRows.map((r) => hot.getDataAtRow(r))
        : hot.getData();
    const array = tableData.map((row) =>
      Object.fromEntries(fields.headers.map((h, i) => [h, row[i]]))
    );
    return array.filter(typeof filterFn === "function" ? filterFn : () => true);
  }

  // Note: paste handling is implemented in the Handsontable options.afterPaste below
  // Show datatable and buttons
  for (const el of document.getElementsByClassName("shown")) {
    el.classList.remove("shown");
    el.style.display = "none";
  }
  for (const el of document.getElementsByClassName("hidden")) {
    el.classList.remove("hidden");
  }
  // Remove any previous table
  const hotContainer = document.getElementById("user-table-container");

  hotContainer.innerHTML = "";
  const options = {
    data: [Array(fields.headers.length).fill("")], // Start with one row
    colHeaders: fields.headers,
    rowHeaders: true,
    minRows: 1,
    minCols: fields.headers.length,
    maxCols: fields.headers.length,
    contextMenu: ["row_above", "row_below", "remove_row", "undo", "redo"],
    manualColumnResize: true,
    manualRowResize: true,
    stretchH: "all",
    width: "100%",
    height: 320,
    autoWrapRow: true,
    autoWrapCol: true,
    outsideClickDeselects: false,
    licenseKey: "non-commercial-and-evaluation",
    // Remove column type definitions; use default column type for all columns
    // columns: fields.headers.map(() => ({})),
    afterGetColHeader: afterGetColHeader,
    // Avoid scrolling during live selection to not disrupt editing; handled on selection end
    afterSelection: function (r1, c1, r2, c2) {},
    afterSelectionEnd: function (r1, c1, r2, c2) {
      // Store the last selection as an array of ranges
      lastSelectionRanges = [[r1, c1, r2, c2]];
      // Ensure selection remains visible if it ended outside the viewport
      const row = Math.min(r1, r2);
      const col = Math.min(c1, c2);
      const wt = this.view && this.view.wt;
      if (wt && typeof wt.getViewport === "function") {
        const [firstRow, firstCol, lastRow, lastCol] = wt.getViewport();
        const outOfView =
          row < firstRow || row > lastRow || col < firstCol || col > lastCol;
        if (outOfView) {
          this.scrollViewportTo(row, col);
        }
      }
    },
    afterSelectionEndByProp: function (r1, p1, r2, p2) {
      // Also handle selection by prop
      lastSelectionRanges = [[r1, 0, r2, fields.headers.length - 1]];
      const row = Math.min(r1, r2);
      const col = 0;
      const wt = this.view && this.view.wt;
      if (wt && typeof wt.getViewport === "function") {
        const [firstRow, firstCol, lastRow, lastCol] = wt.getViewport();
        const outOfView =
          row < firstRow || row > lastRow || col < firstCol || col > lastCol;
        if (outOfView) {
          this.scrollViewportTo(row, col);
        }
      }
    },
    // Avoid scrolling during editing to prevent editor from closing
    afterPaste: function (data, coords) {
      if (!data || !data.length) return;
      // Normalize the first row as potential headers
      const rawHeader = data[0].map((h) => String(h ?? "").trim());
      const headerRow = rawHeader.map((h) => h.toLowerCase());

      // Build a column map using declared patterns in LoginFields only
      const colMap = {};
      let headerMatches = 0;
      headerRow.forEach((cell, pasteIdx) => {
        let matchedThisCell = false;
        // Pattern-based detection from LoginFields
        for (const [field, fieldObj] of fields) {
          try {
            if (
              fieldObj?.pattern &&
              typeof fieldObj.pattern.test === "function" &&
              fieldObj.pattern.test(cell)
            ) {
              if (colMap[field] === undefined) {
                colMap[field] = pasteIdx;
              }
              matchedThisCell = true;
            }
          } catch (_) {
            // ignore pattern errors
          }
        }
        if (matchedThisCell) headerMatches++;
      });

      // Decide if the first row is actually headers
      const distinctMapped = Object.keys(colMap).length;
      // Heuristic: header if at least 2 cells matched patterns or at least 1 mapped field and <= 5 columns
      const looksLikeHeader =
        headerMatches >= 2 || (distinctMapped >= 1 && headerRow.length <= 5);

      const startIdx = looksLikeHeader ? 1 : 0; // data-only if no headers detected

      const newRows = [];
      for (let i = startIdx; i < data.length; ++i) {
        const src = data[i] || [];
        // Always create a row of the correct length
        const mappedRow = new Array(fields.headers.length).fill("");
        if (looksLikeHeader) {
          // Fill all mapped columns using fields order
          for (let idx = 0; idx < fields.headers.length; idx++) {
            const field = fields.headers[idx];

            if (!isNaN(colMap[field])) {
              mappedRow[idx] = src[colMap[field]] ?? "";
            }
          }

          // After mapping, allow fields to post-process (e.g., auto-set first/last from student)
          const fieldHeaders = Object.keys(fields);
          for (let idx = 0; idx < fieldHeaders.length; idx++) {
            const field = fieldHeaders[idx];
            const meta = fields[field];
            if (typeof meta.afterCallback === "function") {
              const metaobj = meta.afterCallback(src, colMap);
              if (metaobj && typeof metaobj === "object") {
                for (const key in metaobj) {
                  const idx = fields.headers.indexOf(key);
                  if (idx >= 0) {
                    mappedRow[idx] = metaobj[key];
                  }
                }
              }
            }
          }
        } else {
          // No headers detected; map by position as best-effort (no auto-split for first/last)
          const copyLen = Math.min(src.length, fields.headers.length);
          for (let j = 0; j < copyLen; j++) {
            mappedRow[j] = src[j] ?? "";
          }
        }

        newRows.push([...mappedRow]);
      }

      // Remove fully empty rows to avoid a table full of blanks
      const cleaned = [];
      for (let i = 0; i < newRows.length; i++) {
        const row = newRows[i];
        let hasValue = false;
        for (let j = 0; j < row.length; j++) {
          if (String(row[j] ?? "").trim() !== "") {
            hasValue = true;
            break;
          }
        }
        if (hasValue) cleaned.push(row);
      }

      // Expand table to fit pasted data
      hot.loadData(
        cleaned.length ? cleaned : [Array(fields.headers.length).fill("")]
      );
    },
    // Enable scrollbars
    renderAllRows: false,
    viewportRowRenderingOffset: "auto",
    viewportColumnRenderingOffset: "auto",
    // Enable scrolling
    overflow: "auto",
  };

  // Create new Handsontable;
  hot = new Handsontable(hotContainer, options);

  // Setup email metadata table
  const emailMetaContainer = document.getElementById("email-meta-table");
  if (emailMetaContainer) {
    const metaData = [
      ["System", ""],
      ["Client", ""],
      ["Server", ""],
      ["Web URL", ""],
    ];
    metaHot = new Handsontable(emailMetaContainer, {
      data: metaData,
      colHeaders: ["Field", "Value"],
      rowHeaders: false,
      licenseKey: "non-commercial-and-evaluation",
      readOnly: false,
      columns: [{ readOnly: true }, { readOnly: false }],
      stretchH: "all",
      width: "100%",
      height: 140,
      manualColumnResize: true,
      manualRowResize: true,
      disableVisualSelection: true,
    });
    // Reveal container
    const metaWrap = document.getElementById("emailmeta-container");
    if (metaWrap) metaWrap.classList.remove("hidden");
    const metaBtns = document.getElementById("email-btns-inside");
    if (metaBtns) metaBtns.classList.remove("hidden");
  }

  function readEmailMeta() {
    if (!metaHot) return {};
    const rows = metaHot.getData();
    const obj = {};
    rows.forEach((r) => {
      const key = (r[0] || "").toString().trim();
      if (key) obj[key] = r[1];
    });
    return obj;
  }

  async function getOAuthToken(interactive = true) {
    return new Promise((resolve, reject) => {
      if (!chrome.identity || !chrome.identity.getAuthToken) {
        return reject(new Error("chrome.identity API not available"));
      }
      chrome.identity.getAuthToken({ interactive }, (token) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }
        resolve(token);
      });
    });
  }

  async function sendGmailRaw(base64Raw, token) {
    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: base64Raw }),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error("Gmail send failed: " + res.status + " " + text);
    }
    return res.json();
  }

  function rfc2822Encode({ to, subject, body, from }) {
    const headers = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      `From: ${from}`,
    ];
    const msg = headers.join("\r\n") + "\r\n\r\n" + body;
    // base64url encode
    return btoa(unescape(encodeURIComponent(msg)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async function sendEmailsHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    setUiBlocked(true);
    try {
      const selectedRows = buildSelectedLogins((row) => {
        const email = row["studentEmail"] && String(row["studentEmail"]).trim();
        return email && /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
      });
      if (!selectedRows.length)
        throw new Error("No valid student emails in selection.");
      const meta = readEmailMeta();
      const token = await getOAuthToken(true);
      const fromAddress = meta["System"] || "me";
      let sentCount = 0;
      for (const row of selectedRows) {
        const to = row["studentEmail"];
        const subject = `Access Details for ${meta["System"] || ""}`.trim();
        const lines = [
          `System: ${meta["System"] || ""}`,
          `Client: ${meta["Client"] || ""}`,
          `Server: ${meta["Server"] || ""}`,
          `Web URL: ${meta["Web URL"] || ""}`,
          "",
          "Your Credentials:",
          `SAP Login: ${row["sapLogin"] || ""}`,
          row["password"] ? `Password: ${row["password"]}` : "",
          "",
          "Please log in and change your password if required.",
        ].filter(Boolean);
        const body = lines.join("\n");
        const raw = rfc2822Encode({ to, subject, body, from: fromAddress });
        await sendGmailRaw(raw, token);
        sentCount++;
      }
      alert(`Sent ${sentCount} email(s).`);
    } catch (err) {
      console.error(err);
      alert("Email send failed: " + err.message);
    } finally {
      setUiBlocked(false);
    }
  }

  const sendBtn = document.getElementById("sendEmailsBtn");
  if (sendBtn) sendBtn.addEventListener("click", sendEmailsHandler);

  // Add keyboard shortcut: Ctrl+Shift+Enter (Cmd+Shift+Enter on Mac) to insert row below
  hotContainer.addEventListener("keydown", function (e) {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      const sel = hot.getSelectedLast();
      let row = sel ? sel[0] : hot.countRows() - 1;
      hot.alter("insert_row_below", row);
      hot.selectCell(row + 1, 0);
    }
  });

  document
    .getElementById("modifyUsersBtn")
    .addEventListener("click", modifyButtonHandler);

  async function changePasswordsHandler(e) {
    // Prevent button click from clearing selection
    e.preventDefault();
    e.stopPropagation();
    setUiBlocked(true);
    // Only rows with SAP Login and Password
    const asObjects = buildSelectedLogins((row) => {
      const sap = row["sapLogin"] && String(row["sapLogin"]).trim();
      const pass = row["sapPassword"] && String(row["password"]).trim();
      return !!sap && !!pass;
    });
    // Send to content script with a distinct action type
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["content.bundle.js"],
        },
        () => {
          chrome.tabs.sendMessage(
            tab.id,
            {
              type: "CHANGE_SAP_PASSWORDS",
              data: asObjects,
            },
            async (response) => {
              setUiBlocked(false);
              if (!(response && response.success)) {
                alert("Batch password change failed or was cancelled.");
              }
            }
          );
        }
      );
    } else {
      setUiBlocked(false);
    }
  }

  document
    .getElementById("changePasswordsBtn")
    .addEventListener("click", changePasswordsHandler);
});
