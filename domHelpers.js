/**
 * Simulate keyboard typing into an input/textarea element by setting its value character by character.
 * Dispatches input and change events to mimic real typing.
 * @param {HTMLInputElement|HTMLTextAreaElement} el - The input or textarea element
 * @param {string} value - The value to type
 * @param {number} [delay=30] - Delay in ms between keystrokes
 */
export async function typeValue(el, value, delay = 30) {
  if (!el) return;
  el.focus();
  let inputvalue = "";
  if (!delay || delay < 0) delay = 0;
  if (delay) {
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      const keyCode = char.charCodeAt(0);
      const eventInit = {
        key: char,
        code: `Key${char.toUpperCase()}`,
        charCode: keyCode,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
      };
      // SAP and enterprise apps may require these events:
      el.dispatchEvent(
        new InputEvent("beforeinput", {
          data: char,
          inputType: "insertText",
          bubbles: true,
          cancelable: true,
        })
      );
      el.dispatchEvent(new CompositionEvent("compositionstart", { data: "" }));
      el.dispatchEvent(new KeyboardEvent("keydown", eventInit));
      el.dispatchEvent(new KeyboardEvent("keypress", eventInit));
      el.dispatchEvent(
        new CompositionEvent("compositionupdate", { data: char })
      );
      inputvalue += char;
      el.value = inputvalue;
      el.dispatchEvent(
        new InputEvent("input", {
          data: char,
          inputType: "insertText",
          bubbles: true,
        })
      );
      el.dispatchEvent(new KeyboardEvent("keyup", eventInit));
      el.dispatchEvent(new CompositionEvent("compositionend", { data: char }));
      await timeout(delay);
    }
  } else {
    el.value = value;
    el.dispatchEvent(
      new InputEvent("input", {
        data: value,
        inputType: "insertText",
        bubbles: true,
      })
    );
  }
  el.dispatchEvent(new Event("blur", { bubbles: true }));
  el.dispatchEvent(new Event("focusout", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}
/**
 * Dispatch an event of the given type on the root element and all its descendants.
 * @param {Element} root - The root element to start from
 * @param {string} eventType - The event type to dispatch (e.g., 'input', 'change')
 * @param {Object} [eventInit] - Optional event initialization object
 */
export function triggerEvent(root, eventType, eventInit = {}) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  const event = new Event(eventType, {
    bubbles: true,
    cancelable: true,
    ...eventInit,
  });
  root.dispatchEvent(event);
  if (eventInit.deep) {
    for (const el of root.querySelectorAll("*")) {
      el.dispatchEvent(event);
    }
  }
}
/**
 * Await a timeout for a given number of milliseconds.
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>} Resolves after the delay
 */
