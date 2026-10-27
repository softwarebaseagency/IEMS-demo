window.Views = window.Views || {};

/* 06 Finance - money in, and what is still owed. A payment is recorded by one
   person and confirmed by another before its receipt exists; a payment that
   did not come through is taken back, never deleted. */
window.Views.finance = function (root) {
  "use strict";
  var D = DATA;
  var open = D.invoices.filter(function (i) { return i.status !== "paid"; });
  var overdue = open.filter(function (i) { return i.status === "overdue"; });
  var accounts = [
    { name: "Bank account (USD)", value: 41850 },
    { name: "Cash box (USD)",     value: 9320 },
    { name: "FIB wallet",         value: 6140 },
    { name: "Bank account (IQD)", value: 4980 }
  ];

  var PAY_STATE = { verified: "verified", recorded: "recorded", reversed: "reversed" };

  root.innerHTML =
    UI.pageHead({ moduleNo: "06", title: "Finance",
      lede: "Money received and money owed. Recording a payment and confirming it are two different people's jobs, and a payment that did not come through is taken back with its history, never deleted.",
      actions: UI.select({ label: "Period", options: ["October 2026", "September 2026", "This quarter", "This year"], attrs: " data-demo-select" }) +
        UI.btn({ label: "Export", icon: "download", demo: "export" }) +
        UI.btn({ label: "Record a payment", icon: "plus", variant: "primary", demo: "record" }) }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "Received this month", icon: "banknote", value: D.compact(D.receivedThisMonth()), unit: "USD", delta: -16.7, note: "confirmed payments", spark: Charts.spark(D.charts.received) }) +
      UI.stat({ label: "Outstanding", icon: "receipt", value: D.compact(D.outstanding()), unit: "USD", note: open.length + " invoices open" }) +
      UI.stat({ label: "Overdue", icon: "alert", value: D.compact(D.sum(overdue, function (i) { return i.amount - i.paid; })), unit: "USD", goodWhen: "down", delta: -40, note: overdue.length + " invoice past its due date" }) +
      UI.stat({ label: "Cash and bank", icon: "wallet", value: D.compact(D.sum(accounts, "value")), unit: "USD", delta: 6.3, note: "across four accounts" }) +
    "</div>" +
    '<div class="grid grid--wide">' +
      UI.card({ title: "Payment register", sub: "Newest first · click one for who recorded and who confirmed it", flush: true, body: '<div id="payTable"></div>' }) +
      '<div class="stack">' +
        UI.chartCard({ id: "aging", title: "What clients owe, by age", sub: "USD" }) +
        UI.chartCard({ id: "accounts", title: "Cash by account", sub: "Balances today" }) +
      "</div>" +
    "</div>" +
    UI.card({ title: "Open invoices", sub: "Unpaid and overdue, oldest due first", flush: true, body: '<ul class="list">' + open.map(function (i) {
      return '<li><button type="button" class="list__button" data-doc="' + i.ref + '"><span class="list__body"><span class="list__title">' + UI.esc(i.client) + "</span>" +
        '<span class="list__meta">' + UI.ltr(i.ref) + " · " + UI.esc(i.label) + " · due " + UI.ltr(i.due) + "</span></span>" +
        '<span class="list__aside">' + Iems.money(i.amount - i.paid) + " " + UI.statusPill(i.status) + "</span></button></li>";
    }).join("") + "</ul>" });

  UI.dataTable(root.querySelector("#payTable"), {
    rows: D.payments, pageSize: 8, searchPlaceholder: "Search reference, client or invoice", defaultSort: "ref", defaultDir: "desc",
    columns: [
      { field: "ref", label: "Payment", render: function (r) { return Iems.ref(r.ref); } },
      { field: "client", label: "From", wrap: true, render: function (r) { return "<b>" + UI.esc(r.client) + '</b><span class="cell-sub">' + UI.ltr(r.invoice) + "</span>"; } },
      { field: "amount", label: "Amount", num: true, render: function (r) { return Iems.money(r.amount); } },
      { field: "status", label: "Status", sortable: false, render: function (r) { return UI.statusPill(PAY_STATE[r.status]); } }
    ],
    onRow: function (p) {
      UI.openDrawer({
        eyebrow: p.ref, title: Fmt.int(p.amount) + " USD from " + p.client, sub: p.method + " into " + p.account,
        body:
          '<div class="drawer-hero"><div>' + UI.statusPill(PAY_STATE[p.status]) + "</div>" +
            '<div class="drawer-hero__total"><span class="muted text-xs">Amount</span>' + Iems.money(p.amount) + "</div></div>" +
          (p.note ? UI.notice({ tone: "critical", icon: "undo", title: "Taken back", text: p.note }) : "") +
          UI.card({ title: "Payment", body: '<div class="kv">' +
            UI.field("Date", p.date) + UI.field("Against invoice", p.invoice) + UI.field("Method", p.method) + UI.field("Into", p.account) +
            UI.field("Recorded by", p.recordedBy) + UI.field("Confirmed by", p.verifiedBy, p.status === "recorded" ? "Waiting for a second person" : "") + "</div>" }) +
          (p.receipt ? UI.card({ title: "Receipt", body: '<p class="text-sm">' + UI.btn({ label: "Preview " + p.receipt, icon: "eye", size: "sm", attrs: ' data-doc="' + p.receipt + '"' }) + "</p>" }) : ""),
        foot: p.status === "recorded" ? UI.btn({ label: "Confirm it reached the bank", icon: "check", variant: "primary", demo: "verify" }) :
          p.status === "verified" ? UI.btn({ label: "Take the payment back", icon: "undo", demo: "reverse" }) : "",
        onMount: function (node) { UI.wireDemoActions(node); }
      });
    }
  });

  UI.mountCharts(root, {
    aging: { type: "bars", title: "What clients owe, by age", rows: D.aging(), ordinal: true, categoryLabel: "Age", valueLabel: "USD",
      labelWidth: 92, label: function (v) { return Fmt.int(v); } },
    accounts: { type: "donut", title: "Cash by account", rows: accounts, categoryLabel: "Account", valueLabel: "USD",
      centerValue: D.compact(D.sum(accounts, "value")), centerLabel: "USD", label: function (v) { return Fmt.int(v); } }
  });

  root.querySelectorAll("[data-demo-select]").forEach(function (s) {
    s.addEventListener("change", function () { this.selectedIndex = 0; UI.toast(Iems.DEMO, "lock"); });
  });
};
