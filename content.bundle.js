/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./domHelpers.js":
/*!***********************!*\
  !*** ./domHelpers.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   findButtonByContent: () => (/* binding */ findButtonByContent),
/* harmony export */   findInputByLabel: () => (/* binding */ findInputByLabel),
/* harmony export */   queryByContent: () => (/* binding */ queryByContent),
/* harmony export */   timeout: () => (/* binding */ timeout),
/* harmony export */   triggerEvent: () => (/* binding */ triggerEvent),
/* harmony export */   typeValue: () => (/* binding */ typeValue),
/* harmony export */   waitFor: () => (/* binding */ waitFor),
/* harmony export */   waitForElement: () => (/* binding */ waitForElement)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * Simulate keyboard typing into an input/textarea element by setting its value character by character.
 * Dispatches input and change events to mimic real typing.
 * @param {HTMLInputElement|HTMLTextAreaElement} el - The input or textarea element
 * @param {string} value - The value to type
 * @param {number} [delay=30] - Delay in ms between keystrokes
 */
function typeValue(_x, _x2) {
  return _typeValue.apply(this, arguments);
}
/**
 * Dispatch an event of the given type on the root element and all its descendants.
 * @param {Element} root - The root element to start from
 * @param {string} eventType - The event type to dispatch (e.g., 'input', 'change')
 * @param {Object} [eventInit] - Optional event initialization object
 */
