// Open the side panel when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (chrome.sidePanel) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});
chrome.runtime.onInstalled.addListener(() => {
  console.log("Batch User Accounts extension installed.");
});