export async function timeout(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * DOM helper utilities.
 */

/**
 * Find an input/select/textarea element associated with a label under a given root.
 * Matching strategy:
 *  1) Match labels under the root by text (case-insensitive substring) or RegExp.
 *  2) For a matched label, try in order:
 *     - label.control (native association)
 *     - label.htmlFor -> element with matching id
 *     - <input|select|textarea> descendant of the label
 *     - Walk forward siblings from the label; for each sibling, search within for input
 *     - If not found, ascend to parent and repeat forward-sibling search
 *  3) Stop when an input is found or when we reach beyond the provided root.
 *
 * @param {ParentNode|Element} root - The container to search within (e.g., a form or section)
 * @param {string|RegExp} labelTextOrPattern - Label text to match (case-insensitive substring) or a RegExp
 * @returns {HTMLElement|null} - The found input/select/textarea element, or null if none
 */
export function findInputByLabel(labelTextOrPattern, root, level = 3) {
  if (!root) {
    root = document.body;
  }
  if (typeof root.querySelectorAll !== "function") return null;

  const INPUT_SELECTOR = "input, select, textarea";
  const matches = createTextMatcher(labelTextOrPattern);

  const labels = root.querySelectorAll("label");

  for (const label of labels) {
    const labelText = getElementText(label);
    if (!matches(labelText)) continue;

    // 1) Direct association via HTMLLabelElement.control
    if (label.control && isInputLike(label.control)) return label.control;

    // 2) For attribute -> element with id
    const forId = label.getAttribute("for");
    if (forId) {
      const ctrl =
        root.querySelector(`#${cssEscape(forId)}`) ||
        (root.ownerDocument && root.ownerDocument.getElementById(forId));
      if (ctrl && isInputLike(ctrl)) return ctrl;
    }

    // 3) Input nested inside the label
    const nested = label.querySelector(INPUT_SELECTOR);
    if (nested) return nested;
    let depth = 0;
    // 4) Walk forward siblings at the current level
    // 5) Ascend and search forward siblings at each ancestor level until reaching root
    let node = label;
    do {
      const foundInSiblings = findInNextSiblings(node, INPUT_SELECTOR);
      if (foundInSiblings) return foundInSiblings;
      node = node.parentElement;
    } while (node && node !== root && depth++ < level);
  }
  return null;
}

function isInputLike(el) {
  if (!el || el.nodeType !== 1) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "select" || tag === "textarea";
}

function findInNextSiblings(startEl, selector) {
  for (
    let sib = startEl.nextElementSibling;
    sib;
    sib = sib.nextElementSibling
  ) {
    if (sib.matches && sib.matches(selector)) return sib;
    const found = sib.querySelector ? sib.querySelector(selector) : null;
    if (found) return found;
  }
  return null;
}

// CSS.escape polyfill-ish (minimal) if not available
function cssEscape(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return String(value).replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
}

/**
 * Create a case-insensitive substring matcher for strings or a direct RegExp matcher.
 * @param {string|RegExp} needle
 * @returns {(text: string) => boolean}
 */
function createTextMatcher(needle) {
  const isRegExp = needle instanceof RegExp;
  if (isRegExp) {
    const re = /** @type {RegExp} */ (needle);
    return (text) => re.test(String(text ?? ""));
  }
  const norm = String(needle ?? "")
    .trim()
    .toLowerCase();
  return (text) =>
    String(text ?? "")
      .trim()
      .toLowerCase()
      .includes(norm);
}

/**
 * Safely get an element's text for matching purposes.
 * @param {Element} el
 */
function getElementText(el) {
  if (!el) return "";
  const txt = el.textContent ?? "";
  return String(txt).trim();
}

/**
 * Find a button-like element under root whose id contains "::btn" and whose text matches the given name/pattern.
 * @param {ParentNode|Element} root
 * @param {string|RegExp} nameOrPattern
 * @returns {HTMLElement|null}
 */
export function queryByContent(querySelector, nameOrPattern, root) {
  if (!root) {
    root = document.body;
  }
  if (!root || typeof root.querySelectorAll !== "function") return null;
  const matches = createTextMatcher(nameOrPattern);
  const candidates = root.querySelectorAll(querySelector);

  for (const el of candidates) {
    const text = getElementText(el);
    if (matches(text)) return /** @type {HTMLElement} */ (el);
  }
  return null;
}

export function findButtonByContent(nameOrPattern, root) {
  return queryByContent('[role="button"]', nameOrPattern, root);
}

/**
 * Wait for an element matching a selector to be present under a root.
 * Uses a combination of immediate check, DOMContentLoaded, MutationObserver,
 * and a polling fallback with an overall timeout.
 *
 * @param {string} selector - CSS selector to query with querySelector
 * @param {Object} [options]
 * @param {ParentNode|Element|Document} [options.root=document] - Root to search within
 * @param {number} [options.timeout=10000] - Max time to wait in ms
 * @param {number} [options.interval=150] - Polling interval in ms (used as a fallback)
 * @param {boolean} [options.throwOnTimeout=true] - Reject on timeout/abort when true; resolve null when false
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to cancel the wait
 * @returns {Promise<HTMLElement|null>} Resolves when found; rejects on timeout/abort if throwOnTimeout=true
 */
export async function waitForElement(selector, options = {}) {
  const {
    root = document,
    timeout = 10000,
    interval = 150,
    throwOnTimeout = true,
    signal,
  } = options;

  if (!root || typeof root.querySelector !== "function") {
    return null;
  }

  // Fast path
  let current = root.querySelector(selector);
  if (current) return /** @type {HTMLElement} */ (current);

  let done = false;
  let timeoutId = null;
  let pollId = null;
  let observer = null;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      done = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (pollId) clearInterval(pollId);
      if (observer) observer.disconnect();
      if (signal) signal.removeEventListener("abort", onAbort);
      document.removeEventListener("DOMContentLoaded", onDomReady);
    };

    const finishSuccess = (el) => {
      if (done) return;
      cleanup();
      resolve(el);
    };

    const finishTimeout = () => {
      if (done) return;
      cleanup();
      if (throwOnTimeout) {
        const err = new Error(
          `waitForElement: timed out after ${timeout}ms for selector "${selector}"`
        );
        err.name = "TimeoutError";
        reject(err);
      } else {
        resolve(null);
      }
    };

    const onAbort = () => {
      if (done) return;
      cleanup();
      if (throwOnTimeout) {
        const err = new Error("waitForElement: aborted");
        err.name = "AbortError";
        reject(err);
      } else {
        resolve(null);
      }
    };

    const check = () => {
      if (done) return;
      const el = root.querySelector(selector);
      if (el) finishSuccess(/** @type {HTMLElement} */ (el));
    };

    const onDomReady = () => {
      // Another check once DOM is interactive/complete
      check();
    };

    // Set up timeout
    if (Number.isFinite(timeout) && timeout > 0) {
      timeoutId = setTimeout(finishTimeout, timeout);
    }

    // Observe DOM mutations under the root
    try {
      observer = new MutationObserver(() => check());
      // Observe broad changes; subtree true to catch deep insertions
      observer.observe(/** @type {Node} */ (root), {
        childList: true,
        subtree: true,
      });
    } catch (_e) {
      // Fallback only; if observe fails (rare), polling should still handle it
    }

    // Polling fallback
    pollId = setInterval(check, interval);

    // DOMContentLoaded hook (if still loading)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onDomReady, { once: true });
    }

    // Abort support
    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }

    // Initial tick
    check();
  });
}

