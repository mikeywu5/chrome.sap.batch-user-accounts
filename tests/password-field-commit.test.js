/**
 * A typed SU01 password stays pending until the WebGUI InputField Change
 * runs. Apply before that posts an empty field.
 *
 * Run: node tests/password-field-commit.test.js
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const vm = require("node:vm");
const { SAP_FIELD_COMMIT_SOURCE, commitSapInputField } = require("../domHelpers");

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

test("the page activates a settled password and waits until SAP is idle", async () => {
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
      getElementById(id) {
        return id === el.id ? el : null;
      },
    },
    setTimeout,
    Date,
  };
  vm.createContext(sandbox);
  vm.runInContext(SAP_FIELD_COMMIT_SOURCE, sandbox);

  sandbox.window.__sapBatchCommitField(el.id, "req1");
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(el.getAttribute("data-sap-commit-result"), null);
  assert.equal(fired, 1);

  state.pending = false;
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(el.getAttribute("data-sap-commit-result"), "req1:ok");
  assert.equal(control.sValue, "Ab3kM9xQ");

  control.prepareFireChange = () => {
    throw new Error("value unchanged");
  };
  sandbox.window.__sapBatchCommitField(el.id, "req2");
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(el.getAttribute("data-sap-commit-result"), "req2:unchanged");

  el.value = "";
  sandbox.window.__sapBatchCommitField(el.id, "req3");
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(el.getAttribute("data-sap-commit-result"), "req3:empty");
  assert.equal(fired, 1);
});

test("commitSapInputField resolves from the page result and rejects an empty commit", async () => {
  const el = field("M1:46:1::3:26");
  const installed = [];
  const previous = globalThis.document;
  globalThis.document = {
    documentElement: {
      attrs: {},
      getAttribute(name) {
        return this.attrs[name] || null;
      },
      setAttribute(name, value) {
        this.attrs[name] = value;
      },
      appendChild(node) {
        installed.push(node.textContent);
      },
    },
    head: {
      appendChild(node) {
        const match = /__sapBatchCommitField\("([^"]+)","([^"]+)"\)/.exec(node.textContent || "");
        if (!match) return;
        el.setAttribute("data-sap-commit-result", `${match[2]}:ok`);
      },
    },
    createElement() {
      return { textContent: "", remove() {} };
    },
  };
  try {
    assert.equal(await commitSapInputField(el), true);
    assert.match(installed[0], /prepareFireChange/);
    assert.match(installed[0], /oPendingRequest/);

    globalThis.document.head.appendChild = (node) => {
      const match = /__sapBatchCommitField\("([^"]+)","([^"]+)"\)/.exec(node.textContent || "");
      if (match) el.setAttribute("data-sap-commit-result", `${match[2]}:empty`);
    };
    assert.equal(await commitSapInputField(el), false);
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
});
