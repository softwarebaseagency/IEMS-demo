/* ============================================================================
   IEMS demo shell - navigation, topbar and hash router
   ========================================================================== */
(function (global) {
  "use strict";

  var t = I18n.t, D = DATA;
  var DEMO = Iems.DEMO;

  I18n.DICT["demo.entryDisabled"] = DEMO;
  I18n.DICT["demo.readOnly"] = "Interface demo - sample data";
  I18n.DICT["demo.noEntry"] = "Altun Creative is a made-up company. Every name, figure and reference is sample data, and nothing you click is saved.";

  var openExceptions = D.exceptions.filter(function (e) { return e.state === "open" || e.state === "correction"; }).length;

  var NAV = [
    { group: "Workspace", items: [
      { id: "dashboard",  no: "00", label: "Overview",          icon: "grid" },
      { id: "tasks",      no: "01", label: "My tasks",          icon: "listCheck", badge: D.tasks.filter(function (x) { return x.state !== "done"; }).length },
      { id: "approvals",  no: "02", label: "Approvals",         icon: "inbox",     badge: D.approvals.length }
    ]},
    { group: "Sales", items: [
      { id: "crm",        no: "03", label: "Leads & clients",   icon: "megaphone" },
      { id: "meetings",   no: "04", label: "Meetings",          icon: "calendarCheck" }
    ]},
    { group: "Commercial", items: [
      { id: "commercial", no: "05", label: "Quotations",        icon: "file" },
      { id: "finance",    no: "06", label: "Finance",           icon: "wallet" }
    ]},
    { group: "Delivery", items: [
      { id: "projects",   no: "07", label: "Projects",          icon: "layers" },
      { id: "procurement", no: "08", label: "Procurement",      icon: "cart" }
    ]},
    { group: "People", items: [
      { id: "attendance", no: "09", label: "Attendance",        icon: "clock", badge: openExceptions },
      { id: "people",     no: "10", label: "People",            icon: "users" }
    ]},
    { group: "Control", items: [
      { id: "reports",    no: "11", label: "Reports",           icon: "trend" },
      { id: "admin",      no: "12", label: "Admin & audit",     icon: "shield" }
    ]}
  ];

  var MODULES = {};
  NAV.forEach(function (g) { g.items.forEach(function (i) { MODULES[i.id] = i; }); });

  var DEFAULT_ROUTE = "dashboard";
  var main = document.getElementById("main");
  var sidebar = document.getElementById("sidebar");

  function parse() {
    var raw = (location.hash || "").replace(/^#\/?/, "");
    var parts = raw.split("?");
    var params = {};
    (parts[1] || "").split("&").forEach(function (pair) {
      if (!pair) { return; }
      var kv = pair.split("=");
      params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
    });
    return { route: MODULES[parts[0]] ? parts[0] : DEFAULT_ROUTE, params: params };
  }
  function currentRoute() { return parse().route; }

  function go(route, params) {
    var hash = "#/" + route + (params ? "?" + Object.keys(params).map(function (k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
    }).join("&") : "");
    if (location.hash === hash) { render(); return; }
    location.hash = hash;
  }

  function paintNav() {
    document.getElementById("navScroll").innerHTML = NAV.map(function (g) {
      return '<div class="navgroup"><p class="navgroup__label">' + UI.esc(g.group) + "</p>" +
        g.items.map(function (i) {
          return '<button class="navitem" type="button" data-route="' + i.id + '">' +
            '<span class="navitem__num">' + i.no + "</span>" +
            Icon(i.icon, { size: 18, cls: "navitem__icon" }) +
            '<span class="navitem__label">' + UI.esc(i.label) + "</span>" +
            (i.badge ? '<span class="navitem__badge" aria-label="' + i.badge + ' waiting">' + i.badge + "</span>" : "") +
          "</button>";
        }).join("") + "</div>";
    }).join("");
    markActive();
  }

  function markActive() {
    var route = currentRoute();
    document.querySelectorAll("[data-route]").forEach(function (b) {
      if (b.getAttribute("data-route") === route) { b.setAttribute("aria-current", "page"); }
      else { b.removeAttribute("aria-current"); }
    });
  }

  document.getElementById("navScroll").addEventListener("click", function (e) {
    var b = e.target.closest("[data-route]");
    if (!b) { return; }
    go(b.getAttribute("data-route"));
    if (window.matchMedia("(max-width: 1023px)").matches) { closeSidebar(); }
  });

  /* ---- Mobile drawer ---------------------------------------------------- */
  var scrim = null;
  function ensureScrim() {
    if (scrim) { return; }
    scrim = document.createElement("div");
    scrim.className = "scrim";
    scrim.addEventListener("click", closeSidebar);
    document.body.appendChild(scrim);
  }
  function openSidebar() {
    sidebar.setAttribute("data-open", "true");
    document.getElementById("menuBtn").setAttribute("aria-expanded", "true");
    ensureScrim();
    scrim.setAttribute("data-open", "true");
  }
  function closeSidebar() {
    sidebar.removeAttribute("data-open");
    document.getElementById("menuBtn").setAttribute("aria-expanded", "false");
    if (scrim) { scrim.removeAttribute("data-open"); }
  }
  var wide = window.matchMedia("(min-width: 1024px)");
  (wide.addEventListener ? wide.addEventListener.bind(wide, "change") :
    wide.addListener.bind(wide))(function (e) { if (e.matches) { closeSidebar(); } });

  /* ---- Render ----------------------------------------------------------- */
  function render() {
    var state = parse();
    var mod = MODULES[state.route];
    var view = global.Views && global.Views[state.route];

    document.title = mod.label + " - IEMS Demo";
    markActive();

    var fresh = main.cloneNode(false);
    main.parentNode.replaceChild(fresh, main);
    main = fresh;
    main.className = "content view-enter";

    if (!view) {
      main.innerHTML = UI.empty({ icon: "info", title: "Screen not in this demo", text: "Pick another module from the menu." });
      return;
    }
    view(main, { module: mod, params: state.params });
    UI.wireDemoActions(main);
    I18n.apply(main);
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  window.addEventListener("hashchange", function () { UI.closeDrawer(); UI.closeModal(); render(); });

  /* Cross-links any screen can use: data-go jumps to a module (data-tab picks
     its tab), data-quotation opens a quotation, data-doc previews a document. */
  document.addEventListener("click", function (e) {
    var jump = e.target.closest("[data-go]");
    if (jump) {
      e.preventDefault();
      UI.closeDrawer();
      UI.closeModal();
      go(jump.getAttribute("data-go"), jump.getAttribute("data-tab") ? { tab: jump.getAttribute("data-tab") } : null);
      return;
    }
    var q = e.target.closest("[data-quotation]");
    if (q) { e.preventDefault(); UI.closeModal(); Iems.openQuotation(q.getAttribute("data-quotation")); return; }
    var doc = e.target.closest("[data-doc]");
    if (doc) { e.preventDefault(); Iems.openPaper(doc.getAttribute("data-doc")); }
  });

  /* ---- Topbar menus ----------------------------------------------------- */
  var openMenu = null;
  function closeMenu() {
    if (!openMenu) { return; }
    openMenu.anchor.setAttribute("aria-expanded", "false");
    openMenu.node.remove();
    openMenu = null;
    document.removeEventListener("click", onDocClick, true);
  }
  function onDocClick(e) {
    if (openMenu && !openMenu.node.contains(e.target) && !openMenu.anchor.contains(e.target)) { closeMenu(); }
  }
  function showMenu(anchor, html, onClick) {
    if (openMenu && openMenu.anchor === anchor) { closeMenu(); return; }
    closeMenu();
    var node = document.createElement("div");
    node.className = "menu";
    node.setAttribute("role", "menu");
    node.innerHTML = html;
    document.body.appendChild(node);
    var box = anchor.getBoundingClientRect();
    var left = I18n.dir() === "rtl" ? box.left : box.right - node.offsetWidth;
    node.style.left = Math.max(8, Math.min(window.innerWidth - node.offsetWidth - 8, left)) + "px";
    node.style.top = (box.bottom + window.scrollY + 6) + "px";
    anchor.setAttribute("aria-expanded", "true");
    openMenu = { anchor: anchor, node: node };
    if (onClick) { node.addEventListener("click", onClick); }
    var first = node.querySelector("button, a");
    if (first) { first.focus(); }
    setTimeout(function () { document.addEventListener("click", onDocClick, true); }, 0);
  }

  function paintTopbar() {
    document.getElementById("menuBtn").innerHTML = Icon("menu", { size: 17 });
    document.getElementById("menuBtn").setAttribute("aria-label", t("act.openMenu"));
    document.getElementById("searchIcon").innerHTML = Icon("search", { size: 15 });
    /* The icon sits straight in the button: on a phone .collapse-label hides
       every span inside it, leaving only the icon. */
    document.getElementById("newBtn").innerHTML = Icon("plus", { size: 15 }) + "<span>New</span>";
    document.getElementById("clock").innerHTML = Icon("clock", { size: 14 }) +
      "<span>Tue 27 Oct · 10:42</span>";

    var langBtn = document.getElementById("langBtn");
    langBtn.innerHTML = Icon("globe", { size: 17 });
    langBtn.setAttribute("aria-label", t("act.language") + " - " + I18n.meta().short);

    var bell = document.getElementById("bellBtn");
    bell.innerHTML = Icon("bell", { size: 17 }) + '<span class="dot">' + D.alerts.length + "</span>";
    bell.setAttribute("aria-label", t("act.notifications") + " (" + D.alerts.length + ")");

    var userBtn = document.getElementById("userBtn");
    userBtn.innerHTML = UI.avatar(D.meta.user.name, "sm") + Icon("chevronDown", { size: 13 });
    userBtn.setAttribute("aria-label", t("act.account"));

    var gs = document.getElementById("globalSearch");
    gs.placeholder = "Search leads, clients, quotations and people";
    gs.setAttribute("aria-label", gs.placeholder);
  }

  function wireTopbar() {
    document.getElementById("menuBtn").addEventListener("click", function () {
      if (sidebar.getAttribute("data-open") === "true") { closeSidebar(); } else { openSidebar(); }
    });

    document.getElementById("newBtn").addEventListener("click", function () {
      var items = [
        ["listCheck", "New task"], ["megaphone", "New lead"], ["calendarCheck", "Schedule a meeting"],
        ["scale", "New costing sheet"], ["cart", "New purchase request"], ["calendar", "Request leave"]
      ];
      var html = '<div class="menu__label">Create</div>' + items.map(function (i) {
        return '<button type="button" role="menuitem" data-create>' + Icon(i[0], { size: 15 }) + UI.esc(i[1]) + "</button>";
      }).join("");
      showMenu(this, html, function (e) {
        if (e.target.closest("[data-create]")) { UI.toast(DEMO, "lock"); closeMenu(); }
      });
    });

    document.getElementById("globalSearch").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        UI.toast("This is only a demo. Each list has its own search box.", "search");
        this.value = "";
      }
    });

    document.getElementById("langBtn").addEventListener("click", function () {
      var html = '<div class="menu__label">' + UI.esc(t("act.language")) + "</div>" +
        I18n.all().map(function (l) {
          return '<button type="button" role="menuitemradio" data-lang="' + l.code +
            '" aria-checked="' + (l.code === I18n.get()) + '"><span style="min-width:0">' +
            UI.esc(l.meta.native) + '<span class="muted text-2xs" style="display:block">' +
            UI.esc(l.meta.name + " - " + l.meta.dir.toUpperCase()) +
            (l.implemented ? "" : " - not in this demo") + "</span></span></button>";
        }).join("");
      showMenu(this, html, function (e) {
        var b = e.target.closest("[data-lang]");
        if (!b) { return; }
        if (!I18n.set(b.getAttribute("data-lang"))) { UI.toast(t("demo.langOnly"), "globe"); }
        closeMenu();
      });
    });

    document.getElementById("bellBtn").addEventListener("click", function () {
      var html = '<div class="menu__label">' + UI.esc(t("act.notifications")) + "</div>" +
        '<ul class="list" style="min-width:300px;max-width:380px">' +
        D.alerts.map(function (a) {
          return '<li><button type="button" class="menu-alert" data-alert="' + a.route + '">' +
            '<span class="' + UI.cls(["pill", "pill--icon", a.tone && "pill--" + a.tone]) + '">' + Icon(a.icon, { size: 12 }) + "</span>" +
            '<span class="list__body"><span class="list__title">' + UI.esc(a.title) + "</span>" +
            '<span class="list__meta">' + UI.esc(a.meta) + "</span></span></button></li>";
        }).join("") + "</ul>";
      showMenu(this, html, function (e) {
        var b = e.target.closest("[data-alert]");
        if (b) { closeMenu(); go(b.getAttribute("data-alert")); }
      });
    });

    document.getElementById("userBtn").addEventListener("click", function () {
      var u = D.meta.user;
      var html = '<div class="menu__label">' + UI.esc(u.name) + "</div>" +
        '<div style="padding:0 12px 8px;font-size:var(--text-xs);color:var(--ink-muted)">' +
        UI.esc(u.role) + " · " + UI.esc(u.email) + "</div><hr>" +
        '<button type="button" data-demo-only>' + Icon("lock", { size: 15 }) + "Change password</button>" +
        '<a href="index.html">' + Icon("logout", { size: 15 }) + UI.esc(t("act.signOut")) + "</a>";
      showMenu(this, html, function (e) {
        if (e.target.closest("[data-demo-only]")) { UI.toast(DEMO, "lock"); closeMenu(); }
      });
    });

    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (e.key === "Escape") {
        closeMenu();
        if (sidebar.getAttribute("data-open") === "true") {
          closeSidebar();
          document.getElementById("menuBtn").focus();
        }
      }
      if (e.key === "/" && !typing) {
        e.preventDefault();
        document.getElementById("globalSearch").focus();
      }
    });
  }

  I18n.restore();
  paintNav();
  paintTopbar();
  wireTopbar();
  I18n.apply();
  I18n.onChange(function () { paintNav(); paintTopbar(); render(); });

  if (!location.hash) { location.replace("#/" + DEFAULT_ROUTE); }
  render();

  global.App = { go: go, MODULES: MODULES, NAV: NAV };
})(window);
