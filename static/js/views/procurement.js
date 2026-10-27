window.Views = window.Views || {};

/* 08 Procurement - buying for jobs. A request is approved before it becomes
   an order, and only an approved supplier can be named on one. */
window.Views.procurement = function (root) {
  "use strict";
  var D = DATA;
  var STATE = { draft: "draft", pending: "pending", approved: "approved", ordered: "ordered", received: "received", rejected: "rejected" };
  var SUP = { approved: "approved", pending: "pending", blocked: "blocked" };

  var spend = D.suppliers.filter(function (s) { return s.spend; }).map(function (s) { return { name: s.category, value: s.spend }; })
    .sort(function (a, b) { return b.value - a.value; });

  function stars(r) {
    if (!r) { return '<span class="muted text-xs">Not rated yet</span>'; }
    var full = Math.round(r);
    var html = '<span class="stars" role="img" aria-label="' + r + ' out of 5">';
    for (var i = 1; i <= 5; i += 1) { html += '<span class="' + (i <= full ? "is-on" : "") + '">' + Icon("star", { size: 12 }) + "</span>"; }
    return html + "<b>" + r.toFixed(1) + "</b></span>";
  }

  root.innerHTML =
    UI.pageHead({ moduleNo: "08", title: "Procurement",
      lede: "Buying for the jobs. A purchase request is approved before it becomes an order, and only an approved supplier can be named on one.",
      actions: UI.btn({ label: "Suppliers", icon: "truck", demo: "suppliers" }) + UI.btn({ label: "New purchase request", icon: "plus", variant: "primary", demo: "new" }) }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "Waiting for approval", icon: "inbox", value: String(D.purchases.filter(function (p) { return p.status === "pending"; }).length), note: "over 5,000 USD needs the Operations Director" }) +
      UI.stat({ label: "On order", icon: "truck", value: D.compact(D.sum(D.purchases.filter(function (p) { return p.status === "ordered" || p.status === "approved"; }), "amount")), unit: "USD", note: "approved or ordered" }) +
      UI.stat({ label: "Spend this quarter", icon: "wallet", value: D.compact(D.sum(D.suppliers, "spend")), unit: "USD", delta: 7.8, note: "across " + spend.length + " categories" }) +
      UI.stat({ label: "Approved suppliers", icon: "checkCircle", value: String(D.suppliers.filter(function (s) { return s.status === "approved"; }).length), note: "1 pending, 1 blocked" }) +
    "</div>" +
    UI.card({ title: "Purchase requests", sub: "Newest first", flush: true, body: '<div id="prTable"></div>' }) +
    '<div class="grid grid--wide">' +
      UI.card({ title: "Suppliers", sub: "Rated after every order", flush: true, body: '<ul class="list">' + D.suppliers.map(function (s) {
        return '<li><span class="list__body"><span class="list__title">' + UI.esc(s.name) + "</span>" +
          '<span class="list__meta">' + UI.esc(s.category) + " · " + UI.esc(s.city) + (s.spend ? " · " + Fmt.int(s.spend) + " USD this quarter" : "") + "</span></span>" +
          '<span class="list__aside">' + stars(s.rating) + " " + UI.statusPill(SUP[s.status]) + "</span></li>";
      }).join("") + "</ul>" }) +
      UI.chartCard({ id: "spend", title: "Spend by category", sub: "This quarter · USD" }) +
    "</div>";

  UI.dataTable(root.querySelector("#prTable"), {
    rows: D.purchases, pageSize: 10, searchPlaceholder: "Search request, project or supplier", defaultSort: "ref", defaultDir: "desc",
    columns: [
      { field: "ref", label: "Request", render: function (r) { return Iems.ref(r.ref); } },
      { field: "title", label: "What", wrap: true, render: function (r) { return "<b>" + UI.esc(r.title) + '</b><span class="cell-sub">' + UI.esc(r.project) + "</span>"; } },
      { field: "supplier", label: "Supplier" },
      { field: "by", label: "Requested by" },
      { field: "needed", label: "Needed by" },
      { field: "amount", label: "Amount", num: true, render: function (r) { return Iems.money(r.amount); } },
      { field: "status", label: "Status", sortable: false, render: function (r) { return UI.statusPill(STATE[r.status]); } }
    ],
    onRow: function (r) {
      UI.openDrawer({
        eyebrow: r.ref, title: r.title, sub: r.project + " · " + r.supplier,
        body: '<div class="drawer-hero"><div>' + UI.statusPill(STATE[r.status]) + '</div><div class="drawer-hero__total"><span class="muted text-xs">Amount</span>' + Iems.money(r.amount) + "</div></div>" +
          UI.card({ title: "Request", body: '<div class="kv">' + UI.field("Requested by", r.by) + UI.field("For project", r.project) +
            UI.field("Supplier", r.supplier) + UI.field("Needed by", r.needed) + "</div>" }) +
          (r.status === "rejected" ? UI.notice({ tone: "critical", icon: "xCircle", title: "Rejected", text: "The supplier is blocked; the team uses its own van for crew transport." }) : ""),
        foot: r.status === "pending" ? UI.btn({ label: "Approve", icon: "check", variant: "primary", demo: "approve" }) + UI.btn({ label: "Reject", icon: "xCircle", demo: "reject" }) :
          r.status === "approved" ? UI.btn({ label: "Raise the purchase order", icon: "file", variant: "primary", demo: "po" }) : "",
        onMount: function (node) { UI.wireDemoActions(node); }
      });
    }
  });

  UI.mountCharts(root, {
    spend: { type: "bars", title: "Spend by category", rows: spend, categoryLabel: "Category", valueLabel: "USD", labelWidth: 100,
      label: function (v) { return Fmt.int(v); } }
  });
};