/**
 * Repeatedly invoke a callback until it returns a truthy value or times out.
 * - The callback may be sync or async; its resolved value is checked for truthiness.
 * - On success, resolves with the truthy value and clears the polling interval/timeout.
 * - On timeout, rejects with a TimeoutError.
 *
 * @template T
 * @param {() => (T | Promise<T>)} callback - Function to evaluate; truthy result ends polling
 * @param {number} [pollingMs=1000] - Interval between polls in ms
 * @param {number} [timeoutMs=10000] - Maximum wait time in ms
 * @returns {Promise<T>} Truthy result from the callback; rejects on timeout
 */
export async function waitFor(callback, options = {}) {
  const { interval = 150, timeout = 10000 } = options;
  return new Promise((resolve, reject) => {
    let intervalId = null;
    let timeoutId = null;

    const clear = () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      intervalId = null;
      timeoutId = null;
    };

    const tick = async () => {
      try {
        const val = await callback();
        if (val) {
          clear();
          resolve(val);
        }
      } catch (_) {
        // Ignore errors and keep polling
      }
    };

    // Schedule timeout
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        clear();
        const err = new Error(`waitFor: timed out after ${timeout}ms`);
        err.name = "TimeoutError";
        reject(err);
      }, timeout);
    }

    // Start polling (immediate tick + interval)
    if (interval > 0) {
      intervalId = setInterval(tick, interval);
    }
    // Run an immediate check so we don't always wait for the first interval
    tick();
  });
}
