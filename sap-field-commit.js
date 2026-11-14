/**
 * Page-world half of a SU01 password commit.
 * Loaded as a MAIN-world content script. The isolated content script cannot
 * see UCF_System, and script tags it inserts do not run on this WebGUI.
 * It marks the field with data-sap-commit-request; this script calls
 * InputField.prepareFireChange and writes data-sap-commit-result.
 */
(function () {
  if (window.__sapBatchCommitInstalled) return;
  window.__sapBatchCommitInstalled = true;

  function idle() {
    var ls = window.UCF_System && window.UCF_System.oLS;
    if (!ls) return true;
    var win = ls.oBrowserWindow;
    var locked = win && typeof win.bIsLocked === "function" && win.bIsLocked();
    return !ls.oPendingRequest && !locked;
  }

  function commitElement(el) {
    var ls = window.UCF_System && window.UCF_System.oLS;
    if (!ls || typeof ls.oGetControlByDomRef !== "function") return "missing-framework";
    var control = ls.oGetControlByDomRef(el);
    if (!control || typeof control.prepareFireChange !== "function") return "missing-control";
    var current = "";
    try {
      current = typeof control.sGetCurrentValue === "function"
        ? String(control.sGetCurrentValue() || "")
        : String(el.value || "");
    } catch (e) {
      current = String(el.value || "");
    }
    if (!current) return "empty";
    try {
      control.prepareFireChange();
      return "ok";
    } catch (e) {
      var msg = String(e && e.message || e);
      var stored = String(control.sValue || "");
      if (/unchanged/i.test(msg) && stored === current) return "unchanged";
      return "error";
    }
  }

  function finish(el, requestId, status) {
    var start = Date.now();
    (function waitIdle() {
      if (idle() || Date.now() - start > 4000) {
        el.setAttribute("data-sap-commit-result", requestId + ":" + status);
        return;
      }
      setTimeout(waitIdle, 50);
    })();
  }

  function drain() {
    var nodes = document.querySelectorAll("[data-sap-commit-request]");
    Array.prototype.forEach.call(nodes, function (el) {
      var requestId = el.getAttribute("data-sap-commit-request");
      if (!requestId) return;
      el.removeAttribute("data-sap-commit-request");
      finish(el, requestId, commitElement(el));
    });
  }

  document.addEventListener("sap-batch-commit-field", drain, true);
  function watch() {
    if (typeof MutationObserver !== "function" || !document.documentElement) return;
    var observer = new MutationObserver(drain);
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-sap-commit-request"],
    });
  }
  if (document.documentElement) watch();
  else document.addEventListener("DOMContentLoaded", watch);
  drain();
})();
