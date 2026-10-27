window.Views = window.Views || {};

/* 10 People - the directory and the organisation it hangs from. Each person
   has one job role, which decides what they may see and do; the org chart is
   branches, then units, then the person who heads each. */
window.Views.people = function (root, ctx) {
  "use strict";
  var D = DATA;
  var tab = ctx.params.tab === "org" ? "org" : "directory";

  function sheetOf(name) { return D.sheet.filter(function (r) { return r.name === name; })[0]; }
  function tally(name) {
    var row = sheetOf(name), out = { present: 0, late: 0, absent: 0, leave: 0 };
    if (!row) { return out; }
    row.days.forEach(function (s) { if (out[s] !== undefined) { out[s] += 1; } });
    return out;
  }
  function boardOf(name) { return D.todayBoard.filter(function (b) { return b.name === name; })[0] || {}; }

  var branches = D.org.branches.length;
  var units = D.org.branches.reduce(function (t, b) { return t + b.units.length; }, 0);

  root.innerHTML =
    UI.pageHead({ moduleNo: "10", title: "People",
      lede: "Everyone at " + D.meta.org + ", where they sit in the organisation and the one job role that decides what each person may see and do.",
      actions: UI.btn({ label: "Export the directory", icon: "download", demo: "export" }) +
        UI.btn({ label: "Enrol a person", icon: "plus", variant: "primary", demo: "enrol" }) }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "People", icon: "users", value: String(D.people.length), delta: 1, deltaUnit: "", note: "joined in October" }) +
      UI.stat({ label: "Branches", icon: "branch", value: String(branches), note: units + " units between them" }) +
      UI.stat({ label: "On leave today", icon: "calendar", value: String(D.todayBoard.filter(function (p) { return p.state === "leave"; }).length), note: "back on Thursday" }) +
      UI.stat({ label: "Leave requests", icon: "inbox", value: "1", note: "waiting in approvals" }) +
    "</div>" +
    UI.tabs([{ id: "directory", label: "Directory (" + D.people.length + ")" }, { id: "org", label: "Organisation chart" }], tab) +
    '<div id="pplBody"></div>';

  var body = root.querySelector("#pplBody");

  function directory() {
    body.innerHTML = UI.card({ title: "Directory", sub: "Click a person for their record, role and this month's attendance", flush: true, body: '<div id="pTable"></div>' });
    UI.dataTable(body.querySelector("#pTable"), {
      rows: D.people, pageSize: 14, searchPlaceholder: "Search name, role or division", defaultSort: "id",
      columns: [
        { field: "name", label: "Name", render: function (p) { return UI.person(p.name, p.role); } },
        { field: "id", label: "Employee", render: function (p) { return Iems.ref(p.ref); } },
        { field: "division", label: "Division" },
        { field: "jobRole", label: "Job role", render: function (p) { return UI.pill(p.jobRole, p.jobRole === "Founder & CEO" ? "brand" : "", "shield"); } },
        { field: "branch", label: "Branch" },
        { field: "state", label: "Today", sortable: false, searchable: false, render: function (p) { return UI.statusPill(boardOf(p.name).state); } }
      ],
      onRow: openPerson
    });
  }

  function openPerson(p) {
    var t = tally(p.name), b = boardOf(p.name), role = D.roles.filter(function (r) { return r.name === p.jobRole; })[0];
    UI.openDrawer({
      eyebrow: p.ref, title: p.name, sub: p.role + " · " + p.division,
      body:
        '<div class="drawer-hero"><div>' + UI.person(p.name, p.email, "lg") + "</div><div>" + UI.statusPill(b.state) + "</div></div>" +
        UI.card({ title: "Record", body: '<div class="kv">' +
          UI.field("Division", p.division) + UI.field("Branch", p.branch) + UI.field("With us since", p.since) +
          UI.field("Door device ID", String(p.device)) + UI.field("First punch today", b.firstIn || "", b.note || "") + "</div>" }) +
        UI.card({ title: "October so far", body: '<div class="mini-stats">' +
          "<div><span>Present</span><b>" + t.present + "</b></div>" +
          "<div><span>Late</span><b>" + t.late + "</b></div>" +
          "<div><span>Absent</span><b>" + t.absent + "</b></div>" +
          "<div><span>On leave</span><b>" + t.leave + "</b></div></div>" }) +
        (role ? UI.card({ title: "Job role · " + role.name, body: '<p class="text-sm">' + UI.esc(role.summary) + "</p>" +
          '<p class="chips">' + role.scope.map(function (s) { return UI.pill(s, "", "check"); }).join("") + "</p>" }) : ""),
      foot: UI.btn({ label: "Edit the record", icon: "pencil", variant: "primary", demo: "edit" }) + UI.btn({ label: "Attendance sheet", icon: "clock", attrs: ' data-go="attendance"' }),
      onMount: function (node) { UI.wireDemoActions(node); }
    });
  }

  function org() {
    body.innerHTML = UI.card({ title: D.org.name, sub: "Legal entity, then branches, then units and who heads each", body:
      '<div class="org">' +
        '<div class="org__root"><span class="org__mark">' + Icon("building", { size: 18 }) + "</span><b>" + UI.esc(D.org.name) + "</b>" +
          '<span class="muted text-xs">' + D.people.length + " people · " + branches + " branches</span></div>" +
        '<div class="org__branches">' + D.org.branches.map(function (br) {
          return '<section class="org__branch"><header class="org__branchhead">' + Icon("branch", { size: 15 }) +
            "<b>" + UI.esc(br.name) + '</b><span class="muted text-xs">' + UI.esc(br.city) + "</span></header>" +
            '<ul class="org__units">' + br.units.map(function (u) {
              var headcount = D.people.filter(function (p) { return p.division === u.name && p.branch === br.name; }).length;
              var head = D.person(u.head) || {};
              return '<li><button type="button" class="org__unit" data-person="' + UI.esc(u.head) + '">' +
                '<span class="org__unitname">' + UI.esc(u.name) + '</span>' + UI.person(u.head, head.role || "", "sm") +
                '<span class="org__count">' + Icon("users", { size: 12 }) + headcount + "</span></button></li>";
            }).join("") + "</ul></section>";
        }).join("") + "</div></div>" });
  }

  body.addEventListener("click", function (e) {
    var u = e.target.closest("[data-person]");
    if (u) { openPerson(D.person(u.getAttribute("data-person"))); }
  });

  var show = { directory: directory, org: org };
  show[tab]();
  UI.wireTabs(root, function (id) { show[id](); });
};
