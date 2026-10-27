/* ============================================================================
   IEMS demo - sample dataset

   One fictional agency, Altun Creative, so every screen tells the same story:
   a lead becomes a client, a costing sheet becomes a quotation, the quotation
   becomes invoices, receipts and a delivery, the job becomes a project, and
   the people doing it punch in at the door. Every name, figure and reference
   here is invented for the demo. Nothing is read from or written to anywhere.
   ========================================================================== */
(function (global) {
  "use strict";

  /* ---- Helpers ----------------------------------------------------------- */
  function sum(rows, field) {
    return rows.reduce(function (t, r) {
      return t + Number(typeof field === "function" ? field(r) : r[field] || 0);
    }, 0);
  }
  function count(rows, test) { return rows.filter(test).length; }
  function by(rows, field) {
    var out = {};
    rows.forEach(function (r) { out[r[field]] = r; });
    return out;
  }
  function usd(n) { return Fmt.int(n) + " USD"; }
  function compact(n) {
    var a = Math.abs(n);
    if (a >= 1e6) { return (n / 1e6).toFixed(2) + "M"; }
    if (a >= 1e4) { return (n / 1e3).toFixed(0) + "K"; }
    if (a >= 1e3) { return (n / 1e3).toFixed(1) + "K"; }
    return Fmt.int(n);
  }
  /* A small deterministic generator, so the month sheet looks the same on
     every load and in every screenshot. */
  function seeded(seed) {
    var s = seed;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  /* ---- The company -------------------------------------------------------- */
  var META = {
    product: "IEMS",
    productFull: "Base Agency IEMS",
    org: "Altun Creative",
    legal: "Altun Creative LLC",
    prefix: "AC",
    city: "Erbil",
    today: "Tuesday 27 October 2026",
    todayShort: "27 Oct 2026",
    updated: "27 Oct 2026 10:42",
    currency: "USD",
    week: "Saturday to Thursday, 09:00-17:00",
    user: { name: "Shilan Kareem", role: "Founder & CEO", email: "shilan@altun.example" }
  };

  var DIVISIONS = ["Business Development", "Events & Production", "Interiors & Fit-out",
    "Branding & Print", "Digital", "Finance", "Operations", "Management"];

  /* ---- People ------------------------------------------------------------- */
  var PEOPLE = [
    { id: "EID-001", name: "Shilan Kareem",  role: "Founder & CEO",               division: "Management",           jobRole: "Founder & CEO",      branch: "Erbil Head Office", since: "Mar 2019", email: "shilan@altun.example" },
    { id: "EID-002", name: "Hemin Darwesh",  role: "Operations Director",         division: "Operations",           jobRole: "Operations & Finance",                branch: "Erbil Head Office", since: "Jun 2019", email: "hemin@altun.example" },
    { id: "EID-003", name: "Lana Qadir",     role: "Business Development Manager", division: "Business Development", jobRole: "Business Developer", branch: "Erbil Head Office", since: "Jan 2021", email: "lana@altun.example" },
    { id: "EID-004", name: "Rawa Jalal",     role: "Business Developer",          division: "Business Development", jobRole: "Business Developer", branch: "Erbil Head Office", since: "Oct 2026", email: "rawa@altun.example" },
    { id: "EID-005", name: "Dilan Aziz",     role: "Creative Director",           division: "Interiors & Fit-out",  jobRole: "Creative Director",  branch: "Erbil Head Office", since: "Aug 2019", email: "dilan@altun.example" },
    { id: "EID-006", name: "Soma Rasul",     role: "Senior Interior Designer",    division: "Interiors & Fit-out",  jobRole: "Creative Director",  branch: "Sulaymaniyah Studio", since: "Feb 2022", email: "soma@altun.example" },
    { id: "EID-007", name: "Bryar Hama",     role: "Project Manager",             division: "Events & Production",  jobRole: "Creative Director",  branch: "Erbil Head Office", since: "May 2020", email: "bryar@altun.example" },
    { id: "EID-008", name: "Zhwan Omer",     role: "Production Coordinator",      division: "Events & Production",  jobRole: "Delivery Team",  branch: "Erbil Head Office", since: "Sep 2023", email: "zhwan@altun.example" },
    { id: "EID-009", name: "Nawroz Salih",   role: "Brand Designer",              division: "Branding & Print",     jobRole: "Delivery Team",  branch: "Erbil Head Office", since: "Apr 2022", email: "nawroz@altun.example" },
    { id: "EID-010", name: "Avan Mustafa",   role: "Print Production Lead",       division: "Branding & Print",     jobRole: "Delivery Team",  branch: "Erbil Head Office", since: "Nov 2021", email: "avan@altun.example" },
    { id: "EID-011", name: "Karwan Ali",     role: "Software Engineer",           division: "Digital",              jobRole: "Delivery Team",  branch: "Erbil Head Office", since: "Jul 2024", email: "karwan@altun.example" },
    { id: "EID-012", name: "Sara Fattah",    role: "Finance Officer",             division: "Finance",              jobRole: "Operations & Finance",                branch: "Erbil Head Office", since: "Mar 2023", email: "sara@altun.example" },
    { id: "EID-013", name: "Hozan Ahmed",    role: "Procurement Officer",         division: "Operations",           jobRole: "Operations & Finance",                branch: "Erbil Head Office", since: "Jan 2024", email: "hozan@altun.example" },
    { id: "EID-014", name: "Tara Mahmood",   role: "HR & Office Manager",         division: "Operations",           jobRole: "Operations & Finance",                branch: "Erbil Head Office", since: "Jun 2022", email: "tara@altun.example" }
  ];
  PEOPLE.forEach(function (p, i) { p.ref = "AC-EID-2026-" + p.id.slice(-3); p.device = 101 + i; });

  /* ---- CRM: leads and clients ---------------------------------------------- */
  var CLIENTS = [
    { ref: "AC-CLI-2026-000001", name: "Zagros Hotels Group",      sector: "Hospitality",  city: "Erbil",         contact: "Mr. Aram Barzani",   owner: "Lana Qadir",  since: "Feb 2024", standing: "ready",      classification: "Key account" },
    { ref: "AC-CLI-2026-000002", name: "Nishtiman Mall",           sector: "Retail",       city: "Erbil",         contact: "Mrs. Hero Jamal",    owner: "Lana Qadir",  since: "Jul 2024", standing: "interested", classification: "Standard" },
    { ref: "AC-CLI-2026-000003", name: "Hawler Medical Centre",    sector: "Healthcare",   city: "Erbil",         contact: "Dr. Kawa Rashid",    owner: "Rawa Jalal",  since: "Jan 2025", standing: "interested", classification: "Standard" },
    { ref: "AC-CLI-2026-000004", name: "Kurdistan Tech Summit",    sector: "Events",       city: "Erbil",         contact: "Ms. Rozhan Faraj",   owner: "Lana Qadir",  since: "Mar 2025", standing: "ready",      classification: "Key account" },
    { ref: "AC-CLI-2026-000005", name: "Sardam Real Estate",       sector: "Real estate",  city: "Sulaymaniyah",  contact: "Mr. Baran Sabir",    owner: "Lana Qadir",  since: "May 2025", standing: "thinking",   classification: "Standard" },
    { ref: "AC-CLI-2026-000006", name: "Dukan Lakeside Resort",    sector: "Hospitality",  city: "Sulaymaniyah",  contact: "Mrs. Chiman Karim",  owner: "Rawa Jalal",  since: "Jun 2025", standing: "ready",      classification: "Key account" },
    { ref: "AC-CLI-2026-000007", name: "Ankawa Bistro Group",      sector: "Food & drink", city: "Erbil",         contact: "Mr. Ninos Yousif",   owner: "Rawa Jalal",  since: "Aug 2025", standing: "interested", classification: "Standard" },
    { ref: "AC-CLI-2026-000008", name: "Garden City Developments", sector: "Real estate",  city: "Erbil",         contact: "Mr. Shwan Othman",   owner: "Lana Qadir",  since: "Sep 2025", standing: "cooling",    classification: "Standard" },
    { ref: "AC-CLI-2026-000009", name: "Erbil International School", sector: "Education",  city: "Erbil",         contact: "Mrs. Dalia Hassan",  owner: "Lana Qadir",  since: "Jan 2026", standing: "interested", classification: "Standard" },
    { ref: "AC-CLI-2026-000010", name: "Skyline Telecom",          sector: "Telecom",      city: "Erbil",         contact: "Mr. Rebaz Anwar",    owner: "Rawa Jalal",  since: "Apr 2026", standing: "ready",      classification: "Key account" },
    { ref: "AC-CLI-2026-000011", name: "Shaqlawa Mountain Lodge",  sector: "Hospitality",  city: "Shaqlawa",      contact: "Mr. Hawre Ismail",   owner: "Rawa Jalal",  since: "Jun 2026", standing: "thinking",   classification: "Standard" },
    { ref: "AC-CLI-2026-000012", name: "Nova Pharma Kurdistan",    sector: "Pharma",       city: "Erbil",         contact: "Dr. Lavin Saeed",    owner: "Lana Qadir",  since: "Sep 2026", standing: "interested", classification: "Standard" }
  ];

  var LEADS = [
    { ref: "AC-LED-2026-000031", company: "Halabja Heritage Museum",  contact: "Mr. Sherko Latif",  source: "Referral",             status: "new",          owner: "Rawa Jalal", value: 18500, created: "26 Oct 2026", interest: "Exhibition fit-out" },
    { ref: "AC-LED-2026-000030", company: "Duhok Auto Expo",          contact: "Mrs. Nazdar Ali",   source: "Event",                status: "qualified",    owner: "Lana Qadir", value: 42000, created: "24 Oct 2026", interest: "Stand design and build" },
    { ref: "AC-LED-2026-000029", company: "Pirmam Wellness Spa",      contact: "Ms. Bahar Nuri",    source: "Website",              status: "new",          owner: "Rawa Jalal", value: 9800,  created: "22 Oct 2026", interest: "Branding refresh" },
    { ref: "AC-LED-2026-000028", company: "Nova Pharma Kurdistan",    contact: "Dr. Lavin Saeed",   source: "Business Development", status: "converted",    owner: "Lana Qadir", value: 26400, created: "19 Sep 2026", interest: "Office interiors" },
    { ref: "AC-LED-2026-000027", company: "Koya University",          contact: "Dr. Ayub Hasan",    source: "Business Development", status: "qualified",    owner: "Lana Qadir", value: 31000, created: "15 Oct 2026", interest: "Graduation ceremony" },
    { ref: "AC-LED-2026-000026", company: "Barzan Car Rental",        contact: "Mr. Peshawa Kamal", source: "Website",              status: "disqualified", owner: "Rawa Jalal", value: 4200,  created: "12 Oct 2026", interest: "Vehicle wraps" },
    { ref: "AC-LED-2026-000025", company: "Rania Fashion House",      contact: "Mrs. Rania Taha",   source: "Instagram",            status: "new",          owner: "Rawa Jalal", value: 12600, created: "10 Oct 2026", interest: "Store launch event" },
    { ref: "AC-LED-2026-000024", company: "Skyline Telecom",          contact: "Mr. Rebaz Anwar",   source: "Referral",             status: "converted",    owner: "Rawa Jalal", value: 58000, created: "02 Apr 2026", interest: "Annual partner gala" },
    { ref: "AC-LED-2026-000023", company: "Kurdistan Coffee Week",    contact: "Mr. Dara Faiq",     source: "Event",                status: "qualified",    owner: "Lana Qadir", value: 22000, created: "06 Oct 2026", interest: "Festival production" },
    { ref: "AC-LED-2026-000022", company: "Shaqlawa Mountain Lodge",  contact: "Mr. Hawre Ismail",  source: "Business Development", status: "converted",    owner: "Rawa Jalal", value: 19500, created: "03 Jun 2026", interest: "Lobby redesign" },
    { ref: "AC-LED-2026-000021", company: "Soran Glass Works",        contact: "Mr. Salar Aziz",    source: "Website",              status: "disqualified", owner: "Lana Qadir", value: 3500,  created: "28 Sep 2026", interest: "Catalogue print" },
    { ref: "AC-LED-2026-000020", company: "Erbil Book Fair",          contact: "Ms. Shno Kakai",    source: "Referral",             status: "qualified",    owner: "Lana Qadir", value: 27500, created: "25 Sep 2026", interest: "Pavilion build" },
    { ref: "AC-LED-2026-000019", company: "Zakho Riverside Hotel",    contact: "Mr. Delovan Mirza", source: "Business Development", status: "new",          owner: "Rawa Jalal", value: 46000, created: "21 Sep 2026", interest: "Ballroom refurbishment" },
    { ref: "AC-LED-2026-000018", company: "Chwar Chra Cafe",          contact: "Ms. Ashti Rauf",    source: "Instagram",            status: "new",          owner: "Rawa Jalal", value: 6800,  created: "17 Sep 2026", interest: "Menu and signage" }
  ];

  /* ---- Commercial: quotations and what they became ----------------------- */
  var STAGES = ["Issued", "Accepted", "Invoiced", "Paid", "Delivered"];

  function L(desc, qty, unit, price) { return { desc: desc, qty: qty, unit: unit, price: price }; }

  var QUOTATIONS = [
    { n: 47, title: "Annual partner gala 2026",          client: "Skyline Telecom",          division: "Events & Production", owner: "Rawa Jalal", issued: "08 Oct 2026", valid: "07 Nov 2026", stage: 3, status: "accepted",
      lines: [L("Venue design and stage build", 1, "lot", 18500), L("Lighting and sound package", 1, "lot", 9800), L("LED wall 6 x 3 m, two days", 2, "days", 2400), L("Guest branding and print", 450, "pcs", 12), L("Production crew", 14, "people", 260)],
      schedule: [{ label: "Advance on approval", pct: 50 }, { label: "Balance after the event", pct: 50 }] },
    { n: 46, title: "Lobby and reception redesign",      client: "Shaqlawa Mountain Lodge",  division: "Interiors & Fit-out", owner: "Rawa Jalal", issued: "02 Oct 2026", valid: "01 Nov 2026", stage: 1, status: "issued",
      lines: [L("Concept and 3D visuals", 1, "lot", 2600), L("Reception desk, walnut and brass", 1, "pcs", 6400), L("Feature wall cladding", 38, "m²", 145), L("Lighting fixtures", 1, "lot", 3900)],
      schedule: [{ label: "Advance on approval", pct: 40 }, { label: "On installation", pct: 40 }, { label: "On handover", pct: 20 }] },
    { n: 45, title: "Tech Summit 2026 production",       client: "Kurdistan Tech Summit",    division: "Events & Production", owner: "Lana Qadir", issued: "21 Sep 2026", valid: "21 Oct 2026", stage: 5, status: "accepted",
      lines: [L("Main stage and keynote set", 1, "lot", 24500), L("Exhibition booths 3 x 3 m", 24, "pcs", 950), L("Registration and badges", 1200, "pcs", 4), L("Livestream and recording", 2, "days", 3200), L("Event staff", 30, "people", 180)],
      schedule: [{ label: "Advance on approval", pct: 50 }, { label: "Balance on delivery", pct: 50 }] },
    { n: 44, title: "Clinic wayfinding and signage",     client: "Hawler Medical Centre",    division: "Branding & Print",    owner: "Rawa Jalal", issued: "17 Sep 2026", valid: "17 Oct 2026", stage: 3, status: "accepted",
      lines: [L("Wayfinding plan", 1, "lot", 1800), L("Directional signs, acrylic", 46, "pcs", 85), L("Door plates", 120, "pcs", 22), L("Installation", 1, "lot", 1400)],
      schedule: [{ label: "On approval", pct: 100 }] },
    { n: 43, title: "Ballroom refurbishment",            client: "Zagros Hotels Group",      division: "Interiors & Fit-out", owner: "Lana Qadir", issued: "09 Sep 2026", valid: "09 Oct 2026", stage: 3, status: "accepted",
      lines: [L("Design development", 1, "lot", 6800), L("Acoustic wall panels", 220, "m²", 95), L("Carpet, 80/20 wool", 640, "m²", 42), L("Chandeliers, custom", 6, "pcs", 4200), L("Site works and supervision", 1, "lot", 9600)],
      schedule: [{ label: "Advance on approval", pct: 40 }, { label: "On installation", pct: 40 }, { label: "On handover", pct: 20 }] },
    { n: 42, title: "Store launch weekend",              client: "Nishtiman Mall",           division: "Events & Production", owner: "Lana Qadir", issued: "01 Sep 2026", valid: "01 Oct 2026", stage: 5, status: "accepted",
      lines: [L("Atrium activation set", 1, "lot", 7800), L("Promoters and hosts", 16, "people", 140), L("Printed collateral", 1, "lot", 1900)],
      schedule: [{ label: "On approval", pct: 100 }] },
    { n: 41, title: "Brand identity and launch kit",     client: "Nova Pharma Kurdistan",    division: "Branding & Print",    owner: "Lana Qadir", issued: "24 Oct 2026", valid: "23 Nov 2026", stage: 0, status: "pending",
      lines: [L("Brand strategy workshop", 1, "lot", 2400), L("Identity design", 1, "lot", 5600), L("Stationery set", 1, "lot", 1300), L("Launch print run", 1, "lot", 3800)],
      schedule: [{ label: "Advance on approval", pct: 50 }, { label: "On final files", pct: 50 }] },
    { n: 40, title: "Restaurant fit-out, Ankawa branch", client: "Ankawa Bistro Group",      division: "Interiors & Fit-out", owner: "Rawa Jalal", issued: "26 Aug 2026", valid: "25 Sep 2026", stage: 4, status: "accepted",
      lines: [L("Interior design package", 1, "lot", 5200), L("Joinery and booth seating", 1, "lot", 16800), L("Bar counter", 1, "pcs", 7400), L("Signage and menu boards", 1, "lot", 2100)],
      schedule: [{ label: "Advance on approval", pct: 40 }, { label: "On installation", pct: 60 }] },
    { n: 39, title: "Show apartment styling",            client: "Garden City Developments", division: "Interiors & Fit-out", owner: "Lana Qadir", issued: "18 Aug 2026", valid: "17 Sep 2026", stage: 0, status: "declined",
      lines: [L("Styling concept", 1, "lot", 1900), L("Furniture package, rental", 1, "lot", 8600), L("Install and de-install", 1, "lot", 1600)],
      schedule: [{ label: "On approval", pct: 100 }] },
    { n: 38, title: "Graduation ceremony 2026",          client: "Erbil International School", division: "Events & Production", owner: "Lana Qadir", issued: "05 Aug 2026", valid: "04 Sep 2026", stage: 5, status: "accepted",
      lines: [L("Stage and backdrop", 1, "lot", 4600), L("Seating, 900 guests", 900, "pcs", 3.5), L("Sound and photography", 1, "lot", 2800)],
      schedule: [{ label: "On approval", pct: 100 }] },
    { n: 37, title: "Lakeside wedding pavilion",         client: "Dukan Lakeside Resort",    division: "Events & Production", owner: "Rawa Jalal", issued: "22 Jul 2026", valid: "21 Aug 2026", stage: 5, status: "accepted",
      lines: [L("Pavilion structure", 1, "lot", 11800), L("Floral and decor", 1, "lot", 6400), L("Lighting design", 1, "lot", 3900)],
      schedule: [{ label: "Advance on approval", pct: 50 }, { label: "Balance on delivery", pct: 50 }] },
    { n: 36, title: "Sales gallery fit-out",             client: "Sardam Real Estate",       division: "Interiors & Fit-out", owner: "Lana Qadir", issued: "10 Oct 2026", valid: "09 Nov 2026", stage: 1, status: "issued",
      lines: [L("Gallery design", 1, "lot", 3800), L("Model display plinth", 2, "pcs", 2600), L("Feature lighting", 1, "lot", 4100), L("Graphics and screens", 1, "lot", 5300)],
      schedule: [{ label: "Advance on approval", pct: 50 }, { label: "On handover", pct: 50 }] },
    { n: 35, title: "Quarterly brochure print",          client: "Zagros Hotels Group",      division: "Branding & Print",    owner: "Lana Qadir", issued: "14 Oct 2026", valid: "13 Nov 2026", stage: 2, status: "accepted",
      lines: [L("Layout and artwork", 1, "lot", 1200), L("Brochure A4, 24 pages", 3000, "pcs", 1.6), L("Delivery to four hotels", 1, "lot", 300)],
      schedule: [{ label: "On approval", pct: 100 }] }
  ];

  var STATUS_LABEL = { pending: "Awaiting approval", issued: "Issued", accepted: "Accepted", declined: "Declined", draft: "Draft" };

  QUOTATIONS.forEach(function (q) {
    q.ref = "AC-QUO-2026-0000" + q.n;
    q.subtotal = sum(q.lines, function (l) { return l.qty * l.price; });
    q.discount = q.subtotal > 40000 ? Math.round(q.subtotal * 0.05) : 0;
    q.total = q.subtotal - q.discount;
    q.contact = (by(CLIENTS, "name")[q.client] || {}).contact || "";
    q.statusLabel = STATUS_LABEL[q.status];
  });

  /* Invoices, receipts and delivery notes, derived from each quotation's
     stage and payment schedule so the chain always adds up. */
  var INVOICES = [], RECEIPTS = [], DELIVERIES = [];
  var invNo = 14, rcpNo = 10, dlnNo = 3;
  var INVOICE_DATES = ["12 Oct 2026", "24 Sep 2026", "19 Sep 2026", "14 Sep 2026", "05 Sep 2026", "30 Aug 2026", "12 Aug 2026", "26 Jul 2026", "15 Oct 2026"];
  QUOTATIONS.slice().reverse().forEach(function (q, qi) {
    if (q.stage < 3) {
      if (q.stage === 2) { /* invoiced in full, unpaid */
        invNo += 1;
        INVOICES.push({ ref: "AC-INV-2026-0000" + invNo, quotation: q.ref, client: q.client, amount: q.total, paid: 0,
          issued: "15 Oct 2026", due: "14 Nov 2026", label: "Full amount", status: "unpaid" });
        q.invoices = [INVOICES[INVOICES.length - 1].ref];
        q.schedule[0].invoice = q.invoices[0];
        q.schedule[0].paid = false;
        q.stage = 3; /* invoiced in full: the third dot */
      }
      return;
    }
    q.invoices = [];
    q.schedule.forEach(function (s, si) {
      var amount = Math.round(q.total * s.pct / 100);
      var paidUp = q.stage >= 4 || (q.stage === 3 && si === 0 && q.schedule.length > 1);
      var due = si === 0 || q.stage >= 4;
      if (!due && q.stage === 3) { return; }
      invNo += 1;
      var inv = { ref: "AC-INV-2026-0000" + invNo, quotation: q.ref, client: q.client, amount: amount,
        paid: paidUp ? amount : 0, issued: INVOICE_DATES[(qi + si) % INVOICE_DATES.length],
        due: si === 0 ? "On approval" : "On delivery", label: s.label, status: paidUp ? "paid" : "unpaid" };
      INVOICES.push(inv);
      q.invoices.push(inv.ref);
      s.invoice = inv.ref;
      s.paid = paidUp;
      if (paidUp) {
        rcpNo += 1;
        RECEIPTS.push({ ref: "AC-RCP-2026-0000" + rcpNo, invoice: inv.ref, quotation: q.ref, client: q.client,
          amount: amount, date: inv.issued, method: ["Bank transfer", "Cash", "FIB wallet"][rcpNo % 3] });
        s.receipt = RECEIPTS[RECEIPTS.length - 1].ref;
      }
    });
    if (q.stage >= 5) {
      dlnNo += 1;
      DELIVERIES.push({ ref: "AC-DLN-2026-00000" + dlnNo, quotation: q.ref, client: q.client, date: "Delivered" });
      q.delivery = DELIVERIES[DELIVERIES.length - 1].ref;
    }
  });
  /* One overdue invoice, so the receivables screen has something to chase. */
  INVOICES.forEach(function (inv) {
    if (inv.status === "unpaid" && inv.quotation === "AC-QUO-2026-000044") { inv.status = "overdue"; inv.due = "17 Oct 2026"; }
  });
  function invoicesOf(quotationRef) { return INVOICES.filter(function (i) { return i.quotation === quotationRef; }); }
  var OVERDUE_INVOICE = invoicesOf("AC-QUO-2026-000044")[0];
  var BROCHURE_INVOICE = invoicesOf("AC-QUO-2026-000035")[0];
  var ANKAWA_INVOICE = invoicesOf("AC-QUO-2026-000040").slice(-1)[0];

  /* ---- Costing sheets (every quotation starts as one) -------------------- */
  var COSTINGS = QUOTATIONS.filter(function (q) { return q.status !== "declined"; }).map(function (q, i) {
    var ratio = [0.62, 0.58, 0.66, 0.55, 0.61, 0.7, 0.57, 0.64, 0.6, 0.68, 0.63, 0.59][i % 12];
    var cost = Math.round(q.total * ratio);
    return {
      ref: "AC-JOB-2026-0000" + (12 + i), quotation: q.ref, title: q.title, client: q.client, division: q.division,
      cost: cost, sell: q.total, profit: q.total - cost, margin: Math.round((1 - ratio) * 1000) / 10,
      lines: q.lines.length + 2, status: q.status === "pending" ? "pending" : q.stage >= 5 ? "closed" : "approved",
      breakdown: [
        { name: "Materials",     value: Math.round(cost * 0.46) },
        { name: "Labour",        value: Math.round(cost * 0.24) },
        { name: "Subcontractors", value: Math.round(cost * 0.18) },
        { name: "Transport",     value: Math.round(cost * 0.07) },
        { name: "Contingency",   value: cost - Math.round(cost * 0.46) - Math.round(cost * 0.24) - Math.round(cost * 0.18) - Math.round(cost * 0.07) }
      ]
    };
  });

  /* ---- Payments ------------------------------------------------------------ */
  var PAYMENTS = RECEIPTS.map(function (r, i) {
    return { ref: "AC-PAY-2026-0000" + (10 + i), date: r.date, client: r.client, invoice: r.invoice, receipt: r.ref,
      method: r.method, account: r.method === "Cash" ? "Cash box (USD)" : r.method === "FIB wallet" ? "FIB wallet" : "Bank account (USD)",
      amount: r.amount, status: "verified", recordedBy: "Sara Fattah", verifiedBy: "Shilan Kareem" };
  });
  /* Recorded by finance, waiting for a second person to confirm it reached the
     bank: the brochure invoice, paid in full by transfer. */
  PAYMENTS.push({ ref: "AC-PAY-2026-000030", date: "26 Oct 2026", client: BROCHURE_INVOICE.client, invoice: BROCHURE_INVOICE.ref,
    receipt: "", method: "Bank transfer", account: "Bank account (USD)", amount: BROCHURE_INVOICE.amount, status: "recorded",
    recordedBy: "Sara Fattah", verifiedBy: "" });
  /* A transfer that bounced and was taken back before the client paid again. */
  PAYMENTS.push({ ref: "AC-PAY-2026-000029", date: "21 Oct 2026", client: ANKAWA_INVOICE.client, invoice: ANKAWA_INVOICE.ref,
    receipt: "", method: "Bank transfer", account: "Bank account (USD)", amount: ANKAWA_INVOICE.amount, status: "reversed",
    recordedBy: "Sara Fattah", verifiedBy: "", note: "Taken back: the first transfer never cleared. Its receipt was voided and a reversing entry posted; the client then paid in cash." });

  /* ---- Meetings ------------------------------------------------------------ */
  var MEETINGS = [
    { ref: "AC-MTG-2026-000041", title: "Ballroom snag walk",             with: "Zagros Hotels Group",     kind: "Client", owner: "Lana Qadir", day: 28, time: "10:00", length: 60, mode: "In person",  where: "Zagros Hotel, Erbil",        state: "scheduled" },
    { ref: "AC-MTG-2026-000040", title: "Presenting the pavilion concept", with: "Erbil Book Fair",         kind: "Lead",   owner: "Lana Qadir", day: 29, time: "13:30", length: 90, mode: "In person",  where: "Altun Creative studio",      state: "scheduled" },
    { ref: "AC-MTG-2026-000039", title: "Brand workshop prep call",        with: "Nova Pharma Kurdistan",   kind: "Client", owner: "Lana Qadir", day: 27, time: "15:00", length: 30, mode: "Phone call", where: "+964 750 000 0000",          state: "scheduled" },
    { ref: "AC-MTG-2026-000038", title: "Intro over coffee",               with: "Dara, Kurdistan Coffee Week", kind: "Name", owner: "Rawa Jalal", day: 27, time: "11:00", length: 45, mode: "In person", where: "Family Mall",               state: "scheduled" },
    { ref: "AC-MTG-2026-000037", title: "Site visit, lobby measurements",  with: "Shaqlawa Mountain Lodge", kind: "Client", owner: "Rawa Jalal", day: 25, time: "09:30", length: 120, mode: "In person", where: "Shaqlawa",                  state: "held", mood: "Very good", standing: "Ready to buy",
      report: "Measured the lobby and reception. They want walnut and brass, and asked for the desk to be ready before the new-year bookings.", next: "Send the revised quotation with the desk upgrade" },
    { ref: "AC-MTG-2026-000036", title: "Stand design brief",              with: "Duhok Auto Expo",         kind: "Lead",   owner: "Lana Qadir", day: 24, time: "14:00", length: 60, mode: "Video call", where: "Online",                    state: "held", mood: "Good",      standing: "Interested",
      report: "Three stands across two halls. Budget not fixed; they compare us with a Turkish supplier on price.", next: "Costing sheet for two options by Thursday" },
    { ref: "AC-MTG-2026-000035", title: "Gala run-of-show",                with: "Skyline Telecom",         kind: "Client", owner: "Rawa Jalal", day: 22, time: "10:00", length: 60, mode: "In person",  where: "Skyline HQ",                 state: "held", mood: "Very good", standing: "Ready to buy",
      report: "Signed off the run-of-show and the guest list of 450. Balance invoice to follow after the event.", next: "Confirm LED wall supplier" },
    { ref: "AC-MTG-2026-000034", title: "Graduation venue walk",           with: "Koya University",         kind: "Lead",   owner: "Lana Qadir", day: 20, time: "11:00", length: 60, mode: "In person",  where: "Koya campus",                state: "held", mood: "Mixed",     standing: "Thinking it over",
      report: "The dean likes the concept but the board meets on 5 November before deciding on any supplier.", next: "Call back after the board meets" },
    { ref: "AC-MTG-2026-000033", title: "Show flat follow-up",             with: "Garden City Developments", kind: "Client", owner: "Lana Qadir", day: 18, time: "16:00", length: 30, mode: "Phone call", where: "Phone",                    state: "held", mood: "Poor",      standing: "Cooling off",
      report: "They paused all marketing spend until the second tower is approved.", next: "Check in again in December" },
    { ref: "AC-MTG-2026-000032", title: "Clinic signage review",           with: "Hawler Medical Centre",   kind: "Client", owner: "Rawa Jalal", day: 15, time: "12:00", length: 45, mode: "In person",  where: "Hawler Medical Centre",      state: "held", mood: "Good",      standing: "Interested",
      report: "Approved the sign family. Invoice overdue: finance contact promised payment this week.", next: "Chase the overdue invoice" },
    { ref: "AC-MTG-2026-000031", title: "Spa branding intro",              with: "Pirmam Wellness Spa",     kind: "Lead",   owner: "Rawa Jalal", day: 23, time: "17:00", length: 30, mode: "Video call", where: "Online",                    state: "cancelled", reason: "They asked to move it to next month." },
    { ref: "AC-MTG-2026-000030", title: "Summit debrief",                  with: "Kurdistan Tech Summit",   kind: "Client", owner: "Lana Qadir", day: 13, time: "10:30", length: 60, mode: "In person",  where: "Altun Creative studio",      state: "held", mood: "Very good", standing: "Ready to buy",
      report: "Very happy with the event. They want to book 2027 early and add a second hall.", next: "Prepare a 2027 proposal" }
  ];
  MEETINGS.forEach(function (m) { m.date = (m.day < 10 ? "0" : "") + m.day + " Oct 2026"; });

  /* ---- Projects (delivery) -------------------------------------------------- */
  var PROJECTS = [
    { ref: "AC-PRJ-2026-000018", name: "Skyline partner gala",        client: "Skyline Telecom",          division: "Events & Production", manager: "Bryar Hama", column: "inProgress", progress: 72, due: "05 Nov 2026", health: "onTrack", team: ["Bryar Hama", "Zhwan Omer", "Avan Mustafa"], quotation: "AC-QUO-2026-000047" },
    { ref: "AC-PRJ-2026-000017", name: "Zagros ballroom refurbishment", client: "Zagros Hotels Group",    division: "Interiors & Fit-out", manager: "Dilan Aziz", column: "review",     progress: 91, due: "30 Oct 2026", health: "atRisk",  team: ["Dilan Aziz", "Soma Rasul"], quotation: "AC-QUO-2026-000043" },
    { ref: "AC-PRJ-2026-000016", name: "Clinic wayfinding",           client: "Hawler Medical Centre",    division: "Branding & Print",    manager: "Avan Mustafa", column: "review",   progress: 84, due: "29 Oct 2026", health: "onTrack", team: ["Avan Mustafa", "Nawroz Salih"], quotation: "AC-QUO-2026-000044" },
    { ref: "AC-PRJ-2026-000015", name: "Ankawa Bistro fit-out",       client: "Ankawa Bistro Group",      division: "Interiors & Fit-out", manager: "Soma Rasul", column: "inProgress", progress: 58, due: "12 Nov 2026", health: "late",    team: ["Soma Rasul", "Dilan Aziz", "Hozan Ahmed"], quotation: "AC-QUO-2026-000040" },
    { ref: "AC-PRJ-2026-000019", name: "Zagros quarterly brochure",   client: "Zagros Hotels Group",      division: "Branding & Print",    manager: "Nawroz Salih", column: "planned",  progress: 10, due: "20 Nov 2026", health: "onTrack", team: ["Nawroz Salih", "Avan Mustafa"], quotation: "AC-QUO-2026-000035" },
    { ref: "AC-PRJ-2026-000014", name: "Tech Summit 2026",            client: "Kurdistan Tech Summit",    division: "Events & Production", manager: "Bryar Hama", column: "delivered",  progress: 100, due: "12 Oct 2026", health: "onTrack", team: ["Bryar Hama", "Zhwan Omer", "Karwan Ali"], quotation: "AC-QUO-2026-000045" },
    { ref: "AC-PRJ-2026-000013", name: "Nishtiman store launch",      client: "Nishtiman Mall",           division: "Events & Production", manager: "Zhwan Omer", column: "delivered",  progress: 100, due: "20 Sep 2026", health: "onTrack", team: ["Zhwan Omer", "Bryar Hama"], quotation: "AC-QUO-2026-000042" },
    { ref: "AC-PRJ-2026-000020", name: "Shaqlawa lobby (pending)",    client: "Shaqlawa Mountain Lodge",  division: "Interiors & Fit-out", manager: "Dilan Aziz", column: "planned",    progress: 0, due: "Dec 2026", health: "onTrack", team: ["Dilan Aziz"], quotation: "AC-QUO-2026-000046" }
  ];

  var BOARD_COLUMNS = [
    { id: "planned",    label: "Planned" },
    { id: "inProgress", label: "In progress" },
    { id: "review",     label: "Quality review" },
    { id: "delivered",  label: "Delivered" }
  ];

  /* ---- Procurement ---------------------------------------------------------- */
  var SUPPLIERS = [
    { name: "Hawler Timber & Joinery", category: "Joinery",        city: "Erbil",        status: "approved", rating: 4.6, spend: 38400 },
    { name: "Lumen Lighting Co.",       category: "Lighting",       city: "Erbil",        status: "approved", rating: 4.4, spend: 21900 },
    { name: "PrintLab Kurdistan",       category: "Print",          city: "Erbil",        status: "approved", rating: 4.8, spend: 16200 },
    { name: "Stagecraft AV",            category: "Audio & video",  city: "Sulaymaniyah", status: "approved", rating: 4.1, spend: 27300 },
    { name: "Silk Road Fabrics",        category: "Textiles",       city: "Duhok",        status: "pending",  rating: 0,   spend: 0 },
    { name: "Quick Haul Logistics",     category: "Transport",      city: "Erbil",        status: "blocked",  rating: 2.3, spend: 2400 }
  ];

  var PURCHASES = [
    { ref: "AC-PR-2026-000052", title: "LED wall rental, two days",       project: "Skyline partner gala",        supplier: "Stagecraft AV",          by: "Bryar Hama",  amount: 4100, status: "approved", needed: "03 Nov 2026" },
    { ref: "AC-PR-2026-000051", title: "Walnut veneer and brass trim",    project: "Shaqlawa lobby (pending)",    supplier: "Hawler Timber & Joinery", by: "Dilan Aziz",  amount: 5600, status: "pending",  needed: "15 Nov 2026" },
    { ref: "AC-PR-2026-000050", title: "Acoustic panels, final batch",    project: "Zagros ballroom refurbishment", supplier: "Hawler Timber & Joinery", by: "Soma Rasul", amount: 7300, status: "ordered", needed: "29 Oct 2026" },
    { ref: "AC-PR-2026-000049", title: "Brochure paper stock, 3,000 sets", project: "Zagros quarterly brochure",  supplier: "PrintLab Kurdistan",     by: "Nawroz Salih", amount: 2300, status: "draft",    needed: "10 Nov 2026" },
    { ref: "AC-PR-2026-000048", title: "Bar counter lighting",             project: "Ankawa Bistro fit-out",      supplier: "Lumen Lighting Co.",     by: "Soma Rasul",  amount: 1850, status: "received", needed: "20 Oct 2026" },
    { ref: "AC-PR-2026-000047", title: "Acrylic sign blanks",              project: "Clinic wayfinding",          supplier: "PrintLab Kurdistan",     by: "Avan Mustafa", amount: 1260, status: "received", needed: "06 Oct 2026" },
    { ref: "AC-PR-2026-000046", title: "Crew transport, gala week",        project: "Skyline partner gala",        supplier: "Quick Haul Logistics",   by: "Zhwan Omer",  amount: 950,  status: "rejected", needed: "02 Nov 2026" }
  ];

  /* ---- Attendance (the door device) ------------------------------------------ */
  var TODAY_BOARD = [
    { name: "Shilan Kareem", state: "inOffice", firstIn: "08:47" },
    { name: "Hemin Darwesh", state: "inOffice", firstIn: "08:52" },
    { name: "Lana Qadir",    state: "out",      firstIn: "08:58", note: "At a client meeting" },
    { name: "Rawa Jalal",    state: "inOffice", firstIn: "09:04" },
    { name: "Dilan Aziz",    state: "inOffice", firstIn: "08:41" },
    { name: "Soma Rasul",    state: "leave",    firstIn: "",      note: "Annual leave until Thursday" },
    { name: "Bryar Hama",    state: "late",     firstIn: "09:23", note: "23 minutes late" },
    { name: "Zhwan Omer",    state: "inOffice", firstIn: "08:55" },
    { name: "Nawroz Salih",  state: "inOffice", firstIn: "09:06" },
    { name: "Avan Mustafa",  state: "onBreak",  firstIn: "08:50", note: "On break since 12:20" },
    { name: "Karwan Ali",    state: "inOffice", firstIn: "09:00" },
    { name: "Sara Fattah",   state: "inOffice", firstIn: "08:49" },
    { name: "Hozan Ahmed",   state: "notIn",    firstIn: "",      note: "No punch yet" },
    { name: "Tara Mahmood",  state: "inOffice", firstIn: "08:39" }
  ];

  /* October so far: Friday is the rest day; a few people have leave, lateness
     and one missed day, generated from a fixed seed. */
  var rand = seeded(26);
  var OCT_DAYS = [];
  for (var d = 1; d <= 27; d += 1) {
    var weekday = new Date(2026, 9, d).getDay(); /* 5 = Friday */
    OCT_DAYS.push({ day: d, weekday: weekday, rest: weekday === 5 });
  }
  var SHEET = PEOPLE.map(function (p, pi) {
    var row = OCT_DAYS.map(function (day) {
      if (day.rest) { return "rest"; }
      if (day.day === 27) { return ({ leave: "leave", late: "late", notIn: "pending" })[TODAY_BOARD[pi].state] || "present"; }
      if (p.name === "Soma Rasul" && day.day >= 25) { return "leave"; }
      if (p.name === "Rawa Jalal" && day.day < 12) { return "none"; }
      var r = rand();
      if (r < 0.035) { return "absent"; }
      if (r < 0.13) { return "late"; }
      if (r < 0.16) { return "leave"; }
      return "present";
    });
    return { name: p.name, division: p.division, days: row };
  });

  var EXCEPTIONS = [
    { date: "26 Oct 2026", person: "Bryar Hama",   kind: "Late",                 detail: "Arrived at 09:31, 21 minutes after the 10-minute grace.",            state: "open" },
    { date: "26 Oct 2026", person: "Avan Mustafa", kind: "Break ran over",       detail: "Break of 104 minutes against an allowance of 60.",                    state: "explained", explanation: "Collected the sign blanks from PrintLab on the way back." },
    { date: "25 Oct 2026", person: "Hozan Ahmed",  kind: "Missing punch",        detail: "No departure punch, so the device cannot say when he left.",         state: "correction", explanation: "Asked to correct: left at 17:05, the device did not read the card." },
    { date: "22 Oct 2026", person: "Zhwan Omer",   kind: "Unofficial overtime",  detail: "Stayed until 19:40, 2 h 10 min past 17:30, not agreed beforehand.", state: "accepted", explanation: "Gala rehearsal ran late; accepted by the project manager." },
    { date: "21 Oct 2026", person: "Karwan Ali",   kind: "Left early",           detail: "Left at 15:12, 1 h 48 min before 17:00.",                             state: "explained", explanation: "Doctor's appointment, note handed to HR." },
    { date: "20 Oct 2026", person: "Nawroz Salih", kind: "Late",                 detail: "Arrived at 09:44, 34 minutes after the grace.",                       state: "open" }
  ];

  /* ---- Approvals inbox -------------------------------------------------------- */
  var APPROVALS = [
    { ref: "AC-QUO-2026-000041", kind: "Quotation",            icon: "file",     title: "Brand identity and launch kit",       from: "Lana Qadir",  amount: 13100, age: "3 days", due: "Today",     rule: "Raised by Lana Qadir. The two-person rule means she cannot approve her own quotation." },
    { ref: "AC-PR-2026-000051",  kind: "Purchase request",     icon: "cart",     title: "Walnut veneer and brass trim",        from: "Dilan Aziz",  amount: 5600,  age: "1 day",  due: "Tomorrow",  rule: "Over 5,000 USD, so it needs the Operations Director or the CEO." },
    { ref: "AC-PAY-2026-000030", kind: "Payment verification", icon: "banknote", title: "Bank transfer from Zagros Hotels Group", from: "Sara Fattah", amount: BROCHURE_INVOICE.amount, age: "18 h", due: "Today", rule: "Recorded by Sara Fattah against " + BROCHURE_INVOICE.ref + ". A second person confirms it reached the bank before the receipt is issued." },
    { ref: "AC-ATC-2026-000006", kind: "Attendance correction", icon: "clock",   title: "Hozan Ahmed, 25 Oct: left at 17:05", from: "Hozan Ahmed", amount: 0,     age: "2 days", due: "Overdue",   rule: "The record stays as the device read it until a manager decides." },
    { ref: "AC-LVR-2026-000019", kind: "Leave request",        icon: "calendar", title: "Nawroz Salih, 9-11 Nov, annual leave", from: "Nawroz Salih", amount: 0,    age: "5 h",    due: "In 3 days", rule: "Three days of 21 remaining this year." },
    { ref: "AC-JOB-2026-000024", kind: "Costing sheet",        icon: "scale",    title: "Duhok Auto Expo, option B",           from: "Lana Qadir",  amount: 38800, age: "4 h",    due: "In 2 days", rule: "Approving the sheet raises the draft quotation from it." }
  ];

  /* ---- Personal tasks (the CEO's own list) ------------------------------------ */
  var TASKS = [
    { ref: "AC-TSK-2026-000412", title: "Sign off the Skyline gala run-of-show",    state: "active", priority: "urgent", due: "Today 15:00",  late: false },
    { ref: "AC-TSK-2026-000409", title: "Review Q4 hiring plan with Tara",          state: "active", priority: "high",   due: "Tomorrow",     late: false },
    { ref: "AC-TSK-2026-000404", title: "Approve Nova Pharma brand quotation",      state: "queued", priority: "high",   due: "2 days late",  late: true },
    { ref: "AC-TSK-2026-000401", title: "Call Garden City about the show flat",     state: "queued", priority: "normal", due: "Thu 29 Oct",   late: false },
    { ref: "AC-TSK-2026-000398", title: "Renew studio insurance",                    state: "queued", priority: "normal", due: "Sun 1 Nov",    late: false },
    { ref: "AC-TSK-2026-000395", title: "Prepare 2027 proposal for the Tech Summit", state: "queued", priority: "normal", due: "Tue 10 Nov",   late: false },
    { ref: "AC-TSK-2026-000390", title: "Pick the new studio coffee machine",        state: "queued", priority: "low",    due: "No date",      late: false },
    { ref: "AC-TSK-2026-000386", title: "Lighting supplier contract renewal",        state: "onHold", priority: "normal", due: "Sat 7 Nov",    late: false, note: "Waiting for Lumen's new price list" },
    { ref: "AC-TSK-2026-000381", title: "Quarterly board pack",                      state: "done",   priority: "high",   due: "Done 22 Oct",  late: false },
    { ref: "AC-TSK-2026-000379", title: "Interview for the 3D visualiser role",      state: "done",   priority: "normal", due: "Done 20 Oct",  late: false }
  ];

  /* ---- Alerts and the audit trail -------------------------------------------- */
  var ALERTS = [
    { tone: "critical", icon: "receipt",  title: "Invoice " + OVERDUE_INVOICE.ref + " is overdue", meta: OVERDUE_INVOICE.client + ", 10 days past due", route: "finance" },
    { tone: "warning",  icon: "file",     title: "2 quotations expire this week",         meta: "Shaqlawa Mountain Lodge and Sardam Real Estate", route: "commercial" },
    { tone: "serious",  icon: "inbox",    title: "6 approvals are waiting for you",       meta: "One attendance correction is overdue", route: "approvals" },
    { tone: "info",     icon: "calendarCheck", title: "1 meeting report is due",          meta: "Rawa Jalal: intro over coffee, today 11:00", route: "meetings" }
  ];

  var AUDIT = [
    { seq: 5075, when: "27 Oct 2026 10:41", who: "Sara Fattah",   action: "finance.payment.record",   target: "AC-PAY-2026-000030", hash: "9f3a c4e1" },
    { seq: 5074, when: "27 Oct 2026 10:12", who: "Lana Qadir",    action: "crm.meeting.schedule",     target: "AC-MTG-2026-000041", hash: "71bd 02fa" },
    { seq: 5073, when: "27 Oct 2026 09:58", who: "System",        action: "attendance.import",        target: "14 punches",         hash: "e208 9c33" },
    { seq: 5072, when: "27 Oct 2026 09:31", who: "Dilan Aziz",    action: "procurement.request.submit", target: "AC-PR-2026-000051", hash: "3c6e a917" },
    { seq: 5071, when: "26 Oct 2026 17:44", who: "Rawa Jalal",    action: "crm.lead.create",          target: "AC-LED-2026-000031", hash: "b4f0 6d28" },
    { seq: 5070, when: "26 Oct 2026 16:20", who: "Shilan Kareem", action: "commercial.quotation.approve", target: "AC-QUO-2026-000035", hash: "0a91 e7c4" },
    { seq: 5069, when: "26 Oct 2026 15:02", who: "Bryar Hama",    action: "projects.task.complete",   target: "AC-PRJ-2026-000018", hash: "d57c 1b80" },
    { seq: 5068, when: "26 Oct 2026 11:37", who: "Hemin Darwesh", action: "identity.role.grant",      target: "Rawa Jalal",         hash: "6e2d f443" },
    { seq: 5067, when: "25 Oct 2026 18:05", who: "Sara Fattah",   action: "finance.payment.reverse",  target: "AC-PAY-2026-000029", hash: "c90b 5a1e" }
  ];

  var ROLES = [
    { name: "Founder & CEO",      people: 1, icon: "shield",    summary: "Every permission in the system. Signs off quotations and payments; decides who follows whose meetings.", scope: ["Everything", "Finance", "Approvals", "Audit"] },
    { name: "Operations & Finance", people: 4, icon: "settings",  summary: "The senior checker across operations: approves documents, purchase requests and leave, but makes none of them.", scope: ["Commercial approval", "Procurement", "HR", "Projects"] },
    { name: "Creative Director",  people: 3, icon: "layers",    summary: "Runs delivery and holds the quality gate on deliverables.", scope: ["Projects", "Quality review", "Documents"] },
    { name: "Business Developer", people: 2, icon: "megaphone", summary: "Works leads into clients, schedules meetings and writes their reports. Sees no money.", scope: ["Leads", "Clients", "Meetings", "Pipeline"] },
    { name: "Delivery Team",  people: 4, icon: "clipboard", summary: "Delivery tasks and company documents. No commercial documents and no finance.", scope: ["Project tasks", "Documents"] }
  ];

  var ORG = {
    name: "Altun Creative LLC",
    branches: [
      { name: "Erbil Head Office", city: "Erbil", units: [
        { name: "Management",            head: "Shilan Kareem" },
        { name: "Business Development",  head: "Lana Qadir" },
        { name: "Events & Production",   head: "Bryar Hama" },
        { name: "Interiors & Fit-out",   head: "Dilan Aziz" },
        { name: "Branding & Print",      head: "Avan Mustafa" },
        { name: "Digital",               head: "Karwan Ali" },
        { name: "Finance",               head: "Sara Fattah" },
        { name: "Operations",            head: "Hemin Darwesh" }
      ]},
      { name: "Sulaymaniyah Studio", city: "Sulaymaniyah", units: [
        { name: "Interiors & Fit-out",   head: "Soma Rasul" }
      ]}
    ]
  };

  /* ---- Series for charts ------------------------------------------------------ */
  var CHARTS = {
    months: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    received: [38400, 52100, 47800, 61900, 70350, 58600],
    quotesIssued: [9, 11, 8, 12, 14, 13],
    quotesAccepted: [5, 7, 5, 8, 10, 7],
    attendanceRate: [93.1, 94.6, 92.8, 95.2, 94.9, 96.1],
    weeks: ["Wk 39", "40", "41", "42", "43", "44"],
    attendanceWeeks: [93.8, 95.1, 94.2, 96.4, 95.7, 96.1],
    pipeline: [
      { name: "Qualified",   value: 12 },
      { name: "Discovery",   value: 9 },
      { name: "Proposal",    value: 7 },
      { name: "Negotiation", value: 4 },
      { name: "Won",         value: 6 }
    ],
    leadActivity: {
      columns: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
      rows: [
        { label: "Wk 39", values: [3, 5, 2, 4, 6, 1] },
        { label: "Wk 40", values: [4, 6, 3, 5, 4, 2] },
        { label: "Wk 41", values: [2, 4, 6, 7, 3, 2] },
        { label: "Wk 42", values: [5, 7, 4, 6, 8, 3] },
        { label: "Wk 43", values: [6, 8, 5, 9, 7, 4] }
      ]
    }
  };

  /* ---- Derived figures --------------------------------------------------------- */
  function receivedThisMonth() { return CHARTS.received[CHARTS.received.length - 1]; }
  function outstanding() { return sum(INVOICES.filter(function (i) { return i.status !== "paid"; }), function (i) { return i.amount - i.paid; }); }
  function standingOffers() { return QUOTATIONS.filter(function (q) { return q.status === "issued" || q.status === "pending"; }); }
  function openLeads() { return LEADS.filter(function (l) { return l.status === "new" || l.status === "qualified"; }); }
  function inOffice() { return count(TODAY_BOARD, function (p) { return p.state === "inOffice" || p.state === "late" || p.state === "onBreak"; }); }
  function revenueByDivision() {
    var totals = {};
    QUOTATIONS.forEach(function (q) { if (q.status === "accepted") { totals[q.division] = (totals[q.division] || 0) + q.total; } });
    return Object.keys(totals).map(function (k) { return { name: k, value: totals[k] }; })
      .sort(function (a, b) { return b.value - a.value; });
  }
  function leadSources() {
    var totals = {};
    LEADS.forEach(function (l) { totals[l.source] = (totals[l.source] || 0) + 1; });
    return Object.keys(totals).map(function (k) { return { name: k, value: totals[k] }; })
      .sort(function (a, b) { return b.value - a.value; });
  }
  /* What clients owe, by how late it is - from the invoices themselves, so the
     buckets always add up to the Outstanding figure. */
  function aging() {
    var open = INVOICES.filter(function (i) { return i.status !== "paid"; });
    var owed = function (rows) { return sum(rows, function (i) { return i.amount - i.paid; }); };
    return [
      { name: "Not yet due",  value: owed(open.filter(function (i) { return i.status === "unpaid"; })) },
      { name: "1-30 days",    value: owed(open.filter(function (i) { return i.status === "overdue"; })) },
      { name: "31-60 days",   value: 0 },
      { name: "61-90 days",   value: 0 },
      { name: "Over 90 days", value: 0 }
    ];
  }
  function documents() {
    var rows = [];
    QUOTATIONS.forEach(function (q) { rows.push({ ref: q.ref, type: "Quotation", client: q.client, amount: q.total, date: q.issued, status: q.status }); });
    INVOICES.forEach(function (i) { rows.push({ ref: i.ref, type: "Invoice", client: i.client, amount: i.amount, date: i.issued, status: i.status }); });
    RECEIPTS.forEach(function (r) { rows.push({ ref: r.ref, type: "Receipt", client: r.client, amount: r.amount, date: r.date, status: "paid" }); });
    DELIVERIES.forEach(function (n) { rows.push({ ref: n.ref, type: "Delivery note", client: n.client, amount: 0, date: "-", status: "completed" }); });
    PURCHASES.filter(function (p) { return p.status === "ordered" || p.status === "received"; }).forEach(function (p, i) {
      rows.push({ ref: "AC-PO-2026-0000" + (31 + i), type: "Purchase order", client: p.supplier, amount: p.amount, date: p.needed, status: p.status === "received" ? "completed" : "inProgress" });
    });
    return rows;
  }

  global.DATA = {
    meta: META, divisions: DIVISIONS, people: PEOPLE, clients: CLIENTS, leads: LEADS,
    quotations: QUOTATIONS, stages: STAGES, invoices: INVOICES, receipts: RECEIPTS, deliveries: DELIVERIES,
    costings: COSTINGS, payments: PAYMENTS, meetings: MEETINGS, projects: PROJECTS, board: BOARD_COLUMNS,
    suppliers: SUPPLIERS, purchases: PURCHASES, todayBoard: TODAY_BOARD, octDays: OCT_DAYS, sheet: SHEET,
    exceptions: EXCEPTIONS, approvals: APPROVALS, tasks: TASKS, alerts: ALERTS, audit: AUDIT, roles: ROLES,
    org: ORG, charts: CHARTS,
    sum: sum, count: count, by: by, usd: usd, compact: compact,
    receivedThisMonth: receivedThisMonth, outstanding: outstanding, standingOffers: standingOffers,
    openLeads: openLeads, inOffice: inOffice, revenueByDivision: revenueByDivision,
    leadSources: leadSources, aging: aging, documents: documents,
    person: function (name) { return by(PEOPLE, "name")[name]; },
    client: function (name) { return by(CLIENTS, "name")[name]; },
    quotation: function (ref) { return by(QUOTATIONS, "ref")[ref]; },
    invoice: function (ref) { return by(INVOICES, "ref")[ref]; }
  };
})(window);
