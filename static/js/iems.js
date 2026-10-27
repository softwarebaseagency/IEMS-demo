/* ============================================================================
   IEMS demo - shared pieces

   What more than one screen needs: the IEMS record states, money and
   reference formatting, the five-dot quotation progress, the quotation
   detail drawer and the printable document preview. A quotation therefore
   opens the same way from the overview, the CRM, approvals or finance.
   ========================================================================== */
(function (global) {
  "use strict";

  var D = global.DATA;
  var DEMO = "This is only a demo. Nothing is saved.";

  /* ---- Record states IEMS adds to the design system's set ---------------- */
  var STATES = {
    issued:        ["Issued", "info", "file"],
    accepted:      ["Accepted", "good", "checkCircle"],
    declined:      ["Declined", "critical", "xCircle"],
    awaiting:      ["Awaiting approval", "warning", "clock"],
    new:           ["New", "info", "sparkle"],
    qualified:     ["Qualified", "good", "check"],
    converted:     ["Converted", "brand", "swap"],
    disqualified:  ["Disqualified", "", "xCircle"],
    verified:      ["Confirmed", "good", "checkCircle"],
    recorded:      ["Waiting to be confirmed", "warning", "clock"],
    reversed:      ["Taken back", "critical", "undo"],
    ordered:       ["Ordered", "info", "truck"],
    received:      ["Received", "good", "boxes"],
    held:          ["Held", "good", "checkCircle"],
    inOffice:      ["In office", "good", "building"],
    late:          ["Late", "warning", "clock"],
    onBreak:       ["On break", "info", "pause"],
    out:           ["Out of office", "info", "external"],
    leave:         ["On leave", "", "calendar"],
    notIn:         ["Not in yet", "serious", "alert"],
    onTrack:       ["On track", "good", "trend"],
    atRisk:        ["At risk", "warning", "alert"],
    behind:        ["Behind", "critical", "trendDown"],
    explained:     ["Explained", "info", "message"],
    correction:    ["Correction asked", "warning", "pencil"],
    acceptedAsIs:  ["Accepted as it stands", "good", "check"],
    ready:         ["Ready to buy", "good", "star"],
    interested:    ["Interested", "info", "trend"],
    thinking:      ["Thinking it over", "warning", "clock"],
    cooling:       ["Cooling off", "", "trendDown"],
    keyAccount:    ["Key account", "brand", "star"]
  };
  Object.keys(STATES).forEach(function (id) {
    var s = STATES[id];
    UI.STATUS[id] = { key: "s." + id, tone: s[1], icon: s[2] };
    I18n.DICT["s." + id] = s[0];
  });

  /* ---- Formatting ------------------------------------------------------------ */
  function money(n, cur) {
    return '<span class="money">' + Fmt.int(n) + '<span class="money__cur">' + UI.esc(cur || D.meta.currency) + "</span></span>";
  }
  function ref(r) { return '<span class="ref">' + UI.ltr(r) + "</span>"; }

  function quotationPill(q) {
    if (q.status === "pending") { return UI.statusPill("awaiting"); }
    return UI.statusPill(q.status);
  }

  /* Five dots: issued, accepted, invoiced, paid, delivered. */
  function dots(q) {
    var reached = q.status === "declined" || q.status === "pending" ? 0 : q.stage;
    var label = q.status === "declined" ? "Declined" :
      q.status === "pending" ? "Not issued yet" : D.stages[Math.max(0, reached - 1)];
    var html = '<span class="dots' + (q.status === "declined" ? " dots--off" : "") + '" role="img" aria-label="' +
      UI.esc(label + ", " + reached + " of 5 steps") + '">';
    for (var i = 1; i <= 5; i += 1) {
      html += '<span class="dots__dot' + (i <= reached ? " is-done" : "") + (i === reached ? " is-current" : "") + '"></span>';
    }
    return html + '</span><span class="dots__label">' + UI.esc(label) + "</span>";
  }

  /* ---- The chain behind one quotation ---------------------------------------- */
  function chain(q) {
    var steps = [];
    steps.push({ title: q.status === "pending" ? "Raised from its costing sheet, waiting for approval" : "Quotation issued",
      meta: q.ref + " · " + q.issued + " · by " + q.owner, done: true });
    if (q.status === "declined") {
      steps.push({ title: "Declined by the client", meta: "Closed. Nothing else was raised.", done: true });
      return steps;
    }
    steps.push({ title: "Client acceptance", meta: q.stage >= 2 ? "Accepted by " + q.contact : "Waiting for the client", done: q.stage >= 2 });
    q.schedule.forEach(function (s) {
      if (s.invoice) {
        var inv = D.invoice(s.invoice);
        steps.push({ title: "Invoice · " + s.label + " (" + s.pct + "%)", meta: s.invoice + " · " + Fmt.int(inv.amount) + " USD", done: true });
        steps.push({ title: s.paid ? "Paid · receipt issued" : inv.status === "overdue" ? "Payment overdue" : "Payment not received yet",
          meta: s.paid ? s.receipt : "Due " + inv.due, done: s.paid, warn: inv.status === "overdue" });
      } else if (q.stage >= 2) {
        steps.push({ title: "Invoice · " + s.label + " (" + s.pct + "%)", meta: "Raised when the stage is reached", done: false });
      }
    });
    steps.push({ title: "Delivered", meta: q.delivery ? q.delivery + " · delivery note signed" : "Not delivered yet", done: Boolean(q.delivery) });
    return steps;
  }

  function chainHtml(q) {
    return '<ol class="chain">' + chain(q).map(function (s) {
      return '<li class="chain__step' + (s.done ? " is-done" : "") + (s.warn ? " is-warn" : "") + '">' +
        '<span class="chain__mark" aria-hidden="true">' + Icon(s.done ? "check" : s.warn ? "alert" : "dot", { size: 12 }) + "</span>" +
        '<span class="chain__body"><span class="chain__title">' + UI.esc(s.title) + "</span>" +
        '<span class="chain__meta">' + UI.ltr(s.meta) + "</span></span></li>";
    }).join("") + "</ol>";
  }

  function linesTable(q) {
    return '<div class="tablewrap"><table class="data"><thead><tr><th>Item</th><th class="num">Qty</th><th>Unit</th>' +
      '<th class="num">Price</th><th class="num">Amount</th></tr></thead><tbody>' +
      q.lines.map(function (l) {
        return "<tr><td>" + UI.esc(l.desc) + '</td><td class="num">' + Fmt.int(l.qty) + "</td><td>" + UI.esc(l.unit) +
          '</td><td class="num">' + Fmt.int(l.price) + '</td><td class="num">' + Fmt.int(l.qty * l.price) + "</td></tr>";
      }).join("") +
      "</tbody></table></div>";
  }

  /* ---- The quotation drawer ---------------------------------------------------- */
  function openQuotation(q) {
    if (typeof q === "string") { q = D.quotation(q); }
    if (!q) { return; }
    var costing = D.costings.filter(function (c) { return c.quotation === q.ref; })[0];
    var body =
      '<div class="drawer-hero"><div>' + dots(q) + "</div>" +
        '<div class="drawer-hero__total"><span class="muted text-xs">Total</span>' + money(q.total) + "</div></div>" +
      UI.card({ title: "Everything raised from it", sub: "Quotation, invoices, receipts and delivery, in the order they happened", body: chainHtml(q) }) +
      UI.card({ title: "Details", body: '<div class="kv">' +
        UI.field("Client", q.client, q.contact) +
        UI.field("Division", q.division) +
        UI.field("Owner", q.owner) +
        UI.field("Issued", q.issued) +
        UI.field("Valid until", q.valid) +
        UI.field("Costing sheet", costing ? costing.ref : "", costing ? costing.margin + "% margin" : "") + "</div>" }) +
      UI.card({ title: "Payment schedule", sub: "How the client pays for this job", flush: true,
        body: '<ul class="list">' + q.schedule.map(function (s) {
          var state = s.paid ? "paid" : s.invoice ? (D.invoice(s.invoice).status === "overdue" ? "overdue" : "unpaid") : "notStarted";
          return '<li><span class="list__body"><span class="list__title">' + UI.esc(s.label) + " · " + s.pct + "%</span>" +
            '<span class="list__meta">' + (s.invoice ? UI.ltr(s.invoice) : "Not invoiced yet") + "</span></span>" +
            '<span class="list__aside">' + money(Math.round(q.total * s.pct / 100)) + " " + UI.statusPill(state) + "</span></li>";
        }).join("") + "</ul>" }) +
      UI.card({ title: "Line items", flush: true, body: linesTable(q),
        foot: '<div class="totals"><span>Subtotal</span><b>' + Fmt.int(q.subtotal) + "</b>" +
          (q.discount ? "<span>Discount</span><b>-" + Fmt.int(q.discount) + "</b>" : "") +
          "<span>Total (USD)</span><b>" + Fmt.int(q.total) + "</b></div>" });

    UI.openDrawer({
      eyebrow: q.ref,
      title: q.title,
      sub: q.client + " · " + q.division,
      body: body,
      foot: UI.btn({ label: "Preview the document", icon: "eye", variant: "primary", attrs: " data-preview=\"" + q.ref + "\"" }) +
        UI.btn({ label: "Download PDF", icon: "download", demo: "pdf" }) +
        (q.status === "issued" ? UI.btn({ label: "Record acceptance", icon: "check", demo: "accept" }) : ""),
      onMount: function (node) {
        /* The drawer element is reused, so listeners go on its fresh content,
           never on the drawer itself (they would pile up, one per opening). */
        UI.wireDemoActions(node);
        var b = node.querySelector("[data-preview]");
        if (b) { b.addEventListener("click", function () { openPaper(b.getAttribute("data-preview")); }); }
      }
    });
  }

  /* ---- The printable document --------------------------------------------------- */
  function paperFor(refValue) {
    var q = D.quotation(refValue);
    var inv = D.invoice(refValue);
    var rcp = D.receipts.filter(function (r) { return r.ref === refValue; })[0];
    if (q) { return { kind: "Quotation", q: q, ref: q.ref, date: q.issued, extra: "Valid until " + q.valid, amount: q.total }; }
    if (inv) { var iq = D.quotation(inv.quotation); return { kind: "Invoice", q: iq, ref: inv.ref, date: inv.issued, extra: inv.label + " · due " + inv.due, amount: inv.amount, part: inv }; }
    if (rcp) { var rq = D.quotation(rcp.quotation); return { kind: "Receipt", q: rq, ref: rcp.ref, date: rcp.date, extra: "Paid by " + rcp.method.toLowerCase() + " against " + rcp.invoice, amount: rcp.amount, receipt: rcp }; }
    return null;
  }

  function paperHtml(doc) {
    var q = doc.q;
    var client = D.client(q.client) || {};
    var rows = doc.kind === "Quotation" ? q.lines.map(function (l) {
      return "<tr><td>" + UI.esc(l.desc) + '</td><td class="num">' + Fmt.int(l.qty) + " " + UI.esc(l.unit) +
        '</td><td class="num">' + Fmt.int(l.price) + '</td><td class="num">' + Fmt.int(l.qty * l.price) + "</td></tr>";
    }).join("") : "<tr><td>" + UI.esc((doc.part ? doc.part.label : "Payment received") + " for " + q.title) +
      '<span class="paper__sub">' + UI.esc("Quotation " + q.ref) + '</span></td><td class="num">1</td><td class="num">' +
      Fmt.int(doc.amount) + '</td><td class="num">' + Fmt.int(doc.amount) + "</td></tr>";

    var totals = doc.kind === "Quotation"
      ? "<span>Subtotal</span><b>" + Fmt.int(q.subtotal) + "</b>" + (q.discount ? "<span>Discount</span><b>-" + Fmt.int(q.discount) + "</b>" : "") +
        '<span class="paper__grand">Total USD</span><b class="paper__grand">' + Fmt.int(q.total) + "</b>"
      : '<span class="paper__grand">' + (doc.kind === "Receipt" ? "Received USD" : "Amount due USD") + '</span><b class="paper__grand">' + Fmt.int(doc.amount) + "</b>";

    var terms = doc.kind === "Quotation"
      ? "<h4>Payment terms</h4><ul>" + q.schedule.map(function (s) { return "<li>" + s.pct + "% " + UI.esc(s.label.toLowerCase()) + "</li>"; }).join("") +
        "</ul><h4>Terms</h4><ul><li>Prices are in US dollars and valid until " + UI.esc(q.valid) + ".</li>" +
        "<li>Work starts once the advance is received.</li><li>Changes to the scope are quoted separately.</li></ul>"
      : "<h4>" + (doc.kind === "Receipt" ? "Received with thanks" : "How to pay") + "</h4><ul>" +
        (doc.kind === "Receipt" ? "<li>" + UI.esc(doc.extra) + ".</li>" :
          "<li>Bank transfer to Altun Creative LLC, account 0000 0000 0000 (sample).</li><li>Please quote " + UI.esc(doc.ref) + " with the payment.</li>") + "</ul>";

    return '<div class="paper-wrap"><article class="paper" aria-label="' + UI.esc(doc.kind + " " + doc.ref) + '">' +
      '<header class="paper__head"><div class="paper__brand"><span class="paper__mark">altun<b>.</b></span>' +
        '<span class="paper__org">Altun Creative LLC<br>Gulan Street, Erbil, Kurdistan Region<br>+964 750 000 0000 · hello@altun.example</span></div>' +
        '<div class="paper__title"><h3>' + UI.esc(doc.kind) + "</h3><dl>" +
          "<dt>Reference</dt><dd>" + UI.ltr(doc.ref) + "</dd><dt>Date</dt><dd>" + UI.ltr(doc.date) + "</dd>" +
          "<dt>" + (doc.kind === "Quotation" ? "Valid until" : "Quotation") + "</dt><dd>" + UI.ltr(doc.kind === "Quotation" ? q.valid : q.ref) + "</dd></dl></div></header>" +
      '<section class="paper__to"><span class="paper__label">' + (doc.kind === "Receipt" ? "Received from" : "Prepared for") + "</span>" +
        "<b>" + UI.esc(q.client) + "</b><span>" + UI.esc(client.contact || "") + "</span><span>" + UI.esc(client.city || "") + "</span>" +
        '<span class="paper__project">' + UI.esc(q.title) + "</span></section>" +
      '<table class="paper__lines"><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th></tr></thead>' +
        "<tbody>" + rows + "</tbody></table>" +
      '<div class="paper__foot"><div class="paper__terms">' + terms + "</div>" +
        '<div class="paper__totals">' + totals + "</div></div>" +
      '<footer class="paper__sign"><div><span class="paper__line"></span><span>Prepared by ' + UI.esc(q.owner) + "</span></div>" +
        '<div class="paper__stamp" aria-hidden="true"><span>Altun Creative</span><b>' + (doc.kind === "Receipt" ? "PAID" : "APPROVED") + "</b><span>Erbil</span></div>" +
        '<div><span class="paper__line"></span><span>Approved by Shilan Kareem, Founder &amp; CEO</span></div></footer>' +
      '<p class="paper__demo">Sample document generated by the IEMS interface demo. Not a real offer.</p>' +
      "</article></div>";
  }

  function openPaper(refValue) {
    var doc = paperFor(refValue);
    if (!doc) { UI.toast("This document has no preview in the demo.", "file"); return; }
    UI.openModal({
      eyebrow: doc.kind + " preview",
      title: doc.ref,
      sub: doc.q.client + " · exactly as it prints",
      body: paperHtml(doc),
      foot: UI.btn({ label: "Print", icon: "printer", demo: "print" }) +
        UI.btn({ label: "Download PDF", icon: "download", variant: "primary", demo: "pdf" }),
      onMount: function (node) {
        UI.wireDemoActions(node);
        var panel = node.querySelector(".modal__panel");
        if (panel) { panel.classList.add("modal__panel--paper"); }
      }
    });
  }

  global.Iems = {
    DEMO: DEMO,
    money: money,
    ref: ref,
    dots: dots,
    quotationPill: quotationPill,
    chainHtml: chainHtml,
    linesTable: linesTable,
    openQuotation: openQuotation,
    openPaper: openPaper
  };
})(window);
