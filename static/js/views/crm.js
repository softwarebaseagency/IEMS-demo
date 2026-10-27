window.Views = window.Views || {};

/* 03 Leads & clients - a lead is worked until it is qualified and converted;
   a client then has a 360 view of everything raised for it. */
window.Views.crm = function (root, ctx) {
  "use strict";
  var D = DATA;
  var tab = ["leads", "clients", "pipeline"].indexOf(ctx.params.tab) >= 0 ? ctx.params.tab : "leads";

  var counts = {
    new: D.leads.filter(function (l) { return l.status === "new"; }).length,
    qualified: D.leads.filter(function (l) { return l.status === "qualified"; }).length,
    converted: D.leads.filter(function (l) { return l.status === "converted"; }).length
  };

  root.innerHTML =
    UI.pageHead({ moduleNo: "03", title: "Leads & clients",
      lede: "Every enquiry starts as a lead, is qualified when there is real interest, and becomes a client when they sign. Duplicates are caught by email, phone and name before they are saved.",
      actions: UI.btn({ label: "Client information form", icon: "file", demo: "form" }) +
        UI.btn({ label: "New lead", icon: "plus", variant: "primary", demo: "new" }) }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "Open leads", icon: "megaphone", value: String(D.openLeads().length), note: counts.new + " new, " + counts.qualified + " qualified" }) +
      UI.stat({ label: "Pipeline value", icon: "wallet", value: D.compact(D.sum(D.openLeads(), "value")), unit: "USD", delta: 9.1, note: "expected value of open leads" }) +
      UI.stat({ label: "Clients", icon: "building", value: String(D.clients.length), note: D.clients.filter(function (c) { return c.classification === "Key account"; }).length + " key accounts" }) +
      UI.stat({ label: "Lead to client", icon: "trend", value: Math.round(counts.converted / D.leads.length * 100) + "%", delta: 3, deltaUnit: " pt", note: "conversion this year" }) +
    "</div>" +
    UI.tabs([{ id: "leads", label: "Leads (" + D.leads.length + ")" }, { id: "clients", label: "Clients (" + D.clients.length + ")" }, { id: "pipeline", label: "Pipeline" }], tab) +
    '<div id="crmBody"></div>';

  var body = root.querySelector("#crmBody");

  /* ---- Leads ------------------------------------------------------------ */
  function openLead(l) {
    var meetings = D.meetings.filter(function (m) { return m.with === l.company; });
    var steps = [{ t: "Lead captured", m: l.created + " · source: " + l.source + " · by " + l.owner }];
    if (l.status !== "new") { steps.push({ t: l.status === "disqualified" ? "Disqualified" : "Qualified", m: l.status === "disqualified" ? "Not a fit at this time" : "Real interest confirmed: " + l.interest }); }
    if (l.status === "converted") { steps.push({ t: "Converted to a client", m: "Client record and its first opportunity created" }); }
    UI.openDrawer({
      eyebrow: l.ref, title: l.company, sub: l.contact + " · " + l.interest,
      body:
        '<div class="drawer-hero"><div>' + UI.statusPill(l.status) + "</div>" +
          '<div class="drawer-hero__total"><span class="muted text-xs">Expected value</span>' + Iems.money(l.value) + "</div></div>" +
        UI.card({ title: "Lead", body: '<div class="kv">' +
          UI.field("Contact person", l.contact) + UI.field("Interest", l.interest) + UI.field("Source", l.source) +
          UI.field("Owner", l.owner) + UI.field("Captured", l.created) + UI.field("Lawful basis", "Legitimate interest") + "</div>" }) +
        UI.card({ title: "History", body: '<ul class="timeline">' + steps.map(function (s) {
          return '<li><span class="timeline__title">' + UI.esc(s.t) + '</span><span class="timeline__meta">' + UI.esc(s.m) + "</span></li>";
        }).join("") + "</ul>" }) +
        UI.card({ title: "Meetings", flush: true, body: meetings.length ? '<ul class="list">' + meetings.map(meetingRow).join("") + "</ul>"
          : '<p class="card__empty">No meetings yet.</p>' }),
      foot: (l.status === "new" ? UI.btn({ label: "Qualify lead", icon: "check", variant: "primary", demo: "qualify" }) : "") +
        (l.status === "qualified" ? UI.btn({ label: "Convert lead", icon: "swap", variant: "primary", demo: "convert" }) : "") +
        (l.status === "new" || l.status === "qualified" ? UI.btn({ label: "Schedule a meeting", icon: "calendarCheck", demo: "meet" }) +
          UI.btn({ label: "Disqualify", icon: "xCircle", demo: "disqualify" }) : ""),
      onMount: function (node) { UI.wireDemoActions(node); }
    });
  }

  function meetingRow(m) {
    return '<li><span class="' + UI.cls(["pill", "pill--icon", m.state === "held" ? "pill--good" : m.state === "cancelled" ? "pill--critical" : "pill--info"]) + '">' +
      Icon(m.state === "held" ? "checkCircle" : m.state === "cancelled" ? "calendarX" : "calendar", { size: 12 }) + "</span>" +
      '<span class="list__body"><span class="list__title">' + UI.esc(m.title) + "</span>" +
      '<span class="list__meta">' + UI.ltr(m.date) + " · " + UI.esc(m.time) + " · " + UI.esc(m.owner) + "</span></span>" +
      (m.standing ? '<span class="list__aside">' + UI.pill(m.standing, "", "star") + "</span>" : "") + "</li>";
  }

  function leads() {
    body.innerHTML = UI.card({ title: "Leads", sub: "Newest first. Click one to work it.", flush: true, body: '<div id="leadTable"></div>' });
    UI.dataTable(body.querySelector("#leadTable"), {
      rows: D.leads, pageSize: 10, searchPlaceholder: "Search company, contact or reference",
      defaultSort: "ref", defaultDir: "desc",
      columns: [
        { field: "ref", label: "Reference", render: function (r) { return Iems.ref(r.ref); } },
        { field: "company", label: "Company", wrap: true, render: function (r) { return "<b>" + UI.esc(r.company) + '</b><span class="cell-sub">' + UI.esc(r.contact) + "</span>"; } },
        { field: "interest", label: "Interest", wrap: true },
        { field: "source", label: "Source" },
        { field: "value", label: "Value", num: true, render: function (r) { return Iems.money(r.value); } },
        { field: "owner", label: "Owner" },
        { field: "status", label: "Status", sortable: false, render: function (r) { return UI.statusPill(r.status); } }
      ],
      onRow: openLead
    });
  }

  /* ---- Clients ---------------------------------------------------------- */
  function openClient(c) {
    var quotes = D.quotations.filter(function (q) { return q.client === c.name; });
    var invoices = D.invoices.filter(function (i) { return i.client === c.name; });
    var owed = D.sum(invoices.filter(function (i) { return i.status !== "paid"; }), function (i) { return i.amount - i.paid; });
    var won = D.sum(quotes.filter(function (q) { return q.status === "accepted"; }), "total");
    var meetings = D.meetings.filter(function (m) { return m.with === c.name; });
    UI.openDrawer({
      eyebrow: c.ref, title: c.name, sub: c.sector + " · " + c.city + " · client since " + c.since,
      body:
        '<div class="mini-stats">' +
          '<div><span>Won with us</span><b>' + Iems.money(won) + "</b></div>" +
          '<div><span>Owed now</span><b>' + Iems.money(owed) + "</b></div>" +
          '<div><span>Quotations</span><b>' + quotes.length + "</b></div>" +
          '<div><span>Where we stand</span><b>' + UI.statusPill(c.standing) + "</b></div>" +
        "</div>" +
        UI.card({ title: "Client", body: '<div class="kv">' +
          UI.field("Main contact", c.contact) + UI.field("Classification", c.classification) +
          UI.field("Account owner", c.owner) + UI.field("Sector", c.sector) + "</div>" }) +
        UI.card({ title: "Quotations", sub: "Each opens with everything raised from it", flush: true,
          body: quotes.length ? '<ul class="list">' + quotes.map(function (q) {
            return '<li><button type="button" class="list__button" data-quotation="' + q.ref + '"><span class="list__body"><span class="list__title">' + UI.esc(q.title) + "</span>" +
              '<span class="list__meta">' + UI.ltr(q.ref) + " · " + UI.ltr(q.issued) + "</span></span>" +
              '<span class="list__aside list__aside--stack">' + Iems.money(q.total) + '<span class="dots-wrap">' + Iems.dots(q) + "</span></span></button></li>";
          }).join("") + "</ul>" : '<p class="card__empty">No quotations yet.</p>' }) +
        UI.card({ title: "Meetings", flush: true, body: meetings.length ? '<ul class="list">' + meetings.map(meetingRow).join("") + "</ul>"
          : '<p class="card__empty">No meetings recorded.</p>' }),
      foot: UI.btn({ label: "New costing sheet", icon: "scale", variant: "primary", demo: "costing" }) +
        UI.btn({ label: "Schedule a meeting", icon: "calendarCheck", demo: "meet" }),
      onMount: function (node) { UI.wireDemoActions(node); }
    });
  }

  function clients() {
    var rows = D.clients.map(function (c) {
      var quotes = D.quotations.filter(function (q) { return q.client === c.name; });
      return {
        c: c, ref: c.ref, name: c.name, sector: c.sector, owner: c.owner, standing: c.standing,
        quotes: quotes.length, won: D.sum(quotes.filter(function (q) { return q.status === "accepted"; }), "total")
      };
    });
    body.innerHTML = UI.card({ title: "Clients", sub: "The client book. Click one for its 360 view.", flush: true, body: '<div id="clientTable"></div>' });
    UI.dataTable(body.querySelector("#clientTable"), {
      rows: rows, pageSize: 12, searchPlaceholder: "Search client, sector or owner", defaultSort: "won", defaultDir: "desc",
      columns: [
        { field: "name", label: "Client", wrap: true, render: function (r) { return "<b>" + UI.esc(r.name) + '</b><span class="cell-sub">' + UI.ltr(r.ref) + "</span>"; } },
        { field: "sector", label: "Sector" },
        { field: "classification", label: "Class", value: function (r) { return r.c.classification; },
          render: function (r) { return r.c.classification === "Key account" ? UI.statusPill("keyAccount") : '<span class="muted">Standard</span>'; } },
        { field: "owner", label: "Owner" },
        { field: "quotes", label: "Quotations", num: true },
        { field: "won", label: "Won", num: true, render: function (r) { return Iems.money(r.won); } },
        { field: "standing", label: "Where we stand", sortable: false, render: function (r) { return UI.statusPill(r.standing); } }
      ],
      onRow: function (r) { openClient(r.c); }
    });
  }

  /* ---- Pipeline --------------------------------------------------------- */
  function pipeline() {
    var open = D.openLeads().slice().sort(function (a, b) { return b.value - a.value; });
    var stages = D.charts.pipeline;
    var max = Math.max.apply(null, stages.map(function (s) { return s.value; }));
    body.innerHTML =
      '<div class="grid grid--wide">' +
        UI.card({ title: "Pipeline by stage", sub: "Open opportunities, from first qualification to won", body:
          '<div class="stages">' + stages.map(function (s, i) {
            return '<div><div class="stage__top"><span class="stage__name">' + UI.esc(s.name) + "</span>" +
              '<span class="stage__count">' + s.value + '</span><span class="stage__pct">' + Math.round(s.value / max * 100) + "%</span></div>" +
              UI.track(Math.round(s.value / max * 100), i === stages.length - 1 ? "good" : "") + "</div>";
          }).join("") + "</div>" }) +
        UI.chartCard({ id: "leadSrc", title: "Leads by source", sub: "This year" }) +
      "</div>" +
      UI.card({ title: "Biggest open leads", sub: "By expected value", flush: true, body: '<ul class="list">' + open.slice(0, 6).map(function (l) {
        return '<li><span class="list__body"><span class="list__title">' + UI.esc(l.company) + "</span>" +
          '<span class="list__meta">' + UI.esc(l.interest) + " · " + UI.esc(l.owner) + "</span></span>" +
          '<span class="list__aside">' + Iems.money(l.value) + " " + UI.statusPill(l.status) + "</span></li>";
      }).join("") + "</ul>" });
    UI.mountCharts(body, {
      leadSrc: { type: "donut", title: "Leads by source", rows: D.leadSources(), categoryLabel: "Source", valueLabel: "Leads",
        centerValue: String(D.leads.length), centerLabel: "leads", label: Fmt.int }
    });
  }

  var show = { leads: leads, clients: clients, pipeline: pipeline };
  show[tab]();
  UI.wireTabs(root, function (id) { show[id](); UI.wireDemoActions(body); });
};