function _typeValue() {
  _typeValue = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(el, value) {
    var delay,
      inputvalue,
      i,
      _char,
      keyCode,
      eventInit,
      _args = arguments;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          delay = _args.length > 2 && _args[2] !== undefined ? _args[2] : 30;
          if (el) {
            _context.n = 1;
            break;
          }
          return _context.a(2);
        case 1:
          el.focus();
          inputvalue = "";
          if (!delay || delay < 0) delay = 0;
          if (!delay) {
            _context.n = 5;
            break;
          }
          i = 0;
        case 2:
          if (!(i < value.length)) {
            _context.n = 4;
            break;
          }
          _char = value[i];
          keyCode = _char.charCodeAt(0);
          eventInit = {
            key: _char,
            code: "Key".concat(_char.toUpperCase()),
            charCode: keyCode,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
          }; // SAP and enterprise apps may require these events:
          el.dispatchEvent(new InputEvent("beforeinput", {
            data: _char,
            inputType: "insertText",
            bubbles: true,
            cancelable: true
          }));
          el.dispatchEvent(new CompositionEvent("compositionstart", {
            data: ""
          }));
          el.dispatchEvent(new KeyboardEvent("keydown", eventInit));
          el.dispatchEvent(new KeyboardEvent("keypress", eventInit));
          el.dispatchEvent(new CompositionEvent("compositionupdate", {
            data: _char
          }));
          inputvalue += _char;
          el.value = inputvalue;
          el.dispatchEvent(new InputEvent("input", {
            data: _char,
            inputType: "insertText",
            bubbles: true
          }));
          el.dispatchEvent(new KeyboardEvent("keyup", eventInit));
          el.dispatchEvent(new CompositionEvent("compositionend", {
            data: _char
          }));
          _context.n = 3;
          return timeout(delay);
        case 3:
          i++;
          _context.n = 2;
          break;
        case 4:
          _context.n = 6;
          break;
        case 5:
          el.value = value;
          el.dispatchEvent(new InputEvent("input", {
            data: value,
            inputType: "insertText",
            bubbles: true
          }));
        case 6:
          el.dispatchEvent(new Event("blur", {
            bubbles: true
          }));
          el.dispatchEvent(new Event("focusout", {
            bubbles: true
          }));
          el.dispatchEvent(new Event("change", {
            bubbles: true
          }));
        case 7:
          return _context.a(2);
      }
    }, _callee);
  }));
  return _typeValue.apply(this, arguments);
}
function triggerEvent(root, eventType) {
  var eventInit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (!root || typeof root.querySelectorAll !== "function") return;
  var event = new Event(eventType, _objectSpread({
    bubbles: true,
    cancelable: true
  }, eventInit));
  root.dispatchEvent(event);
  if (eventInit.deep) {
    var _iterator = _createForOfIteratorHelper(root.querySelectorAll("*")),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var el = _step.value;
        el.dispatchEvent(event);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
}
/**
 * Await a timeout for a given number of milliseconds.
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>} Resolves after the delay
 */
function timeout() {
  return _timeout.apply(this, arguments);
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
function _timeout() {
  _timeout = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var ms,
      _args2 = arguments;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          ms = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 1000;
          return _context2.a(2, new Promise(function (resolve) {
            return setTimeout(resolve, ms);
          }));
      }
    }, _callee2);
  }));
  return _timeout.apply(this, arguments);
}
function findInputByLabel(labelTextOrPattern, root) {
  var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
  if (!root) {
    root = document.body;
  }
  if (typeof root.querySelectorAll !== "function") return null;
  var INPUT_SELECTOR = "input, select, textarea";
  var matches = createTextMatcher(labelTextOrPattern);
  var labels = root.querySelectorAll("label");
  var _iterator2 = _createForOfIteratorHelper(labels),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var label = _step2.value;
      var labelText = getElementText(label);
      if (!matches(labelText)) continue;

      // 1) Direct association via HTMLLabelElement.control
      if (label.control && isInputLike(label.control)) return label.control;

      // 2) For attribute -> element with id
      var forId = label.getAttribute("for");
      if (forId) {
        var ctrl = root.querySelector("#".concat(cssEscape(forId))) || root.ownerDocument && root.ownerDocument.getElementById(forId);
        if (ctrl && isInputLike(ctrl)) return ctrl;
      }

      // 3) Input nested inside the label
      var nested = label.querySelector(INPUT_SELECTOR);
      if (nested) return nested;
      var depth = 0;
      // 4) Walk forward siblings at the current level
      // 5) Ascend and search forward siblings at each ancestor level until reaching root
      var node = label;
      do {
        var foundInSiblings = findInNextSiblings(node, INPUT_SELECTOR);
        if (foundInSiblings) return foundInSiblings;
        node = node.parentElement;
      } while (node && node !== root && depth++ < level);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return null;
}
function isInputLike(el) {
  var _el$tagName;
  if (!el || el.nodeType !== 1) return false;
  var tag = (_el$tagName = el.tagName) === null || _el$tagName === void 0 ? void 0 : _el$tagName.toLowerCase();
  return tag === "input" || tag === "select" || tag === "textarea";
}
function findInNextSiblings(startEl, selector) {
  for (var sib = startEl.nextElementSibling; sib; sib = sib.nextElementSibling) {
    if (sib.matches && sib.matches(selector)) return sib;
    var found = sib.querySelector ? sib.querySelector(selector) : null;
    if (found) return found;
  }
  return null;
}

// CSS.escape polyfill-ish (minimal) if not available
function cssEscape(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return String(value).replace(/[^a-zA-Z0-9_-]/g, function (ch) {
    return "\\".concat(ch);
  });
}

/**
 * Create a case-insensitive substring matcher for strings or a direct RegExp matcher.
 * @param {string|RegExp} needle
 * @returns {(text: string) => boolean}
 */
function createTextMatcher(needle) {
  var isRegExp = needle instanceof RegExp;
  if (isRegExp) {
    var re = /** @type {RegExp} */needle;
    return function (text) {
      return re.test(String(text !== null && text !== void 0 ? text : ""));
    };
  }
  var norm = String(needle !== null && needle !== void 0 ? needle : "").trim().toLowerCase();
  return function (text) {
    return String(text !== null && text !== void 0 ? text : "").trim().toLowerCase().includes(norm);
  };
}

/**
 * Safely get an element's text for matching purposes.
 * @param {Element} el
 */
function getElementText(el) {
  var _el$textContent;
  if (!el) return "";
  var txt = (_el$textContent = el.textContent) !== null && _el$textContent !== void 0 ? _el$textContent : "";
  return String(txt).trim();
}

