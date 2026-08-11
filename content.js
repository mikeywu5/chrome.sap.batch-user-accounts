console.log("Batch User Accounts content script loaded.");
const {
  findInputByLabel,
  waitFor,
  waitForElement,
  findButtonByContent,
  triggerEvent,
  typeValue,
  setInputValueRobust,
  timeout,
} = require("./domHelpers");

let enableLogging = false;
let isBatchRunning = false;
const LISTENER_FLAG = "__batchUserAccountsListenerRegistered";
let searchPanelObserverStarted = false;
let searchPanelInjectInFlight = false;
let studentCacheWatchStarted = false;
let latestStudentRows = [];
const SEARCH_PANEL_STATE_KEY = "embeddedSearchPanelState";
const EMBEDDED_IFRAME_HEIGHT_MESSAGE_TYPE = "BATCH_IFRAME_HEIGHT";
const TEMPLATE_COPY_REQUEST_TYPE = "BATCH_GENERATE_TEMPLATE_COPY";
const TEMPLATE_COPY_RESPONSE_TYPE = "BATCH_GENERATE_TEMPLATE_COPY_RESULT";
let embeddedIframeHeightListenerRegistered = false;
chrome.storage?.local?.get(["enableLogging"], (res) => {
  enableLogging = !!res?.enableLogging;
});
function toLine(args) {
  return args
    .map((a) => {
      if (a instanceof Error) return `${a.name}: ${a.message}`;
      if (typeof a === "object") {
        try { return JSON.stringify(a); } catch (_) { return String(a); }
      }
      return String(a);
    })
    .join(" ");
}
function log(...args) {
  if (!enableLogging) return;
  console.log("[BatchUser][content]", ...args);
  try {
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", payload: toLine(args) });
  } catch (_) {}
}

function syncMatchedStudentToPane(sapLogin) {
  const login = String(sapLogin || "").trim();
  if (!login) return;
  try {
    chrome.runtime.sendMessage({
      type: "FOCUS_STUDENT_ROW",
      sapLogin: login,
    });
  } catch (_) {}
}

function registerEmbeddedPaneHeightListener() {
  if (embeddedIframeHeightListenerRegistered) return;
  embeddedIframeHeightListenerRegistered = true;

  window.addEventListener("message", (event) => {
    const data = event?.data;
    if (!data || data.type !== EMBEDDED_IFRAME_HEIGHT_MESSAGE_TYPE) return;
    const iframe = document.getElementById("batch-user-embedded-pane-frame");
    if (!iframe || event.source !== iframe.contentWindow) return;
    const nextHeight = Number(data.height || 0);
    if (!Number.isFinite(nextHeight) || nextHeight <= 0) return;
    const clamped = Math.max(180, Math.min(2600, Math.ceil(nextHeight + 8)));
    iframe.style.height = `${clamped}px`;
  });
}

