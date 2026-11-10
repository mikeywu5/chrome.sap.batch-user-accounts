/**
 * A reset counts only after SU01 is re-read and still says Initial.
 * Run: node tests/password-reset-validate.test.js
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const SRC = fs.readFileSync(path.join(__dirname, "..", "content.js"), "utf8");

function extractFunction(name) {
  const start = SRC.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`missing function ${name}`);
  const openParen = SRC.indexOf("(", start);
  let depth = 0;
  let parenEnd = -1;
  for (let i = openParen; i < SRC.length; i++) {
    if (SRC[i] === "(") depth += 1;
    else if (SRC[i] === ")") {
      depth -= 1;
      if (depth === 0) {
        parenEnd = i;
        break;
      }
    }
  }
  const brace = SRC.indexOf("{", parenEnd);
  depth = 0;
  for (let i = brace; i < SRC.length; i++) {
    if (SRC[i] === "{") depth += 1;
    else if (SRC[i] === "}") {
      depth -= 1;
      if (depth === 0) return SRC.slice(start, i + 1);
    }
  }
  throw new Error(`unterminated function ${name}`);
}

const passwordStatusIsInitial = new Function(
  `${extractFunction("passwordStatusIsInitial")}; return passwordStatusIsInitial;`
)();

test("initial status is the only state that counts as validated", () => {
  assert.equal(
    passwordStatusIsInitial("Initial Password (Set by Administrator)"),
    true
  );
  assert.equal(passwordStatusIsInitial("Production Password"), false);
  assert.equal(passwordStatusIsInitial("Password Status"), false);
});

test("a reset is not success until the status bar confirms, and a miss is retried", () => {
  const fn = extractFunction("changeSAPPasswords");
  const once = extractFunction("setStudentPasswordOnce");
  assert.match(fn, /Password was not confirmed after retries/);
  assert.match(fn, /Password set was not confirmed; retrying/);
  assert.match(once, /Override production password/);
  assert.match(once, /statusBarConfirmed:\s*true/);
  assert.match(once, /beginStatusBarWatch\(\)/);
  assert.match(once, /setSapPasswordField/);
  assert.match(once, /did not receive the full password/);
  assert.match(once, /clicking the check without Enter/);
  assert.match(once, /commitFocusedPasswordField\(\)/);
  assert.match(once, /closing the dialog/);
  assert.match(once, /The passwords specified must be identical/);
  assert.doesNotMatch(once, /pressEnterOnElement/);
  const confirmAt = once.indexOf("const confirmPassword");
  const blurAt = once.indexOf("commitFocusedPasswordField", confirmAt);
  const clickAt = once.indexOf("clickSapButton", confirmAt);
  assert.ok(blurAt > confirmAt && blurAt < clickAt, "Repeat must blur before Apply");
  const commit = extractFunction("commitFocusedPasswordField");
  assert.match(commit, /blurring the focused field so WebGUI posts it/);
  assert.match(commit, /\.blur\(\)/);
  assert.doesNotMatch(commit, /Tab|pressEnterOnElement|key:\s*"Enter"/);
  assert.match(fn, /humanPause\(\)/);
  const successAt = once.indexOf("statusBarConfirmed: true");
  assert.ok(
    once.indexOf("pollPasswordSetConfirmation") < successAt,
    "success must follow the status-bar read"
  );
});