/**
 * Find a button-like element under root whose id contains "::btn" and whose text matches the given name/pattern.
 * @param {ParentNode|Element} root
 * @param {string|RegExp} nameOrPattern
 * @returns {HTMLElement|null}
 */
function queryByContent(querySelector, nameOrPattern, root) {
  if (!root) {
    root = document.body;
  }
  if (!root || typeof root.querySelectorAll !== "function") return null;
  var matches = createTextMatcher(nameOrPattern);
  var candidates = root.querySelectorAll(querySelector);
  var _iterator3 = _createForOfIteratorHelper(candidates),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var el = _step3.value;
      var text = getElementText(el);
      if (matches(text)) return /** @type {HTMLElement} */el;
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  return null;
}
function findButtonByContent(nameOrPattern, root) {
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
function waitForElement(_x3) {
  return _waitForElement.apply(this, arguments);
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
function _waitForElement() {
  _waitForElement = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(selector) {
    var options,
      _options$root,
      root,
      _options$timeout,
      timeout,
      _options$interval,
      interval,
      _options$throwOnTimeo,
      throwOnTimeout,
      signal,
      current,
      done,
      timeoutId,
      pollId,
      observer,
      _args3 = arguments;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          options = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {};
          _options$root = options.root, root = _options$root === void 0 ? document : _options$root, _options$timeout = options.timeout, timeout = _options$timeout === void 0 ? 10000 : _options$timeout, _options$interval = options.interval, interval = _options$interval === void 0 ? 150 : _options$interval, _options$throwOnTimeo = options.throwOnTimeout, throwOnTimeout = _options$throwOnTimeo === void 0 ? true : _options$throwOnTimeo, signal = options.signal;
          if (!(!root || typeof root.querySelector !== "function")) {
            _context3.n = 1;
            break;
          }
          return _context3.a(2, null);
        case 1:
          // Fast path
          current = root.querySelector(selector);
          if (!current) {
            _context3.n = 2;
            break;
          }
          return _context3.a(2, /** @type {HTMLElement} */current);
        case 2:
          done = false;
          timeoutId = null;
          pollId = null;
          observer = null;
          return _context3.a(2, new Promise(function (resolve, reject) {
            var cleanup = function cleanup() {
              done = true;
              if (timeoutId) clearTimeout(timeoutId);
              if (pollId) clearInterval(pollId);
              if (observer) observer.disconnect();
              if (signal) signal.removeEventListener("abort", onAbort);
              document.removeEventListener("DOMContentLoaded", onDomReady);
            };
            var finishSuccess = function finishSuccess(el) {
              if (done) return;
              cleanup();
              resolve(el);
            };
            var finishTimeout = function finishTimeout() {
              if (done) return;
              cleanup();
              if (throwOnTimeout) {
                var err = new Error("waitForElement: timed out after ".concat(timeout, "ms for selector \"").concat(selector, "\""));
                err.name = "TimeoutError";
                reject(err);
              } else {
                resolve(null);
              }
            };
            var onAbort = function onAbort() {
              if (done) return;
              cleanup();
              if (throwOnTimeout) {
                var err = new Error("waitForElement: aborted");
                err.name = "AbortError";
                reject(err);
              } else {
                resolve(null);
              }
            };
            var check = function check() {
              if (done) return;
              var el = root.querySelector(selector);
              if (el) finishSuccess(/** @type {HTMLElement} */el);
            };
            var onDomReady = function onDomReady() {
              // Another check once DOM is interactive/complete
              check();
            };

            // Set up timeout
            if (Number.isFinite(timeout) && timeout > 0) {
              timeoutId = setTimeout(finishTimeout, timeout);
            }

            // Observe DOM mutations under the root
            try {
              observer = new MutationObserver(function () {
                return check();
              });
              // Observe broad changes; subtree true to catch deep insertions
              observer.observe(/** @type {Node} */root, {
                childList: true,
                subtree: true
              });
            } catch (_e) {
              // Fallback only; if observe fails (rare), polling should still handle it
            }

            // Polling fallback
            pollId = setInterval(check, interval);

            // DOMContentLoaded hook (if still loading)
            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", onDomReady, {
                once: true
              });
            }

            // Abort support
            if (signal) {
              if (signal.aborted) return onAbort();
              signal.addEventListener("abort", onAbort, {
                once: true
              });
            }

            // Initial tick
            check();
          }));
      }
    }, _callee3);
  }));
  return _waitForElement.apply(this, arguments);
}
function waitFor(_x4) {
  return _waitFor.apply(this, arguments);
}
function _waitFor() {
  _waitFor = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(callback) {
    var options,
      _options$interval2,
      interval,
      _options$timeout2,
      timeout,
      _args5 = arguments;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          options = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {};
          _options$interval2 = options.interval, interval = _options$interval2 === void 0 ? 150 : _options$interval2, _options$timeout2 = options.timeout, timeout = _options$timeout2 === void 0 ? 10000 : _options$timeout2;
          return _context5.a(2, new Promise(function (resolve, reject) {
            var intervalId = null;
            var timeoutId = null;
            var clear = function clear() {
              if (intervalId) clearInterval(intervalId);
              if (timeoutId) clearTimeout(timeoutId);
              intervalId = null;
              timeoutId = null;
            };
            var tick = /*#__PURE__*/function () {
              var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
                var val, _t;
                return _regenerator().w(function (_context4) {
                  while (1) switch (_context4.p = _context4.n) {
                    case 0:
                      _context4.p = 0;
                      _context4.n = 1;
                      return callback();
                    case 1:
                      val = _context4.v;
                      if (val) {
                        clear();
                        resolve(val);
                      }
                      _context4.n = 3;
                      break;
                    case 2:
                      _context4.p = 2;
                      _t = _context4.v;
                    case 3:
                      return _context4.a(2);
                  }
                }, _callee4, null, [[0, 2]]);
              }));
              return function tick() {
                return _ref.apply(this, arguments);
              };
            }();

            // Schedule timeout
            if (timeout > 0) {
              timeoutId = setTimeout(function () {
                clear();
                var err = new Error("waitFor: timed out after ".concat(timeout, "ms"));
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
          }));
      }
    }, _callee5);
  }));
  return _waitFor.apply(this, arguments);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./content.js ***!
  \********************/
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
console.log("Batch User Accounts content script loaded.");
var _require = __webpack_require__(/*! ./domHelpers */ "./domHelpers.js"),
  findInputByLabel = _require.findInputByLabel,
  waitFor = _require.waitFor,
  waitForElement = _require.waitForElement,
  findButtonByContent = _require.findButtonByContent,
  triggerEvent = _require.triggerEvent,
  typeValue = _require.typeValue,
  timeout = _require.timeout;
