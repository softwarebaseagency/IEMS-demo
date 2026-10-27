window.Views = window.Views || {};

/* 07 Projects - delivery of what was sold. An accepted quotation becomes a
   project; work passes a quality gate before it counts as delivered. Delivery
   screens show no money: the team sees the work, not its price. */
window.Views.projects = function (root) {
  "use strict";
  var D = DATA;
  var HEALTH = { onTrack: "onTrack", atRisk: "atRisk", late: "behind" };

  var MILESTONES = {
    "AC-PRJ-2026-000018": [["Run-of-show signed off", true], ["Stage and LED wall booked", true], ["Guest branding printed", true], ["Rehearsal", false], ["Gala night, 5 Nov", false]],
    "AC-PRJ-2026-000017": [["Acoustic panels installed", true], ["Carpet laid", true], ["Chandeliers hung", true], ["Snag walk with the client", false], ["Handover", false]],
    "AC-PRJ-2026-000015": [["Design approved", true], ["Joinery delivered (a week late)", true], ["Booth seating installed", false], ["Bar counter and lighting", false], ["Handover", false]]
  };

  function card(p) {
    return '<button type="button" class="pcard" data-project="' + p.ref + '">' +
      '<span class="pcard__top"><span class="ref">' + UI.ltr(p.ref) + "</span>" + UI.statusPill(HEALTH[p.health]) + "</span>" +
      '<span class="pcard__name">' + UI.esc(p.name) + "</span>" +
      '<span class="pcard__client">' + UI.esc(p.client) + " · " + UI.esc(p.division) + "</span>" +
      '<span class="pcard__progress">' + UI.track(p.progress, p.health === "late" ? "crit" : p.health === "atRisk" ? "warn" : "good") +
        "<b>" + p.progress + "%</b></span>" +
      '<span class="pcard__foot"><span class="pcard__team">' + p.team.map(function (n) { return UI.avatar(n, "sm"); }).join("") + "</span>" +
        '<span class="pcard__due">' + Icon("calendar", { size: 12 }) + UI.esc(p.due) + "</span></span>" +
      "</button>";
  }

  var board = '<div class="kanban">' + D.board.map(function (col) {
    var items = D.projects.filter(function (p) { return p.column === col.id; });
    return '<section class="kanban__col" aria-label="' + UI.esc(col.label) + '"><header class="kanban__head"><span>' + UI.esc(col.label) + "</span>" +
      '<span class="badge">' + items.length + "</span></header>" + items.map(card).join("") + "</section>";
  }).join("") + "</div>";

  root.innerHTML =
    UI.pageHead({ moduleNo: "07", title: "Projects",
      lede: "Delivery of everything that was sold. An accepted quotation becomes a project, and work passes a quality review before it counts as delivered. These screens show no prices.",
      actions: UI.btn({ label: "My project work", icon: "user", demo: "mine" }) + UI.btn({ label: "New project", icon: "plus", variant: "primary", demo: "new" }) }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "In delivery", icon: "layers", value: String(D.projects.filter(function (p) { return p.column === "inProgress" || p.column === "review"; }).length), note: "in progress or in review" }) +
      UI.stat({ label: "Needs attention", icon: "alert", value: String(D.projects.filter(function (p) { return p.health !== "onTrack"; }).length), note: "at risk or behind" }) +
      UI.stat({ label: "Delivered in Q4", icon: "checkCircle", value: String(D.projects.filter(function (p) { return p.column === "delivered"; }).length), delta: 2, deltaUnit: "", note: "passed quality review" }) +
      UI.stat({ label: "On-time delivery", icon: "clock", value: "88", unit: "%", delta: 5, deltaUnit: " pt", note: "last 6 months" }) +
    "</div>" +
    UI.card({ title: "Delivery board", sub: "Click a project for its milestones and team", body: board });

  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-project]");
    if (!b) { return; }
    var p = D.projects.filter(function (x) { return x.ref === b.getAttribute("data-project"); })[0];
    var steps = MILESTONES[p.ref] || [["Kick-off with the client", p.progress > 0], ["Design and planning", p.progress > 30], ["Production", p.progress > 60], ["Quality review", p.progress > 85], ["Delivered", p.progress === 100]];
    UI.openDrawer({
      eyebrow: p.ref, title: p.name, sub: p.client + " · managed by " + p.manager,
      body:
        '<div class="drawer-hero"><div>' + UI.statusPill(HEALTH[p.health]) + "</div>" +
          '<div class="drawer-hero__total"><span class="muted text-xs">Done</span><b class="hero-num">' + p.progress + "%</b></div></div>" +
        UI.card({ title: "Milestones", body: '<ol class="chain">' + steps.map(function (s) {
          return '<li class="chain__step' + (s[1] ? " is-done" : "") + '"><span class="chain__mark" aria-hidden="true">' + Icon(s[1] ? "check" : "dot", { size: 12 }) + "</span>" +
            '<span class="chain__body"><span class="chain__title">' + UI.esc(s[0]) + "</span></span></li>";
        }).join("") + "</ol>" }) +
        UI.card({ title: "Project", body: '<div class="kv">' +
          UI.field("Client", p.client) + UI.field("Division", p.division) + UI.field("Manager", p.manager) +
          UI.field("Due", p.due) + UI.field("From quotation", p.quotation) + "</div>" }) +
        UI.card({ title: "Team", flush: true, body: '<ul class="list">' + p.team.map(function (n) {
          var person = D.person(n) || {};
          return "<li>" + UI.person(n, person.role || "") + "</li>";
        }).join("") + "</ul>" }),
      foot: UI.btn({ label: "Submit for quality review", icon: "fileCheck", variant: "primary", demo: "review" }) + UI.btn({ label: "Add a task", icon: "plus", demo: "task" }),
      onMount: function (node) { UI.wireDemoActions(node); }
    });
  });
};
