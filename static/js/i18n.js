/* ============================================================================
   Base Agency Design System — Interface language

   Two jobs. It supplies the strings the component layer needs (ui.js and
   charts.js both call I18n.t), and it carries the RTL plumbing: stamping
   lang/dir on the document, swapping to the Arabic cut of the typeface, and
   filling every [data-i18n] node.

   Ship it even in a single-language project. Without it, ui.js falls back to
   printing raw keys like "s.approved" into the interface, and adding a
   language later means touching every view instead of this one file.

   ---- Adding a language -------------------------------------------------
   1. Give each DICT entry an array instead of a string, in ORDER order:
        "act.search": ["Search", "گەڕان", "بحث"]
      and change t() to return row[idx(current)] || row[0].
   2. Add the code to IMPLEMENTED.
   The RTL layout, the fonts and the switcher already work.
   ========================================================================= */
(function (global) {
  "use strict";

  var LANGS = {
    en: { name: "English",           native: "English", dir: "ltr", short: "EN" },
    ku: { name: "Kurdish (Sorani)",  native: "کوردی",   dir: "rtl", short: "KU" },
    ar: { name: "Arabic",            native: "العربية", dir: "rtl", short: "AR" }
  };

  var ORDER = ["en", "ku", "ar"];

  /* Only locales listed here are actually translated. Offering a language the
     product cannot speak, and then showing English under a flipped layout, is
     worse than saying so — set() refuses and lets the caller report it. */
  var IMPLEMENTED = ["en"];

  var DICT = {
    /* ---- Actions the component layer renders ---------------------------- */
    "act.search":        "Search",
    "act.close":         "Close",
    "act.previous":      "Previous",
    "act.next":          "Next",
    "act.chart":         "Chart",
    "act.table":         "Table",
    "act.viewAll":       "View all",
    "act.export":        "Export",
    "act.print":         "Print",
    "act.language":      "Language",
    "act.notifications": "Alerts",
    "act.account":       "Account",
    "act.signOut":       "Sign out",
    "act.openMenu":      "Open navigation",
    "act.apply":         "Apply",
    "act.clear":         "Clear",

    /* ---- Table and chart chrome ----------------------------------------- */
    "t.showing":         "Showing",
    "t.of":              "of",
    "t.noResults":       "No matching records",
    "t.noResultsHint":   "Try a different search term or clear the filters.",
    "t.viewAsTable":     "View chart data as a table",
    "t.lastUpdated":     "Last updated",
    "mod.label":         "Module",

    /* ---- Demo framing ---------------------------------------------------- */
    "demo.readOnly":     "Interface demo — sample data",
    "demo.noEntry":      "Every figure on this screen is illustrative. Data entry, printing and hardware are switched off in the demo.",
    "demo.entryDisabled":"Not available in the demo — this action would write to the live system.",
    "demo.langOnly":     "Only English is translated in this demo. The switcher, RTL layout and Kurdish typeface are already wired up.",

    /* ---- Status vocabulary (matches UI.STATUS in ui.js) ------------------ */
    "s.draft":           "Draft",
    "s.pending":         "Pending",
    "s.approved":        "Approved",
    "s.rejected":        "Rejected",
    "s.active":          "Active",
    "s.inactive":        "Inactive",
    "s.scheduled":       "Scheduled",
    "s.ended":           "Ended",
    "s.archived":        "Archived",
    "s.cancelled":       "Cancelled",

    "s.notStarted":      "Not started",
    "s.inProgress":      "In progress",
    "s.onHold":          "On hold",
    "s.blocked":         "Blocked",
    "s.completed":       "Completed",

    "s.paid":            "Paid",
    "s.partial":         "Part paid",
    "s.unpaid":          "Unpaid",
    "s.overdue":         "Overdue",
    "s.refunded":        "Refunded",

    "s.inStock":         "In stock",
    "s.lowStock":        "Low stock",
    "s.outOfStock":      "Out of stock",
    "s.expiringSoon":    "Expiring soon",
    "s.expired":         "Expired",

    "s.balanced":        "Balanced",
    "s.short":           "Short",
    "s.over":            "Over",

    "s.open":            "Open",
    "s.closed":          "Closed",
    "s.online":          "Online",
    "s.offline":         "Offline",
    "s.locked":          "Locked"
  };

  var current = "en";
  var listeners = [];

  /** Translate a key. An unknown key returns itself, which shows up loudly in
      the interface — that is deliberate, a missing string should be visible. */
  function t(key) {
    var v = DICT[key];
    return v === undefined ? key : v;
  }

  function get() { return current; }
  function dir() { return LANGS[current].dir; }
  function meta(lang) { return LANGS[lang || current]; }
  function isImplemented(lang) { return IMPLEMENTED.indexOf(lang) >= 0; }

  function all() {
    return ORDER.map(function (code) {
      return { code: code, meta: LANGS[code], implemented: isImplemented(code) };
    });
  }

  /**
   * Switch language.
   * @returns {boolean} false when the locale exists but is not translated, so
   *          the caller can say so instead of rendering a half-translated UI.
   */
  function set(lang) {
    if (!LANGS[lang] || !isImplemented(lang)) { return false; }
    if (lang === current) { return true; }
    current = lang;
    try { localStorage.setItem("bds.lang", lang); } catch (e) { /* private mode */ }
    apply();
    listeners.forEach(function (fn) { fn(lang); });
    return true;
  }

  function onChange(fn) { listeners.push(fn); }

  /** Stamp dir/lang on the document and fill every [data-i18n] node. */
  function apply(root) {
    var scope = root || document;
    if (!root) {
      document.documentElement.lang = current;
      document.documentElement.dir = LANGS[current].dir;
    }
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) { el.setAttribute(attr, t(key)); }
      else { el.textContent = t(key); }
    });
  }

  function restore() {
    var saved = null;
    try { saved = localStorage.getItem("bds.lang"); } catch (e) { /* private mode */ }
    if (saved && LANGS[saved] && isImplemented(saved)) { current = saved; }
    apply();
  }

  global.I18n = {
    t: t, set: set, get: get, dir: dir, meta: meta, all: all,
    isImplemented: isImplemented,
    apply: apply, restore: restore, onChange: onChange,
    DICT: DICT, LANGS: LANGS, IMPLEMENTED: IMPLEMENTED
  };
})(window);
