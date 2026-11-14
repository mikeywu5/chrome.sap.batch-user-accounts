/**
 * Repeat Password is typed only after New Password's typing function returns.
 * Activating the first field from inside that function stalls the dialog on
 * New Password. Activation happens later, in the page world, after both boxes
 * are filled.
 *
 * Run: node tests/password-field-commit.test.js
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { commitSapInputField } = require("../domHelpers");

const PAGE = fs.readFileSync(path.join(__dirname, "..", "sap-field-commit.js"), "utf8");
const HELPERS = fs.readFileSync(path.join(__dirname, "..", "domHelpers.js"), "utf8");
const CONTENT = fs.readFileSync(path.join(__dirname, "..", "content.js"), "utf8");

function field(id) {
  return {
    id,
    value: "",
    attrs: {},
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null;
    },
    removeAttribute(name) {
      delete this.attrs[name];
    },
  };
}

function extractFunction(src, name) {
  const start = src.indexOf(`async function ${name}(`);
  const startAlt = start >= 0 ? start : src.indexOf(`function ${name}(`);
  if (startAlt < 0) throw new Error(`missing ${name}`);
  const brace = src.indexOf("{", startAlt);
  let depth = 0;
  for (let i = brace; i < src.length; i += 1) {
    if (src[i] === "{") depth += 1;
    else if (src[i] === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(startAlt, i + 1);
    }
  }
  throw new Error(`unterminated ${name}`);
}

test("typing a password does not activate the field", () => {
  const typing = extractFunction(HELPERS, "setSapPasswordField");
  assert.doesNotMatch(typing, /commitSapInputField/);
  const once = extractFunction(CONTENT, "setStudentPasswordOnce");
  const newAt = once.indexOf("Password 2/4");
  const repeatAt = once.indexOf("Password 3/4");
  const applyAt = once.indexOf("Password 4/4");
  const commitAt = once.indexOf("commitFocusedPasswordField", applyAt);
  assert.ok(newAt > 0 && repeatAt > newAt && commitAt > repeatAt);
});

test("the page script activates a settled password and waits until SAP is idle", async () => {
  const el = field("M1:46:1::2:26");
  el.value = "Ab3kM9xQ";
  let fired = 0;
  const control = {
    sValue: "",
    sGetCurrentValue() {
      return el.value;
    },
    prepareFireChange() {
      fired += 1;
      this.sValue = this.sGetCurrentValue();
    },
  };
  const state = { pending: true };
  const listeners = [];
  const sandbox = {
    window: {
      UCF_System: {
        oLS: {
          get oPendingRequest() {
            return state.pending ? {} : null;
          },
          oBrowserWindow: { bIsLocked() { return false; } },
          oGetControlByDomRef() {
            return control;
          },
        },
      },
    },
    document: {
      documentElement: {},
      addEventListener(type, fn) {
        listeners.push({ type, fn });
      },
      querySelectorAll(selector) {
        return selector === "[data-sap-commit-request]" && el.getAttribute("data-sap-commit-request")
          ? [el]
          : [];
      },
    },
    MutationObserver: class {
      observe() {}
    },
    setTimeout,
    Date,
  };
  vm.createContext(sandbox);
  vm.runInContext(PAGE, sandbox);
  assert.equal(sandbox.window.__sapBatchCommitInstalled, true);

  el.setAttribute("data-sap-commit-request", "req1");
  listeners.find((entry) => entry.type === "sap-batch-commit-field").fn();
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(el.getAttribute("data-sap-commit-result"), null);
  assert.equal(fired, 1);
  assert.equal(el.getAttribute("data-sap-commit-request"), null);

  state.pending = false;
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(el.getAttribute("data-sap-commit-result"), "req1:ok");
  assert.equal(control.sValue, "Ab3kM9xQ");

  control.prepareFireChange = () => {
    throw new Error("value unchanged");
  };
  el.setAttribute("data-sap-commit-request", "req2");
  listeners.find((entry) => entry.type === "sap-batch-commit-field").fn();
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(el.getAttribute("data-sap-commit-result"), "req2:unchanged");

  el.value = "";
  el.setAttribute("data-sap-commit-request", "req3");
  listeners.find((entry) => entry.type === "sap-batch-commit-field").fn();
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(el.getAttribute("data-sap-commit-result"), "req3:empty");
  assert.equal(fired, 1);
});

test("commitSapInputField resolves from the page result and rejects an empty commit", async () => {
  const el = field("M1:46:1::3:26");
  const previous = globalThis.document;
  const previousEvent = globalThis.Event;
  globalThis.Event = class Event {
    constructor(type) {
      this.type = type;
    }
  };
  globalThis.document = {
    getElementById(id) {
      return id === el.id ? el : null;
    },
    dispatchEvent() {
      const requestId = el.getAttribute("data-sap-commit-request");
      el.removeAttribute("data-sap-commit-request");
      el.setAttribute("data-sap-commit-result", `${requestId}:ok`);
    },
  };
  try {
    assert.equal(await commitSapInputField(el), true);
    assert.equal(el.getAttribute("data-sap-commit-result"), null);

    globalThis.document.dispatchEvent = () => {
      const requestId = el.getAttribute("data-sap-commit-request");
      el.removeAttribute("data-sap-commit-request");
      el.setAttribute("data-sap-commit-result", `${requestId}:empty`);
    };
    assert.equal(await commitSapInputField(el), false);
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
    if (previousEvent === undefined) delete globalThis.Event;
    else globalThis.Event = previousEvent;
  }
});
