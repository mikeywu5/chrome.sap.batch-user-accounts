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

test("a reset is not success until the dialog is reopened and re-read", () => {
  const fn = extractFunction("changeSAPPasswords");
  assert.match(fn, /Password was not validated/);
  assert.match(fn, /Override production password/);
  assert.match(fn, /validated:\s*true/);
  assert.match(fn, /humanPause\(\)/);
  const successAt = fn.indexOf("validated: true");
  const reopenAt = fn.lastIndexOf("getPasswordStateText", successAt);
  assert.ok(reopenAt > 0, "the success flag must follow a status re-read");
  assert.ok(
    fn.indexOf("passwordStatusIsInitial") < successAt,
    "success must be gated on the initial-status check"
  );
});
