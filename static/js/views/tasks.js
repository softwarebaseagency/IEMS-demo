window.Views = window.Views || {};

/* 01 My tasks - the notebook replacement: one list per person, only the owner
   may change it, and a manager sees it only with a grant. */
window.Views.tasks = function (root) {
  "use strict";
  var D = DATA;
  var tasks = D.tasks;
  var open = tasks.filter(function (x) { return x.state !== "done"; });

  var PRIORITY = { urgent: ["Urgent", "critical"], high: ["High", "warning"], normal: ["Normal", ""], low: ["Low", ""] };

  function taskRow(x) {
    var p = PRIORITY[x.priority];
    return '<li class="task' + (x.late ? " task--late" : "") + '">' +
      '<span class="task__check" aria-hidden="true">' + Icon(x.state === "done" ? "checkCircle" : x.state === "active" ? "play" : "dot", { size: 16 }) + "</span>" +
      '<span class="task__body"><span class="task__title">' + UI.esc(x.title) + "</span>" +
        '<span class="task__meta">' + UI.ltr(x.ref) + (x.note ? " · " + UI.esc(x.note) : "") + "</span></span>" +
      '<span class="task__aside">' + UI.pill(p[0], p[1], x.priority === "urgent" ? "alert" : "tag") +
        '<span class="task__due' + (x.late ? " is-late" : "") + '">' + Icon(x.late ? "alert" : "clock", { size: 12 }) + UI.esc(x.due) + "</span>" +
        (x.state !== "done" ? UI.btn({ variant: "icon", size: "sm", icon: x.state === "active" ? "check" : "play", label: x.state === "active" ? "Complete" : "Start", demo: "task" }) : "") +
      "</span></li>";
  }

  function column(title, sub, rows, empty) {
    return UI.card({ title: title, sub: sub, flush: true,
      body: rows.length ? '<ul class="tasklist">' + rows.map(taskRow).join("") + "</ul>"
        : '<p class="card__empty">' + UI.esc(empty) + "</p>" });
  }

  var strip = [
    ["Overdue", tasks.filter(function (x) { return x.late; }).length, "critical"],
    ["Due today", tasks.filter(function (x) { return /^Today/.test(x.due); }).length, "warning"],
    ["In hand", tasks.filter(function (x) { return x.state === "active"; }).length, "info"],
    ["Waiting", tasks.filter(function (x) { return x.state === "queued"; }).length, ""],
    ["On hold", tasks.filter(function (x) { return x.state === "onHold"; }).length, ""]
  ].map(function (s) {
    return '<span class="countchip' + (s[2] ? " countchip--" + s[2] : "") + '"><b>' + s[1] + "</b>" + UI.esc(s[0]) + "</span>";
  }).join("");

  root.innerHTML =
    UI.pageHead({ moduleNo: "01", title: "My tasks",
      lede: "Your own list, the one that replaced the paper notebook. Nobody else can add to it or change it; a manager can read it only if they were given sight of it.",
      actions: UI.btn({ label: "Calendar", icon: "calendar", demo: "calendar" }) +
        UI.btn({ label: "Export the month", icon: "download", demo: "export" }) +
        UI.btn({ label: "New task", icon: "plus", variant: "primary", demo: "new" }) }) +
    '<div class="countstrip">' + strip + "</div>" +
    '<div class="quickadd"><span class="quickadd__icon">' + Icon("plus", { size: 16 }) + "</span>" +
      '<input type="text" class="quickadd__input" placeholder="Write down the next thing on your mind, then press Enter" aria-label="Quick add a task">' +
      UI.select({ label: "Due", options: ["No date", "Today", "Tomorrow", "This week"] }) + "</div>" +
    '<div class="grid grid--2">' +
      column("In hand", "What you are working on now", open.filter(function (x) { return x.state === "active"; }), "Nothing started. Pick something from the queue.") +
      column("Queue", "Most pressing first, then soonest", open.filter(function (x) { return x.state === "queued"; }), "The queue is empty.") +
    "</div>" +
    '<div class="grid grid--2">' +
      column("On hold", "Parked, with the reason", open.filter(function (x) { return x.state === "onHold"; }), "Nothing on hold.") +
      column("Finished recently", "Older ones move to the archive, month by month", tasks.filter(function (x) { return x.state === "done"; }), "Nothing finished yet.") +
    "</div>";

  var input = root.querySelector(".quickadd__input");
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); this.value = ""; UI.toast(Iems.DEMO, "lock"); }
  });
};
