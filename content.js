console.log("Batch User Accounts content script loaded.");
const {
  findInputByLabel,
  waitFor,
  waitForElement,
  findButtonByContent,
  triggerEvent,
  typeValue,
  timeout,
} = require("./domHelpers");
// Debug: confirm content script is running
window.addEventListener("DOMContentLoaded", () => {
  console.log("[BatchUser] DOMContentLoaded in content script");
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[BatchUser] Received message:", message);
  if (message.type === "MODIFY_SAP_USERS" && Array.isArray(message.data)) {
    console.log("[BatchUser] Calling modifySAPUsers with data:", message.data);
    modifySAPUsers(message.data);
  } else if (
    message.type === "CHANGE_SAP_PASSWORDS" &&
    Array.isArray(message.data)
  ) {
    console.log(
      "[BatchUser] Calling changeSAPPasswords with data:",
      message.data
    );
    changeSAPPasswords(message.data);
  }
});

// Main batch edit logic
async function modifySAPUsers(tableData) {
  let num = 0;
  for (const student of /** @type {LoginSAPFields[]} */ (tableData)) {
    await timeout();
    console.log("Modding User: ", ++num, student);
    const $user = await waitFor(() => {
      const $user = findInputByLabel("User");
      return $user.disabled ? null : $user;
    });
    await typeValue($user, student.sapLogin);
    const $change = await waitFor(() => findButtonByContent("Change"));
    console.log("Change", $change);
    await timeout();
    triggerEvent($change, "click");
    const $email = await waitFor(() => findInputByLabel("E-Mail"));
    typeValue($email, student.studentEmail, 0);
    //$email.setAttribute("value", student.studentEmail);
    await timeout();
    const $save = await waitFor(() => findButtonByContent("Save"));
    triggerEvent($save, "click");
  }
  console.log("Batch user login update complete!");
}
// Main batch change passwords logic
async function changeSAPPasswords(tableData) {
  let num = 0;
  for (const student of /** @type {LoginSAPFields[]} */ (tableData)) {
    await timeout();
    console.log("Changing User: ", ++num, student);
    const $user = await waitFor(() => {
      const $user = findInputByLabel("User");
      return $user.disabled ? null : $user;
    });
    await typeValue($user, student.sapLogin);
    const $change = await waitFor(() => findButtonByContent("Change Password"));
    triggerEvent($change, "click");
    await timeout();
    const $newPass = await waitFor(() => findInputByLabel("New Password"));
    await typeValue($newPass, student.sapPassword);
    const $confirmPass = await waitFor(() =>
      findInputByLabel("Repeat Password")
    );
    await typeValue($confirmPass, student.sapPassword);
    await timeout();
    const $save = await waitFor(() => findButtonByContent("Apply"));
    triggerEvent($save, "click");
    console.log("Changed password for", student.sapLogin);
  }
  console.log("Batch change SAP passwords complete!");
}
