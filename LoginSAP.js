// LoginSAP.js
// Defines LoginSAP and LoginSAPFields for SAP batch user management
import { findInputByLabel, waitForElement } from "./domHelpers";
import { LoginField } from "./LoginField";
import { LoginFieldValue } from "./LoginFields";

export class LoginSAPFields extends LoginField {
  constructor() {
    super();
  }

  get student() {
    return `${this.firstName?.trim() ?? ""} ${this.lastName?.trim() ?? ""}`;
  }
  isValid() {
    return (
      this.firstName &&
      this.lastName &&
      this.studentEmail &&
      this.sapLogin &&
      this.sapPassword
     );
   }
}
/** @type {Array<LoginSAPFields>} */
export class LoginSAP {
  /** @type {LoginSAPFields[]} */
  rows;
  constructor(tableData) {
    this.rows = tableData.map((rowArr) => {
      const fields = new LoginSAPFields();
      fields.headers.forEach((field, idx) => {
        fields[field] = rowArr[idx];
      });
      return fields;
    });
  }
  // Iterator for LoginSAPFields instances (one per row)
  [Symbol.iterator]() {
    let i = 0;
    const rows = this.rows;
    return {
      next: () => {
        if (i < rows.length) {
          return { value: rows[i++], done: false };
        } else {
          return { done: true };
        }
      },
    };
  }

  modifySAPUsers() {
    for (const row of this) {
      if (row.isValid()) {
        const $user = waitFor(() => findInputByLabel("User"));
        $user.value = row.sapLogin;
      }
      break;
    }
  }
}
