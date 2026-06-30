/* ============================================================
   LET THERE BE — site behavior
   Nav, scroll reveals, and the generative mitosis cell system.
   The brand's mitosis blobs are rendered as native SVG metaballs
   (gooey filter) so the cells actually divide in the browser.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- NAV ---------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  window.addEventListener("scroll", function () {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  if (toggle && links) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      var open = toggle.classList.toggle("open");
      links.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Respect reduced-motion: pause autoplaying work videos
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video[autoplay]").forEach(function (v) {
      v.removeAttribute("autoplay");
      v.pause();
    });
  }

  // Mobile: tap a dropdown parent to expand it
  document.querySelectorAll("li.has-dropdown > a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (window.innerWidth <= 980) {
        e.preventDefault();
        a.parentElement.classList.toggle("open");
      }
    });
  });

  /* ---------- ACTIVE NAV STATE (by current URL) ----------
     The nav markup is identical on every page; we light up the current link
     (and its top-level parent) here so we never hardcode per-page classes. */
  (function () {
    var here = (location.pathname.split("/").pop() || "index.html");
    if (here === "") here = "index.html";
    document.querySelectorAll(".nav-links > li").forEach(function (li) {
      var matched = false;
      li.querySelectorAll("a").forEach(function (a) {
        var href = (a.getAttribute("href") || "").split("#")[0];
        if (href && href === here) { a.classList.add("active"); matched = true; }
      });
      if (matched) {
        var top = li.querySelector(":scope > a");
        if (top) top.classList.add("active");
      }
    });
  })();

  /* ---------- MEGA-MENU PREVIEW (hover a service tile -> reveal its pane) ---------- */
  document.querySelectorAll(".mega").forEach(function (mega) {
    var tiles = mega.querySelectorAll(".mega-tile");
    var panes = mega.querySelectorAll(".mega-pane");
    var dflt = mega.querySelector(".mega-pane[data-mp-default]");
    function show(id) {
      panes.forEach(function (p) { p.classList.toggle("on", p.id === id); });
      tiles.forEach(function (t) { t.classList.toggle("active-tile", t.getAttribute("data-mp") === id); });
    }
    tiles.forEach(function (t) {
      var id = t.getAttribute("data-mp");
      t.addEventListener("mouseenter", function () { show(id); });
      t.addEventListener("focus", function () { show(id); });
    });
    mega.addEventListener("mouseleave", function () {       // reset to the intro pane
      panes.forEach(function (p) { p.classList.toggle("on", p === dflt); });
      tiles.forEach(function (t) { t.classList.remove("active-tile"); });
    });
  });

  /* ---------- SCROLL REVEAL ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        if (entry.target.classList.contains("phase-cell")) {
          entry.target.classList.add("go");
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".reveal, .phase-cell").forEach(function (el) {
    io.observe(el);
  });

  /* ---------- GENERATIVE MITOSIS CELLS ---------- */
  // Gradient palettes sampled from the four brand mitosis photographs.
  // Light hues only — no dark purple/red cell fills (those stay in the text gradient).
  var PALETTES = [
    [["#94CAB4", "#7C82A1"], ["#8C6C8F", "#E1483B"]],
    [["#7FB6CC", "#7C82A1"], ["#E1483B", "#EE6B4D"]],
    [["#7C82A1", "#94CAB4"], ["#8C6C8F", "#E1483B"]],
    [["#8C6C8F", "#7C82A1"], ["#EE6B4D", "#E1483B"]]
  ];
  // Vivid, gradient-spectrum palettes for dark (Science Studio) pages
  var DARK_PALETTES = [
    [["#7FB6CC", "#7C82A1"], ["#8C6C8F", "#E1483B"]],
    [["#7C82A1", "#8C6C8F"], ["#EE6B4D", "#E1483B"]],
    [["#EE6B4D", "#E1483B"], ["#7FB6CC", "#7C82A1"]],
    [["#B4B7C9", "#EE6B4D"], ["#7C82A1", "#8C6C8F"]]
  ];
  if (document.body.classList.contains("theme-dark")) {
    PALETTES = DARK_PALETTES;
  }
  var uid = 0;

  var GSTOP = "<stop offset='0%' stop-color='#94CAB4'/><stop offset='20%' stop-color='#7FB6CC'/><stop offset='40%' stop-color='#7C82A1'/><stop offset='54%' stop-color='#8C6C8F'/><stop offset='70%' stop-color='#E1483B'/><stop offset='86%' stop-color='#EE6B4D'/><stop offset='100%' stop-color='#F2966A'/>";
  function linGrad(id, d) {
    return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + d[0] + '" y1="' + d[1] + '" x2="' + d[2] + '" y2="' + d[3] + '">' + GSTOP + "</linearGradient>";
  }
  var DIRS = [[85,120,320,290],[320,130,90,290],[100,100,315,312],[95,312,320,108]];
  var HOME = document.body.classList.contains("home");  // homepage = denser layout + scroll parallax
  var parCells = [];                                    // bg cells to parallax on scroll (home only)
  var SEED = (function () {                              // per-page seed -> unique cell layout
    var nm = (location.pathname.split("/").pop() || "home").replace(".html", "") || "home";
    var h = 2166136261;
    for (var k = 0; k < nm.length; k++) { h ^= nm.charCodeAt(k); h = (h * 16777619) >>> 0; }
    return h;
  })();

  function gooFilter(id, blur) {
    return '<filter id="' + id + '" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="' + blur + '" result="b"/>' +
      '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo"/>' +
      '<feGaussianBlur in="goo" stdDeviation="2"/>' +
      "</filter>";
  }
  // Crisp goo: lobes still fuse into an organic mitosis shape, but the edge is hard (no haze).
  function gooFilterCrisp(id, blur) {
    return '<filter id="' + id + '" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="' + blur + '" result="b"/>' +
      '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 34 -15"/>' +
      "</filter>";
  }

  /* ---------- PAINTERLY CELLS (live SVG) ----------
     Brand mitosis cells as live, scalable SVG. The painterly fill = a
     green->orange-weighted gradient whose axis is tightened onto the blob (so
     green/orange land on the lobes, not dead corners), warped by a turbulence
     /displacement filter for organic colour leaking, plus a soft highlight.
     The fill shows through each cell's animated goo mask. */
  // Background margin cells — connected, one-shape forms only (no split, so they
  // never read as two circles). Priority: peanut > ambient > diagonal > trio.
  var BG_TYPES = ["peanut", "ambient", "trio", "diagonal", "quad", "trio", "peanut", "diagonal", "ambient", "quad"];
  // Muted "milky" brand palette — matches the mitosis cell library.
  var GO_STOPS =
    "<stop offset='0%' stop-color='#94CAB4'/><stop offset='20%' stop-color='#7FB6CC'/>" +
    "<stop offset='40%' stop-color='#7C82A1'/><stop offset='54%' stop-color='#8C6C8F'/>" +
    "<stop offset='70%' stop-color='#E1483B'/><stop offset='86%' stop-color='#EE6B4D'/>" +
    "<stop offset='100%' stop-color='#F2966A'/>";
  function injectPaintDefs() {
    if (document.getElementById("ltb-paint-defs")) return;
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("id", "ltb-paint-defs");
    s.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
    s.innerHTML =
      '<defs>' +
      '<linearGradient id="ltbBase" gradientUnits="userSpaceOnUse" x1="112" y1="136" x2="312" y2="272">' + GO_STOPS + '</linearGradient>' +
      // Engine-motion cells use the FULL muted brand gradient (teal -> peach), same scheme as the cell library.
      '<linearGradient id="ltbE_uncover" gradientUnits="objectBoundingBox" x1="0.18" y1="0.16" x2="0.82" y2="0.84">' + GO_STOPS + '</linearGradient>' +
      '<linearGradient id="ltbE_extract" gradientUnits="objectBoundingBox" x1="0.18" y1="0.16" x2="0.82" y2="0.84">' + GO_STOPS + '</linearGradient>' +
      '<linearGradient id="ltbE_transform" gradientUnits="objectBoundingBox" x1="0.18" y1="0.16" x2="0.82" y2="0.84">' + GO_STOPS + '</linearGradient>' +
      '<linearGradient id="ltbE_scale" gradientUnits="objectBoundingBox" x1="0.18" y1="0.16" x2="0.82" y2="0.84">' + GO_STOPS + '</linearGradient>' +
      '<radialGradient id="ltbHL" cx="32%" cy="25%" r="46%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>' +
      '<filter id="ltbPaint"><feTurbulence type="fractalNoise" baseFrequency="0.005 0.0075" numOctaves="3" seed="6" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="80" xChannelSelector="R" yChannelSelector="G" result="d"/><feColorMatrix in="d" type="saturate" values="1.12"/></filter>' +
      '<filter id="ltbPaintS"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="6" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" result="d"/><feColorMatrix in="d" type="saturate" values="1.12"/></filter>' +
      '</defs>';
    document.body.appendChild(s);
  }
  function paintFill(W, H, fid) {
    // oversized painted rect: the split lobes pull/drift beyond the viewBox, so
    // the fill must extend past it or the shape gets clipped where it has no fill.
    return '<rect x="-160" y="-160" width="' + (W + 320) + '" height="' + (H + 320) + '" fill="url(#ltbBase)" filter="url(#' + (fid || "ltbPaint") + ')"/>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#ltbHL)"/>';
  }
  function goo(id, blur) {
    return '<filter id="' + id + '" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="' + blur + '" result="b"/>' +
      '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 34 -15"/></filter>';
  }

  /* ---------- SOFT CELLS (match the mitosis library) ----------
     Library look = feathered, translucent edges that dissolve into the page,
     a muted gradient, and glowing cores in the lobes. We reproduce that in SVG:
       - a SOFT alpha ramp on the goo (low multiplier) -> edges fade out, not hard
       - per-lobe radial core glows -> brightens the lobe centres (kills the flat
         linear read) and gives the "glowing core"
       - group opacity < 1 -> the body reads translucent
     The fill is still warped by the turbulence filter for organic colour leak. */
  var SOFT_STOPS = [
    [0.00, [148, 202, 180]], [0.20, [127, 182, 204]], [0.40, [124, 130, 161]],
    [0.54, [140, 108, 143]], [0.70, [225, 72, 59]], [0.86, [238, 107, 77]], [1.00, [242, 150, 106]]
  ];
  function _mix(a, b, f) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
  function paletteAt(t) {
    t = Math.max(0, Math.min(1, t));
    for (var i = 0; i < SOFT_STOPS.length - 1; i++) {
      var p0 = SOFT_STOPS[i][0], p1 = SOFT_STOPS[i + 1][0];
      if (t >= p0 && t <= p1 && p1 > p0) return _mix(SOFT_STOPS[i][1], SOFT_STOPS[i + 1][1], (t - p0) / (p1 - p0));
    }
    return SOFT_STOPS[t <= 0 ? 0 : SOFT_STOPS.length - 1][1];
  }
  function _hex(c) { function h(v) { v = Math.round(Math.max(0, Math.min(255, v))); return (v < 16 ? "0" : "") + v.toString(16); } return "#" + h(c[0]) + h(c[1]) + h(c[2]); }
  function _coreCol(c) { var l = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]; return [l + (c[0] - l) * 1.3, l + (c[1] - l) * 1.3, l + (c[2] - l) * 1.3]; }
  // lobes: [{x,y,r,cls,style}]   axis: [x1,y1,x2,y2] (teal end -> red end)
  // Two layered masks give "defined edge + translucent body":
  //   m1 (crisp goo) = the connected silhouette with a clean, defined edge.
  //   m2 (density)   = a per-lobe radial alpha (opaque core -> translucent rim)
  //                    so light comes through the body but never past the edge.
  // Colour is the directional linear gradient (teal->red, mixes organically) and
  // each lobe gets a gentle core glow in its own hue.
  function softCell(lobes, axis, blur) {
    uid++; var f = "lg" + uid, m = "lm" + uid, g = "gg" + uid;
    var x1 = axis[0], y1 = axis[1], x2 = axis[2], y2 = axis[3];
    var dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy + 1e-6;
    var masks = "", ts = [], i;
    for (i = 0; i < lobes.length; i++) {
      var lb = lobes[i];
      masks += '<circle class="' + (lb.cls || "anim-breathe") + '" cx="' + lb.x + '" cy="' + lb.y + '" r="' + lb.r + '" fill="#fff"' + (lb.style ? ' style="' + lb.style + '"' : '') + '/>';
      ts.push(((lb.x - x1) * dx + (lb.y - y1) * dy) / L);
    }
    // glow at the coolest + warmest lobes
    var ci = 0, wi = 0;
    for (i = 0; i < ts.length; i++) { if (ts[i] < ts[ci]) ci = i; if (ts[i] > ts[wi]) wi = i; }
    var gdefs = "", guse = "";
    [ci, wi].forEach(function (idx, k) {
      var lb = lobes[idx]; var col = _coreCol(paletteAt(ts[idx])); var gid = "cg" + uid + (k ? "w" : "c");
      gdefs += '<radialGradient id="' + gid + '" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="' + _hex(col) + '" stop-opacity="0.78"/><stop offset="100%" stop-color="' + _hex(col) + '" stop-opacity="0"/></radialGradient>';
      guse += '<circle cx="' + lb.x + '" cy="' + lb.y + '" r="' + (lb.r * 0.96).toFixed(0) + '" fill="url(#' + gid + ')"/>';
    });
    return '<svg viewBox="0 0 400 400" aria-hidden="true"><defs>' +
      '<linearGradient id="' + g + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + GO_STOPS + '</linearGradient>' + gdefs +
      '<filter id="' + f + '" x="-55%" y="-55%" width="210%" height="210%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="' + (blur || 8) + '" result="b"/>' +
      '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"/></filter>' +
      '<mask id="' + m + '"><g class="goo-group" filter="url(#' + f + ')">' + masks + '</g></mask></defs>' +
      '<g mask="url(#' + m + ')" opacity="0.9">' +
      '<rect x="-160" y="-160" width="720" height="720" fill="url(#' + g + ')"/>' +
      guse +
      '<rect width="400" height="400" fill="url(#ltbHL)"/></g></svg>';
  }
  injectPaintDefs();
  function divideBlob() {
    uid++; var f = "lg" + uid, m = "lm" + uid;
    return '<svg viewBox="0 0 400 400" aria-hidden="true"><defs>' + goo(f, 11) +
      '<mask id="' + m + '"><g class="goo-group anim-divide anim-drift" filter="url(#' + f + ')">' +
      '<circle class="cell-a" cx="172" cy="196" r="92" fill="#fff" style="--pull:58px;--pull2:76px"/>' +
      '<circle class="cell-b" cx="246" cy="210" r="76" fill="#fff" style="--pull:58px;--pull2:76px"/>' +
      '</g></mask></defs><g mask="url(#' + m + ')">' + paintFill(400, 400) + '</g></svg>';
  }
  // The cells morph in place like living mitosis: lobes ease apart/together (the
  // neck stretches and thins) and pulse, via per-lobe --mx/--my motion vars.
  function ambientBlob() {
    return softCell([
      { x: 170, y: 200, r: 86, cls: "mito", style: "--mx:-9px;--my:-5px;--dur:8s" },
      { x: 262, y: 226, r: 58, cls: "mito", style: "--mx:12px;--my:7px;--dur:6.5s;animation-delay:-2.2s" }
    ], [92, 188, 338, 238], 8);
  }
  function peanutBlob() {
    // two lobes that stay fused; the neck stretches and relaxes (mitosis-like)
    return softCell([
      { x: 170, y: 202, r: 92, cls: "mito", style: "--mx:-14px;--dur:7s" },
      { x: 254, y: 212, r: 82, cls: "mito", style: "--mx:14px;--dur:7s" }
    ], [92, 200, 332, 214], 9);
  }
  function diagonalBlob() {
    // lobes ease apart along the diagonal and back
    return softCell([
      { x: 156, y: 156, r: 88, cls: "mito", style: "--mx:-11px;--my:-11px;--dur:7.5s" },
      { x: 252, y: 252, r: 84, cls: "mito", style: "--mx:11px;--my:11px;--dur:7.5s" }
    ], [86, 86, 322, 322], 9);
  }
  function trioBlob() {
    // three orbs each drift outward and pulse, out of phase -> undulating cluster
    return softCell([
      { x: 152, y: 166, r: 66, cls: "mito", style: "--mx:-9px;--my:-8px;--dur:7s" },
      { x: 256, y: 158, r: 64, cls: "mito", style: "--mx:11px;--my:-6px;--dur:6.4s;animation-delay:-2.4s" },
      { x: 206, y: 256, r: 62, cls: "mito", style: "--mx:1px;--my:12px;--dur:7.8s;animation-delay:-4.3s" }
    ], [120, 150, 286, 286], 8);
  }
  function splitBlob() {
    // active mitosis division: two lobes pull strongly apart, neck thins, then rejoin
    // lobes start merged (one cell), then travel far enough apart that the goo
    // metaball breaks into two distinct cells — full mitosis — then merge again.
    return softCell([
      { x: 190, y: 206, r: 88, cls: "mito", style: "--mx:-80px;--s0:0.99;--s1:1.03;--dur:26s" },
      { x: 232, y: 206, r: 84, cls: "mito", style: "--mx:80px;--s0:0.99;--s1:1.03;--dur:26s" }
    ], [88, 200, 340, 212], 8);
  }
  function quadBlob() {
    // four fused lobes in a diamond cluster, each drifting out of phase
    return softCell([
      { x: 160, y: 158, r: 66, cls: "mito", style: "--mx:-11px;--my:-9px;--dur:7.2s" },
      { x: 256, y: 156, r: 62, cls: "mito", style: "--mx:12px;--my:-7px;--dur:6.6s;animation-delay:-2.1s" },
      { x: 156, y: 256, r: 60, cls: "mito", style: "--mx:-10px;--my:11px;--dur:7.6s;animation-delay:-3.6s" },
      { x: 260, y: 258, r: 66, cls: "mito", style: "--mx:13px;--my:12px;--dur:7s;animation-delay:-5.1s" }
    ], [124, 130, 300, 300], 8);
  }
  function elongatedBlob() {
    // a stretched, gently S-curved chain of lobes
    return softCell([
      { x: 116, y: 150, r: 56, cls: "mito", style: "--mx:-9px;--my:-6px;--dur:7.8s" },
      { x: 184, y: 188, r: 72, cls: "mito", style: "--mx:-2px;--my:3px;--dur:7s;animation-delay:-1.7s" },
      { x: 252, y: 224, r: 66, cls: "mito", style: "--mx:6px;--my:6px;--dur:6.8s;animation-delay:-3.1s" },
      { x: 314, y: 262, r: 52, cls: "mito", style: "--mx:11px;--my:9px;--dur:7.4s;animation-delay:-4.7s" }
    ], [108, 138, 322, 274], 8);
  }
  function budBlob() {
    // a parent cell with a small bud easing out and back (budding mitosis)
    return softCell([
      { x: 190, y: 214, r: 100, cls: "mito", style: "--mx:-6px;--dur:7.6s" },
      { x: 286, y: 166, r: 42, cls: "mito", style: "--mx:20px;--my:-14px;--s0:0.85;--s1:1.12;--dur:5.8s;animation-delay:-1.4s" }
    ], [112, 244, 322, 150], 9);
  }
  function heartBlob() {
    // a real heart path with the brand gradient + soft edge, gently beating
    uid++; var g = "hg" + uid, f = "hf" + uid;
    var d = "M200,132 C200,86 160,66 130,66 C78,66 60,112 60,154 C60,220 130,262 200,330 C270,262 340,220 340,154 C340,112 322,66 270,66 C240,66 200,86 200,132 Z";
    return '<svg viewBox="0 0 400 400" aria-hidden="true"><defs>' +
      '<linearGradient id="' + g + '" gradientUnits="userSpaceOnUse" x1="80" y1="80" x2="330" y2="320">' + GO_STOPS + '</linearGradient>' +
      '<filter id="' + f + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5"/></filter></defs>' +
      '<g class="ltb-heartbeat" opacity="0.9" filter="url(#' + f + ')">' +
      '<path d="' + d + '" fill="url(#' + g + ')"/>' +
      '<path d="' + d + '" fill="url(#ltbHL)"/></g></svg>';
  }
  // Live, animated SVG cells (they breathe + drift in the browser) carrying the
  // translucent / glowing-core look.
  function blobByType(t) {
    switch (t) {
      case "heart": return heartBlob();
      case "peanut": return peanutBlob();
      case "diagonal": return diagonalBlob();
      case "trio": return trioBlob();
      case "split": return splitBlob();
      case "quad": return quadBlob();
      case "elongated": return elongatedBlob();
      case "bud": return budBlob();
      default: return ambientBlob();
    }
  }

  document.querySelectorAll("[data-blob]").forEach(function (el, i) {
    var type = el.getAttribute("data-blob");
    var pIdx = el.hasAttribute("data-palette")
      ? parseInt(el.getAttribute("data-palette"), 10) % PALETTES.length
      : i % PALETTES.length;
    var palette = PALETTES[pIdx];
    el.innerHTML = blobByType(type);
    // Per-page hero placement: shift / scale / rotate / flip so no two pages match.
    // Kept to the right & lower edge so it never crosses the left-aligned hero text.
    if (el.classList.contains("blob-hero") || el.classList.contains("blob-corner-tr")) {
      var vy = ((SEED % 7) * 6) - 8;          // -8 .. 28 vh
      var vx = ((SEED >> 3) % 4) * 2;          // 0 .. 6 vw further toward the edge
      var sc = 0.95 + ((SEED >> 1) % 5) * 0.1;  // 0.95 .. 1.35 (bigger, never tiny)
      var rt = (((SEED >> 2) % 5) + 2) * 13 * ((SEED % 2) ? -1 : 1); // +/-26..78 deg, never upright
      if (el.dataset.rot) rt = parseFloat(el.dataset.rot);   // per-page rotation override
      if (el.dataset.ty) vy = parseFloat(el.dataset.ty);     // per-page vertical (vh) override
      if (el.dataset.tx) vx = parseFloat(el.dataset.tx);     // per-page horizontal (vw) override
      if (el.dataset.scale) sc = parseFloat(el.dataset.scale); // per-page scale override
      var fx = (SEED % 2) ? -1 : 1;
      el.dataset.base = "translate(" + vx + "vw," + vy + "vh) rotate(" + rt + "deg) scale(" + (sc * fx) + "," + sc + ")";
      el.style.transform = el.dataset.base;
      el.style.transformOrigin = "center";
    }
  });

  /* ---------- SITE-WIDE BACKGROUND CELLS ---------- */
  // One continuous layer of cells flowing down the entire page,
  // hugging the left/right edges so content never boxes them in.
  function buildBgCells() {
    var old = document.querySelector(".bg-cells");
    if (old) old.remove();
    var layer = document.createElement("div");
    layer.className = "bg-cells";
    layer.setAttribute("aria-hidden", "true");
    var docH = document.documentElement.scrollHeight;
    uid += SEED % 7;                                  // shift gradient directions per page
    var start = window.innerHeight * (1.05 + (SEED % 6) * 0.05);
    var step = (HOME ? 820 : 1120) + (SEED % 110);   // fewer cells overall (perf)
    // Cells dodge solid-background blocks (dark bands) so they never look sliced.
    var blocked = [];
    document.querySelectorAll(".band, .video-embed, .blob-stage").forEach(function (el) {
      var r = el.getBoundingClientRect();
      var top = r.top + window.scrollY;
      blocked.push([top - 260, top + r.height + 60]);
    });
    // Statement-band sections show only their engine-motion icell — keep the
    // background mitosis cells well clear (pushed up toward the title or further down).
    document.querySelectorAll(".statement-band").forEach(function (el) {
      var r = el.getBoundingClientRect();
      var top = r.top + window.scrollY;
      blocked.push([top - 520, top + r.height + 520]);
    });
    function collides(y, size) {
      return blocked.some(function (b) { return y + size > b[0] && y < b[1]; });
    }
    // Cells live in the page gutters: they straddle section boundaries freely,
    // but never reach far enough inward to sit under body text.
    var gutter = Math.max(0, (window.innerWidth - 1180) / 2);
    // Text never reaches past the .wrap's inner padding edge — keep cells left of that.
    var wrapEl = document.querySelector("main .wrap") || document.querySelector(".wrap");
    var wrapPad = wrapEl ? parseFloat(getComputedStyle(wrapEl).paddingLeft) || 24 : 24;
    var wrapLeft = wrapEl ? Math.max(0, wrapEl.getBoundingClientRect().left) : gutter;
    var safeEdge = Math.max(0, wrapLeft + wrapPad - 18);   // visible cell edge stays in the margin
    var placed = [];
    function overlaps(side, top, bot) {
      for (var p = 0; p < placed.length; p++) {
        if (placed[p].side === side && bot > placed[p].top && top < placed[p].bot) return true;
      }
      return false;
    }
    var i = 0;
    for (var y = start; y < docH - 600; y += step) {
      var n = i + SEED;
      // bigger cells, no tiny ones — they should take up real space in the margins
      var size = (HOME ? 500 : 560) + ((n * 89) % (HOME ? 260 : 260));
      var yy = y + ((n * 53) % 220);
      var left = (n % 2 === 0);
      var side = left ? "L" : "R";
      var pad = Math.round(size * 0.22) + 50;          // room for rotation/scale + breathing space
      if (collides(yy, size) || overlaps(side, yy - pad, yy + size + pad)) { i++; continue; }
      var visible = Math.max(0, Math.min(size * 0.6, safeEdge));
      var cell = document.createElement("div");
      cell.className = "bg-cell";
      cell.style.top = Math.round(yy) + "px";
      cell.style.width = cell.style.height = size + "px";
      cell.style.opacity = HOME ? "0.9" : "0.8";
      cell.dataset.par = "0.08";   // uniform parallax: cells move together so spacing never collapses into overlap
      cell.style[left ? "left" : "right"] = "-" + Math.round(size - visible) + "px";
      // per-page variety + rotation so the teal/red sides keep swapping down the
      // margins. Cells are NEVER left upright (0deg) — always tilted on the page.
      var fx = ((n >> 1) % 2) ? -1 : 1, fy = ((n >> 2) % 2) ? -1 : 1;
      var ROTS = [25, 200, 90, 160, 320, 250, 35, 215];     // all clearly rotated, mix of teal- and red-leading
      var rot = ROTS[n % ROTS.length] + (((n * 23) % 13) - 6); // +/-6deg organic jitter
      cell.dataset.base = "scale(" + fx + "," + fy + ") rotate(" + rot + "deg)";
      cell.style.transform = cell.dataset.base;
      var palette = PALETTES[n % PALETTES.length];
      cell.innerHTML = blobByType(BG_TYPES[n % BG_TYPES.length]);
      placed.push({ side: side, top: yy - pad, bot: yy + size + pad });
      layer.appendChild(cell);
      i++;
    }
    document.body.insertBefore(layer, document.body.firstChild);
    parCells = [];
    // PERF: only animate cells that are on (or near) the screen. Off-screen cells
    // get their morph paused so the browser isn't re-rasterizing filtered masks for
    // the whole page at once.
    if (window.IntersectionObserver) {
      var vio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target.classList.toggle("offscreen", !e.isIntersecting); });
      }, { rootMargin: "300px 0px" });
      Array.prototype.forEach.call(layer.querySelectorAll(".bg-cell"), function (c) { vio.observe(c); });
    }
  }
  // Scroll parallax intentionally disabled: re-transforming the filtered SVG cells
  // on every scroll frame caused jank. Cells now scroll normally with the page and
  // animate in place (see the mitosis morph below).
  window.addEventListener("load", buildBgCells);
  var rsT;
  window.addEventListener("resize", function () {
    clearTimeout(rsT); rsT = setTimeout(buildBgCells, 300);
  });

  /* ---------- CLIENT LOGO MARQUEE ---------- */
  // Edit this list to add/remove client logos (files in assets/clients/).
  var CLIENT_LOGOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27];
  document.querySelectorAll("[data-client-logos]").forEach(function (track) {
    var imgs = "";
    [false, true].forEach(function (ghost) {
      CLIENT_LOGOS.forEach(function (n) {
        var f = "assets/clients/client-" + (n < 10 ? "0" + n : n) + ".png";
        imgs += '<img src="' + f + '" alt="' + (ghost ? '" aria-hidden="true"' : 'Client logo"') + ' loading="lazy">';
      });
    });
    track.innerHTML = imgs;
  });

  /* ---------- PHASE HOVER DELEGATION (home model) ---------- */
  document.querySelectorAll(".phase").forEach(function (ph) {
    var cell = ph.querySelector(".icell");
    if (!cell) return;
    ph.addEventListener("mouseenter", function () { cell.classList.add("hovering"); });
    ph.addEventListener("mouseleave", function () { cell.classList.remove("hovering"); });
  });

  /* ---------- SOUND TOGGLES (in place, no Vimeo hop) ---------- */
  document.querySelectorAll("[data-sound-target], #sizzle-sound").forEach(function (btn) {
    var frameId = btn.getAttribute("data-sound-target") || "sizzle-frame";
    var frame = document.getElementById(frameId);
    if (!frame) return;
    var muted = true;
    function vm(method, value) {
      frame.contentWindow.postMessage(JSON.stringify({ method: method, value: value }), "*");
    }
    btn.addEventListener("click", function () {
      muted = !muted;
      vm("setMuted", muted);
      vm("setVolume", muted ? 0 : 1);
      btn.textContent = muted ? "Watch with sound" : "Mute";
    });
  });

  /* ---------- SHOWCASE SOUND PILLS (one at a time) ---------- */
  var pills = Array.from(document.querySelectorAll(".sound-pill"));
  if (pills.length) {
    function pvm(id, method, value) {
      var fr = document.getElementById(id);
      if (fr) fr.contentWindow.postMessage(JSON.stringify({ method: method, value: value }), "*");
    }
    var audible = null;
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var id = pill.getAttribute("data-sv");
        if (audible === id) {
          pvm(id, "setMuted", true); pill.textContent = "Sound"; audible = null; return;
        }
        if (audible) {
          pvm(audible, "setMuted", true);
          var prev = document.querySelector('.sound-pill[data-sv="' + audible + '"]');
          if (prev) prev.textContent = "Sound";
        }
        pvm(id, "setMuted", false); pvm(id, "setVolume", 1);
        pill.textContent = "Mute"; audible = id;
      });
    });
  }

  /* ---------- QUOTE ROTATOR ---------- */
  document.querySelectorAll(".rotator").forEach(function (rot) {
    var quotes = rot.querySelectorAll(".rq");
    if (quotes.length < 2) return;
    var dotsWrap = rot.parentElement.querySelector(".rotator-dots");
    var dots = [];
    if (dotsWrap) {
      quotes.forEach(function (_, i) {
        var b = document.createElement("button");
        b.setAttribute("aria-label", "Quote " + (i + 1));
        b.addEventListener("click", function () { show(i); restart(); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }
    var idx = 0, timer;
    function fit(i) { rot.style.height = (quotes[i].offsetHeight + 6) + "px"; }
    function show(i) {
      idx = i;
      quotes.forEach(function (q, j) { q.classList.toggle("on", j === i); });
      dots.forEach(function (d, j) { d.classList.toggle("on", j === i); });
      fit(i);
    }
    function next() { show((idx + 1) % quotes.length); }
    function restart() { clearInterval(timer); timer = setInterval(next, 6500); }
    show(0); restart();
    window.addEventListener("resize", function () { fit(idx); });
  });

  /* ---------- HERO PARALLAX (disabled — caused scroll jank on filtered SVGs) ---------- */

  /* ---------- CONTACT FORM — mailto to alex@, honeypot + simple captcha ---------- */
  var cform = document.getElementById("contact-form");
  if (cform) {
    var A = 2 + Math.floor(Math.random() * 6), B = 2 + Math.floor(Math.random() * 6);
    var capLabel = document.getElementById("f-captcha-label");
    if (capLabel) capLabel.textContent = "Quick check: what is " + A + " + " + B + "?";
    cform.addEventListener("submit", function (e) {
      e.preventDefault();
      if (document.getElementById("f-hp").value) return;                  // bot filled the honeypot
      var cap = document.getElementById("f-captcha");
      if (parseInt(cap.value, 10) !== A + B) {
        cap.setCustomValidity("That doesn't add up — try again.");
        cap.reportValidity();
        cap.setCustomValidity("");
        return;
      }
      var g = function (id) { return (document.getElementById(id) || {}).value || ""; };
      var subject = encodeURIComponent("Website inquiry — " + (g("f-company") || g("f-name")));
      var body = encodeURIComponent(
        "Name: " + g("f-name") + "\nEmail: " + g("f-email") +
        "\nCompany: " + g("f-company") + "\nExploring: " + g("f-interest") +
        "\n\n" + g("f-msg"));
      window.location.href = "mailto:alex@lettherebe.com?subject=" + subject + "&body=" + body;
    });
  }

  /* ---------- COST CALCULATOR ----------
     Service dependencies (the new three-service model):
       \u2022 data-requires  \u2192 a prerequisite that is auto-added as its own billable line
                          (Claim Dev needs a Lit Review; every Studio activation needs
                          a Science Story).
       \u2022 data-includes  \u2192 items the service bundles into its own price, shown "Included"
                          (Science Story bundles Lit Review + Claim Dev).
     We track the user's explicit picks separately so auto-added prerequisites can be
     released cleanly when the downstream service is removed. */
  var calcSummary = document.getElementById("calc-summary");
  if (calcSummary) {
    var svcs = Array.from(document.querySelectorAll(".svc"));
    var byId = {}; svcs.forEach(function (el) { byId[el.dataset.id] = el; });
    var userSel = {};   // ids the user explicitly checked
    function money(n) { return "$" + n.toLocaleString("en-US"); }
    function deps(el, name) {
      return (el.dataset[name] || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    }
    function recalc() {
      // Resolve the full set: walk user picks + everything they pull in.
      var free = {}, req = {}, seen = {};
      var queue = Object.keys(userSel).filter(function (id) { return userSel[id]; });
      while (queue.length) {
        var id = queue.shift();
        if (seen[id]) continue; seen[id] = true;
        var el = byId[id]; if (!el) continue;
        deps(el, "includes").forEach(function (d) { free[d] = true; if (!seen[d]) queue.push(d); });
        deps(el, "requires").forEach(function (d) { req[d] = true; if (!seen[d]) queue.push(d); });
      }
      var count = 0, subtotal = 0, lines = [];
      svcs.forEach(function (el) {
        var id = el.dataset.id, box = el.querySelector("input"), pr = el.querySelector(".price");
        var price = parseInt(el.dataset.price, 10) || 0;
        var dep = el.querySelector(".svc-dep");
        if (dep && !dep.dataset.orig) dep.dataset.orig = dep.textContent;
        el.classList.remove("on", "included-note", "req-added");
        var isFree = !!free[id];
        var isReq = !!req[id] && !userSel[id];
        if (isFree) {                                   // bundled into another service's price
          box.checked = true; box.disabled = true;
          el.classList.add("on", "included-note");
          if (pr) pr.textContent = "Included";
          if (dep) dep.textContent = "Included with your selection.";
        } else if (isReq) {                             // auto-added prerequisite, billed
          box.checked = true; box.disabled = true;
          el.classList.add("on", "req-added");
          if (pr) pr.textContent = money(price);
          if (dep) dep.textContent = "Added automatically \u2014 required first.";
          count++; subtotal += price;
          lines.push(el.dataset.name + " - " + money(price) + " (required)");
        } else {                                        // free to toggle
          box.disabled = false;
          if (dep && dep.dataset.orig) dep.textContent = dep.dataset.orig;
          if (pr) pr.textContent = money(price);
          box.checked = !!userSel[id];
          if (userSel[id]) {
            el.classList.add("on");
            count++; subtotal += price;
            lines.push(el.dataset.name + " - " + money(price));
          }
        }
      });
      var disc = count >= 3 ? 0.10 : count === 2 ? 0.05 : 0;
      var savings = Math.round(subtotal * disc);
      var total = subtotal - savings;
      document.getElementById("calc-count").textContent = count;
      document.getElementById("calc-subtotal").textContent = money(subtotal);
      document.getElementById("calc-discount").textContent = Math.round(disc * 100) + "%";
      document.getElementById("calc-savings").textContent = "\u2212" + money(savings);
      document.getElementById("calc-total").textContent = money(total);
      var body = "Hi Alexander,%0D%0A%0D%0AI built an estimate on lettherebe.com:%0D%0A%0D%0A" +
        encodeURIComponent(lines.join("\r\n")) +
        "%0D%0A%0D%0ABundle discount: " + Math.round(disc * 100) + "%25" +
        "%0D%0AEstimated total: " + encodeURIComponent(money(total)) +
        "%0D%0A%0D%0ALet's talk.";
      document.getElementById("calc-cta").href =
        "mailto:alexander@lettherebe.com?cc=alex@lettherebe.com&subject=" +
        encodeURIComponent("Project estimate inquiry (" + money(total) + ")") + "&body=" + body;
    }
    svcs.forEach(function (el) {
      el.querySelector("input").addEventListener("change", function () {
        var box = el.querySelector("input");
        if (box.disabled) return;                       // forced rows aren't user-toggleable
        if (box.checked) userSel[el.dataset.id] = true; else delete userSel[el.dataset.id];
        recalc();
      });
    });
    recalc();
  }

  /* ---------- COUNT-UP STATS ---------- */
  var counters = Array.from(document.querySelectorAll(".stat-value .nm")).filter(function (el) {
    if (el.closest("[data-no-count]")) return false;   // pages can opt out of the count animation
    return /^[+\u2212\-$]?[\d.,]+[%xX]?$/.test(el.textContent.trim());
  });
  if (counters.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        cio.unobserve(entry.target);
        var el = entry.target;
        var raw = el.textContent.trim();
        var m = raw.match(/^([+\u2212\-$]*)([\d.,]+)([%xX]?)$/);
        if (!m) return;
        var prefix = m[1], suffix = m[3];
        var target = parseFloat(m[2].replace(/,/g, ""));
        var decimals = (m[2].split(".")[1] || "").length;
        var useCommas = m[2].indexOf(",") !== -1;
        // Lock the element to its final width so counting up doesn't reflow the block/graphic
        el.style.display = "inline-block";
        el.style.textAlign = "left";
        el.style.fontVariantNumeric = "tabular-nums";
        el.style.minWidth = Math.ceil(el.getBoundingClientRect().width) + "px";
        var t0 = null, dur = 1300;
        function fmt(v) {
          var str = v.toFixed(decimals);
          if (useCommas) str = Number(str).toLocaleString("en-US", { minimumFractionDigits: decimals });
          return prefix + str + suffix;
        }
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * eased);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = raw;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- CASE-STUDY CAROUSEL ARROWS ---------- */
  document.querySelectorAll("[data-carousel-next], [data-carousel-prev]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var head = btn.closest("section");
      var track = head ? head.querySelector("[data-carousel]") : null;
      if (!track) return;
      var first = track.firstElementChild;
      var step = first ? first.getBoundingClientRect().width + 16 : 320;
      var dir = btn.hasAttribute("data-carousel-next") ? 1 : -1;
      track.scrollBy({ left: dir * step, behavior: "smooth" });
    });
  });

  /* Studio theater: click a video to play it in-tab; browse with prev/next */
  var lb = document.getElementById("vlightbox");
  if (lb) {
    var lbFrame = document.getElementById("vlb-frame");
    var lbNote  = document.getElementById("vlb-note");
    var prevBtn = document.getElementById("vlb-prev");
    var nextBtn = document.getElementById("vlb-next");
    var tiles = Array.prototype.slice.call(document.querySelectorAll(".scv-tile[data-vid]"));
    var idx = -1;
    function play(i) {
      idx = (i + tiles.length) % tiles.length;
      var t = tiles[idx];
      var vid = t.getAttribute("data-vid");
      var title = (t.getAttribute("data-title") || "").replace(/"/g, "");
      lbFrame.innerHTML = '<iframe src="https://player.vimeo.com/video/' + vid +
        '?autoplay=1&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture" title="' + title + '"></iframe>';
      if (lbNote) lbNote.style.display = "none";
    }
    function openLB(i) { play(i); lb.classList.add("open"); lb.setAttribute("aria-hidden","false"); document.body.style.overflow = "hidden"; }
    function closeLB() { lb.classList.remove("open"); lb.setAttribute("aria-hidden","true"); lbFrame.innerHTML = ""; document.body.style.overflow = ""; }
    tiles.forEach(function (t, i) { t.addEventListener("click", function () { openLB(i); }); });
    if (prevBtn) prevBtn.addEventListener("click", function (e) { e.stopPropagation(); play(idx - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function (e) { e.stopPropagation(); play(idx + 1); });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("vlb-close") || e.target.classList.contains("vlb-inner")) closeLB();
    });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLB();
      else if (e.key === "ArrowLeft") play(idx - 1);
      else if (e.key === "ArrowRight") play(idx + 1);
    });
  }


  /* ---------- SQUARE MUTE TOGGLE (background videos) ---------- */
  var ICON_MUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><line x1="16" y1="9" x2="22" y2="15"/><line x1="22" y1="9" x2="16" y2="15"/></svg>';
  var ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a9 9 0 0 1 0 12"/></svg>';
  document.querySelectorAll(".mute-sq").forEach(function (btn) {
    var muted = true;
    btn.innerHTML = ICON_MUTED;
    btn.addEventListener("click", function () {
      muted = !muted;
      var fr = document.getElementById(btn.getAttribute("data-frame"));
      if (fr && fr.contentWindow) {
        fr.contentWindow.postMessage(JSON.stringify({ method: "setMuted", value: muted }), "*");
        fr.contentWindow.postMessage(JSON.stringify({ method: "setVolume", value: muted ? 0 : 1 }), "*");
      }
      btn.innerHTML = muted ? ICON_MUTED : ICON_ON;
      btn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    });
  });

  /* ---------- MOODBOARD DRAG-TO-SCROLL ---------- */
  document.querySelectorAll("[data-moodboard]").forEach(function (mb) {
    var down = false, startX = 0, startScroll = 0;
    mb.addEventListener("pointerdown", function (e) {
      down = true; startX = e.clientX; startScroll = mb.scrollLeft;
      mb.classList.add("dragging");
      try { mb.setPointerCapture(e.pointerId); } catch (err) {}
    });
    mb.addEventListener("pointermove", function (e) {
      if (!down) return;
      mb.scrollLeft = startScroll - (e.clientX - startX);
    });
    var end = function () { down = false; mb.classList.remove("dragging"); };
    mb.addEventListener("pointerup", end);
    mb.addEventListener("pointercancel", end);
    mb.addEventListener("pointerleave", end);
    mb.addEventListener("wheel", function (e) { if (e.deltaY && !e.shiftKey) { mb.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  });

  /* ---------- MOODBOARD IMAGE LIGHTBOX ---------- */
  var ilb = document.getElementById("img-lightbox");
  if (ilb) {
    var ilbInner = ilb.querySelector(".ilb-inner");
    var closeIlb = function () { ilb.classList.remove("open"); ilbInner.innerHTML = ""; document.body.style.overflow = ""; };
    document.querySelectorAll(".mb-zoom").forEach(function (btn) {
      btn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var item = btn.closest(".mb-item");
        var img = item ? item.querySelector("img") : null;
        var lbl = item && item.querySelector("span") ? item.querySelector("span").textContent : "";
        ilbInner.innerHTML = img ? ('<img src="' + img.getAttribute("src") + '" alt="">') : ('<div class="ilb-ph">' + lbl + '</div>');
        ilb.classList.add("open"); ilb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
      });
    });
    ilb.addEventListener("click", function (e) { if (e.target === ilb || e.target.classList.contains("ilb-close")) closeIlb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && ilb.classList.contains("open")) closeIlb(); });
  }

  /* ---------- ENGINE PIPELINE MAP (what you need, and why) ---------- */
  (function () {
    var map = document.getElementById("pmap");
    if (!map) return;
    var info = document.getElementById("pmap-info");
    var allNodes = Array.prototype.slice.call(map.querySelectorAll("[data-node]"));
    var conns = Array.prototype.slice.call(map.querySelectorAll(".pmap-conn"));
    // highlight chains (include the "studio" container for production goals)
    var CHAIN = {
      lit: ["lit"], claim: ["lit", "claim"], story: ["lit", "claim", "story"],
      moa: ["lit", "claim", "story", "studio", "moa"],
      isk: ["lit", "claim", "story", "studio", "isk"],
      a2e: ["lit", "claim", "story", "studio", "a2e"],
      solo: ["studio", "solo"],
      lab: ["lab"]
    };
    var STAGE = {
      lit: { name: "Lit Review™", what: "An AI-assisted map of everything the science already says — mechanisms, white space, and misconceptions.", why: "Maps what the science can support — the foundation everything else is built on." },
      claim: { name: "Claim Dev™", what: "Pre-compliant claims pulled from the evidence and checked against MLR.", why: "Turns that evidence into pre-compliant, defensible claims you're actually allowed to make." },
      story: { name: "Science Story™", what: "Your science and claims shaped into creative concepts, tested with consumers.", why: "Shapes the claims into tested concepts — so production starts from a story that resonates, not a blank brief." },
      moa: { name: "MOA Moment™", what: "A short mechanism-of-action video that makes the science seeable." },
      isk: { name: "Influencer Science Kit™", what: "A creator-ready kit so partners explain your science with credibility." },
      a2e: { name: "Ad-to-Education Sequence™", what: "An ad-into-education funnel that turns attention into understanding." },
      lab: { name: "Claims Lab™", what: "An ongoing retainer with Lit Review™, Claim Dev™, and Science Story™ baked in — run continuously, every month, for brands in competitive markets that always need an edge. It runs on its own track, not as a one-time pipeline." }
    };
    var NOTE = {
      moa: { type: "rec", text: "✓ A MOA Moment™ can be produced on its own — but it's far stronger built on the full engine, where the mechanism is grounded in tested claims and a clear narrative." },
      isk: { type: "req", text: "Requires the full engine — an Influencer Science Kit™ can't be built without a Science Story™ behind it." },
      a2e: { type: "req", text: "Requires the full engine — the sequence only works when the education is grounded in a Science Story™." }
    };
    function note(t, txt) { return '<p class="pmap-note pmap-note-' + t + '">' + txt + "</p>"; }
    var DEFAULT = '<p class="pmap-detail-h">How to read this</p><p class="pmap-sm" style="font-size:1rem;color:#4a4a4e;line-height:1.6">The Science Marketing Engine is a pipeline — each stage produces exactly what the next one needs. Tap any deliverable above to see the path to make it and why each step matters. Most brands run the whole pipeline; you can enter wherever you are.</p>';
    function detail(goal) {
      if (goal === "lab") {
        return '<p class="pmap-detail-h">' + STAGE.lab.name + "</p><p class=\"pmap-sm\" style=\"font-size:0.98rem;color:#4a4a4e;line-height:1.6\">" + STAGE.lab.what + "</p>";
      }
      if (goal === "solo") {
        return '<p class="pmap-detail-h">A standalone video or ad</p>'
          + '<p class="pmap-sm">Education videos, :15 ads, social cut-downs — produced without the engine behind them.</p>'
          + note("warn", "Possible, but not recommended. Without the engine these are ordinary videos and ads with no scientific differentiation — they won't carry the edge our process is built for. We can do it, but it's not the work we're known for.");
      }
      var chain = CHAIN[goal].filter(function (k) { return k !== "studio"; });
      var lis = chain.map(function (k, i) {
        var s = STAGE[k], isGoal = k === goal;
        return '<li class="' + (isGoal ? "is-goal" : "") + '"><span class="pmap-num">' + (i + 1) + '</span><div><strong>' + s.name + (isGoal ? " — your deliverable" : "") + "</strong><p>" + (isGoal ? s.what : s.why) + "</p></div></li>";
      }).join("");
      return '<p class="pmap-detail-h">To deliver <strong>' + STAGE[goal].name + "</strong>, the path runs:</p><ol class=\"pmap-path\">" + lis + "</ol>" + (NOTE[goal] ? note(NOTE[goal].type, NOTE[goal].text) : "");
    }
    function show(goal) {
      var chain = (goal && CHAIN[goal]) || [];
      allNodes.forEach(function (n) {
        var k = n.getAttribute("data-node");
        var inChain = chain.indexOf(k) !== -1;
        n.classList.toggle("req", !!goal && inChain && k !== goal);
        n.classList.toggle("active", k === goal);
        n.classList.toggle("dim", !!goal && !inChain);
      });
      conns.forEach(function (c) {
        var ends = (c.getAttribute("data-conn") || "").split("-");
        c.classList.toggle("on", chain.indexOf(ends[0]) !== -1 && chain.indexOf(ends[1]) !== -1);
      });
      if (info) info.innerHTML = goal ? detail(goal) : DEFAULT;
    }
    var locked = null;
    var buttons = allNodes.filter(function (n) { return n.tagName === "BUTTON"; });
    buttons.forEach(function (b) {
      var k = b.getAttribute("data-node");
      b.addEventListener("mouseenter", function () { show(k); });
      b.addEventListener("focus", function () { show(k); });
      b.addEventListener("click", function () { locked = (locked === k) ? null : k; show(locked); });
    });
    map.addEventListener("mouseleave", function () { show(locked); });
    show(null);
  })();

  /* ---------- FOOTER YEAR ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- ENTRY SCREEN (petri-dish loader) ----------
     Reuses the brand soft-cell renderer. JS-gated in <head>: only the homepage,
     once per session, never for reduced-motion users. On Enter we dive into the
     centre cell and the homepage is revealed beneath the fading overlay. */
  function buildEntry() {
    var html = document.documentElement;
    if (!html.classList.contains("ltb-gating")) return;        // gate decided no
    if (!document.body.classList.contains("home")) { html.classList.remove("ltb-gating"); return; }
    try {
      var ov = document.createElement("div");
      ov.className = "ltb-entry";
      ov.setAttribute("role", "dialog");
      ov.setAttribute("aria-label", "Enter the Let There Be site");

      // measurement ticks around the rim (lab-instrument cue)
      var ticks = "";
      for (var a = 0; a < 360; a += 6) {
        var lng = (a % 30 === 0);
        var rad = a * Math.PI / 180;
        var r0 = lng ? 45.2 : 46.6, r1 = 48.4;
        ticks += '<line x1="' + (50 + r0 * Math.cos(rad)).toFixed(2) + '" y1="' + (50 + r0 * Math.sin(rad)).toFixed(2) +
          '" x2="' + (50 + r1 * Math.cos(rad)).toFixed(2) + '" y2="' + (50 + r1 * Math.sin(rad)).toFixed(2) +
          '" stroke="rgba(12,13,16,' + (lng ? 0.22 : 0.12) + ')" stroke-width="' + (lng ? 0.5 : 0.3) + '"/>';
      }

      var stage = document.createElement("div");
      stage.className = "pd-stage";
      stage.innerHTML =
        '<div class="pd-dish">' +
          '<svg class="pd-ticks" viewBox="0 0 100 100" aria-hidden="true">' + ticks + '</svg>' +
          '<div class="pd-medium"></div>' +              // agar / culture medium tint
          '<div class="pd-field"></div>' +               // single living cell goes here
          '<div class="pd-meniscus"></div>' +            // liquid edge ring
          '<div class="pd-glint"></div>' +               // diagonal glass streak
          '<div class="pd-bubble b1"></div><div class="pd-bubble b2"></div><div class="pd-bubble b3"></div>' +
          '<div class="pd-bubble b4"></div><div class="pd-bubble b5"></div><div class="pd-bubble b6"></div>' +
          '<div class="pd-rim"></div>' +                 // glass rim thickness + highlight
          '<div class="pd-spec"></div>' +                // top-left specular reflection
        '</div>';

      // The single homepage mitosis cell — the one you dive into.
      var field = stage.querySelector(".pd-field");
      var featureCell = document.createElement("div");
      featureCell.className = "pd-cell feature";
      var spin = document.createElement("div");
      spin.className = "pd-spin";
      spin.innerHTML = blobByType("split");
      featureCell.appendChild(spin);
      field.appendChild(featureCell);

      // Match the homepage hero blob's angle/flip so the dive lands seamlessly
      // on the same orientation (the hero blob is already placed by this point).
      // Put the hero-matched angle on the inner spinner so the cell box itself
      // stays free to scale (zoom-in) cleanly.
      var hero = document.querySelector(".hero .blob-hero, .blob-hero");
      if (hero && hero.dataset.base) {
        var mr = hero.dataset.base.match(/rotate\(([-\d.]+)deg\)/);
        var ms = hero.dataset.base.match(/scale\(([-\d.]+)/);
        var rot = mr ? parseFloat(mr[1]) : 0;
        var flip = (ms && parseFloat(ms[1]) < 0) ? -1 : 1;
        spin.style.transform = "rotate(" + rot + "deg) scaleX(" + flip + ")";
      }

      ov.appendChild(stage);
      ov.insertAdjacentHTML("beforeend",
        '<img class="pd-logo" src="assets/logo-left.png" alt="Let There Be — Science Marketing">' +
        '<div class="pd-prompt"><span class="key">Press Enter</span><span class="sub">or click anywhere to begin</span><button class="pd-skip" type="button">Skip intro</button></div>');
      document.body.appendChild(ov);

      var done = false;
      function enter(zoom) {
        if (done) return; done = true;
        try { sessionStorage.setItem("ltbEntered", "1"); } catch (e) {}
        html.classList.remove("ltb-gating");
        html.classList.add("ltb-released");
        if (zoom) ov.classList.add("entering");   // CSS zooms a full-screen gradient over everything
        else ov.style.opacity = "0";
        // Background cells were sized to the locked viewport — rebuild for the real page height.
        setTimeout(function () { try { buildBgCells(); } catch (e) {} }, 80);
        // Once the cell's gradient has filled the screen, crossfade through to the homepage.
        if (zoom) setTimeout(function () { ov.style.opacity = "0"; }, 900);
        setTimeout(function () {
          ov.remove();
          html.classList.remove("ltb-released");
          document.removeEventListener("keydown", onKey);
        }, zoom ? 1550 : 950);
      }
      function onKey(e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); enter(true); }
        else if (e.key === "Escape") { e.preventDefault(); enter(false); }
      }
      ov.addEventListener("click", function (e) {
        if (e.target.closest(".pd-skip")) return;
        enter(true);
      });
      ov.querySelector(".pd-skip").addEventListener("click", function (e) { e.stopPropagation(); enter(false); });
      document.addEventListener("keydown", onKey);
    } catch (err) {
      html.classList.remove("ltb-gating");   // never trap the page if something fails
    }
  }
  buildEntry();
})();
