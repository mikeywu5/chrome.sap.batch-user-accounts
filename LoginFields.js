// LoginFields.js
// Defines LoginFields and LoginFieldValue for SAP batch user management

import { LoginField } from "./LoginField";

export class LoginFieldValue {
  name;
  pattern;
  afterCallback;
  type;
  constructor(name, pattern, type = "text", afterCallback = null) {
    this.name = name; // Human-readable name
    this.pattern = pattern; // Regex pattern
    this.type = type; // Logical field type for UI/validation
    this.afterCallback = afterCallback; // Optional callback after setting value
  }
}

export class LoginFields extends LoginField {
  constructor() {
    super();
    const self = this;
    this.firstName = new LoginFieldValue(
      "First Name",
      /(?:first.*name|\bfirst\b|^f(?:irst)?\b)/i
    );
    this.lastName = new LoginFieldValue(
      "Last Name",
      /(?:last.*name|\blast\b|^l(?:ast)?\b)/i
    );
    this.student = new LoginFieldValue(
      "Student",
      /^\s*(?:student|learner|user|name)\s*$/i,
      false,
      function (srcRow, rowCols) {
        const o = self.getObject(srcRow, rowCols, "student");
        const obj = self.parseName(o.student);
        return obj;
      }
    );
    this.studentEmail = new LoginFieldValue(
      "Student Email",
      /(sis.*login.*id|(?:student|learner|user).*email|\bemail\b)/i,
      "email"
    );
    this.studentId = new LoginFieldValue(
      "Student ID",
      /(student.*id|integration.*id|student.*num|^sid$)/i
    );
    this.section = new LoginFieldValue("Section", /section/i);
    this.instructor = new LoginFieldValue(
      "Instructor",
      /(?:instructor|teacher|professor|faculty).*(?!.*email)/i
    );
    this.instructorEmail = new LoginFieldValue(
      "Instructor Email",
      /instructor.*email|teacher.*email|professor.*email|faculty.*email/i,
      "email"
    );
    this.sapLogin = new LoginFieldValue("SAP Login", /sap.*login/i);
    this.sapPassword = new LoginFieldValue(
      "SAP Password",
      /pass(?:word)?/i,
      "password"
    );
    this.created = new LoginFieldValue(
      "Created",
      /created|modified|altered|date/i,
      "date"
    );
  }
  parseName(nameVal) {
    const raw = String(nameVal ?? "").trim();
    if (!raw) return { firstName: "", lastName: "" };
    const partsByComma = raw.split(/\s*,\s*/).filter(Boolean);
    if (partsByComma.length >= 2) {
      // Last is the first element; first is the remaining joined
      const lastName = partsByComma[0];
      const firstName = partsByComma.slice(1).join(" ");
      return { firstName, lastName };
    }
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const lastName = parts.pop();
      const firstName = parts.join(" ");
      return { firstName, lastName };
    }
    return { firstName: raw, lastName: "" };
  }

  getObject(row, rowCols, ...keys) {
    if (!keys || keys.length === 0) {
      keys = this.headers;
    }
    const rowObj = {};
    if (typeof row == "object" && row) {
      if (
        typeof row[Symbol.iterator] === "function" &&
        typeof rowCols == "object" &&
        rowCols
      ) {
        for (const key of keys) {
          if (rowCols[key] !== undefined) {
            rowObj[key] = row[rowCols[key]] ?? "";
          }
        }
      } else {
        for (const key of keys) {
          if (row.hasOwnProperty(key)) {
            rowObj[key] = row[key];
          }
        }
      }
    }
    return rowObj;
  }

  #headers;
  get headers() {
    if (!this.#headers) {
      const self = this;
      this.#headers = Object.keys(self).filter((key) => self[key]?.type);
    }
    return this.#headers;
  }
}
