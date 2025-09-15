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
chrome.storage?.local?.get(["enableLogging"], (res) => {
  enableLogging = !!res?.enableLogging;
});
function log(...args) {
  if (enableLogging) console.log("[BatchUser][content]", ...args);
}
// Debug: confirm content script is running
window.addEventListener("DOMContentLoaded", () => {
  console.log("[BatchUser] DOMContentLoaded in content script");
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log("Received message:", message);
  if (message.type === "MODIFY_SAP_USERS" && Array.isArray(message.data)) {
  log("Calling modifySAPUsers with data:", message.data);
    modifySAPUsers(message.data);
  } else if (
    message.type === "CHANGE_SAP_PASSWORDS" &&
    Array.isArray(message.data)
  ) {
    log("Calling changeSAPPasswords with data:", message.data);
    changeSAPPasswords(message.data);
  }
});

// Main batch edit logic
async function modifySAPUsers(tableData) {
  let num = 0;
  for (const student of /** @type {LoginSAPFields[]} */ (tableData)) {
    await timeout();
  log("Modding User: ", ++num, student);
    const $user = await waitFor(() => {
      const $user = findInputByLabel("User");
      return $user.disabled ? null : $user;
    });
  await setInputValueRobust($user, student.sapLogin);
    const $change = await waitFor(() => findButtonByContent("Change"));
  log("Change", $change);
    await timeout();
    triggerEvent($change, "click");
    const $email = await waitFor(() => findInputByLabel("E-Mail"));
  await setInputValueRobust($email, student.studentEmail, { delay: 0 });
    //$email.setAttribute("value", student.studentEmail);
    await timeout();
    const $save = await waitFor(() => findButtonByContent("Save"));
    triggerEvent($save, "click");
  }
  log("Batch user login update complete!");
}
// Main batch change passwords logic
async function changeSAPPasswords(tableData) {
  let num = 0;
  for (const student of /** @type {LoginSAPFields[]} */ (tableData)) {
    await timeout();
  log("Changing User: ", ++num, student);
    const $user = await waitFor(() => {
      const $user = findInputByLabel("User");
      return $user.disabled ? null : $user;
    });
  await setInputValueRobust($user, student.sapLogin);
    const $change = await waitFor(() => findButtonByContent("Change Password"));
    triggerEvent($change, "click");
    await timeout();
    const $newPass = await waitFor(() => findInputByLabel("New Password"));
  await setInputValueRobust($newPass, student.sapPassword);
    const $confirmPass = await waitFor(() =>
      findInputByLabel("Repeat Password")
    );
  await setInputValueRobust($confirmPass, student.sapPassword);
    await timeout();
    const $save = await waitFor(() => findButtonByContent("Apply"));
    triggerEvent($save, "click");
  log("Changed password for", student.sapLogin);
  }
  log("Batch change SAP passwords complete!");
}
