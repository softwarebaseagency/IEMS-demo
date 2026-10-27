window.Views = window.Views || {};

/* 02 Approvals - every decision that needs a second person, in one inbox.
   The rule on each item says why it is here and why its maker cannot close it. */
window.Views.approvals = function (root, ctx) {
  "use strict";
  var D = DATA;

  var DECIDED = [
    { ref: "AC-QUO-2026-000035", kind: "Quotation",        icon: "file",     title: "Quarterly brochure print",         from: "Lana Qadir",  amount: 6300, decided: "26 Oct 2026 16:20", outcome: "approved", by: "Shilan Kareem" },
    { ref: "AC-PR-2026-000052",  kind: "Purchase request", icon: "cart",     title: "LED wall rental, two days",        from: "Bryar Hama",  amount: 4100, decided: "25 Oct 2026 11:05", outcome: "approved", by: "Hemin Darwesh" },
    { ref: "AC-PR-2026-000046",  kind: "Purchase request", icon: "cart",     title: "Crew transport, gala week",        from: "Zhwan Omer",  amount: 950,  decided: "24 Oct 2026 09:40", outcome: "rejected", by: "Hemin Darwesh", note: "Supplier is blocked; use our own van." },
    { ref: "AC-LVR-2026-000018", kind: "Leave request",    icon: "calendar", title: "Soma Rasul, 25-29 Oct, annual leave", from: "Soma Rasul", amount: 0,  decided: "20 Oct 2026 14:12", outcome: "approved", by: "Dilan Aziz" }
  ];

  function urgency(a) {
    return a.due === "Overdue" ? UI.pill("Overdue", "critical", "alert") :
      a.due === "Today" ? UI.pill("Due today", "warning", "clock") : UI.pill(a.due, "", "calendar");
  }

  function waitingList() {
    return '<ul class="approvals">' + D.approvals.map(function (a, i) {
      return '<li><button type="button" class="approval" data-approval="' + i + '">' +
        '<span class="approval__icon">' + Icon(a.icon, { size: 18 }) + "</span>" +
        '<span class="approval__body"><span class="approval__kind">' + UI.esc(a.kind) + " · " + UI.ltr(a.ref) + "</span>" +
          '<span class="approval__title">' + UI.esc(a.title) + "</span>" +
          '<span class="approval__meta">From ' + UI.esc(a.from) + " · waiting " + UI.esc(a.age) + "</span></span>" +
        '<span class="approval__aside">' + (a.amount ? Iems.money(a.amount) : "") + urgency(a) + "</span>" +
        "</button></li>";
    }).join("") + "</ul>";
  }

  function decidedList() {
    return '<ul class="approvals">' + DECIDED.map(function (a) {
      return '<li><div class="approval approval--static">' +
        '<span class="approval__icon">' + Icon(a.icon, { size: 18 }) + "</span>" +
        '<span class="approval__body"><span class="approval__kind">' + UI.esc(a.kind) + " · " + UI.ltr(a.ref) + "</span>" +
          '<span class="approval__title">' + UI.esc(a.title) + "</span>" +
          '<span class="approval__meta">' + UI.esc(a.outcome === "approved" ? "Approved" : "Rejected") + " by " + UI.esc(a.by) + " · " + UI.ltr(a.decided) +
          (a.note ? " · " + UI.esc(a.note) : "") + "</span></span>" +
        '<span class="approval__aside">' + (a.amount ? Iems.money(a.amount) : "") + UI.statusPill(a.outcome) + "</span>" +
        "</div></li>";
    }).join("") + "</ul>";
  }

  var tab = ctx.params.tab === "decided" ? "decided" : "waiting";

  root.innerHTML =
    UI.pageHead({ moduleNo: "02", title: "Approvals",
      lede: "Every decision that needs a second person. The one who made a quotation, a payment or a request never approves it themselves.",
      actions: UI.btn({ label: "Delegate while away", icon: "swap", demo: "delegate" }) }) +
    '<div class="grid grid--kpi">' +
      UI.stat({ label: "Waiting for you", icon: "inbox", value: String(D.approvals.length), note: "across six kinds of request" }) +
      UI.stat({ label: "Overdue", icon: "alert", value: String(D.approvals.filter(function (a) { return a.due === "Overdue"; }).length), note: "past the escalation time" }) +
      UI.stat({ label: "Value to sign off", icon: "wallet", value: D.compact(D.sum(D.approvals, "amount")), unit: "USD", note: "quotations, purchases and payments" }) +
      UI.stat({ label: "Average decision time", icon: "clock", value: "5.2", unit: "hours", delta: -18, goodWhen: "down", note: "last 30 days" }) +
    "</div>" +
    UI.card({ title: "Inbox", tools: UI.tabs([{ id: "waiting", label: "Waiting (" + D.approvals.length + ")" }, { id: "decided", label: "Decided recently" }], tab),
      flush: true, body: '<div id="approvalsBody">' + (tab === "waiting" ? waitingList() : decidedList()) + "</div>" });

  UI.wireTabs(root, function (id) {
    root.querySelector("#approvalsBody").innerHTML = id === "waiting" ? waitingList() : decidedList();
  });

  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-approval]");
    if (!b) { return; }
    var a = D.approvals[Number(b.getAttribute("data-approval"))];
    var body =
      '<div class="kv">' +
        UI.field("Kind", a.kind) + UI.field("Reference", a.ref) + UI.field("Raised by", a.from) +
        UI.field("Waiting", a.age, a.due === "Overdue" ? "Past the escalation time" : "Due " + a.due.toLowerCase()) +
        (a.amount ? UI.field("Amount", Fmt.int(a.amount) + " USD") : "") +
      "</div>" +
      UI.notice({ tone: "info", icon: "shield", title: "Why this needs you", text: a.rule }) +
      '<label class="decision"><span class="field__label">A note for the record (optional)</span>' +
        '<textarea rows="3" placeholder="Shown on the record and kept in the audit log"></textarea></label>' +
      (a.kind === "Quotation" ? '<p class="text-sm">' + UI.btn({ label: "Open the quotation", icon: "file", size: "sm", attrs: ' data-quotation="' + a.ref + '"' }) + "</p>" : "");
    UI.openModal({
      eyebrow: a.kind,
      title: a.title,
      sub: "From " + a.from + " · " + a.ref,
      body: body,
      foot: UI.btn({ label: "Reject", icon: "xCircle", demo: "reject" }) +
        UI.btn({ label: "Send back", icon: "undo", demo: "return" }) +
        UI.btn({ label: "Approve", icon: "check", variant: "primary", demo: "approve" }),
      onMount: function (node) { UI.wireDemoActions(node); }
    });
  });
};
