window.Views = window.Views || {};

/* 04 Meetings - the business developers' diary: day, time and who with, then a
   report on how it went and where we stand. The CEO follows them by grant. */
window.Views.meetings = function (root) {
  "use strict";
  var D = DATA;
  var TODAY = 27;
  var meetings = D.meetings.slice().sort(function (a, b) { return a.day - b.day || a.time.localeCompare(b.time); });

  var MOOD_TONE = { "Very good": "good", "Good": "good", "Mixed": "warning", "Poor": "critical" };

  function chipFor(m) {
    var cls = m.state === "held" ? "mchip--held" : m.state === "cancelled" ? "mchip--off" : "mchip--next";
    return '<button type="button" class="mchip ' + cls + '" data-meeting="' + m.ref + '">' +
      '<span class="mchip__time">' + UI.esc(m.time) + "</span>" + UI.esc(m.with) + "</button>";
  }

  /* October 2026, weeks running Saturday to Friday as the office works. */
  function month() {
    var heads = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    var start = new Date(2026, 8, 26); /* Saturday 26 September */
    var cells = [];
    for (var i = 0; i < 42; i += 1) {
      var day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      var inMonth = day.getMonth() === 9;
      var n = day.getDate();
      var theirs = inMonth ? meetings.filter(function (m) { return m.day === n; }) : [];
      cells.push('<div class="mcal__cell' + (inMonth ? "" : " is-out") + (inMonth && n === TODAY ? " is-today" : "") +
        (day.getDay() === 5 ? " is-rest" : "") + '"><span class="mcal__day">' + n + "</span>" + theirs.map(chipFor).join("") + "</div>");
    }
    return '<div class="mcal" role="grid" aria-label="October 2026">' +
      heads.map(function (h) { return '<div class="mcal__head">' + h + "</div>"; }).join("") + cells.join("") + "</div>";
  }

  function row(m, withDate) {
    return '<li><button type="button" class="list__button" data-meeting="' + m.ref + '">' +
      '<span class="list__body"><span class="list__title">' + UI.esc(m.title) + "</span>" +
      '<span class="list__meta">' + (withDate ? UI.ltr(m.date) + " · " : "") + UI.esc(m.time) + " · " + UI.esc(m.kind === "Name" ? "Not in IEMS yet" : m.kind) +
        " · " + UI.esc(m.with) + " · " + UI.esc(m.owner) + "</span></span>" +
      '<span class="list__aside">' + (m.state === "held" ? UI.pill(m.standing, MOOD_TONE[m.mood] || "", "star") :
        m.state === "cancelled" ? UI.statusPill("cancelled") : UI.statusPill("scheduled")) + "</span></button></li>";
  }

  var coming = meetings.filter(function (m) { return m.state === "scheduled"; });
  var held = meetings.filter(function (m) { return m.state === "held"; }).reverse();

  root.innerHTML =
    UI.pageHead({ moduleNo: "04", title: "Meetings",
      lede: "The diary of meetings with leads, clients and people not in IEMS yet. After each one its owner writes how it went and where we stand; whoever follows them is told.",
      actions: UI.btn({ label: "Who follows whom", icon: "eye", demo: "follow" }) +
        UI.btn({ label: "Schedule a meeting", icon: "plus", variant: "primary", demo: "new" }) }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "This week", icon: "calendarCheck", value: String(coming.length), note: "scheduled, 2 today" }) +
      UI.stat({ label: "Held in October", icon: "checkCircle", value: String(held.length), delta: 20, note: "with a written report" }) +
      UI.stat({ label: "Ready to buy", icon: "star", value: String(held.filter(function (m) { return m.standing === "Ready to buy"; }).length), note: "after their last meeting" }) +
      UI.stat({ label: "Called off", icon: "calendarX", value: String(meetings.filter(function (m) { return m.state === "cancelled"; }).length), note: "each with its reason" }) +
    "</div>" +
    UI.notice({ tone: "info", icon: "eye", title: "You follow Lana Qadir and Rawa Jalal",
      text: "Granted by the CEO, one pair at a time. Without a grant, nobody sees anybody else's meetings, the CEO included." }) +
    '<div class="grid grid--wide">' +
      UI.card({ title: "October 2026", sub: "Saturday to Friday · today is marked", tools:
        '<div class="segmented" role="group" aria-label="Month">' +
          '<button type="button" data-demo-action="prev">' + Icon("chevronLeft", { size: 14 }) + "September</button>" +
          '<button type="button" data-demo-action="next">November' + Icon("chevronRight", { size: 14 }) + "</button></div>",
        body: month() }) +
      UI.card({ title: "Coming up", sub: "Today and the rest of the week", flush: true, body: '<ul class="list">' + coming.map(function (m) { return row(m, true); }).join("") + "</ul>" }) +
    "</div>" +
    UI.card({ title: "Recent reports", sub: "How each meeting went, newest first", flush: true,
      body: '<ul class="list">' + held.map(function (m) { return row(m, true); }).join("") + "</ul>" });

  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-meeting]");
    if (!b) { return; }
    var m = D.meetings.filter(function (x) { return x.ref === b.getAttribute("data-meeting"); })[0];
    var report = m.state === "held"
      ? UI.card({ title: "How it went", body: '<div class="kv">' +
          UI.field("Mood", m.mood) + UI.field("Where we stand", m.standing) + UI.field("Reported", m.date + " by " + m.owner) + "</div>" +
          '<p class="report-text">' + UI.esc(m.report) + "</p>" +
          '<p class="report-next">' + Icon("arrowRight", { size: 14 }) + "<b>Next step:</b> " + UI.esc(m.next) + "</p>" })
      : m.state === "cancelled"
        ? UI.notice({ tone: "critical", icon: "calendarX", title: "It did not happen", text: m.reason })
        : UI.notice({ tone: "info", icon: "pencil", title: "The report is written here once the meeting has started",
            text: "Whoever follows " + m.owner + "'s meetings is told when it is saved." });
    UI.openDrawer({
      eyebrow: m.ref, title: m.title, sub: m.with + " · " + m.owner,
      body: UI.card({ title: "The meeting", body: '<div class="kv">' +
          UI.field("When", m.date + ", " + m.time, m.length + " minutes") +
          UI.field("With", m.with, m.kind === "Name" ? "Not in IEMS yet" : m.kind) +
          UI.field("How", m.mode) + UI.field("Where", m.where) + "</div>" }) + report,
      foot: m.state === "scheduled"
        ? UI.btn({ label: "Write the report", icon: "pencil", variant: "primary", demo: "report" }) + UI.btn({ label: "Change or move", icon: "calendar", demo: "move" })
        : m.state === "held" ? UI.btn({ label: "Schedule the follow-up", icon: "plus", variant: "primary", demo: "follow" }) : "",
      onMount: function (node) { UI.wireDemoActions(node); }
    });
  });
};
