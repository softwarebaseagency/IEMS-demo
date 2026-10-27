window.Views = window.Views || {};

/* 11 Reports - the company's numbers in one place. Every KPI has an owner, a
   source and a time it was last worked out, so a stale figure says so instead
   of passing for today's. */
window.Views.reports = function (root) {
  "use strict";
  var D = DATA, C = D.charts;
  var won = D.revenueByDivision();
  var accepted = D.sum(C.quotesAccepted.map(function (v) { return { v: v }; }), "v");
  var issued = D.sum(C.quotesIssued.map(function (v) { return { v: v }; }), "v");

  var KPIS = [
    { name: "Money received",       value: D.compact(D.receivedThisMonth()) + " USD", target: "60K USD",  owner: "Sara Fattah",   source: "Finance · confirmed payments", fresh: "10:30 today",  state: "warn" },
    { name: "Quotation win rate",   value: Math.round(accepted / issued * 100) + "%", target: "55%",     owner: "Lana Qadir",    source: "Quotations · decided",          fresh: "10:30 today",  state: "good" },
    { name: "Average margin",       value: (D.costings.reduce(function (t, c) { return t + c.margin; }, 0) / D.costings.length).toFixed(1) + "%", target: "36%", owner: "Hemin Darwesh", source: "Costing sheets", fresh: "10:30 today", state: "good" },
    { name: "Days to get paid",     value: "18 days", target: "21 days",  owner: "Sara Fattah",   source: "Invoices and receipts",         fresh: "10:30 today",  state: "good" },
    { name: "On-time delivery",     value: "88%",     target: "90%",      owner: "Bryar Hama",    source: "Projects · quality review",     fresh: "Yesterday 23:00", state: "warn" },
    { name: "Attendance rate",      value: "96.1%",   target: "95%",      owner: "Tara Mahmood",  source: "Door device",                   fresh: "10:40 today",  state: "good" },
    { name: "Meeting reports on time", value: "92%",  target: "100%",     owner: "Lana Qadir",    source: "Meetings",                      fresh: "10:30 today",  state: "warn" },
    { name: "Client satisfaction",  value: "4.6 / 5", target: "4.5 / 5",  owner: "Lana Qadir",    source: "Survey after delivery",         fresh: "3 days ago",   state: "stale" }
  ];
  var TONE = { good: ["On target", "good", "checkCircle"], warn: ["Below target", "warning", "alert"], stale: ["Out of date", "", "history"] };

  root.innerHTML =
    UI.pageHead({ moduleNo: "11", title: "Reports",
      lede: "The company's numbers in one place. Each KPI has an owner, a source and the time it was last worked out, so an old figure says so instead of passing for today's.",
      actions: UI.select({ label: "Period", options: ["Last 6 months", "This quarter", "This year"], attrs: " data-demo-select" }) +
        UI.btn({ label: "Board pack", icon: "file", demo: "pack" }) +
        UI.btn({ label: "Export to Excel", icon: "download", variant: "primary", demo: "export" }) }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "Received, 6 months", icon: "banknote", value: D.compact(D.sum(C.received.map(function (v) { return { v: v }; }), "v")), unit: "USD", delta: 14.2, note: "against the 6 before", spark: Charts.spark(C.received) }) +
      UI.stat({ label: "Won this year", icon: "checkCircle", value: D.compact(D.sum(won, "value")), unit: "USD", delta: 22.5, note: "accepted quotations" }) +
      UI.stat({ label: "Quotations issued", icon: "file", value: String(issued), delta: 8, deltaUnit: "", note: "last 6 months", spark: Charts.spark(C.quotesIssued, { color: Charts.seriesColor(2) }) }) +
      UI.stat({ label: "KPIs on target", icon: "trend", value: KPIS.filter(function (k) { return k.state === "good"; }).length + "/" + KPIS.length, note: "1 is out of date" }) +
    "</div>" +
    '<div class="grid grid--pair">' +
      UI.chartCard({ id: "division", title: "Won by division", sub: "Accepted quotations this year · USD" }) +
      UI.chartCard({ id: "quotes", title: "Quotations issued and accepted", sub: "Per month" }) +
      UI.chartCard({ id: "received", title: "Money received", sub: "Confirmed payments per month · USD" }) +
      UI.chartCard({ id: "attendance", title: "Attendance rate", sub: "% of working days present, per month" }) +
    "</div>" +
    UI.chartCard({ id: "activity", title: "Lead activity", sub: "Calls, meetings and messages logged per day, last five weeks" }) +
    UI.card({ title: "KPI catalogue", sub: "What is measured, who owns it and how fresh it is", flush: true,
      body: '<div class="tablewrap"><table class="data"><thead><tr><th scope="col">KPI</th><th scope="col" class="num">Now</th><th scope="col" class="num">Target</th>' +
        '<th scope="col">Owner</th><th scope="col">Worked out</th><th scope="col">Status</th></tr></thead><tbody>' +
        KPIS.map(function (k) {
          var tone = TONE[k.state];
          return '<tr><td class="wrap"><b>' + UI.esc(k.name) + '</b><span class="cell-sub">' + UI.esc(k.source) + "</span></td>" +
            '<td class="num"><b>' + UI.esc(k.value) + '</b></td><td class="num muted">' + UI.esc(k.target) + "</td>" +
            "<td>" + UI.esc(k.owner) + "</td><td>" + UI.esc(k.fresh) + "</td><td>" + UI.pill(tone[0], tone[1], tone[2]) + "</td></tr>";
        }).join("") + "</tbody></table></div>" });

  UI.mountCharts(root, {
    division: { type: "bars", title: "Won by division", rows: won, categoryLabel: "Division", valueLabel: "USD", labelWidth: 132,
      label: function (v) { return Fmt.int(v); } },
    quotes: { type: "columns", title: "Quotations issued and accepted", categories: C.months,
      series: [{ name: "Issued", label: "Issued", values: C.quotesIssued }, { name: "Accepted", label: "Accepted", values: C.quotesAccepted }],
      categoryLabel: "Month", stacked: false, summary: "Between five and ten quotations are accepted each month, about 60% of those issued.", label: Fmt.int },
    received: { type: "line", title: "Money received", categories: C.months, area: true,
      series: [{ name: "Received", label: "Received", values: C.received }], categoryLabel: "Month",
      summary: "Receipts peaked at 70K in September; October stands at 59K with two invoices still open.",
      label: function (v) { return D.compact(v); } },
    attendance: { type: "line", title: "Attendance rate", categories: C.months,
      series: [{ name: "Attendance", label: "Attendance", values: C.attendanceRate }], categoryLabel: "Month",
      unit: "%", zeroBased: false, target: 95, targetLabel: "Target",
      summary: "Attendance has risen from 93.1% in May to 96.1% in October.",
      label: function (v) { return Fmt.dec(v) + "%"; } },
    activity: { type: "heatmap", title: "Lead activity", columns: C.leadActivity.columns, rows: C.leadActivity.rows,
      rowLabel: "Week", valueLabel: "Activities", label: Fmt.int }
  });

  root.querySelectorAll("[data-demo-select]").forEach(function (s) {
    s.addEventListener("change", function () { this.selectedIndex = 0; UI.toast(Iems.DEMO, "lock"); });
  });
};