// Debug: confirm content script is running
window.addEventListener("DOMContentLoaded", function () {
  console.log("[BatchUser] DOMContentLoaded in content script");
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("[BatchUser] Received message:", message);
  if (message.type === "MODIFY_SAP_USERS" && Array.isArray(message.data)) {
    console.log("[BatchUser] Calling modifySAPUsers with data:", message.data);
    modifySAPUsers(message.data);
  } else if (message.type === "CHANGE_SAP_PASSWORDS" && Array.isArray(message.data)) {
    console.log("[BatchUser] Calling changeSAPPasswords with data:", message.data);
    changeSAPPasswords(message.data);
  }
});

// Main batch edit logic
function modifySAPUsers(_x) {
  return _modifySAPUsers.apply(this, arguments);
} // Main batch change passwords logic
function _modifySAPUsers() {
  _modifySAPUsers = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(tableData) {
    var num, _iterator, _step, student, $user, $change, $email, $save, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          num = 0;
          _iterator = _createForOfIteratorHelper(/** @type {LoginSAPFields[]} */tableData);
          _context.p = 1;
          _iterator.s();
        case 2:
          if ((_step = _iterator.n()).done) {
            _context.n = 12;
            break;
          }
          student = _step.value;
          _context.n = 3;
          return timeout();
        case 3:
          console.log("Modding User: ", ++num, student);
          _context.n = 4;
          return waitFor(function () {
            var $user = findInputByLabel("User");
            return $user.disabled ? null : $user;
          });
        case 4:
          $user = _context.v;
          _context.n = 5;
          return typeValue($user, student.sapLogin);
        case 5:
          _context.n = 6;
          return waitFor(function () {
            return findButtonByContent("Change");
          });
        case 6:
          $change = _context.v;
          console.log("Change", $change);
          _context.n = 7;
          return timeout();
        case 7:
          triggerEvent($change, "click");
          _context.n = 8;
          return waitFor(function () {
            return findInputByLabel("E-Mail");
          });
        case 8:
          $email = _context.v;
          typeValue($email, student.studentEmail, 0);
          //$email.setAttribute("value", student.studentEmail);
          _context.n = 9;
          return timeout();
        case 9:
          _context.n = 10;
          return waitFor(function () {
            return findButtonByContent("Save");
          });
        case 10:
          $save = _context.v;
          triggerEvent($save, "click");
        case 11:
          _context.n = 2;
          break;
        case 12:
          _context.n = 14;
          break;
        case 13:
          _context.p = 13;
          _t = _context.v;
          _iterator.e(_t);
        case 14:
          _context.p = 14;
          _iterator.f();
          return _context.f(14);
        case 15:
          console.log("Batch user login update complete!");
        case 16:
          return _context.a(2);
      }
    }, _callee, null, [[1, 13, 14, 15]]);
  }));
  return _modifySAPUsers.apply(this, arguments);
}
function changeSAPPasswords(_x2) {
  return _changeSAPPasswords.apply(this, arguments);
}
function _changeSAPPasswords() {
  _changeSAPPasswords = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(tableData) {
    var num, _iterator2, _step2, student, $user, $change, $newPass, $confirmPass, $save, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          num = 0;
          _iterator2 = _createForOfIteratorHelper(/** @type {LoginSAPFields[]} */tableData);
          _context2.p = 1;
          _iterator2.s();
        case 2:
          if ((_step2 = _iterator2.n()).done) {
            _context2.n = 15;
            break;
          }
          student = _step2.value;
          _context2.n = 3;
          return timeout();
        case 3:
          console.log("Changing User: ", ++num, student);
          _context2.n = 4;
          return waitFor(function () {
            var $user = findInputByLabel("User");
            return $user.disabled ? null : $user;
          });
        case 4:
          $user = _context2.v;
          _context2.n = 5;
          return typeValue($user, student.sapLogin);
        case 5:
          _context2.n = 6;
          return waitFor(function () {
            return findButtonByContent("Change Password");
          });
        case 6:
          $change = _context2.v;
          triggerEvent($change, "click");
          _context2.n = 7;
          return timeout();
        case 7:
          _context2.n = 8;
          return waitFor(function () {
            return findInputByLabel("New Password");
          });
        case 8:
          $newPass = _context2.v;
          _context2.n = 9;
          return typeValue($newPass, student.sapPassword);
        case 9:
          _context2.n = 10;
          return waitFor(function () {
            return findInputByLabel("Repeat Password");
          });
        case 10:
          $confirmPass = _context2.v;
          _context2.n = 11;
          return typeValue($confirmPass, student.sapPassword);
        case 11:
          _context2.n = 12;
          return timeout();
        case 12:
          _context2.n = 13;
          return waitFor(function () {
            return findButtonByContent("Apply");
          });
        case 13:
          $save = _context2.v;
          triggerEvent($save, "click");
          console.log("Changed password for", student.sapLogin);
        case 14:
          _context2.n = 2;
          break;
        case 15:
          _context2.n = 17;
          break;
        case 16:
          _context2.p = 16;
          _t2 = _context2.v;
          _iterator2.e(_t2);
        case 17:
          _context2.p = 17;
          _iterator2.f();
          return _context2.f(17);
        case 18:
          console.log("Batch change SAP passwords complete!");
        case 19:
          return _context2.a(2);
      }
    }, _callee2, null, [[1, 16, 17, 18]]);
  }));
  return _changeSAPPasswords.apply(this, arguments);
}
})();

/******/ })()
;