function requestTemplateCopyForStudent(embeddedPaneFrame, student) {
  return new Promise((resolve, reject) => {
    if (!embeddedPaneFrame?.contentWindow) {
      reject(new Error("Embedded pane is not ready."));
      return;
    }
    const requestId = `copy-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const timeoutId = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("Timed out while generating email template copy."));
    }, 8000);
    const onMessage = (event) => {
      const data = event?.data;
      if (!data || data.type !== TEMPLATE_COPY_RESPONSE_TYPE || data.requestId !== requestId) {
        return;
      }
      clearTimeout(timeoutId);
      window.removeEventListener("message", onMessage);
      if (data.success) {
        resolve(String(data.html || ""));
        return;
      }
      reject(new Error(String(data.error || "Unable to copy template content.")));
    };
    window.addEventListener("message", onMessage);
    embeddedPaneFrame.contentWindow.postMessage(
      { type: TEMPLATE_COPY_REQUEST_TYPE, requestId, student },
      "*"
    );
  });
}

async function copyRichHtmlToClipboardFromPage(html) {
  const safeHtml = String(html || "");
  if (!safeHtml.trim()) {
    throw new Error("Generated template content is empty.");
  }

  const plain = safeHtml
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    const item = new ClipboardItem({
      "text/html": new Blob([safeHtml], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" }),
    });
    await navigator.clipboard.write([item]);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = plain;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) {
    throw new Error("Clipboard copy is not available.");
  }
}

function isSapWebGuiPage() {
  return /\/sap\/bc\/gui\/sap\/its\/webgui/i.test(window.location.href);
}

function getSearchPanels() {
  return Array.from(document.querySelectorAll("#batch-user-search-panel"));
}

function removeDuplicateSearchPanels() {
  const panels = getSearchPanels();
  if (panels.length <= 1) return;
  for (let i = 1; i < panels.length; i += 1) {
    panels[i].remove();
  }
}

function scheduleSearchPanelInjection(delay = 100) {
  setTimeout(() => {
    removeDuplicateSearchPanels();
    if (searchPanelInjectInFlight || !isSapWebGuiPage()) return;
    if (document.getElementById("batch-user-search-panel")) return;
    searchPanelInjectInFlight = true;
    injectStudentSearchPanel()
      .catch((err) => {
        log("Search panel injection failed", err?.message || err);
      })
      .finally(() => {
        searchPanelInjectInFlight = false;
      });
  }, delay);
}

function startSearchPanelObserver() {
  if (searchPanelObserverStarted || !isSapWebGuiPage()) return;
  searchPanelObserverStarted = true;

  scheduleSearchPanelInjection(50);

  const observer = new MutationObserver(() => {
    scheduleSearchPanelInjection(120);
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  setInterval(() => {
    scheduleSearchPanelInjection(0);
  }, 1500);
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("[BatchUser] DOMContentLoaded in content script");
    startSearchPanelObserver();
  });
} else {
  startSearchPanelObserver();
}

const STUDENT_FIELD_LABELS = {
  firstName: "First Name",
  lastName: "Last Name",
  studentEmail: "Student Email",
  studentId: "Student ID",
  section: "Section",
  instructor: "Instructor",
  instructorEmail: "Instructor Email",
  sapLogin: "SAP Login",
  sapPassword: "SAP Password",
  created: "Created",
};

const SEARCHABLE_KEYS = [
  "firstName",
  "lastName",
  "studentEmail",
  "studentId",
  "sapLogin",
];

function getStudentTableCache() {
  return new Promise((resolve) => {
    chrome.storage?.local?.get(["studentTableCache"], (res) => {
      resolve(Array.isArray(res?.studentTableCache) ? res.studentTableCache : []);
    });
  });
}

async function startStudentCacheWatch() {
  if (studentCacheWatchStarted) return;
  studentCacheWatchStarted = true;
  latestStudentRows = await getStudentTableCache();
  if (!chrome.storage?.onChanged?.addListener) return;
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes?.studentTableCache) return;
    latestStudentRows = Array.isArray(changes.studentTableCache.newValue)
      ? changes.studentTableCache.newValue
      : [];
    window.dispatchEvent(new Event("batch-user-student-cache-updated"));
  });
}

function findAliasInput() {
  return (
    findInputByLabel("Alias") ||
    document.querySelector("input[data-hint*='SUID_ST_NODE_LOGONDATA-USERALIAS']")
  );
}

function forceTextSelectable(el) {
  if (!el?.style?.setProperty) return;
  el.style.setProperty("user-select", "text", "important");
  el.style.setProperty("-webkit-user-select", "text", "important");
}

function buildSearchPanel() {
  const panel = document.createElement("div");
  panel.id = "batch-user-search-panel";
  panel.style.position = "relative";
  panel.style.top = "10em";
  panel.style.marginTop = "8px";
  panel.style.marginBottom = "11em";
  panel.style.padding = "10px";
  panel.style.border = "1px solid #ccd6e6";
  panel.style.borderRadius = "6px";
  panel.style.background = "#f8fbff";
  panel.style.zIndex = "1";
  forceTextSelectable(panel);

  const title = document.createElement("div");
  title.textContent = "Student Search";
  title.style.fontWeight = "600";
  title.style.marginBottom = "8px";
  forceTextSelectable(title);

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "8px";
  row.style.alignItems = "center";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search Query";
  input.id = "batch-user-search-query";
  input.setAttribute("list", "batch-user-search-datalist");
  input.style.flex = "1";
  input.style.minHeight = "28px";
  input.style.padding = "4px 8px";
  forceTextSelectable(input);

  const datalist = document.createElement("datalist");
  datalist.id = "batch-user-search-datalist";

  const initBtn = document.createElement("button");
  initBtn.textContent = "Initialize Password";
  initBtn.id = "batch-user-init-password-btn";
  initBtn.style.minHeight = "30px";
  initBtn.style.padding = "0 10px";
  forceTextSelectable(initBtn);

  const inputUserBtn = document.createElement("button");
  inputUserBtn.textContent = "Input User";
  inputUserBtn.id = "batch-user-input-user-btn";
  inputUserBtn.style.minHeight = "30px";
  inputUserBtn.style.padding = "0 10px";
  forceTextSelectable(inputUserBtn);

  const status = document.createElement("div");
  status.id = "batch-user-search-status";
  status.style.fontSize = "12px";
  forceTextSelectable(status);

  const templateCopyBtn = document.createElement("button");
  templateCopyBtn.type = "button";
  templateCopyBtn.id = "batch-user-template-copy-btn";
  templateCopyBtn.textContent = "📋";
  templateCopyBtn.title = "Copy Email Message";
  templateCopyBtn.style.minHeight = "24px";
  templateCopyBtn.style.padding = "0 8px";
  forceTextSelectable(templateCopyBtn);

  const statusRow = document.createElement("div");
  statusRow.style.marginTop = "8px";
  statusRow.style.display = "flex";
  statusRow.style.alignItems = "center";
  statusRow.style.gap = "8px";
  statusRow.appendChild(templateCopyBtn);
  statusRow.appendChild(status);

  const table = document.createElement("table");
  table.id = "batch-user-search-result";
  table.style.width = "100%";
  table.style.marginTop = "8px";
  table.style.borderCollapse = "collapse";
  forceTextSelectable(table);

  const embeddedPaneWrap = document.createElement("div");
  embeddedPaneWrap.id = "batch-user-embedded-pane";
  embeddedPaneWrap.style.marginTop = "12px";
  embeddedPaneWrap.style.borderTop = "1px solid #d9e1ef";
  embeddedPaneWrap.style.paddingTop = "10px";

  const embeddedPaneTitle = document.createElement("div");
  embeddedPaneTitle.textContent = "Batch SAP User Accounts";
  embeddedPaneTitle.style.fontWeight = "600";
  embeddedPaneTitle.style.marginBottom = "8px";
  embeddedPaneTitle.style.cursor = "pointer";
  embeddedPaneTitle.setAttribute("role", "button");
  embeddedPaneTitle.setAttribute("tabindex", "0");
  forceTextSelectable(embeddedPaneTitle);

  const embeddedPaneFrame = document.createElement("iframe");
  embeddedPaneFrame.id = "batch-user-embedded-pane-frame";
  embeddedPaneFrame.src = chrome.runtime.getURL("popup.html");
  embeddedPaneFrame.style.width = "100%";
  embeddedPaneFrame.style.height = "240px";
  embeddedPaneFrame.style.border = "1px solid #ccd6e6";
  embeddedPaneFrame.style.borderRadius = "6px";
  embeddedPaneFrame.style.background = "#fff";
  embeddedPaneFrame.setAttribute("scrolling", "no");

  embeddedPaneWrap.appendChild(embeddedPaneTitle);
  embeddedPaneWrap.appendChild(embeddedPaneFrame);

  row.appendChild(input);
  row.appendChild(inputUserBtn);
  row.appendChild(initBtn);
  panel.appendChild(title);
  panel.appendChild(row);
  panel.appendChild(datalist);
  panel.appendChild(statusRow);
  panel.appendChild(table);
  panel.appendChild(embeddedPaneWrap);

  return {
    panel,
    input,
    datalist,
    inputUserBtn,
    templateCopyBtn,
    initBtn,
    status,
    table,
    embeddedPaneWrap,
    embeddedPaneTitle,
    embeddedPaneFrame,
  };
}

function renderStudentResultTable(tableEl, student, options = {}) {
  tableEl.innerHTML = "";
  if (!student) return;
  const keys = Object.keys(STUDENT_FIELD_LABELS).filter((key) => key in student);
  if (!keys.length) return;

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const tbody = document.createElement("tbody");
  const dataRow = document.createElement("tr");
  dataRow.style.cursor = "pointer";
  dataRow.setAttribute("tabindex", "0");

  keys.forEach((key) => {
    const th = document.createElement("th");
    th.textContent = STUDENT_FIELD_LABELS[key];
    th.style.border = "1px solid #d9e1ef";
    th.style.padding = "6px 8px";
    th.style.textAlign = "left";
    th.style.background = "#eef4ff";
    th.style.fontWeight = "600";
    forceTextSelectable(th);

    const td = document.createElement("td");
    td.textContent = String(student[key] ?? "");
    td.style.border = "1px solid #d9e1ef";
    td.style.padding = "6px 8px";
    td.style.verticalAlign = "top";
    forceTextSelectable(td);

    headRow.appendChild(th);
    dataRow.appendChild(td);
  });

  thead.appendChild(headRow);
  tbody.appendChild(dataRow);
  tableEl.appendChild(thead);
  tableEl.appendChild(tbody);

  if (typeof options.onActivateMatchedRow === "function") {
    dataRow.addEventListener("click", () => options.onActivateMatchedRow());
    dataRow.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      options.onActivateMatchedRow();
    });
  }
}

function updateDatalist(datalistEl, students, query) {
  datalistEl.innerHTML = "";
  const q = String(query || "").trim().toLowerCase();
  if (!q) return;
  const seen = new Set();
  for (const s of students) {
    for (const key of SEARCHABLE_KEYS) {
      const val = String(s[key] || "").trim();
      if (!val) continue;
      if (!val.toLowerCase().includes(q)) continue;
      const normalized = val.toLowerCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      const opt = document.createElement("option");
      opt.value = val;
      datalistEl.appendChild(opt);
      if (seen.size >= 25) return;
    }
  }
}

function findStudentByQuery(students, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return null;
  return (
    students.find((s) =>
      SEARCHABLE_KEYS.some((key) => String(s[key] || "").toLowerCase() === q)
    ) ||
    students.find((s) =>
      SEARCHABLE_KEYS.some((key) => String(s[key] || "").toLowerCase().includes(q))
    ) ||
    null
  );
}

async function injectStudentSearchPanel() {
  if (!isSapWebGuiPage()) return;
  removeDuplicateSearchPanels();
  if (document.getElementById("batch-user-search-panel")) return;

  await startStudentCacheWatch();

  const aliasInput = await waitFor(() => findAliasInput(), { timeout: 5000 });
  if (!aliasInput) return;

  let rows = Array.isArray(latestStudentRows) ? latestStudentRows : [];
  const host = aliasInput.closest("div[ct='RLI']")?.parentElement || aliasInput.parentElement;
  if (!host) return;

  registerEmbeddedPaneHeightListener();

  const {
    panel,
    input,
    datalist,
    inputUserBtn,
    templateCopyBtn,
    initBtn,
    status,
    table,
    embeddedPaneWrap,
    embeddedPaneTitle,
    embeddedPaneFrame,
  } = buildSearchPanel();
  const aliasRow = aliasInput.closest("div[ct='RLI']");
  if (aliasRow && aliasRow.nextSibling) {
    host.insertBefore(panel, aliasRow.nextSibling);
  } else {
    host.appendChild(panel);
  }

  let matchedStudent = null;
  let paneExpanded = true;

  const syncMatchedToPaneIfAvailable = () => {
    if (matchedStudent?.sapLogin) {
      syncMatchedStudentToPane(matchedStudent.sapLogin);
    }
  };

  const applyPaneExpandedState = () => {
    const chevron = paneExpanded ? "▼" : "▶";
    embeddedPaneTitle.textContent = `${chevron} Batch SAP User Accounts`;
    embeddedPaneTitle.setAttribute("aria-expanded", paneExpanded ? "true" : "false");
    embeddedPaneFrame.style.display = paneExpanded ? "block" : "none";
  };

  const persistSearchPanelState = () => {
    chrome.storage?.local?.set({
      [SEARCH_PANEL_STATE_KEY]: {
        query: String(input.value || ""),
        matchedSapLogin: String(matchedStudent?.sapLogin || ""),
        paneExpanded,
        updatedAt: Date.now(),
      },
    });
  };

  const toggleEmbeddedPane = () => {
    paneExpanded = !paneExpanded;
    applyPaneExpandedState();
    persistSearchPanelState();
  };

  embeddedPaneTitle.addEventListener("click", toggleEmbeddedPane);
  embeddedPaneTitle.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleEmbeddedPane();
  });
  applyPaneExpandedState();

  const handleQueryChange = () => {
    const hadInputFocus = document.activeElement === input;
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;

    updateDatalist(datalist, rows, input.value);
    matchedStudent = findStudentByQuery(rows, input.value);
    renderStudentResultTable(table, matchedStudent, {
      onActivateMatchedRow: () => {
        if (!matchedStudent?.sapLogin) return;
        if (!paneExpanded) {
          paneExpanded = true;
          applyPaneExpandedState();
          persistSearchPanelState();
        }
        embeddedPaneWrap.scrollIntoView({ behavior: "smooth", block: "start" });
        embeddedPaneFrame.focus();
        syncMatchedStudentToPane(matchedStudent.sapLogin);
      },
    });
    status.textContent = matchedStudent
      ? `Matched: ${matchedStudent.sapLogin || "(no SAP Login)"}`
      : "No matching student found";

    if (matchedStudent) {
      const fullName = `${String(matchedStudent.firstName || "").trim()} ${String(
        matchedStudent.lastName || ""
      ).trim()}`.trim();
      const studentName = fullName || String(matchedStudent.sapLogin || "student").trim();
      templateCopyBtn.title = `Copy Email Message for ${studentName}`;
    } else {
      templateCopyBtn.title = "Copy Email Message";
    }

    templateCopyBtn.disabled = !matchedStudent;
    persistSearchPanelState();

    // Keep typing uninterrupted: avoid pane sync (which can steal focus) during live edits.
    if (!hadInputFocus) {
      syncMatchedToPaneIfAvailable();
    }

    if (hadInputFocus) {
      requestAnimationFrame(() => {
        input.focus({ preventScroll: true });
        if (
          typeof selectionStart === "number" &&
          typeof selectionEnd === "number"
        ) {
          input.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    }
  };

  input.addEventListener("input", handleQueryChange);
  input.addEventListener("blur", () => {
    syncMatchedToPaneIfAvailable();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    syncMatchedToPaneIfAvailable();
  });
  window.addEventListener("batch-user-student-cache-updated", () => {
    rows = Array.isArray(latestStudentRows) ? latestStudentRows : [];
    handleQueryChange();
    if (!rows.length) {
      status.textContent = "Student cache is empty. Paste data in popup to sync.";
    }
  });

  chrome.storage?.local?.get([SEARCH_PANEL_STATE_KEY], (res) => {
    const state = res?.[SEARCH_PANEL_STATE_KEY] || {};
    if (typeof state.paneExpanded === "boolean") {
      paneExpanded = state.paneExpanded;
      applyPaneExpandedState();
    }
    const query = String(state.query || "");
    if (!query) return;
    input.value = query;
    handleQueryChange();
  });

  templateCopyBtn.addEventListener("click", async () => {
    if (!matchedStudent) {
      status.textContent = "Select a matching student first.";
      return;
    }
    try {
      status.textContent = "Generating and copying reset-template HTML...";
      const templateOnlyHtml = await requestTemplateCopyForStudent(
        embeddedPaneFrame,
        matchedStudent
      );
      await copyRichHtmlToClipboardFromPage(templateOnlyHtml);
      status.textContent = `Copied reset-template HTML for ${matchedStudent.sapLogin || "student"}.`;
    } catch (err) {
      status.textContent = `Copy failed: ${String(err?.message || err)}`;
    }
  });

  inputUserBtn.addEventListener("click", async () => {
    if (!matchedStudent) {
      status.textContent = "Select a matching student first.";
      return;
    }
    if (!matchedStudent.sapLogin) {
      status.textContent = "Matched student is missing SAP Login.";
      return;
    }
    if (isBatchRunning) {
      status.textContent = "Another action is running. Please wait.";
      return;
    }

    try {
      status.textContent = `Inputting user ${matchedStudent.sapLogin}...`;
      isBatchRunning = true;
      const $user = await waitForEditableUserInput();
      await setInputValueRobust($user, matchedStudent.sapLogin, { delay: 60 });
      status.textContent = `User field populated: ${matchedStudent.sapLogin}`;
    } catch (err) {
      status.textContent = `Failed to input user: ${String(err?.message || err)}`;
    } finally {
      isBatchRunning = false;
    }
  });

  initBtn.addEventListener("click", async () => {
    if (!matchedStudent) {
      status.textContent = "Select a matching student first.";
      return;
    }
    if (!matchedStudent.sapLogin || !matchedStudent.sapPassword) {
      status.textContent = "Matched student is missing SAP Login or SAP Password.";
      return;
    }
    if (isBatchRunning) {
      status.textContent = "Another action is running. Please wait.";
      return;
    }

    try {
      status.textContent = `Initializing password for ${matchedStudent.sapLogin}...`;
      isBatchRunning = true;
      const results = await changeSAPPasswords([matchedStudent]);
      const result = results && results[0];
      if (result?.success) {
        status.textContent = `Password initialized for ${matchedStudent.sapLogin}.`;
      } else {
        status.textContent = `Failed for ${matchedStudent.sapLogin}: ${result?.error || "unknown error"}`;
      }
    } catch (err) {
      status.textContent = `Failed: ${String(err?.message || err)}`;
    } finally {
      isBatchRunning = false;
    }
  });
}

function findModifyChangeActionButton() {
  return (
    findBestActionButton((s) => {
      let score = 0;
      if (/\bchange\b/.test(s.combined)) score += 3;
      if (/change\s*\(shift\s*f6\)/.test(s.combined)) score += 6;
      if (/shift_f6/.test(s.lsdata)) score += 8;
      if (/"0"\s*:\s*"change"/.test(s.lsdata)) score += 8;
      if (/"18"\s*:\s*"shift_f6"/.test(s.lsdata)) score += 12;
      if (/password/.test(s.combined) || /password/.test(s.lsdata)) score -= 20;
      if (/\/tbar\[1\]\//.test(s.dataHint)) score += 2;
      return score;
    }) || findButtonByContent("Change")
  );
}

function clickSapButton(button) {
  if (!button) return;
  triggerEvent(button, "mousedown");
  triggerEvent(button, "mouseup");
  triggerEvent(button, "click");
  if (typeof button.click === "function") {
    button.click();
  }
}

function findChangePasswordActionButton() {
  return findBestActionButton((s) => {
    let score = 0;
    if (/\bchange\s+password\b/.test(s.combined)) score += 10;
    if (/password/.test(s.combined) && /change/.test(s.combined)) score += 4;
    if (/password/.test(s.lsdata)) score += 10;
    if (/"0"\s*:\s*"change password"/.test(s.lsdata)) score += 15;
    if (/shift_f8/.test(s.lsdata)) score += 12;
    if (/"18"\s*:\s*"shift_f8"/.test(s.lsdata)) score += 16;
    if (/chapas/.test(s.lsdata)) score += 6;
    if (/wnd\[1\]/.test(s.dataHint)) score -= 30;
    if (/\/tbar\[1\]\//.test(s.dataHint)) score += 1;
    return score;
  });
}

function findPasswordApplyActionButton() {
  return (
    findBestActionButton((s) => {
      let score = 0;
      if (/\bapply\b/.test(s.combined)) score += 5;
      if (/apply\s*\(enter\)/.test(s.combined)) score += 8;
      if (/"18"\s*:\s*"enter"/.test(s.lsdata) || /\benter\b/.test(s.lsdata)) score += 10;
      if (/vkey\/0/.test(s.lsevents)) score += 10;
      if (/wnd\[1\]/.test(s.dataHint)) score += 3;
      return score;
    }) || findButtonByContent("Apply")
  );
}

function findLockUnlockActionButton() {
  return findBestActionButton((s) => {
    let score = 0;
    if (/\block\s*\/\s*unlock\b/.test(s.combined)) score += 10;
    if (/ctrl_f5/.test(s.lsdata)) score += 12;
    if (/"18"\s*:\s*"ctrl_f5"/.test(s.lsdata)) score += 16;
    if (/\block\b/.test(s.lsdata) || /\bunlock\b/.test(s.lsdata)) score += 6;
    if (/\/tbar\[1\]\//.test(s.dataHint)) score += 2;
    return score;
  });
}

function findUnlockDialogStatusLabel() {
  return Array.from(document.querySelectorAll("[role='button'], .lsLabel, [ct='L']")).find(
    (el) => {
      const text = String(el.textContent || "").replace(/\s+/g, " ").trim();
      return /\bnot\s+locked\b/i.test(text) || /\blocked\b/i.test(text);
    }
  );
}

function findUnlockDialogCancelButton() {
  return findBestActionButton((s) => {
    let score = 0;
    if (/\bcancel\b/.test(s.combined)) score += 6;
    if (/escape/.test(s.combined)) score += 6;
    if (/escape/.test(s.lsdata)) score += 12;
    if (/"18"\s*:\s*"escape"/.test(s.lsdata)) score += 16;
    if (/wnd\[1\]/.test(s.dataHint)) score += 3;
    return score;
  });
}

function findUnlockDialogUnlockButton() {
  return findBestActionButton((s) => {
    let score = 0;
    if (/\bunlock\b/.test(s.combined)) score += 10;
    if (/\(f7\)/.test(s.combined)) score += 6;
    if (/"18"\s*:\s*"f7"/.test(s.lsdata) || /\bf7\b/.test(s.lsdata)) score += 12;
    if (/wnd\[1\]/.test(s.dataHint)) score += 3;
    return score;
  });
}

function isSecondaryWindowVisible() {
  return !!document.querySelector("[data-hint*='wnd[1]']");
}

async function waitForSecondaryWindowToClose(timeoutMs = 10000) {
  await waitFor(() => !isSecondaryWindowVisible(), { timeout: timeoutMs });
}

async function activateChangePasswordAndWaitForInput(anchorElement) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    log(`Password 1/4: waiting for Change Password action (attempt ${attempt})`);
    const $change = await waitFor(() => findChangePasswordActionButton(), {
      timeout: 20000,
    });
    log("Password action found", $change);
    clickSapButton($change);
    await timeout();

    try {
      return await waitFor(() => findNewPasswordInput(), {
        timeout: 7000,
      });
    } catch (err) {
      if (attempt === 2) throw err;
      log("Password pane did not open; retrying Change Password action");
      pressShiftF8OnElement(anchorElement || document.activeElement || document.body);
      await timeout(500);
    }
  }
  throw new Error("Unable to activate Change Password pane.");
}

async function ensureUserUnlockedIfNeeded() {
  const $lockUnlock = findLockUnlockActionButton();
  if (!$lockUnlock) {
    log("Lock/Unlock button not found; continuing without unlock step");
    return;
  }

  log("Unlock step: activating Lock/Unlock action");
  clickSapButton($lockUnlock);
  await timeout();

  const $status = await waitFor(() => findUnlockDialogStatusLabel(), {
    timeout: 10000,
  });
  const statusText = String($status?.textContent || "").replace(/\s+/g, " ").trim();
  log("Unlock step: status detected", statusText);

  if (/\bnot\s+locked\b/i.test(statusText)) {
    const $cancel = await waitFor(() => findUnlockDialogCancelButton(), {
      timeout: 10000,
    });
    log("Unlock step: user already unlocked, closing dialog via Cancel/Escape");
    clickSapButton($cancel);
    await waitForSecondaryWindowToClose();
    return;
  }

  const $unlock = await waitFor(() => findUnlockDialogUnlockButton(), {
    timeout: 10000,
  });
  log("Unlock step: user appears locked, clicking Unlock");
  clickSapButton($unlock);
  await waitForSecondaryWindowToClose();
}

function getActionCandidates() {
  return Array.from(
    document.querySelectorAll("[role='button'], [role='menuitem'], button")
  );
}

function getButtonSignals(el) {
  const text = String(el.textContent || "").replace(/\s+/g, " ").trim();
  const title = String(el.getAttribute("title") || "").trim();
  const aria = String(el.getAttribute("aria-label") || "").trim();
  const lsdata = String(el.getAttribute("lsdata") || "").toLowerCase();
  const lsevents = String(el.getAttribute("lsevents") || "").toLowerCase();
  const dataHint = String(el.getAttribute("data-hint") || "").toLowerCase();
  const combined = `${text} ${title} ${aria}`.toLowerCase().trim();
  return { text, title, aria, lsdata, lsevents, dataHint, combined };
}

function findBestActionButton(scoreFn) {
  let winner = null;
  let bestScore = 0;
  for (const candidate of getActionCandidates()) {
    const signals = getButtonSignals(candidate);
    const score = Number(scoreFn(signals) || 0);
    if (score > bestScore) {
      bestScore = score;
      winner = candidate;
    }
  }
  return winner;
}

function pressEnterOnElement(element) {
  if (!element) return;
  const options = {
    bubbles: true,
    cancelable: true,
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
  };
  triggerEvent(element, "keydown", options);
  triggerEvent(element, "keypress", options);
  triggerEvent(element, "keyup", options);
}

function pressShiftF8OnElement(element) {
  if (!element) return;
  const options = {
    bubbles: true,
    cancelable: true,
    shiftKey: true,
    key: "F8",
    code: "F8",
    keyCode: 119,
    which: 119,
  };
  triggerEvent(element, "keydown", options);
  triggerEvent(element, "keyup", options);
}

function isVisibleInput(el) {
  if (!el || typeof el.getBoundingClientRect !== "function") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function findVisiblePasswordInputs() {
  return Array.from(document.querySelectorAll("input[type='password']")).filter(
    isVisibleInput
  );
}

function findNewPasswordInput() {
  return (
    findInputByLabel("New Password") ||
    findInputByLabel("Password") ||
    findVisiblePasswordInputs()[0] ||
    null
  );
}

function findRepeatPasswordInput() {
  return (
    findInputByLabel("Repeat Password") ||
    findInputByLabel("Retype Password") ||
    findVisiblePasswordInputs()[1] ||
    null
  );
}

function findPasswordStateLabelElement() {
  const candidates = Array.from(
    document.querySelectorAll("span[lsdata*='PASSWORD'], [role='button'], .lsLabel, [ct='L']")
  );
  if (!candidates.length) return null;
  const prioritized = candidates
    .map((el) => {
      const lsdata = String(el.getAttribute("lsdata") || "");
      const text = String(el.textContent || "").replace(/\s+/g, " ").trim();
      let score = 0;
      if (/PASSWORD_EXT_PWD_STATE/i.test(lsdata)) score += 20;
      if (/password status/i.test(text)) score += 14;
      if (/password/i.test(text)) score += 6;
      if (/initial|production/i.test(text)) score += 8;
      if (/wnd\[1\]/i.test(String(el.getAttribute("data-hint") || ""))) score += 4;
      score += Math.min(text.length, 20);
      return { el, text, score };
    })
    .sort((a, b) => b.score - a.score);
  return prioritized[0]?.el || null;
}

async function getPasswordStateText(timeoutMs = 5000) {
  const label = await waitFor(() => findPasswordStateLabelElement(), {
    timeout: timeoutMs,
  });
  return String(label?.textContent || "").replace(/\s+/g, " ").trim();
}

function doesPasswordStateContain(passwordStateText, containsValue) {
  const filterValue = String(containsValue || "").trim();
  if (!filterValue) return true;
  return String(passwordStateText || "")
    .toLowerCase()
    .includes(filterValue.toLowerCase());
}

function findPasswordDialogCancelButton() {
  return findBestActionButton((s) => {
    let score = 0;
    if (/\bcancel\b/.test(s.combined)) score += 12;
    if (/\bclose\b/.test(s.combined)) score += 10;
    if (/\bx\b/.test(s.text.trim().toLowerCase())) score += 6;
    if (/escape/.test(s.lsdata)) score += 12;
    if (/"18"\s*:\s*"escape"/.test(s.lsdata)) score += 16;
    if (/vkey\/12/.test(s.lsevents)) score += 10;
    if (/wnd\[1\]/.test(s.dataHint)) score += 6;
    return score;
  });
}

function findPasswordDialogConfirmButton() {
  return (
    findBestActionButton((s) => {
      let score = 0;
      if (/\bapply\b/.test(s.combined)) score += 10;
      if (/\bok\b/.test(s.combined)) score += 8;
      if (/\bcheck\b/.test(s.combined)) score += 8;
      if (/\benter\b/.test(s.lsdata)) score += 10;
      if (/"18"\s*:\s*"enter"/.test(s.lsdata)) score += 14;
      if (/vkey\/0/.test(s.lsevents)) score += 12;
      if (/wnd\[1\]/.test(s.dataHint)) score += 6;
      return score;
    }) || findPasswordApplyActionButton()
  );
}

async function closePasswordDialogViaX(timeoutMs = 10000) {
  const $cancel = await waitFor(() => findPasswordDialogCancelButton(), {
    timeout: timeoutMs,
  });
  clickSapButton($cancel);
  await waitForSecondaryWindowToClose(timeoutMs);
}

const CLI_MESSAGE_SOURCE = "sap-batch-cli";
const CLI_RESULT_SOURCE = "sap-batch-cli-result";
const CLI_LISTENER_FLAG = "__batchUserAccountsCliListenerRegistered";

function runBatchAction(message) {
  if (message.type === "MODIFY_SAP_USERS" && Array.isArray(message.data)) {
    if (isBatchRunning) {
      return Promise.resolve({
        success: false,
        error: "Another batch is already running. Please wait for it to finish.",
      });
    }
    isBatchRunning = true;
    log("Calling modifySAPUsers with data:", message.data);
    return modifySAPUsers(message.data)
      .then((results) => ({ success: true, results }))
      .catch((err) => ({ success: false, error: String(err?.message || err) }))
      .finally(() => {
        isBatchRunning = false;
      });
  }
  if (message.type === "CHANGE_SAP_PASSWORDS" && Array.isArray(message.data)) {
    if (isBatchRunning) {
      return Promise.resolve({
        success: false,
        error: "Another batch is already running. Please wait for it to finish.",
      });
    }
    isBatchRunning = true;
    log("Calling changeSAPPasswords with data:", message.data);
    return changeSAPPasswords(message.data, {
      passwordStateContains: message.passwordStateContains,
    })
      .then((results) => ({ success: true, results }))
      .catch((err) => ({ success: false, error: String(err?.message || err) }))
      .finally(() => {
        isBatchRunning = false;
      });
  }
  return null;
}

// Listen for messages from popup.js (register once even if script is injected multiple times)
if (!window[LISTENER_FLAG]) {
  window[LISTENER_FLAG] = true;
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log("Received message:", message);
    const pending = runBatchAction(message);
    if (!pending) return false;
    pending.then((response) => sendResponse(response));
    return true;
  });
}

// Bridge for Puppeteer / Node CLI control via window.postMessage.
// Use a DOM marker (not a page-world window property) because content scripts
// run in an isolated world that page.evaluate cannot see.
if (!window[CLI_LISTENER_FLAG]) {
  window[CLI_LISTENER_FLAG] = true;
  try {
    document.documentElement.setAttribute("data-sap-batch-cli", "ready");
  } catch (_) {}
  window.addEventListener("message", (event) => {
    const data = event?.data;
    if (!data || data.source !== CLI_MESSAGE_SOURCE) return;
    if (event.source !== window) return;
    const requestId = data.requestId;
    const pending = runBatchAction(data);
    if (!pending) {
      window.postMessage(
        {
          source: CLI_RESULT_SOURCE,
          requestId,
          success: false,
          error: `Unsupported CLI action: ${data.type || "(missing type)"}`,
        },
        "*"
      );
      return;
    }
    pending.then((response) => {
      window.postMessage(
        {
          source: CLI_RESULT_SOURCE,
          requestId,
          ...response,
        },
        "*"
      );
    });
  });
}

async function waitForEditableUserInput() {
  let activationAttempted = false;
  return waitFor(
    () => {
      const userInput = findInputByLabel("User");
      if (userInput && !userInput.disabled) return userInput;
      if (!activationAttempted) {
        activationAttempted = true;
        const userActivateButton =
          document.querySelector("#Mnu1_But") ||
          document.querySelector("[role='button'][title='User']");
        if (userActivateButton) {
          triggerEvent(userActivateButton, "click");
          log("Activated User input via User button");
        }
      }
      return null;
    },
    { timeout: 20000 }
  );
}

function sanitizeContactFieldValue(value, maxLength = 20) {
  const raw = String(value || "");
  const ascii = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const safe = ascii
    .replace(/[^A-Za-z0-9\- ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return safe.slice(0, maxLength);
}

function countAlphaNumeric(value) {
  const matches = String(value || "").match(/[A-Za-z0-9]/g);
  return matches ? matches.length : 0;
}

function truncateByAlphaNumeric(value, maxAlphaNumeric) {
  if (maxAlphaNumeric <= 0) return "";
  let used = 0;
  let output = "";
  for (const ch of String(value || "")) {
    if (/[A-Za-z0-9]/.test(ch)) {
      if (used >= maxAlphaNumeric) continue;
      used += 1;
      output += ch;
      continue;
    }
    output += ch;
  }
  return output.trim();
}

function buildTelephoneAndExtension(lastName, firstName, maxCombinedAlphaNumeric = 25) {
  let telephone = sanitizeContactFieldValue(lastName, 20);
  let extension = sanitizeContactFieldValue(firstName, 20);

  const telephoneAlphaNumeric = countAlphaNumeric(telephone);
  const extensionBudget = Math.max(0, maxCombinedAlphaNumeric - telephoneAlphaNumeric);
  extension = truncateByAlphaNumeric(extension, extensionBudget);

  const extensionAlphaNumeric = countAlphaNumeric(extension);
  const telephoneBudget = Math.max(0, maxCombinedAlphaNumeric - extensionAlphaNumeric);
  telephone = truncateByAlphaNumeric(telephone, telephoneBudget);
  telephone = sanitizeContactFieldValue(telephone, 20);

  return { telephone, extension };
}

// Main batch edit logic
async function modifySAPUsers(tableData) {
  const results = [];
  let num = 0;
  for (const student of /** @type {LoginSAPFields[]} */ (tableData)) {
    try {
      await timeout();
      log("Modding User: ", ++num, student);
      const $user = await waitForEditableUserInput();
      await setInputValueRobust($user, student.sapLogin);
      const $change = await waitFor(() => findModifyChangeActionButton(), {
        timeout: 20000,
      });
      log("Change", $change);
      await timeout();
      clickSapButton($change);
      const $email = await waitFor(() => findInputByLabel("E-Mail"));
      await setInputValueRobust($email, student.studentEmail, { delay: 0 });

      const phoneFields = buildTelephoneAndExtension(
        student.lastName,
        student.firstName,
        25
      );
      const faxValue = sanitizeContactFieldValue(
        String(student.section || "").replace(/\./g, "-"),
        20
      );

      const $telephone = await waitFor(() => findInputByLabel("Telephone"), {
        timeout: 20000,
      });
      await setInputValueRobust($telephone, phoneFields.telephone, { delay: 0 });

      const $extension = await waitFor(
        () =>
          document.querySelector(
            "input[data-hint*='SUID_ST_NODE_COMM_DATA-TEL_EXTENS']"
          ) || findInputByLabel("Extension"),
        {
          timeout: 20000,
        }
      );
      await setInputValueRobust($extension, phoneFields.extension, { delay: 0 });

      const $fax = await waitFor(() => findInputByLabel("Fax"), {
        timeout: 20000,
      });
      await setInputValueRobust($fax, faxValue, { delay: 0 });
      await timeout();
      const $save = await waitFor(() => findButtonByContent("Save"));
      triggerEvent($save, "click");
      results.push({ sapLogin: student.sapLogin, success: true });
    } catch (err) {
      const error = String(err?.message || err);
      log("Modify failed for", student.sapLogin, error);
      results.push({ sapLogin: student.sapLogin, success: false, error });
    }
  }
  log("Batch user login update complete!");
  return results;
}
// Main batch change passwords logic
async function changeSAPPasswords(tableData, options = {}) {
  const passwordStateContains = String(options?.passwordStateContains || "").trim();
  const results = [];
  let num = 0;
  for (const student of /** @type {LoginSAPFields[]} */ (tableData)) {
    try {
      await timeout();
      log("Changing User: ", ++num, student);
      const $user = await waitForEditableUserInput();
      await setInputValueRobust($user, student.sapLogin);
      await ensureUserUnlockedIfNeeded();
      await setInputValueRobust($user, student.sapLogin);
      const $newPass = await activateChangePasswordAndWaitForInput($user);
      const passwordStateText = await getPasswordStateText(8000);
      if (!doesPasswordStateContain(passwordStateText, passwordStateContains)) {
        log(
          "Password state filter mismatch; closing dialog via X",
          student.sapLogin,
          "state:",
          passwordStateText,
          "required contains:",
          passwordStateContains
        );
        await closePasswordDialogViaX();
        results.push({
          sapLogin: student.sapLogin,
          success: false,
          skipped: true,
          error: `Password state \"${passwordStateText}\" does not contain \"${passwordStateContains}\"`,
        });
        continue;
      }
      log("Password 2/4: waiting for New Password input");
      await setInputValueRobust($newPass, student.sapPassword);
      log("Password 3/4: waiting for Repeat Password input");
      const $confirmPass = await waitFor(() => findRepeatPasswordInput(), {
        timeout: 20000,
      }
      );
      await setInputValueRobust($confirmPass, student.sapPassword);
      await timeout();
      log("Password 4/4: waiting for check/confirm action");
      const $save = await waitFor(() => findPasswordDialogConfirmButton(), {
        timeout: 20000,
      });
      log("Password check/confirm action found", $save);
      clickSapButton($save);
      // Some SAP dialogs react only to Enter on focused input/toolbar button.
      pressEnterOnElement($confirmPass);
      log("Changed password for", student.sapLogin);
      results.push({ sapLogin: student.sapLogin, success: true });
    } catch (err) {
      const error = String(err?.message || err);
      log("Password change failed for", student.sapLogin, error);
      results.push({ sapLogin: student.sapLogin, success: false, error });
    }
  }
  log("Batch change SAP passwords complete!");
  return results;
}
