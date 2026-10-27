window.Views = window.Views || {};

/* 09 Attendance - read from the door device and judged against each person's
   own calendar. A flagged day asks the person for a word; a wrong record can
   be corrected only through a request a manager decides. */
window.Views.attendance = function (root) {
  "use strict";
  var D = DATA;
  var EXC = { open: "open", explained: "explained", correction: "correction", accepted: "acceptedAsIs" };
  var CELL = {
    present: ["Present", "P"], late: ["Late", "L"], absent: ["Absent", "A"], leave: ["On leave", "V"],
    rest: ["Rest day", ""], pending: ["Not in yet", "?"], none: ["Not employed yet", ""]
  };

  var board = '<ul class="peoplelist">' + D.todayBoard.map(function (p) {
    var person = D.person(p.name) || {};
    return '<li><span class="peoplelist__who">' + UI.person(p.name, person.role || "") + "</span>" +
      '<span class="peoplelist__in">' + (p.firstIn ? Icon("door", { size: 12 }) + UI.ltr(p.firstIn) : '<span class="muted">-</span>') + "</span>" +
      '<span class="peoplelist__state">' + UI.statusPill(p.state) + (p.note ? '<span class="cell-sub">' + UI.esc(p.note) + "</span>" : "") + "</span></li>";
  }).join("") + "</ul>";

  var days = D.octDays;
  var sheet = '<div class="sheet-wrap"><table class="sheet" aria-label="October 2026 attendance">' +
    "<thead><tr><th scope=\"col\" class=\"sheet__name\">Person</th>" + days.map(function (d) {
      return '<th scope="col" class="' + (d.rest ? "is-rest" : "") + (d.day === 27 ? " is-today" : "") + '">' +
        '<span class="sheet__wd">' + ["S", "M", "T", "W", "T", "F", "S"][d.weekday] + "</span>" + d.day + "</th>";
    }).join("") + "</tr></thead><tbody>" +
    D.sheet.map(function (row) {
      return '<tr><th scope="row" class="sheet__name">' + UI.esc(row.name) + "</th>" + row.days.map(function (s, i) {
        var c = CELL[s];
        return '<td class="sheet__cell sheet__cell--' + s + (days[i].day === 27 ? " is-today" : "") + '" title="' + UI.esc(row.name + ", " + days[i].day + " Oct: " + c[0]) + '">' +
          '<span aria-hidden="true">' + c[1] + '</span><span class="sr-only">' + UI.esc(c[0]) + "</span></td>";
      }).join("") + "</tr>";
    }).join("") + "</tbody></table></div>" +
    '<div class="sheet-legend">' + ["present", "late", "absent", "leave", "rest", "pending"].map(function (k) {
      return '<span><i class="sheet__swatch sheet__cell--' + k + '"></i>' + UI.esc(CELL[k][0]) + "</span>";
    }).join("") + "</div>";

  var exceptions = '<ul class="list">' + D.exceptions.map(function (x, i) {
    return '<li><button type="button" class="list__button" data-exception="' + i + '">' +
      '<span class="list__body"><span class="list__title">' + UI.esc(x.person) + " · " + UI.esc(x.kind) + "</span>" +
      '<span class="list__meta">' + UI.ltr(x.date) + " · " + UI.esc(x.detail) + "</span>" +
      (x.explanation ? '<span class="list__quote">' + Icon("message", { size: 12 }) + UI.esc(x.explanation) + "</span>" : "") + "</span>" +
      '<span class="list__aside">' + UI.statusPill(EXC[x.state]) + "</span></button></li>";
  }).join("") + "</ul>";

  root.innerHTML =
    UI.pageHead({ moduleNo: "09", title: "Attendance",
      lede: "Read from the door device every two minutes and judged against each person's own working calendar. A flagged day asks the person for a word; a wrong record is corrected only through a request a manager decides.",
      actions: UI.select({ label: "Month", options: ["October 2026", "September 2026", "August 2026"], attrs: " data-demo-select" }) +
        UI.btn({ label: "Export the sheet", icon: "download", demo: "export" }) }) +
    UI.notice({ tone: "info", icon: "door", title: "Front door reader · online",
      text: "Last read at 10:40 today: 14 punches, nothing missed. Lateness counts after a 10-minute grace; lunch is punched between 12:00 and 14:00.",
      aside: UI.pill("Connected", "good", "checkCircle") }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "In the office now", icon: "building", value: D.inOffice() + "/" + D.todayBoard.length, note: "1 out at a client, 1 on leave" }) +
      UI.stat({ label: "Late today", icon: "clock", value: String(D.todayBoard.filter(function (p) { return p.state === "late"; }).length), goodWhen: "down", delta: -50, note: "after the grace period" }) +
      UI.stat({ label: "Open exceptions", icon: "alert", value: String(D.exceptions.filter(function (x) { return x.state === "open" || x.state === "correction"; }).length), note: "waiting for a word or a decision" }) +
      UI.stat({ label: "Attendance rate", icon: "trend", value: "96.1", unit: "%", delta: 1.2, deltaUnit: " pt", note: "this month", spark: Charts.spark(D.charts.attendanceWeeks, { color: Charts.seriesColor(4) }) }) +
    "</div>" +
    '<div class="grid grid--wide">' +
      UI.card({ title: "Today, " + D.meta.todayShort, sub: "First punch at the door and where each person is now", flush: true, body: board }) +
      '<div class="stack">' +
        UI.card({ title: "Exceptions", sub: "Flagged days and what was said about them", flush: true, body: exceptions }) +
        UI.card({ title: "The working rules", body: '<dl class="meta-list">' +
          '<div class="meta-row"><dt>Working days</dt><dd>Saturday to Thursday</dd></div>' +
          '<div class="meta-row"><dt>Hours</dt><dd>09:00-17:00</dd></div>' +
          '<div class="meta-row"><dt>Grace</dt><dd>10 minutes</dd></div>' +
          '<div class="meta-row"><dt>Lunch</dt><dd>Punched, 12:00-14:00, 60 min</dd></div>' +
          '<div class="meta-row"><dt>Overtime</dt><dd>After 17:30, agreed in advance</dd></div></dl>' }) +
      "</div>" +
    "</div>" +
    UI.card({ title: "October 2026", sub: "One row per person, one column per day · hover a day for its status", body: sheet }) +
    UI.chartCard({ id: "rate", title: "Attendance rate by week", sub: "% of working days present" });

  UI.mountCharts(root, {
    rate: { type: "line", title: "Attendance rate by week", categories: D.charts.weeks,
      series: [{ name: "Attendance", label: "Attendance", values: D.charts.attendanceWeeks }], categoryLabel: "Week",
      unit: "%", zeroBased: false, target: 95, targetLabel: "Target",
      summary: "Attendance has stayed between 93.8% and 96.4%, above the 95% target in four of the last six weeks.",
      label: function (v) { return Fmt.dec(v) + "%"; } }
  });

  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-exception]");
    if (!b) { return; }
    var x = D.exceptions[Number(b.getAttribute("data-exception"))];
    UI.openDrawer({
      eyebrow: x.date, title: x.person + " · " + x.kind, sub: "Judged against " + x.person.split(" ")[0] + "'s own calendar",
      body: '<div class="drawer-hero"><div>' + UI.statusPill(EXC[x.state]) + "</div></div>" +
        UI.card({ title: "What the device recorded", body: '<p class="text-sm">' + UI.esc(x.detail) + "</p>" }) +
        (x.explanation ? UI.card({ title: x.state === "correction" ? "Asked to correct" : "Their explanation", body: '<p class="report-text">' + UI.esc(x.explanation) + "</p>" })
          : UI.notice({ tone: "info", icon: "message", title: "No word yet", text: "The person sees this on their own attendance page and can explain it, or ask for the record to be corrected." })),
      foot: x.state === "correction" ? UI.btn({ label: "Accept the correction", icon: "check", variant: "primary", demo: "correct" }) + UI.btn({ label: "Keep the record", icon: "xCircle", demo: "keep" }) :
        x.state === "open" || x.state === "explained" ? UI.btn({ label: "Accept as it stands", icon: "check", variant: "primary", demo: "accept" }) : "",
      onMount: function (node) { UI.wireDemoActions(node); }
    });
  });

  root.querySelectorAll("[data-demo-select]").forEach(function (s) {
    s.addEventListener("change", function () { this.selectedIndex = 0; UI.toast(Iems.DEMO, "lock"); });
  });
};
