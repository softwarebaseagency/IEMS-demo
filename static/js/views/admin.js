window.Views = window.Views || {};

/* 12 Admin & audit - job roles, who holds them, and the audit trail. Every
   change is written to a hash chain: each event carries the fingerprint of
   the one before, so an edited or deleted event breaks the chain and shows. */
window.Views.admin = function (root, ctx) {
  "use strict";
  var D = DATA;
  var tab = ["roles", "access", "audit"].indexOf(ctx.params.tab) >= 0 ? ctx.params.tab : "roles";

  root.innerHTML =
    UI.pageHead({ moduleNo: "12", title: "Admin & audit",
      lede: "Who may do what, and a record of everything that was done. A job role is a set of permissions; every change anyone makes is written to an audit trail that cannot be edited.",
      actions: UI.btn({ label: "Verify the chain", icon: "shield", attrs: " data-verify" }) +
        UI.btn({ label: "Enrol a person", icon: "plus", variant: "primary", demo: "enrol" }) }) +
    UI.notice({ tone: "info", icon: "shield", title: "Audit chain verified · " + Fmt.int(D.audit[0].seq) + " events",
      text: "Checked tonight at 02:00 and again at 10:00. Every event still matches the fingerprint of the one before it.",
      aside: UI.pill("Intact", "good", "checkCircle") }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "Job roles", icon: "shield", value: String(D.roles.length), note: "each a set of permissions" }) +
      UI.stat({ label: "Active accounts", icon: "users", value: String(D.people.length), note: "one per person, no shared logins" }) +
      UI.stat({ label: "Events today", icon: "history", value: "38", note: "written to the audit trail" }) +
      UI.stat({ label: "Last backup", icon: "database", value: "02:00", note: "verified, kept off the server" }) +
    "</div>" +
    UI.tabs([{ id: "roles", label: "Job roles" }, { id: "access", label: "Who has access" }, { id: "audit", label: "Audit trail" }], tab) +
    '<div id="admBody"></div>';

  var body = root.querySelector("#admBody");

  function roles() {
    body.innerHTML = '<div class="stack"><div class="grid grid--3">' + D.roles.map(function (r) {
      var holders = D.people.filter(function (p) { return p.jobRole === r.name; });
      return UI.card({ className: "rolecard", body:
        '<div class="rolecard__head"><span class="rolecard__icon">' + Icon(r.icon, { size: 18 }) + "</span>" +
          '<div><h2 class="card__title">' + UI.esc(r.name) + '</h2><p class="card__sub">' + holders.length + (holders.length === 1 ? " person" : " people") + "</p></div></div>" +
        '<p class="text-sm">' + UI.esc(r.summary) + "</p>" +
        '<p class="chips">' + r.scope.map(function (s) { return UI.pill(s, "", "check"); }).join("") + "</p>" +
        '<div class="rolecard__people">' + holders.map(function (p) { return '<span title="' + UI.esc(p.name) + '">' + UI.avatar(p.name, "sm") + "</span>"; }).join("") + "</div>" });
    }).join("") + "</div>" +
    UI.notice({ tone: "brand", icon: "lock", title: "The two-person rule",
      text: "Whoever raises a quotation, a purchase request or a payment cannot also approve it. The system refuses, even for the CEO's own records." }) + "</div>";
  }

  function access() {
    var rows = D.people.map(function (p) {
      return { name: p.name, role: p.role, jobRole: p.jobRole, email: p.email, last: p.name === "Shilan Kareem" ? "Now" : p.name === "Soma Rasul" ? "Thu 22 Oct" : "Today",
        reads: p.name === "Rawa Jalal" ? "From 1 Oct 2026" : "Everything" };
    });
    body.innerHTML = UI.card({ title: "Who has access", sub: "One account per person. A reading floor hides records older than a date from that person.", flush: true, body: '<div id="aTable"></div>' });
    UI.dataTable(body.querySelector("#aTable"), {
      rows: rows, pageSize: 14, searchPlaceholder: "Search name, email or role", defaultSort: "name",
      columns: [
        { field: "name", label: "Person", render: function (r) { return UI.person(r.name, r.email); } },
        { field: "jobRole", label: "Job role", render: function (r) { return UI.pill(r.jobRole, r.jobRole === "Founder & CEO" ? "brand" : "", "shield"); } },
        { field: "reads", label: "May read", render: function (r) { return r.reads === "Everything" ? '<span class="muted">All records</span>' : UI.pill(r.reads, "warning", "eyeOff"); } },
        { field: "last", label: "Last signed in" },
        { field: "status", label: "Account", sortable: false, searchable: false, render: function () { return UI.statusPill("active"); } }
      ],
      onRow: function (r) {
        UI.openDrawer({
          eyebrow: "Account", title: r.name, sub: r.role,
          body: UI.card({ title: "Access", body: '<div class="kv">' + UI.field("Sign-in email", r.email) + UI.field("Job role", r.jobRole) +
              UI.field("May read", r.reads === "Everything" ? "All records" : "Records from " + r.reads.replace("From ", ""), r.reads === "Everything" ? "" : "Older records are hidden from this person; their own work is always visible.") +
              UI.field("Last signed in", r.last) + "</div>" }) +
            UI.notice({ tone: "info", icon: "history", title: "Every change here is audited", text: "Granting or removing a role, or moving the reading floor, writes an event to the audit trail with who did it." }),
          foot: UI.btn({ label: "Change the job role", icon: "shield", variant: "primary", demo: "role" }) + UI.btn({ label: "Reset password", icon: "key", demo: "reset" }),
          onMount: function (node) { UI.wireDemoActions(node); }
        });
      }
    });
  }

  function audit() {
    body.innerHTML = UI.card({ title: "Audit trail", sub: "Newest first. Each event's fingerprint is worked out from its content and the event before it.", flush: true, body: '<div id="auTable"></div>' });
    UI.dataTable(body.querySelector("#auTable"), {
      rows: D.audit, pageSize: 12, searchPlaceholder: "Search person, action or record", defaultSort: "seq", defaultDir: "desc",
      columns: [
        { field: "seq", label: "#", num: true, render: function (r) { return '<span class="ref">' + Fmt.int(r.seq) + "</span>"; } },
        { field: "when", label: "When" },
        { field: "who", label: "Who", render: function (r) { return r.who === "System" ? '<span class="muted">' + Icon("settings", { size: 12 }) + " System</span>" : UI.esc(r.who); } },
        { field: "action", label: "Action", render: function (r) { return '<code class="code">' + UI.esc(r.action) + "</code>"; } },
        { field: "target", label: "Record", render: function (r) { return Iems.ref(r.target); } },
        { field: "hash", label: "Fingerprint", sortable: false, render: function (r) { return '<span class="hash">' + Icon("lock", { size: 11 }) + UI.esc(r.hash) + "…</span>"; } }
      ]
    });
  }

  root.querySelector("[data-verify]").addEventListener("click", function () {
    UI.toast("Chain checked: " + Fmt.int(D.audit[0].seq) + " events, all fingerprints match.", "checkCircle");
  });

  var show = { roles: roles, access: access, audit: audit };
  show[tab]();
  UI.wireTabs(root, function (id) { show[id](); });
};
