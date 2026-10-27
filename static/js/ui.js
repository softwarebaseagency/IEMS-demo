/* ============================================================================
   Base Agency Design System — UI building blocks
   Small HTML builders plus the few interactive components the demo needs:
   a sortable/filterable table, a detail drawer, and toasts.
   ========================================================================= */
(function (global) {
  "use strict";

  var t = function (k) { return global.I18n ? I18n.t(k) : k; };

  function esc(s) {
    if (s === null || s === undefined) { return ""; }
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function cls(list) { return list.filter(Boolean).join(" "); }
  function uid(prefix) { return (prefix || "u") + "-" + Math.random().toString(36).slice(2, 8); }

  /* Isolate a Latin run (a date, ID, reference) inside translated RTL text —
     without this, bidi pulls "29 Aug 2026" apart into "Aug 2026 ... 29". */
  function ltr(s) { return '<bdi dir="ltr">' + esc(s) + "</bdi>"; }

  /* ---- Status vocabulary ------------------------------------------------
     A starting set covering the states most back-office products need. Every
     entry is { key, tone, icon }: the key is an i18n lookup, the tone picks
     the pill colour, and the icon is what carries the meaning when colour
     cannot — printed in greyscale, or read by someone colour-blind.

     Projects extend this rather than replacing it. Add your own states with
     UI.STATUS.myState = { key: "s.myState", tone: "warning", icon: "clock" }
     and add "s.myState" to the dictionary in i18n.js. Keep the icon: a pill
     that is only a coloured word is the one thing this system does not do.

     Tones: "" (neutral) · info · good · warning · serious · critical
     -------------------------------------------------------------------- */
  var STATUS = {
    /* Record lifecycle */
    draft:          { key: "s.draft",          tone: "",         icon: "file" },
    pending:        { key: "s.pending",        tone: "warning",  icon: "clock" },
    approved:       { key: "s.approved",       tone: "good",     icon: "fileCheck" },
    rejected:       { key: "s.rejected",       tone: "critical", icon: "xCircle" },
    active:         { key: "s.active",         tone: "good",     icon: "dot" },
    inactive:       { key: "s.inactive",       tone: "",         icon: "minus" },
    scheduled:      { key: "s.scheduled",      tone: "info",     icon: "clock" },
    ended:          { key: "s.ended",          tone: "",         icon: "history" },
    archived:       { key: "s.archived",       tone: "",         icon: "box" },
    cancelled:      { key: "s.cancelled",      tone: "critical", icon: "xCircle" },

    /* Progress */
    notStarted:     { key: "s.notStarted",     tone: "",         icon: "dot" },
    inProgress:     { key: "s.inProgress",     tone: "info",     icon: "play" },
    onHold:         { key: "s.onHold",         tone: "warning",  icon: "pause" },
    blocked:        { key: "s.blocked",        tone: "critical", icon: "alert" },
    completed:      { key: "s.completed",      tone: "good",     icon: "checkCircle" },

    /* Money */
    paid:           { key: "s.paid",           tone: "good",     icon: "checkCircle" },
    partial:        { key: "s.partial",        tone: "warning",  icon: "minus" },
    unpaid:         { key: "s.unpaid",         tone: "",         icon: "wallet" },
    overdue:        { key: "s.overdue",        tone: "critical", icon: "alert" },
    refunded:       { key: "s.refunded",       tone: "critical", icon: "undo" },

    /* Stock */
    inStock:        { key: "s.inStock",        tone: "good",     icon: "checkCircle" },
    lowStock:       { key: "s.lowStock",       tone: "warning",  icon: "alert" },
    outOfStock:     { key: "s.outOfStock",     tone: "critical", icon: "xCircle" },
    expiringSoon:   { key: "s.expiringSoon",   tone: "serious",  icon: "clock" },
    expired:        { key: "s.expired",        tone: "critical", icon: "calendarX" },

    /* Reconciliation */
    balanced:       { key: "s.balanced",       tone: "good",     icon: "check" },
    short:          { key: "s.short",          tone: "critical", icon: "arrowDown" },
    over:           { key: "s.over",           tone: "warning",  icon: "arrowUp" },

    /* System */
    open:           { key: "s.open",           tone: "good",     icon: "dot" },
    closed:         { key: "s.closed",         tone: "",         icon: "lock" },
    online:         { key: "s.online",         tone: "good",     icon: "dot" },
    offline:        { key: "s.offline",        tone: "warning",  icon: "wifiOff" },
    locked:         { key: "s.locked",         tone: "",         icon: "lock" }
  };

  /** Status pill — icon + label, so meaning never rides on colour alone. */
  function statusPill(id) {
    var s = STATUS[id];
    if (!s) { return '<span class="pill pill--icon">' + esc(id) + "</span>"; }
    return '<span class="' + cls(["pill", "pill--icon", s.tone && "pill--" + s.tone]) + '">' +
      Icon(s.icon, { size: 12 }) + t(s.key) + "</span>";
  }

  function pill(text, tone, icon) {
    return '<span class="' + cls(["pill", icon && "pill--icon", tone && "pill--" + tone]) + '">' +
      (icon ? Icon(icon, { size: 12 }) : "") + esc(text) + "</span>";
  }

  /* ---- Card ------------------------------------------------------------ */
  function card(o) {
    var head = "";
    if (o.title || o.tools) {
      head = '<div class="card__head"><div class="card__titles">' +
        (o.title ? '<h2 class="card__title">' + esc(o.title) + "</h2>" : "") +
        (o.sub ? '<p class="card__sub">' + esc(o.sub) + "</p>" : "") +
        "</div>" +
        (o.tools ? '<div class="card__tools">' + o.tools + "</div>" : "") +
        "</div>";
    }
    return '<section class="' + cls(["card", o.className]) + '"' +
      (o.id ? ' id="' + o.id + '"' : "") + ">" + head +
      '<div class="' + cls(["card__body", o.flush && "card__body--flush"]) + '">' + (o.body || "") + "</div>" +
      (o.foot ? '<div class="card__foot">' + o.foot + "</div>" : "") +
      "</section>";
  }

  /* ---- Stat tile ------------------------------------------------------- */
  function stat(o) {
    var delta = "";
    if (o.delta !== undefined && o.delta !== null) {
      var dir = o.delta > 0 ? "up" : o.delta < 0 ? "down" : "flat";
      /* "good" flips the colour when down is the healthy direction */
      var good = o.goodWhen === "down" ? (o.delta < 0) : (o.delta > 0);
      var tone = o.delta === 0 ? "flat" : (good ? "up" : "down");
      delta = '<span class="stat__delta stat__delta--' + tone + '">' +
        Icon(dir === "up" ? "arrowUp" : dir === "down" ? "arrowDown" : "minus", { size: 12 }) +
        esc((o.delta > 0 ? "+" : "") + o.delta + (o.deltaUnit !== undefined ? o.deltaUnit : "%")) + "</span>";
    }
    return '<article class="card stat">' +
      '<div class="stat__label">' + (o.icon ? Icon(o.icon, { size: 14 }) : "") + esc(o.label) + "</div>" +
      '<div class="stat__row">' +
        '<span class="stat__value">' + esc(o.value) + "</span>" +
        (o.unit ? '<span class="stat__unit">' + esc(o.unit) + "</span>" : "") +
        (o.spark ? '<span class="stat__spark">' + o.spark + "</span>" : "") +
      "</div>" +
      '<div class="row-tight">' + delta +
        (o.note ? '<span class="stat__note">' + esc(o.note) + "</span>" : "") +
      "</div>" +
      "</article>";
  }

  /* ---- Page header ----------------------------------------------------- */
  function pageHead(o) {
    return '<header class="pagehead"><div class="pagehead__text">' +
      (o.moduleNo ? '<p class="pagehead__eyebrow">' + esc(t("mod.label")) +
        " <b>" + esc(o.moduleNo) + "</b></p>" : "") +
      "<h1>" + esc(o.title) + "</h1>" +
      (o.lede ? "<p>" + esc(o.lede) + "</p>" : "") +
      "</div>" +
      (o.actions ? '<div class="pagehead__actions">' + o.actions + "</div>" : "") +
      "</header>";
  }

  /* ---- Buttons --------------------------------------------------------- */
  function btn(o) {
    return "<button type=\"button\" class=\"" +
      cls(["btn", o.variant && "btn--" + o.variant, o.size && "btn--" + o.size, o.className]) + "\"" +
      (o.id ? ' id="' + o.id + '"' : "") +
      (o.demo ? ' data-demo-action="' + esc(o.demo) + '"' : "") +
      (o.label && o.variant === "icon" ? ' aria-label="' + esc(o.label) + '"' : "") +
      (o.attrs || "") + ">" +
      (o.icon ? Icon(o.icon, { size: o.variant === "icon" ? 17 : 15 }) : "") +
      (o.variant === "icon" ? "" : esc(o.label || "")) +
      "</button>";
  }

  /** Chart/Table toggle — the relief for sub-3:1 series colours. */
  function chartToggle(slotId) {
    return '<div class="segmented" role="group" aria-label="' + esc(t("t.viewAsTable")) + '" ' +
      'data-viz-toggle="' + slotId + '">' +
      '<button type="button" data-mode="chart" aria-pressed="true">' + esc(t("act.chart")) + "</button>" +
      '<button type="button" data-mode="table" aria-pressed="false">' + esc(t("act.table")) + "</button>" +
      "</div>";
  }

  /** A card whose body is a chart slot, with the toggle wired into its head. */
  function chartCard(o) {
    var slotId = "viz-" + o.id;
    return card({
      title: o.title,
      sub: o.sub,
      className: o.className,
      tools: (o.tools || "") + chartToggle(slotId),
      body: '<div class="viz-slot" id="' + slotId + '" data-viz="' + esc(o.id) + '"></div>',
      foot: o.foot
    });
  }

  /* ---- Notice ---------------------------------------------------------- */
  function notice(o) {
    return '<div class="' + cls(["notice", o.tone && "notice--" + o.tone]) + '">' +
      Icon(o.icon || "info", { size: 17 }) +
      "<div><strong>" + esc(o.title) + "</strong>" +
      (o.text ? "<p>" + esc(o.text) + "</p>" : "") + "</div>" +
      (o.aside ? '<div class="push">' + o.aside + "</div>" : "") +
      "</div>";
  }

  function empty(o) {
    return '<div class="empty">' + Icon(o.icon || "search", { size: 30 }) +
      "<h3>" + esc(o.title) + "</h3>" +
      (o.text ? "<p>" + esc(o.text) + "</p>" : "") + "</div>";
  }

  /* ---- Avatar / person ------------------------------------------------- */
  function initials(name) {
    var parts = String(name).trim().split(/\s+/);
    return ((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "");
  }
  function avatar(name, size) {
    return '<span class="' + cls(["avatar", size && "avatar--" + size]) + '" aria-hidden="true">' +
      esc(initials(name).toUpperCase()) + "</span>";
  }
  function person(name, meta, size) {
    return '<span class="person">' + avatar(name, size) +
      '<span><span class="person__name">' + esc(name) + "</span>" +
      (meta ? '<span class="person__meta" style="display:block">' + esc(meta) + "</span>" : "") +
      "</span></span>";
  }

  /* ========================================================================
     DATA TABLE — sortable, filterable, paginated. Read-only by design.
     ===================================================================== */
  function dataTable(host, o) {
    var state = {
      sort: o.defaultSort || null,
      dir: o.defaultDir || "asc",
      page: 0,
      size: o.pageSize || 10,
      query: ""
    };

    function filtered() {
      var rows = o.rows.slice();
      if (state.query) {
        var q = state.query.toLowerCase();
        rows = rows.filter(function (r) {
          return o.columns.some(function (c) {
            if (c.searchable === false) { return false; }
            var v = c.value ? c.value(r) : r[c.field];
            return v !== undefined && String(v).toLowerCase().indexOf(q) >= 0;
          });
        });
      }
      if (state.sort) {
        var col = o.columns.filter(function (c) { return c.field === state.sort; })[0];
        if (col) {
          rows.sort(function (a, b) {
            var av = col.sortValue ? col.sortValue(a) : (col.value ? col.value(a) : a[col.field]);
            var bv = col.sortValue ? col.sortValue(b) : (col.value ? col.value(b) : b[col.field]);
            if (typeof av === "number" && typeof bv === "number") { return av - bv; }
            return String(av).localeCompare(String(bv));
          });
          if (state.dir === "desc") { rows.reverse(); }
        }
      }
      return rows;
    }

    function render() {
      var rows = filtered();
      var pages = Math.max(1, Math.ceil(rows.length / state.size));
      if (state.page >= pages) { state.page = pages - 1; }
      var slice = rows.slice(state.page * state.size, state.page * state.size + state.size);

      var head = o.columns.map(function (c) {
        var sorted = state.sort === c.field;
        var aria = sorted ? ' aria-sort="' + (state.dir === "asc" ? "ascending" : "descending") + '"' : "";
        if (c.sortable === false) {
          return '<th scope="col" class="' + cls([c.num && "num"]) + '">' + esc(c.label) + "</th>";
        }
        return '<th scope="col" class="' + cls(["sortable", c.num && "num"]) + '"' + aria + ">" +
          '<button type="button" data-sort="' + esc(c.field) + '">' + esc(c.label) +
          Icon("arrowUp", { size: 11, cls: "caret" }) + "</button></th>";
      }).join("");

      var body = slice.length
        ? slice.map(function (r, i) {
            var idx = o.rows.indexOf(r);
            return '<tr class="' + (o.onRow ? "row-link" : "") + '"' +
              (o.onRow ? ' tabindex="0" data-row="' + idx + '"' : "") + ">" +
              o.columns.map(function (c) {
                return '<td class="' + cls([c.num && "num", c.wrap && "wrap", c.tdClass]) + '">' +
                  (c.render ? c.render(r, i) : esc(c.value ? c.value(r) : r[c.field])) + "</td>";
              }).join("") + "</tr>";
          }).join("")
        : '<tr><td colspan="' + o.columns.length + '" style="padding:0">' +
          empty({ title: t("t.noResults"), text: t("t.noResultsHint") }) + "</td></tr>";

      var from = rows.length ? state.page * state.size + 1 : 0;
      var to = Math.min(rows.length, (state.page + 1) * state.size);

      host.innerHTML =
        '<div class="tabletools">' +
          '<div class="search">' +
            '<span class="search__icon">' + Icon("search", { size: 15 }) + "</span>" +
            '<input type="search" data-table-search placeholder="' + esc(o.searchPlaceholder || t("act.search")) +
            '" aria-label="' + esc(o.searchPlaceholder || t("act.search")) + '" value="' + esc(state.query) + '">' +
          "</div>" +
          (o.tools || "") +
          '<div class="pager">' +
            '<span class="pager__label">' + esc(t("t.showing")) + " " + from + "–" + to +
              " " + esc(t("t.of")) + " " + rows.length + "</span>" +
            btn({ variant: "icon", icon: "chevronLeft", label: t("act.previous"),
                  attrs: ' data-page="prev"' + (state.page === 0 ? " disabled" : "") }) +
            btn({ variant: "icon", icon: "chevronRight", label: t("act.next"),
                  attrs: ' data-page="next"' + (state.page >= pages - 1 ? " disabled" : "") }) +
          "</div>" +
        "</div>" +
        '<div class="tablewrap"><table class="data">' +
          "<thead><tr>" + head + "</tr></thead>" +
          "<tbody>" + body + "</tbody>" +
        "</table></div>";

      wire();
    }

    var searchTimer = null;
    function wire() {
      host.querySelectorAll("button[data-sort]").forEach(function (b) {
        b.addEventListener("click", function () {
          var f = b.getAttribute("data-sort");
          if (state.sort === f) { state.dir = state.dir === "asc" ? "desc" : "asc"; }
          else { state.sort = f; state.dir = "asc"; }
          render();
        });
      });
      var s = host.querySelector("[data-table-search]");
      if (s) {
        s.addEventListener("input", function () {
          clearTimeout(searchTimer);
          searchTimer = setTimeout(function () {
            state.query = s.value.trim();
            state.page = 0;
            render();
            var again = host.querySelector("[data-table-search]");
            if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
          }, 180); /* debounced — the list is long enough to matter */
        });
      }
      host.querySelectorAll("[data-page]").forEach(function (b) {
        b.addEventListener("click", function () {
          state.page += b.getAttribute("data-page") === "next" ? 1 : -1;
          if (state.page < 0) { state.page = 0; }
          render();
        });
      });
      if (o.onRow) {
        host.querySelectorAll("tr[data-row]").forEach(function (tr) {
          function go() { o.onRow(o.rows[Number(tr.getAttribute("data-row"))]); }
          tr.addEventListener("click", go);
          tr.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
          });
        });
      }
    }

    render();
    return { refresh: render, state: state };
  }

  /* ========================================================================
     DRAWER — read-only detail pane
     ===================================================================== */
  var drawerEl = null, scrimEl = null, lastFocus = null;

  function ensureOverlays() {
    if (drawerEl) { return; }
    scrimEl = document.createElement("div");
    scrimEl.className = "scrim";
    document.body.appendChild(scrimEl);

    drawerEl = document.createElement("aside");
    drawerEl.className = "drawer";
    drawerEl.setAttribute("role", "dialog");
    drawerEl.setAttribute("aria-modal", "true");
    drawerEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(drawerEl);

    scrimEl.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawerEl.getAttribute("data-open") === "true") { closeDrawer(); }
    });
    /* Keep focus inside while open */
    drawerEl.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") { return; }
      var f = drawerEl.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!f.length) { return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function openDrawer(o) {
    ensureOverlays();
    lastFocus = document.activeElement;
    drawerEl.innerHTML =
      '<header class="drawer__head"><div class="card__titles">' +
        (o.eyebrow ? '<p class="pagehead__eyebrow">' + esc(o.eyebrow) + "</p>" : "") +
        '<h2 class="card__title" id="drawerTitle">' + esc(o.title) + "</h2>" +
        (o.sub ? '<p class="card__sub">' + esc(o.sub) + "</p>" : "") +
      "</div>" +
      btn({ variant: "icon", icon: "close", label: t("act.close"), attrs: ' data-drawer-close' }) +
      "</header>" +
      '<div class="drawer__body">' + o.body + "</div>" +
      (o.foot ? '<div class="drawer__foot">' + o.foot + "</div>" : "");
    drawerEl.setAttribute("aria-labelledby", "drawerTitle");
    drawerEl.setAttribute("aria-hidden", "false");
    drawerEl.setAttribute("data-open", "true");
    scrimEl.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";

    drawerEl.querySelector("[data-drawer-close]").addEventListener("click", closeDrawer);
    if (o.onMount) { o.onMount(drawerEl); }
    var focusable = drawerEl.querySelector("[data-drawer-close]");
    if (focusable) { focusable.focus(); }
  }

  function closeDrawer() {
    if (!drawerEl) { return; }
    drawerEl.removeAttribute("data-open");
    drawerEl.setAttribute("aria-hidden", "true");
    scrimEl.removeAttribute("data-open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }


  /* ========================================================================
     MODAL — a focused decision, unlike the drawer's read-only detail.
     Used by the lane for cash tender: it takes focus, traps it, and closes
     on Escape or on the scrim.
     ===================================================================== */
  var modalEl = null, modalScrim = null, modalReturn = null, onModalClose = null;

  function ensureModal() {
    if (modalEl) { return; }
    modalScrim = document.createElement("div");
    modalScrim.className = "scrim";
    document.body.appendChild(modalScrim);

    modalEl = document.createElement("div");
    modalEl.className = "modal";
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(modalEl);

    modalScrim.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl.getAttribute("data-open") === "true") { closeModal(); }
    });
    modalEl.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") { return; }
      var f = modalEl.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!f.length) { return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function openModal(o) {
    ensureModal();
    modalReturn = document.activeElement;
    onModalClose = o.onClose || null;
    modalEl.innerHTML =
      '<div class="modal__panel">' +
        '<header class="drawer__head"><div class="card__titles">' +
          (o.eyebrow ? '<p class="pagehead__eyebrow">' + esc(o.eyebrow) + "</p>" : "") +
          '<h2 class="card__title" id="modalTitle">' + esc(o.title) + "</h2>" +
          (o.sub ? '<p class="card__sub">' + esc(o.sub) + "</p>" : "") +
        "</div>" +
        btn({ variant: "icon", icon: "close", label: t("act.close"), attrs: " data-modal-close" }) +
        "</header>" +
        '<div class="drawer__body">' + o.body + "</div>" +
        (o.foot ? '<div class="drawer__foot">' + o.foot + "</div>" : "") +
      "</div>";
    modalEl.setAttribute("aria-labelledby", "modalTitle");
    modalEl.setAttribute("aria-hidden", "false");
    modalEl.setAttribute("data-open", "true");
    modalScrim.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";

    modalEl.querySelector("[data-modal-close]").addEventListener("click", closeModal);
    if (o.onMount) { o.onMount(modalEl); }
    var focus = o.autofocus ? modalEl.querySelector(o.autofocus) : null;
    (focus || modalEl.querySelector("[data-modal-close]")).focus();
  }

  function closeModal() {
    if (!modalEl || modalEl.getAttribute("data-open") !== "true") { return; }
    modalEl.removeAttribute("data-open");
    modalEl.setAttribute("aria-hidden", "true");
    modalScrim.removeAttribute("data-open");
    document.body.style.overflow = "";
    if (modalReturn && modalReturn.focus) { modalReturn.focus(); }
    var fn = onModalClose;
    onModalClose = null;
    if (fn) { fn(); }
  }

  /** Replace only the body of an open modal — keeps focus and scroll. */
  function updateModal(bodyHTML) {
    if (!modalEl) { return null; }
    var body = modalEl.querySelector(".drawer__body");
    if (body) { body.innerHTML = bodyHTML; }
    return body;
  }

  /* ========================================================================
     TOAST — announces politely, never steals focus
     ===================================================================== */
  function toaster() {
    var box = document.getElementById("toaster");
    if (!box) {
      box = document.createElement("div");
      box.id = "toaster";
      box.className = "toaster";
      box.setAttribute("aria-live", "polite");
      document.body.appendChild(box);
    }
    return box;
  }

  function toast(message, icon) {
    var box = toaster();
    var node = document.createElement("div");
    node.className = "toast";
    node.setAttribute("role", "status");
    node.innerHTML = Icon(icon || "info", { size: 16 }) + "<span>" + esc(message) + "</span>";
    box.appendChild(node);
    setTimeout(function () {
      node.setAttribute("data-leaving", "true");
      setTimeout(function () { node.remove(); }, 200);
    }, 3600); /* auto-dismiss inside the 3–5s window */
  }

  /* ---- Tabs ------------------------------------------------------------ */
  function tabs(items, activeId) {
    return '<div class="tabs" role="tablist">' + items.map(function (i) {
      return '<button type="button" role="tab" data-tab="' + esc(i.id) + '" aria-selected="' +
        (i.id === activeId) + '">' + esc(i.label) + "</button>";
    }).join("") + "</div>";
  }

  function wireTabs(root, onChange) {
    var bar = root.querySelector(".tabs");
    if (!bar) { return; }
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tab]");
      if (!b) { return; }
      bar.querySelectorAll("[data-tab]").forEach(function (x) {
        x.setAttribute("aria-selected", String(x === b));
      });
      onChange(b.getAttribute("data-tab"));
    });
    bar.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") { return; }
      var list = Array.prototype.slice.call(bar.querySelectorAll("[data-tab]"));
      var i = list.indexOf(document.activeElement);
      if (i < 0) { return; }
      e.preventDefault();
      var next = list[(i + (e.key === "ArrowRight" ? 1 : list.length - 1)) % list.length];
      next.focus(); next.click();
    });
  }

  /* ---- Read-only select (the demo never mutates data) ------------------- */
  function select(o) {
    return '<span class="select"><select aria-label="' + esc(o.label) + '"' +
      (o.id ? ' id="' + o.id + '"' : "") + (o.attrs || "") + ">" +
      o.options.map(function (opt) {
        var value = typeof opt === "string" ? opt : opt.value;
        var text = typeof opt === "string" ? opt : opt.label;
        return '<option value="' + esc(value) + '"' +
          (value === o.value ? " selected" : "") + ">" + esc(text) + "</option>";
      }).join("") + "</select></span>";
  }

  /* ---- Read-only field ------------------------------------------------- */
  function field(label, value, help) {
    return '<div class="field"><span class="field__label">' + esc(label) + "</span>" +
      '<span class="field__value">' + (value === "" || value === undefined || value === null
        ? '<span class="muted">—</span>' : esc(value)) + "</span>" +
      (help ? '<span class="field__help">' + esc(help) + "</span>" : "") + "</div>";
  }

  function track(pct, tone) {
    return '<div class="' + cls(["track", tone && "track--" + tone]) + '">' +
      '<div class="track__fill" style="width:' + Math.max(0, Math.min(100, pct)) + '%"></div></div>';
  }

  /* ---- Mount chart specs declared in a view ---------------------------- */
  function mountCharts(root, specs) {
    root.querySelectorAll("[data-viz]").forEach(function (host) {
      var spec = specs[host.getAttribute("data-viz")];
      if (!spec) { return; }
      var fn = Charts[spec.type];
      if (fn) { fn(host, spec); }
    });
    /* Chart <-> table toggles */
    root.querySelectorAll("[data-viz-toggle]").forEach(function (group) {
      var slot = document.getElementById(group.getAttribute("data-viz-toggle"));
      if (!slot) { return; }
      group.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-mode]");
        if (!b) { return; }
        group.querySelectorAll("button").forEach(function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
        Charts.setMode(slot, b.getAttribute("data-mode"));
      });
    });
  }

  /* ---- Wire every demo-only action to the same honest message ----------
     Safe to call again on a region that was partly wired already (a tab
     repainting inside a view): a button is only ever wired once. */
  function wireDemoActions(root) {
    root.querySelectorAll("[data-demo-action]:not([data-demo-wired])").forEach(function (b) {
      b.setAttribute("data-demo-wired", "");
      b.addEventListener("click", function () {
        toast(t("demo.entryDisabled"), "lock");
      });
    });
  }

  global.UI = {
    esc: esc, cls: cls, uid: uid, ltr: ltr,
    card: card, stat: stat, pageHead: pageHead, btn: btn, notice: notice, empty: empty,
    pill: pill, statusPill: statusPill, STATUS: STATUS,
    avatar: avatar, person: person, initials: initials,
    chartCard: chartCard, chartToggle: chartToggle, mountCharts: mountCharts,
    dataTable: dataTable,
    openDrawer: openDrawer, closeDrawer: closeDrawer,
    openModal: openModal, closeModal: closeModal, updateModal: updateModal,
    toast: toast, tabs: tabs, wireTabs: wireTabs,
    select: select, field: field, track: track,
    wireDemoActions: wireDemoActions
  };
})(window);
