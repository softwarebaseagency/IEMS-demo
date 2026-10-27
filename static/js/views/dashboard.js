window.Views = window.Views || {};

/* 00 Overview - the CEO's morning view: money, pipeline, delivery and people,
   then what needs a decision today. */
window.Views.dashboard = function (root) {
  "use strict";
  var t = I18n.t, D = DATA, C = D.charts;
  var offers = D.standingOffers();
  var inDelivery = D.projects.filter(function (p) { return p.column === "inProgress" || p.column === "review"; });
  var pipelineValue = D.sum(D.openLeads(), "value");

  var kpis = [
    UI.stat({ label: "Received this month", icon: "banknote", value: D.compact(D.receivedThisMonth()), unit: "USD", delta: -16.7,
      note: "vs September", spark: Charts.spark(C.received) }),
    UI.stat({ label: "Outstanding", icon: "receipt", value: D.compact(D.outstanding()), unit: "USD", delta: -8.2, goodWhen: "down",
      note: D.invoices.filter(function (i) { return i.status !== "paid"; }).length + " invoices awaiting payment",
      spark: Charts.spark([21, 24, 19, 26, 18, 16], { color: Charts.seriesColor(5) }) }),
    UI.stat({ label: "Standing offers", icon: "file", value: D.compact(D.sum(offers, "total")), unit: "USD", delta: 12.4,
      note: offers.length + " live quotations", spark: Charts.spark([31, 28, 36, 40, 44, 50], { color: Charts.seriesColor(2) }) }),
    UI.stat({ label: "Open pipeline", icon: "megaphone", value: D.compact(pipelineValue), unit: "USD", delta: 9.1,
      note: D.openLeads().length + " open leads", spark: Charts.spark([180, 192, 210, 205, 231, 248], { color: Charts.seriesColor(3) }) }),
    UI.stat({ label: "In delivery", icon: "layers", value: String(inDelivery.length), unit: "projects", delta: 1, deltaUnit: "",
      note: D.projects.filter(function (p) { return p.health !== "onTrack"; }).length + " need attention" }),
    UI.stat({ label: "In the office", icon: "building", value: D.inOffice() + "/" + D.todayBoard.length, unit: "", delta: 2.4, deltaUnit: " pt",
      note: "read from the door at 10:40", spark: Charts.spark(C.attendanceWeeks, { color: Charts.seriesColor(4) }) })
  ].join("");

  var attention = '<ul class="list">' + [
    { icon: "inbox", tone: "serious", title: D.approvals.length + " approvals are waiting for you", meta: "Quotation, purchase request, payment, leave and an attendance correction", go: "approvals" },
    { icon: "receipt", tone: "critical", title: D.alerts[0].title, meta: D.alerts[0].meta, go: "finance" },
    { icon: "file", tone: "warning", title: "2 quotations expire this week", meta: "Shaqlawa Mountain Lodge (1 Nov) and Sardam Real Estate (9 Nov)", go: "commercial" },
    { icon: "alert", tone: "warning", title: "Ankawa Bistro fit-out is behind", meta: "58% done, due 12 Nov; joinery arrived a week late", go: "projects" },
    { icon: "clock", tone: "info", title: "2 attendance exceptions are open", meta: "Bryar Hama and Nawroz Salih arrived late", go: "attendance" },
    { icon: "calendarCheck", tone: "info", title: "1 meeting report is due today", meta: "Rawa Jalal, intro over coffee at 11:00", go: "meetings" }
  ].map(function (a) {
    return '<li class="list__row-link"><span class="' + UI.cls(["pill", "pill--icon", "pill--" + a.tone]) + '">' + Icon(a.icon, { size: 12 }) + "</span>" +
      '<span class="list__body"><span class="list__title">' + UI.esc(a.title) + '</span><span class="list__meta">' + UI.esc(a.meta) + "</span></span>" +
      '<span class="list__aside">' + UI.btn({ variant: "icon", size: "sm", icon: "chevronRight", label: "Open", attrs: ' data-go="' + a.go + '"' }) + "</span></li>";
  }).join("") + "</ul>";

  var recent = '<ul class="timeline">' + D.audit.slice(0, 6).map(function (a) {
    return '<li><span class="timeline__title">' + UI.esc(a.who) + " · " + UI.esc(a.action.split(".").slice(1).join(" ")) + "</span>" +
      '<span class="timeline__meta">' + UI.ltr(a.target) + " · " + UI.ltr(a.when) + "</span></li>";
  }).join("") + "</ul>";

  var live = '<ul class="list">' + D.quotations.filter(function (q) { return q.status !== "declined"; }).slice(0, 5).map(function (q) {
    return '<li><button type="button" class="list__button" data-quotation="' + q.ref + '">' +
      '<span class="list__body"><span class="list__title">' + UI.esc(q.title) + "</span>" +
      '<span class="list__meta">' + UI.ltr(q.ref) + " · " + UI.esc(q.client) + "</span></span>" +
      '<span class="list__aside list__aside--stack">' + Iems.money(q.total) + '<span class="dots-wrap">' + Iems.dots(q) + "</span></span></button></li>";
  }).join("") + "</ul>";

  root.innerHTML =
    '<section class="welcome">' +
      '<div><p class="welcome__eyebrow">' + UI.esc(D.meta.today) + "</p>" +
        '<h1 class="welcome__title">Good morning, Shilan</h1>' +
        '<p class="welcome__lede">Altun Creative at a glance: what came in, what is owed, what is being delivered and who is in the office. ' +
        "Six things need a decision from you today.</p></div>" +
      '<div class="welcome__actions">' +
        UI.btn({ label: "Open approvals", icon: "inbox", variant: "primary", attrs: ' data-go="approvals"' }) +
        UI.btn({ label: t("act.export"), icon: "download", demo: "export" }) +
      "</div>" +
    "</section>" +
    UI.notice({ tone: "brand", icon: "info", title: t("demo.readOnly"), text: t("demo.noEntry"),
      aside: '<span class="badge">' + Icon("clock", { size: 11 }) + " " + UI.esc(t("t.lastUpdated")) + " " + UI.ltr(D.meta.updated) + "</span>" }) +
    '<div class="grid grid--kpi grid--kpi-6">' + kpis + "</div>" +
    '<div class="grid grid--wide">' +
      UI.chartCard({ id: "received", title: "Money received per month", sub: "Confirmed payments · USD" }) +
      UI.card({ title: "Needs your attention", sub: "Decisions and follow-ups for today", flush: true, body: attention }) +
    "</div>" +
    '<div class="grid grid--3">' +
      UI.chartCard({ id: "quotes", title: "Quotations issued and accepted", sub: "Per month" }) +
      UI.chartCard({ id: "sources", title: "Where leads come from", sub: "All leads this year" }) +
      UI.chartCard({ id: "pipeline", title: "Pipeline by stage", sub: "Open opportunities" }) +
    "</div>" +
    '<div class="grid grid--side">' +
      UI.card({ title: "Recent activity", sub: "From the audit log, newest first", body: recent,
        foot: UI.btn({ label: "Open the audit log", size: "sm", icon: "arrowRight", attrs: ' data-go="admin" data-tab="audit"' }) }) +
      UI.card({ title: "Live quotations", sub: "Dots: issued · accepted · invoiced · paid · delivered", flush: true, body: live,
        foot: UI.btn({ label: "All quotations", size: "sm", icon: "arrowRight", attrs: ' data-go="commercial"' }) }) +
    "</div>";

  UI.mountCharts(root, {
    received: { type: "columns", title: "Money received per month", categories: C.months,
      series: [{ name: "Received", label: "Received", values: C.received }], categoryLabel: "Month",
      summary: "Receipts rose from 38K in May to 70K in September, then eased to 59K in October with two invoices still open.",
      label: function (v) { return D.compact(v); } },
    quotes: { type: "line", title: "Quotations issued and accepted", categories: C.months,
      series: [{ name: "Issued", label: "Issued", values: C.quotesIssued }, { name: "Accepted", label: "Accepted", values: C.quotesAccepted }],
      categoryLabel: "Month", summary: "Roughly two in three quotations are accepted, and both lines climbed through September.", label: Fmt.int },
    sources: { type: "donut", title: "Where leads come from", rows: D.leadSources(), categoryLabel: "Source", valueLabel: "Leads",
      centerValue: String(D.leads.length), centerLabel: "leads", label: Fmt.int },
    pipeline: { type: "bars", title: "Pipeline by stage", rows: C.pipeline, ordinal: true, categoryLabel: "Stage", valueLabel: "Opportunities",
      labelWidth: 96, label: Fmt.int }
  });
};
