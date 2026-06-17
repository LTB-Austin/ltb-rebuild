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
    [["#5FBF9C", "#5A8FD0"], ["#8A80C6", "#EE5642"]],
    [["#4FB8B0", "#5A8FD0"], ["#E0655F", "#EF6A4D"]],
    [["#5A8FD0", "#5FBF9C"], ["#8A80C6", "#EE5642"]],
    [["#8A80C6", "#5A8FD0"], ["#EF6A4D", "#EE5642"]]
  ];
  // Vivid, gradient-spectrum palettes for dark (Science Studio) pages
  var DARK_PALETTES = [
    [["#4FB8B0", "#5A8FD0"], ["#8A80C6", "#EE5642"]],
    [["#5A8FD0", "#8A80C6"], ["#EF6A4D", "#EE5642"]],
    [["#EF6A4D", "#EE5642"], ["#4FB8B0", "#5A8FD0"]],
    [["#BEC0D8", "#EF6A4D"], ["#5A8FD0", "#8A80C6"]]
  ];
  if (document.body.classList.contains("theme-dark")) {
    PALETTES = DARK_PALETTES;
  }
  var uid = 0;

  var GSTOP = "<stop offset='0%' stop-color='#5FBF9C'/><stop offset='20%' stop-color='#4FB8B0'/><stop offset='40%' stop-color='#5A8FD0'/><stop offset='58%' stop-color='#8A80C6'/><stop offset='80%' stop-color='#E0655F'/><stop offset='100%' stop-color='#EE5642'/>";
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

  // A dividing cell: two gradient lobes inside a goo filter,
  // pulling apart and re-merging (CSS keyframes drive the motion).
  function divideBlob(palette) {
    uid++;
    var g = "ltbGrad" + uid, f = "ltbGoo" + uid, d = DIRS[uid % DIRS.length];
    return '<svg viewBox="0 0 400 400" aria-hidden="true"><defs>' +
      linGrad(g, d) + gooFilterCrisp(f, 11) + "</defs>" +
      '<g class="goo-group anim-divide anim-drift" filter="url(#' + f + ')" opacity="0.95">' +
      '<circle class="cell-a" cx="172" cy="196" r="92" fill="url(#' + g + ')" style="--pull:58px;--pull2:76px"/>' +
      '<circle class="cell-b" cx="246" cy="210" r="76" fill="url(#' + g + ')" style="--pull:58px;--pull2:76px"/>' +
      "</g></svg>";
  }

  // Ambient cell cluster: slow drift + breathing, no division.
  function ambientBlob(palette) {
    uid++;
    var g = "ltbGrad" + uid, f = "ltbGoo" + uid, d = DIRS[(uid + 1) % DIRS.length];
    return '<svg viewBox="0 0 400 400" aria-hidden="true"><defs>' +
      linGrad(g, d) + gooFilterCrisp(f, 10) + "</defs>" +
      '<g class="goo-group anim-drift" filter="url(#' + f + ')" opacity="0.92">' +
      '<circle class="anim-breathe" cx="170" cy="200" r="86" fill="url(#' + g + ')"/>' +
      '<circle class="anim-breathe" cx="262" cy="226" r="58" fill="url(#' + g + ')" style="animation-delay:-4.5s"/>' +
      "</g></svg>";
  }

  document.querySelectorAll("[data-blob]").forEach(function (el, i) {
    var type = el.getAttribute("data-blob");
    var pIdx = el.hasAttribute("data-palette")
      ? parseInt(el.getAttribute("data-palette"), 10) % PALETTES.length
      : i % PALETTES.length;
    var palette = PALETTES[pIdx];
    el.innerHTML = type === "divide" ? divideBlob(palette) : ambientBlob(palette);
    // Per-page hero placement: shift / scale / rotate / flip so no two pages match.
    // Kept to the right & lower edge so it never crosses the left-aligned hero text.
    if (el.classList.contains("blob-hero") || el.classList.contains("blob-corner-tr")) {
      var vy = ((SEED % 7) * 6) - 8;          // -8 .. 28 vh
      var vx = ((SEED >> 3) % 4) * 2;          // 0 .. 6 vw further toward the edge
      var sc = 0.82 + ((SEED >> 1) % 5) * 0.09; // 0.82 .. 1.18
      var rt = (((SEED >> 2) % 9) - 4) * 10;    // -40 .. 40 deg
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
    var step = (HOME ? 560 : 880) + (SEED % 110);
    // Cells dodge solid-background blocks (dark bands) so they never look sliced.
    var blocked = [];
    document.querySelectorAll(".band, .video-embed, .blob-stage").forEach(function (el) {
      var r = el.getBoundingClientRect();
      var top = r.top + window.scrollY;
      blocked.push([top - 260, top + r.height + 60]);
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
      var size = (HOME ? 300 : 400) + ((n * 89) % (HOME ? 340 : 240));
      var yy = y + ((n * 53) % 220);
      var left = (n % 2 === 0);
      var side = left ? "L" : "R";
      var pad = Math.round(size * 0.22) + 50;          // room for rotation/scale + breathing space
      if (collides(yy, size) || overlaps(side, yy - pad, yy + size + pad)) { i++; continue; }
      var visible = Math.max(0, Math.min(size * 0.5, safeEdge));
      var cell = document.createElement("div");
      cell.className = "bg-cell";
      cell.style.top = Math.round(yy) + "px";
      cell.style.width = cell.style.height = size + "px";
      cell.style.opacity = HOME ? "0.9" : "0.8";
      cell.dataset.par = (0.08 + (i % 5) * 0.05).toFixed(3);
      cell.style[left ? "left" : "right"] = "-" + Math.round(size - visible) + "px";
      // per-page variety: mirror + slight tilt so layouts never repeat (bounding box stays edge-safe)
      var fx = (n % 2) ? -1 : 1, fy = ((n >> 1) % 2) ? -1 : 1, rot = ((n * 41) % 33) - 16;
      cell.dataset.base = "scale(" + fx + "," + fy + ") rotate(" + rot + "deg)";
      cell.style.transform = cell.dataset.base;
      var palette = PALETTES[n % PALETTES.length];
      cell.innerHTML = ((HOME ? (n % 2 === 0) : (n % 3 === 0))) ? divideBlob(palette) : ambientBlob(palette);
      placed.push({ side: side, top: yy - pad, bot: yy + size + pad });
      layer.appendChild(cell);
      i++;
    }
    document.body.insertBefore(layer, document.body.firstChild);
    parCells = HOME ? Array.prototype.slice.call(layer.querySelectorAll(".bg-cell")) : [];
  }
  // Subtle scroll parallax: background cells lag the scroll a touch, adding depth (home only).
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var parTick = false;
    window.addEventListener("scroll", function () {
      if (parTick) return; parTick = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        for (var k = 0; k < parCells.length; k++) {
          parCells[k].style.transform = "translate3d(0," + (y * parseFloat(parCells[k].dataset.par)).toFixed(1) + "px,0) " + parCells[k].dataset.base;
        }
        parTick = false;
      });
    }, { passive: true });
  }
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

  /* ---------- HERO PARALLAX ---------- */
  var heroBlob = document.querySelector(".blob-hero");
  var heroBlob2 = document.querySelector(".hero .blob-corner-tl");
  if ((heroBlob || heroBlob2) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.6) {
        if (heroBlob) heroBlob.style.transform = "translateY(" + (y * 0.16) + "px) " + (heroBlob.dataset.base || "");
        if (heroBlob2) heroBlob2.style.transform = "translateY(" + (y * -0.12) + "px) " + (heroBlob2.dataset.base || "");
      }
    }, { passive: true });
  }

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

  /* ---------- COST CALCULATOR ---------- */
  var calcSummary = document.getElementById("calc-summary");
  if (calcSummary) {
    var svcs = Array.from(document.querySelectorAll(".svc"));
    function money(n) { return "$" + n.toLocaleString("en-US"); }
    function recalc() {
      // Science Story includes Lit Review + Claim Dev
      var included = {};
      svcs.forEach(function (el) {
        var box = el.querySelector("input");
        if (box.checked && el.dataset.includes) {
          el.dataset.includes.split(",").forEach(function (id) { included[id] = true; });
        }
      });
      var count = 0, subtotal = 0, lines = [];
      svcs.forEach(function (el) {
        var box = el.querySelector("input");
        var id = el.dataset.id;
        if (included[id]) {
          box.checked = true; box.disabled = true;
          el.classList.add("on", "included-note");
          var pr = el.querySelector(".price");
          if (pr) pr.textContent = "Included";
          return;
        }
        box.disabled = false;
        el.classList.remove("included-note");
        var pr2 = el.querySelector(".price");
        if (pr2 && pr2.textContent === "Included") pr2.textContent = money(parseInt(el.dataset.price, 10));
        el.classList.toggle("on", box.checked);
        if (box.checked) {
          count++;
          subtotal += parseInt(el.dataset.price, 10);
          lines.push(el.dataset.name + " - " + money(parseInt(el.dataset.price, 10)));
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
      el.querySelector("input").addEventListener("change", recalc);
    });
    recalc();
  }

  /* ---------- COUNT-UP STATS ---------- */
  var counters = Array.from(document.querySelectorAll(".stat-value .nm")).filter(function (el) {
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

  /* Studio carousel: click a card to open the enlarged video lightbox */
  var lb = document.getElementById("vlightbox");
  if (lb) {
    var lbFrame = document.getElementById("vlb-frame");
    var lbNote = document.getElementById("vlb-note");
    var closeLB = function () {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      lbFrame.innerHTML = "";
      document.body.style.overflow = "";
    };
    document.querySelectorAll(".scv-play").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var vid = btn.getAttribute("data-vid");
        var title = (btn.getAttribute("data-title") || "").replace(/"/g, "");
        var note = btn.getAttribute("data-note") || "";
        lbFrame.innerHTML = '<iframe src="https://player.vimeo.com/video/' + vid +
          '?autoplay=1&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture" title="' + title + '"></iframe>';
        lbNote.textContent = note;
        lbNote.style.display = note ? "block" : "none";
        lb.classList.add("open");
        lb.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("vlb-close")) closeLB();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("open")) closeLB();
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

  /* ---------- FOOTER YEAR ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
