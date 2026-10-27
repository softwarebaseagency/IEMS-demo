window.Views = window.Views || {};

/* 05 Quotations - one row per job: the quotation and how far it has gone.
   Every quotation starts from a costing sheet; what it became (invoices,
   receipts, the delivery note) hangs off it. */
window.Views.commercial = function (root, ctx) {
  "use strict";
  var D = DATA;
  var tab = ["quotations", "documents", "costings"].indexOf(ctx.params.tab) >= 0 ? ctx.params.tab : "quotations";
  var accepted = D.quotations.filter(function (q) { return q.status === "accepted"; });
  var decided = D.quotations.filter(function (q) { return q.status === "accepted" || q.status === "declined"; });
  var margin = D.costings.reduce(function (t, c) { return t + c.margin; }, 0) / D.costings.length;

  root.innerHTML =
    UI.pageHead({ moduleNo: "05", title: "Quotations & documents",
      lede: "Every quotation starts as a costing sheet, is approved by a second person, and then carries its invoices, receipts and delivery note with it. Documents print on the company's own stationery.",
      actions: UI.btn({ label: "Letterhead", icon: "file", demo: "letterhead" }) +
        UI.btn({ label: "New costing sheet", icon: "scale", variant: "primary", demo: "new" }) }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "Standing offers", icon: "file", value: D.compact(D.sum(D.standingOffers(), "total")), unit: "USD", note: D.standingOffers().length + " quotations still open" }) +
      UI.stat({ label: "Won this year", icon: "checkCircle", value: D.compact(D.sum(accepted, "total")), unit: "USD", delta: 22.5, note: accepted.length + " accepted quotations" }) +
      UI.stat({ label: "Win rate", icon: "trend", value: Math.round(accepted.length / decided.length * 100), unit: "%", delta: 4, deltaUnit: " pt", note: "of decided quotations" }) +
      UI.stat({ label: "Average margin", icon: "percent", value: margin.toFixed(1), unit: "%", delta: 1.2, deltaUnit: " pt", note: "from the costing sheets" }) +
    "</div>" +
    UI.tabs([{ id: "quotations", label: "Quotations (" + D.quotations.length + ")" }, { id: "documents", label: "All documents" }, { id: "costings", label: "Costing sheets (" + D.costings.length + ")" }], tab) +
    '<div id="comBody"></div>';

  var body = root.querySelector("#comBody");

  function quotations() {
    body.innerHTML = UI.card({ title: "Quotations", sub: "Dots, left to right: issued · accepted · invoiced · paid · delivered. Open one to see everything raised from it.",
      flush: true, body: '<div id="qTable"></div>' });
    UI.dataTable(body.querySelector("#qTable"), {
      rows: D.quotations, pageSize: 10, searchPlaceholder: "Search reference, title or client", defaultSort: "ref", defaultDir: "desc",
      columns: [
        { field: "ref", label: "Quotation", render: function (r) { return Iems.ref(r.ref); } },
        { field: "title", label: "Job", wrap: true, render: function (r) { return "<b>" + UI.esc(r.title) + '</b><span class="cell-sub">' + UI.esc(r.client) + "</span>"; } },
        { field: "owner", label: "Owner" },
        { field: "total", label: "Total", num: true, render: function (r) { return Iems.money(r.total); } },
        { field: "stage", label: "How far it has gone", sortable: true, searchable: false, render: function (r) { return Iems.dots(r); } },
        { field: "status", label: "Status", sortable: false, render: function (r) { return Iems.quotationPill(r); } }
      ],
      onRow: function (r) { Iems.openQuotation(r); }
    });
  }

  var TYPE_ICON = { "Quotation": "file", "Invoice": "receipt", "Receipt": "checkCircle", "Delivery note": "truck", "Purchase order": "cart" };

  function documents() {
    var rows = D.documents();
    body.innerHTML = UI.card({ title: "All documents", sub: "Quotations, invoices, receipts, delivery notes and purchase orders, each with a permanent reference.",
      flush: true, body: '<div id="dTable"></div>' });
    UI.dataTable(body.querySelector("#dTable"), {
      rows: rows, pageSize: 12, searchPlaceholder: "Search reference, type or client", defaultSort: "ref", defaultDir: "desc",
      columns: [
        { field: "ref", label: "Reference", render: function (r) { return Iems.ref(r.ref); } },
        { field: "type", label: "Type", render: function (r) { return '<span class="doctype">' + Icon(TYPE_ICON[r.type] || "file", { size: 14 }) + UI.esc(r.type) + "</span>"; } },
        { field: "client", label: "Client or supplier", wrap: true },
        { field: "date", label: "Date" },
        { field: "amount", label: "Amount", num: true, render: function (r) { return r.amount ? Iems.money(r.amount) : '<span class="muted">-</span>'; } },
        { field: "status", label: "Status", sortable: false, render: function (r) {
          return r.type === "Quotation" ? Iems.quotationPill(D.quotation(r.ref)) : UI.statusPill(r.status);
        } }
      ],
      onRow: function (r) {
        if (r.type === "Quotation" || r.type === "Invoice" || r.type === "Receipt") { Iems.openPaper(r.ref); }
        else { UI.toast(r.type + " previews are not in this demo.", "file"); }
      }
    });
  }

  function costings() {
    body.innerHTML = UI.card({ title: "Costing sheets", sub: "What a job costs us beside what the client is charged. Approving a sheet raises its quotation.",
      flush: true, body: '<div id="cTable"></div>' });
    UI.dataTable(body.querySelector("#cTable"), {
      rows: D.costings, pageSize: 12, searchPlaceholder: "Search reference, job or client", defaultSort: "ref", defaultDir: "desc",
      columns: [
        { field: "ref", label: "Costing", render: function (r) { return Iems.ref(r.ref); } },
        { field: "title", label: "Job", wrap: true, render: function (r) { return "<b>" + UI.esc(r.title) + '</b><span class="cell-sub">' + UI.esc(r.client) + "</span>"; } },
        { field: "cost", label: "It costs us", num: true, render: function (r) { return Iems.money(r.cost); } },
        { field: "sell", label: "We sell for", num: true, render: function (r) { return Iems.money(r.sell); } },
        { field: "profit", label: "Profit", num: true, render: function (r) { return '<span class="pos">' + Iems.money(r.profit) + "</span>"; } },
        { field: "margin", label: "Margin", num: true, render: function (r) {
          return '<span class="margin">' + UI.track(Math.min(100, r.margin * 2), r.margin >= 38 ? "good" : r.margin >= 32 ? "" : "warn") + "<b>" + r.margin + "%</b></span>";
        } },
        { field: "status", label: "Status", sortable: false, render: function (r) { return UI.statusPill(r.status === "pending" ? "pending" : r.status === "closed" ? "closed" : "approved"); } }
      ],
      onRow: openCosting
    });
  }

  function openCosting(c) {
    UI.openDrawer({
      eyebrow: c.ref, title: c.title, sub: c.client + " · " + c.division,
      body:
        '<div class="mini-stats">' +
          "<div><span>It costs us</span><b>" + Iems.money(c.cost) + "</b></div>" +
          "<div><span>We sell for</span><b>" + Iems.money(c.sell) + "</b></div>" +
          "<div><span>Profit</span><b>" + Iems.money(c.profit) + "</b></div>" +
          "<div><span>Margin</span><b>" + c.margin + "%</b></div>" +
        "</div>" +
        UI.chartCard({ id: "breakdown", title: "Where the cost goes", sub: "USD" }) +
        UI.card({ title: "The quotation it raised", body: '<p class="text-sm">' + UI.btn({ label: c.quotation, icon: "file", size: "sm", attrs: ' data-quotation="' + c.quotation + '"' }) +
          ' <span class="muted">Revising the quotation reopens this sheet, and approving it writes the new figures back.</span></p>' }),
      foot: UI.btn({ label: "Open the sheet", icon: "table", variant: "primary", demo: "sheet" }) + UI.btn({ label: "Export", icon: "download", demo: "export" }),
      onMount: function (node) {
        UI.wireDemoActions(node);
        UI.mountCharts(node, { breakdown: { type: "bars", title: "Where the cost goes", rows: c.breakdown.slice().sort(function (a, b) { return b.value - a.value; }),
          categoryLabel: "Cost", valueLabel: "USD", labelWidth: 104, label: function (v) { return Fmt.int(v); } } });
      }
    });
  }

  var show = { quotations: quotations, documents: documents, costings: costings };
  show[tab]();
  UI.wireTabs(root, function (id) { show[id](); });
};
