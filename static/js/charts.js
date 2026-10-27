/* ============================================================================
   Base Agency Design System — Chart layer

   Hand-rolled SVG. No chart library, no CDN — the demo has to open from a
   file:// path, GitHub Pages or Cloudflare Pages with equal reliability.

   Every chart here obeys the same contract:
     · one axis, never two y-scales
     · categorical hue follows the entity, fixed slot order, never cycled
     · thin marks (bars <=24px, 4px rounded data-end), hairline solid grid
     · a 2px surface gap between touching fills, a 2px surface ring on dots
     · a legend whenever there are two or more series; one series gets none
     · selective direct labels — never a number on every point
     · hover AND keyboard reach the same values, and a table view exists so
       nothing is gated behind a tooltip
   ========================================================================= */
(function (global) {
  "use strict";

  var SERIES = ["--series-1", "--series-2", "--series-3", "--series-4", "--series-5", "--series-6"];
  var SEQ = ["--seq-100", "--seq-200", "--seq-300", "--seq-400", "--seq-500", "--seq-600", "--seq-700"];

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function seriesColor(i) { return cssVar(SERIES[i % SERIES.length]); }
  function seqColor(i) { return cssVar(SEQ[Math.max(0, Math.min(SEQ.length - 1, i))]); }

  /* ---- Formatting ------------------------------------------------------ */
  var Fmt = {
    int: function (v) { return Math.round(v).toLocaleString("en-US"); },
    dec: function (v, d) { return Number(v).toFixed(d === undefined ? 1 : d); },
    pct: function (v, d) { return Fmt.dec(v, d === undefined ? 1 : d) + "%"; },
    /* Compact IQD — school finance runs in hundreds of millions */
    money: function (v) {
      var n = Math.abs(v);
      if (n >= 1e9) { return (v / 1e9).toFixed(2) + "B"; }
      /* one decimal only below 10M, so a single chart never mixes 92.0M with 214M */
      if (n >= 1e6) { return (v / 1e6).toFixed(n >= 1e7 ? 0 : 1) + "M"; }
      if (n >= 1e3) { return (v / 1e3).toFixed(0) + "K"; }
      return Fmt.int(v);
    },
    moneyFull: function (v) { return Fmt.int(v) + " IQD"; },
    /* Axis ticks round to clean numbers */
    tick: function (v, unit) {
      if (unit === "%") { return Fmt.dec(v, v % 1 === 0 ? 0 : 1) + "%"; }
      if (unit === "IQD") { return Fmt.money(v); }
      /* keep half steps honest: 2.5 must not print as "3" */
      return v % 1 === 0 ? Fmt.int(v) : Fmt.dec(v, 1);
    }
  };

  /* ---- "Nice" axis scale ----------------------------------------------- */
  function niceScale(min, max, count) {
    count = count || 5;
    if (min === max) { max = min + 1; }
    var range = max - min;
    var raw = range / (count - 1);
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var norm = raw / mag;
    var step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
    var lo = Math.floor(min / step) * step;
    var hi = Math.ceil(max / step) * step;
    var ticks = [];
    for (var v = lo; v <= hi + step * 0.001; v += step) {
      ticks.push(Math.round(v * 1e6) / 1e6);
    }
    return { min: lo, max: hi, ticks: ticks, step: step };
  }

  /* ---- SVG helpers ----------------------------------------------------- */
  var NS = "http://www.w3.org/2000/svg";
  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] !== null && attrs[k] !== undefined) { node.setAttribute(k, attrs[k]); }
      });
    }
    return node;
  }
  /* Rounded at the data end, square at the baseline */
  function barPathV(x, y, w, h, r) {
    if (h <= 0) { return ""; }
    r = Math.min(r, w / 2, h);
    return "M" + x + "," + (y + h) +
           "V" + (y + r) +
           "a" + r + "," + r + " 0 0 1 " + r + "," + -r +
           "h" + (w - 2 * r) +
           "a" + r + "," + r + " 0 0 1 " + r + "," + r +
           "V" + (y + h) + "Z";
  }
  function barPathH(x, y, w, h, r) {
    if (w <= 0) { return ""; }
    r = Math.min(r, h / 2, w);
    return "M" + x + "," + y +
           "H" + (x + w - r) +
           "a" + r + "," + r + " 0 0 1 " + r + "," + r +
           "v" + (h - 2 * r) +
           "a" + r + "," + r + " 0 0 1 " + -r + "," + r +
           "H" + x + "Z";
  }
  function linePath(pts) {
    return pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + "," + p[1]; }).join("");
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---- Shared scaffolding ---------------------------------------------- */

  /**
   * Build the slot: plot + legend + table twin.
   * spec.label(v) formats values; spec.unit drives axis ticks.
   */
  function buildSlot(host, spec) {
    host.innerHTML = "";
    host.classList.add("viz-slot");
    host.setAttribute("data-mode", "chart");

    var viz = document.createElement("div");
    viz.className = "viz";
    viz.style.direction = "ltr"; /* numeric plots stay LTR in every locale */

    var tip = document.createElement("div");
    tip.className = "viz__tip";
    tip.setAttribute("role", "status");
    tip.setAttribute("aria-live", "polite");

    viz.appendChild(tip);
    host.appendChild(viz);

    var legend = null;
    if (spec.series && spec.series.length > 1) {
      legend = document.createElement("div");
      legend.className = "legend";
      host.appendChild(legend);
    }

    var table = document.createElement("div");
    table.className = "viz-table";
    host.appendChild(table);

    return { host: host, viz: viz, tip: tip, legend: legend, table: table };
  }

  function seriesName(s) {
    return s.label || (global.I18n ? I18n.t(s.name) : s.name);
  }

  function paintLegend(slot, spec, onToggle) {
    if (!slot.legend) { return; }
    slot.legend.innerHTML = spec.series.map(function (s, i) {
      var keyCls = spec.type === "line" ? "legend__key legend__key--line" : "legend__key";
      return '<button type="button" data-idx="' + i + '" aria-pressed="true">' +
        '<span class="' + keyCls + '" style="background:' + seriesColor(i) + '"></span>' +
        esc(seriesName(s)) + "</button>";
    }).join("");

    slot.legend.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-idx]");
      if (!b) { return; }
      var on = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", String(!on));
      onToggle();
    });
    /* Hovering a legend entry recedes the other series */
    slot.legend.addEventListener("pointerover", function (e) {
      var b = e.target.closest("button[data-idx]");
      if (b) { slot.viz.setAttribute("data-focus-series", String(Number(b.dataset.idx) + 1)); }
    });
    slot.legend.addEventListener("pointerout", function () {
      slot.viz.removeAttribute("data-focus-series");
    });
  }

  function hiddenSet(slot) {
    var out = {};
    if (!slot.legend) { return out; }
    slot.legend.querySelectorAll("button[data-idx]").forEach(function (b) {
      if (b.getAttribute("aria-pressed") === "false") { out[b.dataset.idx] = true; }
    });
    return out;
  }

  /** The table twin — every value reachable without hover or colour. */
  function paintTable(slot, spec) {
    var label = spec.label || Fmt.int;
    var head = '<th scope="col">' + esc(spec.categoryLabel || "Category") + "</th>" +
      spec.series.map(function (s, i) {
        return '<th scope="col" class="num"><span class="swatch" style="background:' +
          seriesColor(i) + '"></span>' + esc(seriesName(s)) + "</th>";
      }).join("");

    var rows = spec.categories.map(function (c, ci) {
      return "<tr><th scope=\"row\">" + esc(c) + "</th>" +
        spec.series.map(function (s) {
          return '<td class="num">' + esc(label(s.values[ci])) + "</td>";
        }).join("") + "</tr>";
    }).join("");

    slot.table.innerHTML = "<table><caption class=\"sr-only\">" +
      esc(spec.title || "Chart data") + "</caption><thead><tr>" + head +
      "</tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function tipHTML(title, rows) {
    return '<div class="viz__tip-head">' + esc(title) + "</div>" +
      rows.map(function (r) {
        return '<div class="viz__tip-row">' +
          (r.color ? '<span class="viz__tip-key" style="background:' + r.color + '"></span>' : "") +
          '<span class="viz__tip-name">' + esc(r.name) + "</span>" +
          '<span class="viz__tip-val">' + esc(r.value) + "</span></div>";
      }).join("");
  }

  function placeTip(slot, x, y) {
    var tip = slot.tip;
    var box = slot.viz.getBoundingClientRect();
    var tw = tip.offsetWidth || 150;
    var left = x + 14;
    if (left + tw > box.width) { left = x - tw - 14; }
    if (left < 0) { left = 4; }
    tip.style.left = Math.round(left) + "px";
    tip.style.top = Math.round(Math.max(4, y - 12)) + "px";
    tip.setAttribute("data-open", "true");
  }
  function hideTip(slot) {
    slot.tip.removeAttribute("data-open");
    slot.viz.removeAttribute("data-hover");
  }

  /* Re-render on resize so labels never collide at a new width */
  function responsive(slot, draw) {
    var last = 0;
    var frame = null;
    function run() {
      var w = slot.viz.clientWidth;
      if (!w) { return; }
      last = w;
      draw(w);
    }
    run();
    if (typeof ResizeObserver === "function") {
      var ro = new ResizeObserver(function () {
        var w = slot.viz.clientWidth;
        if (Math.abs(w - last) < 8) { return; }
        if (frame) { cancelAnimationFrame(frame); }
        frame = requestAnimationFrame(run);
      });
      ro.observe(slot.viz);
    } else {
      window.addEventListener("resize", function () {
        if (frame) { cancelAnimationFrame(frame); }
        frame = requestAnimationFrame(run);
      });
    }
    return run;
  }

  /* ========================================================================
     LINE / AREA — trend over time
     ===================================================================== */
  function line(host, spec) {
    var slot = buildSlot(host, spec);
    var label = spec.label || Fmt.int;
    var H = spec.height || 236;
    var PAD = { t: 14, r: 18, b: 30, l: 52 };

    var redraw = responsive(slot, function (W) {
      var hidden = hiddenSet(slot);
      var live = spec.series.filter(function (s, i) { return !hidden[i]; });
      var svg = el("svg", { width: W, height: H, role: "img",
        "aria-label": (spec.title || "Trend chart") + ". " + (spec.summary || "") });

      var pw = W - PAD.l - PAD.r;
      var ph = H - PAD.t - PAD.b;

      var flat = [];
      live.forEach(function (s) { flat = flat.concat(s.values); });
      if (spec.target !== undefined) { flat.push(spec.target); }
      if (!flat.length) { flat = [0, 1]; }
      var lo = Math.min.apply(null, flat);
      var hi = Math.max.apply(null, flat);
      var pad = (hi - lo) * 0.12 || 1;
      var scale = niceScale(spec.zeroBased === false ? lo - pad : 0, hi + pad, 5);

      function X(i) {
        return PAD.l + (spec.categories.length === 1 ? pw / 2 : (pw * i) / (spec.categories.length - 1));
      }
      function Y(v) { return PAD.t + ph - ((v - scale.min) / (scale.max - scale.min)) * ph; }

      /* Gridlines + y ticks — hairline, solid, recessive */
      scale.ticks.forEach(function (tv) {
        var y = Y(tv);
        svg.appendChild(el("line", { class: "grid-line", x1: PAD.l, x2: W - PAD.r, y1: y, y2: y }));
        var tx = el("text", { class: "tick tick--y", x: PAD.l - 9, y: y + 4 });
        tx.textContent = Fmt.tick(tv, spec.unit);
        svg.appendChild(tx);
      });

      /* Target reference — same scale, so no second axis is invented.
         Labelled at the start of the rule: the right edge belongs to the
         series end-labels, and stacking the two there reads as noise. */
      if (spec.target !== undefined) {
        var ty = Y(spec.target);
        svg.appendChild(el("line", {
          x1: PAD.l, x2: W - PAD.r, y1: ty, y2: ty,
          stroke: cssVar("--ink-muted"), "stroke-width": 1, "stroke-dasharray": "5 4", opacity: 0.75
        }));
        var tlab = el("text", { class: "mark-label mark-label--muted", x: PAD.l + 4, y: ty - 7 });
        tlab.textContent = (spec.targetLabel || "Target") + " " + Fmt.tick(spec.target, spec.unit);
        svg.appendChild(tlab);
      }

      /* x ticks — thin them out when the plot is narrow */
      var everyN = Math.ceil(spec.categories.length / Math.max(3, Math.floor(pw / 62)));
      spec.categories.forEach(function (c, i) {
        if (i % everyN !== 0 && i !== spec.categories.length - 1) { return; }
        var tx2 = el("text", { class: "tick tick--x", x: X(i), y: H - PAD.b + 18 });
        tx2.textContent = c;
        svg.appendChild(tx2);
      });
      svg.appendChild(el("line", { class: "axis-line", x1: PAD.l, x2: W - PAD.r, y1: Y(scale.min), y2: Y(scale.min) }));

      /* Series */
      spec.series.forEach(function (s, i) {
        if (hidden[i]) { return; }
        var c = seriesColor(i);
        var pts = s.values.map(function (v, k) { return [X(k), Y(v)]; });
        var g = el("g", { class: "series", "data-series": String(i + 1) });

        /* One wash only. Two translucent fills stacked on each other muddy
           the plot and misstate where each series actually sits. */
        if (spec.area !== false && live.length === 1) {
          var areaD = linePath(pts) + "L" + X(pts.length - 1) + "," + Y(scale.min) +
                      "L" + X(0) + "," + Y(scale.min) + "Z";
          g.appendChild(el("path", { class: "area", "data-series": String(i + 1), d: areaD, fill: c, opacity: 0.1 }));
        }
        g.appendChild(el("path", { class: "line", d: linePath(pts), stroke: c }));

        /* End marker + one direct label — the endpoint, not every point */
        var lastPt = pts[pts.length - 1];
        g.appendChild(el("circle", { class: "dot", cx: lastPt[0], cy: lastPt[1], r: 4.5, fill: c }));
        if (spec.endLabels !== false) {
          var lab = el("text", {
            class: "mark-label", x: lastPt[0], y: lastPt[1] - 11, "text-anchor": "end"
          });
          lab.textContent = label(s.values[s.values.length - 1]);
          g.appendChild(lab);
        }
        svg.appendChild(g);
      });

      /* Crosshair + hover/keyboard layer */
      var cross = el("line", { class: "crosshair", y1: PAD.t, y2: PAD.t + ph, x1: 0, x2: 0 });
      svg.appendChild(cross);
      var dots = live.map(function (s, i) {
        var d = el("circle", { class: "crosshair-dot", r: 4.5, fill: seriesColor(spec.series.indexOf(s)) });
        svg.appendChild(d);
        return { node: d, series: s };
      });

      var capture = el("rect", {
        x: PAD.l, y: PAD.t, width: Math.max(0, pw), height: ph,
        fill: "transparent", tabindex: "0", role: "application",
        "aria-label": (spec.title || "Chart") + " — use arrow keys to read each point"
      });
      svg.appendChild(capture);

      var active = -1;
      function show(i) {
        if (i < 0 || i >= spec.categories.length) { return; }
        active = i;
        slot.viz.setAttribute("data-hover", "true");
        var x = X(i);
        cross.setAttribute("x1", x); cross.setAttribute("x2", x);
        var rows = [];
        dots.forEach(function (d) {
          var v = d.series.values[i];
          d.node.setAttribute("cx", x);
          d.node.setAttribute("cy", Y(v));
          rows.push({ color: seriesColor(spec.series.indexOf(d.series)), name: seriesName(d.series), value: label(v) });
        });
        slot.tip.innerHTML = tipHTML(spec.categories[i], rows);
        placeTip(slot, x, Y(Math.max.apply(null, dots.map(function (d) { return d.series.values[i]; }))));
      }

      capture.addEventListener("pointermove", function (e) {
        var box = slot.viz.getBoundingClientRect();
        var rel = e.clientX - box.left - PAD.l;
        var i = Math.round((rel / pw) * (spec.categories.length - 1));
        show(Math.max(0, Math.min(spec.categories.length - 1, i)));
      });
      capture.addEventListener("pointerleave", function () { hideTip(slot); });
      capture.addEventListener("focus", function () { show(active < 0 ? spec.categories.length - 1 : active); });
      capture.addEventListener("blur", function () { hideTip(slot); });
      capture.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); show(Math.min(spec.categories.length - 1, active + 1)); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); show(Math.max(0, active - 1)); }
        else if (e.key === "Home") { e.preventDefault(); show(0); }
        else if (e.key === "End") { e.preventDefault(); show(spec.categories.length - 1); }
        else if (e.key === "Escape") { hideTip(slot); }
      });

      var old = slot.viz.querySelector("svg");
      if (old) { old.remove(); }
      slot.viz.appendChild(svg);
    });

    paintLegend(slot, spec, redraw);
    paintTable(slot, spec);
    return slot;
  }

  /* ========================================================================
     COLUMNS — comparison / part-to-whole by category (grouped or stacked)
     ===================================================================== */
  function columns(host, spec) {
    var slot = buildSlot(host, spec);
    var label = spec.label || Fmt.int;
    var H = spec.height || 246;
    var PAD = { t: 18, r: 16, b: spec.rotateTicks ? 52 : 32, l: 52 };
    var GAP = 2; /* the surface gap that separates touching fills */

    var redraw = responsive(slot, function (W) {
      var hidden = hiddenSet(slot);
      var live = spec.series.filter(function (s, i) { return !hidden[i]; });
      var stacked = spec.stacked !== false && spec.series.length > 1;

      var pw = W - PAD.l - PAD.r;
      var ph = H - PAD.t - PAD.b;
      var svg = el("svg", { width: W, height: H, role: "img",
        "aria-label": (spec.title || "Bar chart") + ". " + (spec.summary || "") });

      var maxima = spec.categories.map(function (c, ci) {
        if (stacked) {
          return live.reduce(function (sum, s) { return sum + s.values[ci]; }, 0);
        }
        return Math.max.apply(null, live.map(function (s) { return s.values[ci]; }).concat([0]));
      });
      var scale = niceScale(0, Math.max.apply(null, maxima.concat([1])), 5);

      function Y(v) { return PAD.t + ph - (v / scale.max) * ph; }

      scale.ticks.forEach(function (tv) {
        var y = Y(tv);
        svg.appendChild(el("line", { class: "grid-line", x1: PAD.l, x2: W - PAD.r, y1: y, y2: y }));
        var tx = el("text", { class: "tick tick--y", x: PAD.l - 9, y: y + 4 });
        tx.textContent = Fmt.tick(tv, spec.unit);
        svg.appendChild(tx);
      });

      var band = pw / spec.categories.length;
      var groupN = stacked ? 1 : live.length;
      /* Cap the mark thickness — never let a bar fill its slot */
      var barW = Math.min(24, Math.max(6, (band * 0.62) / groupN - (groupN > 1 ? GAP : 0)));
      var clusterW = barW * groupN + GAP * (groupN - 1);

      spec.categories.forEach(function (cat, ci) {
        var cx = PAD.l + band * ci + band / 2;

        /* x tick */
        var tx = el("text", { class: "tick tick--x", x: cx, y: H - PAD.b + 18 });
        tx.textContent = cat;
        if (spec.rotateTicks) {
          tx.setAttribute("transform", "rotate(-38 " + cx + " " + (H - PAD.b + 18) + ")");
          tx.setAttribute("text-anchor", "end");
        }
        svg.appendChild(tx);

        if (stacked) {
          var acc = 0;
          var order = [];
          spec.series.forEach(function (s, si) { if (!hidden[si]) { order.push({ s: s, si: si }); } });
          order.forEach(function (o, k) {
            var v = o.s.values[ci];
            var y0 = Y(acc);
            var y1 = Y(acc + v);
            var h = y0 - y1;
            /* 2px gap between segments — white does the separating */
            var isTop = k === order.length - 1;
            var drawH = Math.max(0, h - (isTop ? 0 : GAP));
            var d = isTop
              ? barPathV(cx - barW / 2, y1, barW, drawH, 4)
              : "M" + (cx - barW / 2) + "," + y1 + "h" + barW + "v" + drawH + "h" + -barW + "Z";
            var p = el("path", {
              class: "bar series", "data-series": String(o.si + 1), d: d, fill: seriesColor(o.si)
            });
            svg.appendChild(p);
            acc += v;
          });

          /* Total on the cap — one selective label, not one per segment */
          if (spec.totalLabels !== false) {
            var tl = el("text", { class: "mark-label", x: cx, y: Y(acc) - 8, "text-anchor": "middle" });
            tl.textContent = label(acc);
            svg.appendChild(tl);
          }
          addHit(svg, slot, spec, ci, cx - band / 2, PAD.t, band, ph, cx, Y(acc), label, hidden);
        } else {
          live.forEach(function (s, k) {
            var si = spec.series.indexOf(s);
            var v = s.values[ci];
            var x = cx - clusterW / 2 + k * (barW + GAP);
            var y = Y(v);
            svg.appendChild(el("path", {
              class: "bar series", "data-series": String(si + 1),
              d: barPathV(x, y, barW, Y(0) - y, 4), fill: seriesColor(si)
            }));
          });
          var top = Math.max.apply(null, live.map(function (s) { return s.values[ci]; }));
          if (spec.totalLabels !== false && live.length === 1) {
            var tl2 = el("text", { class: "mark-label", x: cx, y: Y(top) - 8, "text-anchor": "middle" });
            tl2.textContent = label(top);
            svg.appendChild(tl2);
          }
          addHit(svg, slot, spec, ci, cx - band / 2, PAD.t, band, ph, cx, Y(top), label, hidden);
        }
      });

      svg.appendChild(el("line", { class: "axis-line", x1: PAD.l, x2: W - PAD.r, y1: Y(0), y2: Y(0) }));

      var old = slot.viz.querySelector("svg");
      if (old) { old.remove(); }
      slot.viz.appendChild(svg);
    });

    paintLegend(slot, spec, redraw);
    paintTable(slot, spec);
    return slot;
  }

  /* Hit target spans the whole band — comfortably bigger than the mark */
  function addHit(svg, slot, spec, ci, x, y, w, h, tipX, tipY, label, hidden) {
    var hit = el("rect", {
      class: "hit", x: x, y: y, width: w, height: h,
      tabindex: "0", role: "button",
      "aria-label": spec.categories[ci] + ": " + spec.series.map(function (s, i) {
        return hidden[i] ? "" : seriesName(s) + " " + label(s.values[ci]);
      }).filter(Boolean).join(", ")
    });
    function show() {
      slot.viz.setAttribute("data-hover", "true");
      var rows = spec.series.map(function (s, i) {
        if (hidden[i]) { return null; }
        return { color: seriesColor(i), name: seriesName(s), value: label(s.values[ci]) };
      }).filter(Boolean);
      if (rows.length > 1) {
        rows.push({ color: null, name: "Total", value: label(
          spec.series.reduce(function (sum, s, i) { return hidden[i] ? sum : sum + s.values[ci]; }, 0)) });
      }
      slot.tip.innerHTML = tipHTML(spec.categories[ci], rows);
      placeTip(slot, tipX, tipY);
      hit.setAttribute("data-active", "true");
    }
    function hide() { hideTip(slot); hit.removeAttribute("data-active"); }
    hit.addEventListener("pointerenter", show);
    hit.addEventListener("pointerleave", hide);
    hit.addEventListener("focus", show);
    hit.addEventListener("blur", hide);
    svg.appendChild(hit);
  }

  /* ========================================================================
     HORIZONTAL BARS — ranked magnitude, long category names
     ===================================================================== */
  function bars(host, spec) {
    var slot = buildSlot(host, spec);
    var label = spec.label || Fmt.int;
    var rows = spec.rows;
    var rowH = spec.rowHeight || 34;
    var H = rows.length * rowH + 14;
    var labelW = spec.labelWidth || 128;

    responsive(slot, function (W) {
      var svg = el("svg", { width: W, height: H, role: "img",
        "aria-label": (spec.title || "Ranked bars") + ". " + (spec.summary || "") });
      var valueW = 62;
      var pw = Math.max(40, W - labelW - valueW - 12);
      var max = Math.max.apply(null, rows.map(function (r) { return r.value; }).concat([1]));

      rows.forEach(function (r, i) {
        var y = i * rowH + 7;
        var barH = Math.min(24, rowH - 14);
        var by = y + (rowH - 14 - barH) / 2;
        var w = Math.max(2, (r.value / max) * pw);
        /* Ordinal ramp stays on one hue and deepens with severity
           (older debt reads heavier); nominal rows all take slot 1. */
        var fill = spec.ordinal
          ? seqColor(2 + Math.round((i / Math.max(1, rows.length - 1)) * 3))
          : (r.color || seriesColor(0));

        var name = el("text", { class: "tick", x: labelW - 10, y: by + barH / 2 + 4, "text-anchor": "end" });
        name.setAttribute("fill", cssVar("--ink-secondary"));
        name.textContent = r.name;
        svg.appendChild(name);

        svg.appendChild(el("path", {
          class: "bar", d: barPathH(labelW, by, w, barH, 4), fill: fill
        }));

        var val = el("text", { class: "mark-label", x: labelW + w + 9, y: by + barH / 2 + 4 });
        val.textContent = label(r.value);
        svg.appendChild(val);

        var hit = el("rect", {
          class: "hit", x: 0, y: y, width: W, height: rowH - 4,
          tabindex: "0", role: "button",
          "aria-label": r.name + ": " + label(r.value)
        });
        hit.addEventListener("pointerenter", function () {
          slot.viz.setAttribute("data-hover", "true");
          slot.tip.innerHTML = tipHTML(r.name, [{ color: fill, name: spec.valueLabel || "Value", value: label(r.value) }]);
          placeTip(slot, labelW + w, by);
        });
        hit.addEventListener("pointerleave", function () { hideTip(slot); });
        hit.addEventListener("focus", function () {
          slot.viz.setAttribute("data-hover", "true");
          slot.tip.innerHTML = tipHTML(r.name, [{ color: fill, name: spec.valueLabel || "Value", value: label(r.value) }]);
          placeTip(slot, labelW + w, by);
        });
        hit.addEventListener("blur", function () { hideTip(slot); });
        svg.appendChild(hit);
      });

      var old = slot.viz.querySelector("svg");
      if (old) { old.remove(); }
      slot.viz.appendChild(svg);
    });

    /* Table twin */
    slot.table.innerHTML = "<table><caption class=\"sr-only\">" + esc(spec.title || "") +
      "</caption><thead><tr><th scope=\"col\">" + esc(spec.categoryLabel || "Category") +
      "</th><th scope=\"col\" class=\"num\">" + esc(spec.valueLabel || "Value") +
      "</th></tr></thead><tbody>" +
      rows.map(function (r) {
        return "<tr><th scope=\"row\">" + esc(r.name) + '</th><td class="num">' +
          esc(label(r.value)) + "</td></tr>";
      }).join("") + "</tbody></table>";

    return slot;
  }

  /* ========================================================================
     DONUT — part-to-whole at a glance, <=6 segments
     ===================================================================== */
  function donut(host, spec) {
    host.innerHTML = "";
    host.classList.add("viz-slot");
    host.setAttribute("data-mode", "chart");

    var wrap = document.createElement("div");
    wrap.className = "donut-wrap";

    var viz = document.createElement("div");
    viz.className = "viz";
    viz.style.direction = "ltr";
    var tip = document.createElement("div");
    tip.className = "viz__tip";
    viz.appendChild(tip);

    var legendBox = document.createElement("ul");
    legendBox.className = "donut-legend";

    wrap.appendChild(viz);
    wrap.appendChild(legendBox);
    host.appendChild(wrap);

    var table = document.createElement("div");
    table.className = "viz-table";
    host.appendChild(table);

    var slot = { host: host, viz: viz, tip: tip, legend: null, table: table };

    var rows = spec.rows.map(function (r) {
      return { name: r.label || (global.I18n ? I18n.t(r.name) : r.name), value: r.value };
    });
    var total = rows.reduce(function (s, r) { return s + r.value; }, 0) || 1;
    var label = spec.label || Fmt.int;

    var S = 168, C = S / 2, RO = 74, RI = 52;
    var svg = el("svg", { viewBox: "0 0 " + S + " " + S, width: S, height: S, role: "img",
      "aria-label": (spec.title || "Composition") + ". " + rows.map(function (r) {
        return r.name + " " + label(r.value); }).join(", ") });

    function arc(a0, a1) {
      var large = (a1 - a0) > Math.PI ? 1 : 0;
      var x0 = C + RO * Math.cos(a0), y0 = C + RO * Math.sin(a0);
      var x1 = C + RO * Math.cos(a1), y1 = C + RO * Math.sin(a1);
      var x2 = C + RI * Math.cos(a1), y2 = C + RI * Math.sin(a1);
      var x3 = C + RI * Math.cos(a0), y3 = C + RI * Math.sin(a0);
      return "M" + x0 + "," + y0 + "A" + RO + "," + RO + " 0 " + large + " 1 " + x1 + "," + y1 +
             "L" + x2 + "," + y2 + "A" + RI + "," + RI + " 0 " + large + " 0 " + x3 + "," + y3 + "Z";
    }

    var angle = -Math.PI / 2;
    rows.forEach(function (r, i) {
      var span = (r.value / total) * Math.PI * 2;
      var p = el("path", {
        class: "donut-arc", d: arc(angle, angle + span), fill: seriesColor(i),
        tabindex: "0", role: "button",
        "aria-label": r.name + ": " + label(r.value) + ", " + Fmt.pct((r.value / total) * 100)
      });
      function show() {
        viz.setAttribute("data-hover", "true");
        tip.innerHTML = tipHTML(r.name, [
          { color: seriesColor(i), name: spec.valueLabel || "Count", value: label(r.value) },
          { color: null, name: "Share", value: Fmt.pct((r.value / total) * 100) }
        ]);
        var mid = angle + span / 2;
        placeTip(slot, C + (RO - 10) * Math.cos(mid), C + (RO - 10) * Math.sin(mid));
      }
      p.addEventListener("pointerenter", show);
      p.addEventListener("focus", show);
      p.addEventListener("pointerleave", function () { hideTip(slot); });
      p.addEventListener("blur", function () { hideTip(slot); });
      svg.appendChild(p);
      angle += span;
    });

    var cv = el("text", { class: "donut-center-value", x: C, y: C + 2 });
    cv.textContent = spec.centerValue || label(total);
    svg.appendChild(cv);
    var cl = el("text", { class: "donut-center-label", x: C, y: C + 19 });
    cl.textContent = spec.centerLabel || "Total";
    svg.appendChild(cl);

    viz.appendChild(svg);

    legendBox.innerHTML = rows.map(function (r, i) {
      return '<li><span class="legend__key" style="background:' + seriesColor(i) + '"></span>' +
        '<span class="name">' + esc(r.name) + "</span>" +
        '<span class="val">' + esc(label(r.value)) + "</span>" +
        '<span class="pct">' + Fmt.pct((r.value / total) * 100, 0) + "</span></li>";
    }).join("");

    table.innerHTML = "<table><thead><tr><th scope=\"col\">" + esc(spec.categoryLabel || "Category") +
      "</th><th scope=\"col\" class=\"num\">" + esc(spec.valueLabel || "Value") +
      "</th><th scope=\"col\" class=\"num\">Share</th></tr></thead><tbody>" +
      rows.map(function (r, i) {
        return "<tr><th scope=\"row\"><span class=\"swatch\" style=\"background:" + seriesColor(i) +
          "\"></span>" + esc(r.name) + '</th><td class="num">' + esc(label(r.value)) +
          '</td><td class="num">' + Fmt.pct((r.value / total) * 100, 1) + "</td></tr>";
      }).join("") + "</tbody></table>";

    return slot;
  }

  /* ========================================================================
     HEATMAP — magnitude on one hue, light -> dark
     ===================================================================== */
  function heatmap(host, spec) {
    host.innerHTML = "";
    host.classList.add("viz-slot");
    host.setAttribute("data-mode", "chart");

    var viz = document.createElement("div");
    viz.className = "viz";
    var tip = document.createElement("div");
    tip.className = "viz__tip";
    viz.appendChild(tip);
    host.appendChild(viz);

    var table = document.createElement("div");
    table.className = "viz-table";
    host.appendChild(table);
    var slot = { host: host, viz: viz, tip: tip, table: table };

    var label = spec.label || Fmt.pct;

    var all = [];
    spec.rows.forEach(function (r) { all = all.concat(r.values); });
    var lo = Math.min.apply(null, all);
    var hi = Math.max.apply(null, all);
    function step(v) {
      var t = (v - lo) / ((hi - lo) || 1);
      return 1 + Math.round(t * 5); /* seq-200 .. seq-700 */
    }

    var grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "minmax(72px, auto) repeat(" + spec.columns.length + ", minmax(0, 1fr))";
    grid.style.gap = "3px";
    grid.style.alignItems = "center";

    var corner = document.createElement("span");
    grid.appendChild(corner);
    spec.columns.forEach(function (c) {
      var h = document.createElement("span");
      h.className = "text-xs muted";
      h.style.textAlign = "center";
      h.textContent = c;
      grid.appendChild(h);
    });

    spec.rows.forEach(function (r) {
      var lab = document.createElement("span");
      lab.className = "text-xs secondary";
      lab.style.whiteSpace = "nowrap";
      lab.textContent = r.label;
      grid.appendChild(lab);

      r.values.forEach(function (v, ci) {
        var cell = document.createElement("button");
        cell.type = "button";
        cell.className = "heat__cell";
        cell.style.background = seqColor(step(v));
        cell.setAttribute("aria-label", r.label + ", " + spec.columns[ci] + ": " + label(v));
        function show() {
          viz.setAttribute("data-hover", "true");
          tip.innerHTML = tipHTML(r.label + " · " + spec.columns[ci], [
            { color: seqColor(step(v)), name: spec.valueLabel || "Rate", value: label(v) }
          ]);
          var b = cell.getBoundingClientRect();
          var vb = viz.getBoundingClientRect();
          placeTip(slot, b.left - vb.left + b.width / 2, b.top - vb.top);
        }
        cell.addEventListener("pointerenter", show);
        cell.addEventListener("focus", show);
        cell.addEventListener("pointerleave", function () { hideTip(slot); });
        cell.addEventListener("blur", function () { hideTip(slot); });
        grid.appendChild(cell);
      });
    });
    viz.appendChild(grid);

    /* Scale legend — magnitude needs its key */
    var scale = document.createElement("div");
    scale.className = "heat__scale";
    scale.style.marginTop = "12px";
    scale.innerHTML = "<span>" + label(lo) + '</span><span class="heat__scale-ramp">' +
      [1, 2, 3, 4, 5, 6].map(function (s) {
        return '<span class="heat__scale-step" style="background:' + seqColor(s) + '"></span>';
      }).join("") + "</span><span>" + label(hi) + "</span>";
    viz.appendChild(scale);

    table.innerHTML = "<table><thead><tr><th scope=\"col\">" + esc(spec.rowLabel || "Row") + "</th>" +
      spec.columns.map(function (c) { return '<th scope="col" class="num">' + esc(c) + "</th>"; }).join("") +
      "</tr></thead><tbody>" + spec.rows.map(function (r) {
        return "<tr><th scope=\"row\">" + esc(r.label) + "</th>" +
          r.values.map(function (v) { return '<td class="num">' + label(v) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table>";

    return slot;
  }

  /* ========================================================================
     SPARKLINE — de-emphasised trend inside a stat tile (returns markup)
     ===================================================================== */
  function spark(values, opts) {
    opts = opts || {};
    var W = opts.width || 78, H = opts.height || 26, P = 3;
    var lo = Math.min.apply(null, values);
    var hi = Math.max.apply(null, values);
    var span = (hi - lo) || 1;
    var pts = values.map(function (v, i) {
      return [P + (i / (values.length - 1)) * (W - P * 2),
              H - P - ((v - lo) / span) * (H - P * 2)];
    });
    var color = opts.color || cssVar("--series-1");
    var d = linePath(pts);
    var last = pts[pts.length - 1];
    return '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H +
      '" aria-hidden="true" focusable="false">' +
      '<path class="spark-area" d="' + d + "L" + last[0] + "," + H + "L" + pts[0][0] + "," + H +
      'Z" fill="' + color + '" opacity="0.1"/>' +
      '<path class="spark-line" d="' + d + '" stroke="' + color + '"/>' +
      '<circle class="spark-end" cx="' + last[0] + '" cy="' + last[1] + '" r="2.6" fill="' + color + '"/>' +
      "</svg>";
  }

  /* ========================================================================
     Mode switching (chart <-> table)
     ===================================================================== */
  function setMode(slotHost, mode) {
    slotHost.setAttribute("data-mode", mode);
    var t = slotHost.querySelector(".viz-table");
    if (t) { t.setAttribute("data-open", String(mode === "table")); }
  }

  global.Charts = {
    line: line,
    columns: columns,
    bars: bars,
    donut: donut,
    heatmap: heatmap,
    spark: spark,
    setMode: setMode,
    seriesColor: seriesColor,
    seqColor: seqColor,
    fmt: Fmt
  };
  global.Fmt = Fmt;
})(window);
