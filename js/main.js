(function () {
  "use strict";
  var S = window.SITE;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function h(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function safe(fn) { try { return fn(); } catch (e) { return null; } }

  /* Theme ---------------------------------------------------------------- */
  var root = document.documentElement;
  var themeBtn = $("#theme");
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function paintThemeBtn() { themeBtn.textContent = currentTheme() === "dark" ? "Light mode" : "Dark mode"; }
  var saved = safe(function () { return localStorage.getItem("theme"); });
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;
  paintThemeBtn();
  themeBtn.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    safe(function () { localStorage.setItem("theme", next); });
    paintThemeBtn();
  });

  /* Hero: zones ---------------------------------------------------------- */
  var hero = $(".hero");
  var map = $("#map");
  var zonesEl = $("#zones");
  var panel = $("#zonePanel");
  var pinned = null, preview = null;
  var COVER = [["built", "Built-up", "--c-built"], ["water", "Water", "--c-water"], ["veg", "Vegetation", "--c-veg"], ["barren", "Barren", "--c-barren"]];

  hero.classList.add("is-loading");

  S.zones.forEach(function (z, i) {
    var b = h("button", { "class": "zone", type: "button", "aria-pressed": "false", "data-zone": i });
    b.style.setProperty("--zc", z.color);
    b.innerHTML = "<i></i><span>" + esc(z.code) + " " + esc(z.name) + "</span>";
    b.addEventListener("mouseenter", function () { setPreview(i); });
    b.addEventListener("mouseleave", function () { setPreview(null); });
    b.addEventListener("focus", function () { setPreview(i); });
    b.addEventListener("blur", function () { setPreview(null); });
    b.addEventListener("click", function () { togglePin(i); });
    zonesEl.appendChild(b);
  });

  function settle() { hero.classList.add("is-settled"); }
  function setPreview(i) { preview = i; settle(); render(); }
  function togglePin(i) { pinned = pinned === i ? null : i; settle(); render(); }

  function render() {
    var active = preview != null ? preview : pinned;
    map.setAttribute("data-active", active == null ? "" : String(active));
    $$(".zone", zonesEl).forEach(function (b, i) {
      b.classList.toggle("is-live", active === i);
      b.setAttribute("aria-pressed", pinned === i ? "true" : "false");
    });
    if (active == null) {
      panel.style.removeProperty("--zc");
      panel.innerHTML = '<div class="zone-title">Five zones from one model</div>' +
        "<p>The residential and the commercial and residential zones are the most built up, at 49.92 and 45.52 percent. Industrial and eco-agricultural land is the least built up, at 19.77 percent. Overall accuracy against reference data is 0.91, with a Kappa of 0.82.</p>";
      return;
    }
    var z = S.zones[active];
    panel.style.setProperty("--zc", z.color);
    var bar = COVER.map(function (c) { return '<span style="width:' + z.cover[c[0]] + "%;background:var(" + c[2] + ')"></span>'; }).join("");
    var key = COVER.map(function (c) { return '<span><i style="background:var(' + c[2] + ')"></i>' + c[1] + " <b>" + z.cover[c[0]].toFixed(1) + "%</b></span>"; }).join("");
    panel.innerHTML = '<div class="zone-title">' + esc(z.code) + ", " + esc(z.name.toLowerCase()) + " zone</div>" +
      '<div class="cover" role="img" aria-label="Land cover of the zone">' + bar + "</div>" +
      '<div class="cover-key">' + key + "</div>" +
      "<p>" + esc(z.fact) + "</p>" +
      '<p class="small">Found around: ' + esc(z.places) + ".</p>";
  }
  render();

  /* Hover on the map itself. Needs canvas pixel reads, so it is skipped if the browser blocks them. */
  var stack = $(".map-stack");
  var zoneImgs = $$(".layer-zone");
  var ctxs = [], pixelsOk = true, CW = 190, CH = 256;
  function prepPixels() {
    zoneImgs.forEach(function (img, i) {
      var c = document.createElement("canvas"); c.width = CW; c.height = CH;
      var x = c.getContext("2d", { willReadFrequently: true });
      x.drawImage(img, 0, 0, CW, CH);
      ctxs[i] = x;
    });
    if (safe(function () { return ctxs[0].getImageData(0, 0, 1, 1); }) == null) pixelsOk = false;
  }
  function zoneAt(e) {
    var r = stack.getBoundingClientRect();
    var x = Math.floor((e.clientX - r.left) / r.width * CW), y = Math.floor((e.clientY - r.top) / r.height * CH);
    if (x < 0 || y < 0 || x >= CW || y >= CH) return null;
    for (var i = 0; i < ctxs.length; i++) {
      var d = safe(function () { return ctxs[i].getImageData(x, y, 1, 1).data; });
      if (d && d[3] > 40) return i;
    }
    return null;
  }
  Promise.all(zoneImgs.map(function (img) {
    return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
  })).then(function () {
    prepPixels();
    if (pixelsOk) {
      stack.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        var z = zoneAt(e);
        if (z !== preview) setPreview(z);
      });
      stack.addEventListener("pointerleave", function () { if (preview != null) setPreview(null); });
      stack.addEventListener("click", function (e) {
        var z = zoneAt(e);
        if (z != null) togglePin(z); else if (pinned != null) togglePin(pinned);
      });
    }
  });
  var loadTimer = setTimeout(go, 1600);
  function go() {
    clearTimeout(loadTimer);
    if (!hero.classList.contains("is-loading")) return;
    hero.classList.remove("is-loading"); hero.classList.add("is-ready");
    setTimeout(settle, 2100);
  }
  Promise.all(zoneImgs.map(function (img) { return img.decode ? img.decode().catch(function () {}) : Promise.resolve(); })).then(go);

  /* Lightbox -------------------------------------------------------------- */
  var lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbPrev = $("#lbPrev"), lbNext = $("#lbNext");
  var lbList = [], lbIdx = 0, lbOpener = null;
  function lbShow() {
    var it = lbList[lbIdx];
    lbImg.src = it.src; lbImg.alt = it.alt || it.cap || "";
    lbCap.textContent = it.cap || "";
    lbPrev.disabled = lbIdx === 0; lbNext.disabled = lbIdx === lbList.length - 1;
    lbPrev.hidden = lbNext.hidden = lbList.length < 2;
  }
  function openLb(list, idx, opener) {
    lbList = list; lbIdx = idx; lbOpener = opener || null;
    lbShow();
    if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
  }
  lbPrev.addEventListener("click", function () { if (lbIdx > 0) { lbIdx--; lbShow(); } });
  lbNext.addEventListener("click", function () { if (lbIdx < lbList.length - 1) { lbIdx++; lbShow(); } });
  $("#lbClose").addEventListener("click", function () { lb.close(); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener("close", function () { if (lbOpener) lbOpener.focus(); });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") lbPrev.click();
    if (e.key === "ArrowRight") lbNext.click();
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-gallery]");
    if (!t) return;
    var name = t.getAttribute("data-gallery"), idx = +t.getAttribute("data-index") || 0;
    if (name === "single") {
      openLb([{ src: t.getAttribute("data-src"), cap: t.getAttribute("data-cap"), alt: t.getAttribute("data-alt") }], 0, t);
    } else if (S.gallery[name]) {
      openLb(S.gallery[name], idx, t);
    }
  });

  /* Thesis: pipeline stepper --------------------------------------------- */
  var stepTabs = $("#stepTabs"), stepPanel = $("#stepPanel"), stepIdx = 0;
  S.steps.forEach(function (s, i) {
    var b = h("button", { "class": "step-tab", type: "button", role: "tab", id: "step-tab-" + i, "aria-controls": "stepPanel" },
      "<b>" + (i + 1) + "</b><span>" + esc(s.tab) + "</span>");
    b.addEventListener("click", function () { showStep(i); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { showStep((stepIdx + 1) % S.steps.length, true); e.preventDefault(); }
      if (e.key === "ArrowLeft") { showStep((stepIdx + S.steps.length - 1) % S.steps.length, true); e.preventDefault(); }
    });
    stepTabs.appendChild(b);
  });
  function showStep(i, focus) {
    stepIdx = i;
    var s = S.steps[i];
    $$(".step-tab", stepTabs).forEach(function (b, j) {
      b.setAttribute("aria-selected", j === i ? "true" : "false");
      b.tabIndex = j === i ? 0 : -1;
      if (focus && j === i) b.focus();
    });
    stepPanel.setAttribute("aria-labelledby", "step-tab-" + i);
    stepPanel.innerHTML = "<div><h4>" + esc(s.title) + "</h4>" +
      s.text.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") +
      '<p class="step-note">' + esc(s.note) + "</p></div>" +
      '<button type="button" class="step-fig thumb" data-gallery="single" data-src="' + esc(s.fig.src) + '" data-cap="' + esc(s.fig.caption) + '" data-alt="' + esc(s.fig.alt) + '">' +
      '<img src="' + esc(s.fig.src) + '" alt="' + esc(s.fig.alt) + '"><span>' + esc(s.fig.caption) + ". Select to enlarge.</span></button>";
  }
  showStep(0);

  /* Thesis: result explorer ----------------------------------------------- */
  var resTabs = $("#resultTabs"), resPanel = $("#resultPanel"), resIdx = 0;
  function fmt(kind, v) {
    if (kind === "pct") return v.toFixed(1) + "%";
    if (kind === "n2") return v.toFixed(2);
    return v.toFixed(3);
  }
  function barsHTML(bars, domain, kind, target) {
    var lo = domain[0], hi = domain[1], span = hi - lo;
    function pos(v) { return (v - lo) / span * 100; }
    var rows = bars.map(function (b) {
      var z = pos(0), p = pos(b.v);
      var left = Math.min(z, p), width = Math.abs(p - z);
      var inside = p > 78;
      var label = '<span class="bar-val" style="' + (inside ? "right:" + (100 - p) + "%;color:var(--accent-ink)" : "left:" + (b.v >= 0 ? p + 0.8 : z + 0.8) + "%") + '">' + fmt(kind, b.v) + "</span>";
      return '<div class="bar-row"><span>' + esc(b.label) + '</span><div class="bar-track">' +
        (lo < 0 ? '<span class="bar-zero" style="left:' + z + '%"></span>' : "") +
        (target != null ? '<span class="bar-target" style="left:' + pos(target) + '%"></span>' : "") +
        '<span class="bar-fill' + (b.hero ? " is-hero" : "") + '" data-left="' + left + '" data-width="' + width + '" style="left:' + z + '%;width:0"></span>' +
        label + "</div></div>";
    }).join("");
    return '<div class="bars">' + rows + "</div>" + (target != null ? '<p class="bar-target-label">Dashed line: the 90 percent target.</p>' : "");
  }
  S.results.forEach(function (r, i) {
    var b = h("button", { "class": "step-tab", type: "button", role: "tab", id: "res-tab-" + i }, "<span>" + esc(r.tab) + "</span>");
    b.addEventListener("click", function () { showResult(i); });
    resTabs.appendChild(b);
  });
  function showResult(i) {
    resIdx = i;
    var r = S.results[i];
    $$(".step-tab", resTabs).forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); });
    resPanel.setAttribute("aria-labelledby", "res-tab-" + i);
    var body;
    if (r.groups) {
      body = r.groups.map(function (g) { return '<div class="pair-title">' + esc(g.name) + "</div>" + barsHTML(g.bars, g.domain, g.fmt); }).join("");
    } else {
      body = barsHTML(r.bars, r.domain, r.fmt, r.target);
    }
    resPanel.innerHTML = "<h4>" + esc(r.title) + '</h4><p class="result-sub">' + esc(r.sub) + "</p>" + body + '<p class="result-takeaway">' + esc(r.take) + "</p>";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        $$(".bar-fill", resPanel).forEach(function (f) {
          f.style.left = f.getAttribute("data-left") + "%";
          f.style.width = f.getAttribute("data-width") + "%";
        });
      });
    });
  }
  showResult(0);

  /* Thesis: figure thumbnails -------------------------------------------- */
  var tt = $("#thesisThumbs");
  var captions = ["Raw ERA5 against the gauges", "Model against baselines", "Phase-separated against joint training", "Ablation, nine configurations", "Daily prediction intervals", "Monthly observed and predicted", "The 2018 failure, diagnosed", "Graph network architecture", "Two stage training", "Full workflow"];
  S.gallery.thesis.forEach(function (g, i) {
    var b = h("button", { "class": "thumb", type: "button", "data-gallery": "thesis", "data-index": i });
    b.innerHTML = '<img loading="lazy" src="' + esc(g.src) + '" alt="' + esc(g.cap) + '"><span>' + esc(captions[i] || "Figure") + "</span>";
    tt.appendChild(b);
  });
  if (S.config.thesisRepo) { var tr = $("#thesisRepo"); tr.href = S.config.thesisRepo; tr.hidden = false; }

  /* Projects ledger ------------------------------------------------------ */
  var ledger = $("#ledger"), filters = $("#filters"), countEl = $("#count");
  var tags = ["All"];
  S.projects.forEach(function (p) { p.tags.forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); }); });
  var filter = "All";
  tags.forEach(function (t) {
    var b = h("button", { "class": "chip", type: "button", "aria-pressed": t === "All" ? "true" : "false" }, esc(t));
    b.addEventListener("click", function () { setFilter(t); });
    filters.appendChild(b);
  });
  S.projects.forEach(function (p) {
    var d = h("details", { "class": "row", id: "p-" + p.id });
    d.setAttribute("data-tags", p.tags.join("|"));
    var meta = esc(p.meta).replace(/In progress\./, "<em>In progress.</em>");
    var sum = h("summary", null,
      '<span><span class="row-title">' + esc(p.title) + '</span><span class="row-meta">' + meta + "</span></span>" +
      '<span class="row-result">' + esc(p.result) + "</span><span class=\"row-plus\" aria-hidden=\"true\"></span>");
    var body = h("div", { "class": "row-body" + (p.fig ? "" : " no-fig") });
    var left = h("div", null, p.body.map(function (t) { return t.charAt(0) === "<" ? t : "<p>" + esc(t) + "</p>"; }).join("") +
      '<div class="row-tags">' + p.tags.concat(p.tools).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>");
    body.appendChild(left);
    if (p.fig) {
      var fg = h("div", { "class": "row-fig" });
      fg.innerHTML = '<button type="button" class="thumb" data-gallery="single" data-src="' + esc(p.fig.src) + '" data-cap="' + esc(p.fig.caption) + '" data-alt="' + esc(p.fig.alt) + '"><img loading="lazy" src="' + esc(p.fig.src) + '" alt="' + esc(p.fig.alt) + '"><span>' + esc(p.fig.caption) + ". Select to enlarge.</span></button>";
      body.appendChild(fg);
    }
    d.appendChild(sum); d.appendChild(body);
    ledger.appendChild(d);
  });
  function setFilter(t) {
    filter = t;
    $$(".chip", filters).forEach(function (b) { b.setAttribute("aria-pressed", b.textContent === t ? "true" : "false"); });
    var shown = 0;
    $$(".row", ledger).forEach(function (r) {
      var ok = t === "All" || r.getAttribute("data-tags").split("|").indexOf(t) >= 0;
      r.hidden = !ok; if (ok) shown++;
    });
    countEl.textContent = t === "All" ? S.projects.length + " projects" : "Showing " + shown + " of " + S.projects.length + " projects: " + t;
  }
  setFilter("All");
  function openProject(id) {
    var d = $("#p-" + id);
    if (!d) return false;
    if (d.hidden) setFilter("All");
    d.open = true;
    return true;
  }
  if (location.hash.indexOf("#p-") === 0) { openProject(location.hash.slice(3)); }

  /* Field work: fill gallery handled via data attributes ------------------ */

  /* Tools ---------------------------------------------------------------- */
  var SHORT = { thesis: "Rainfall thesis", paper: "Zone paper", "census-ml": "District GDP models", "senhati-gaps": "Senhati service gaps", "senhati-market": "Senhati markets", uei: "Expansion intensity", gazipur: "Gazipur", gangarampur: "Gangarampur", landscape: "Park design", "water-transport": "Water transport proposal", "env-profile": "Ward profiling" };
  var tg = $("#toolgrid");
  S.tools.forEach(function (t) {
    var used = (t.used || []).map(function (id) {
      var href = id === "thesis" ? "#thesis" : id === "paper" ? "#paper" : "#p-" + id;
      return '<a href="' + href + '" data-open="' + id + '">' + esc(SHORT[id] || id) + "</a>";
    }).join(", ");
    var d = h("div", { "class": "tool" },
      "<h3>" + esc(t.name) + '</h3><p class="tool-sub">' + esc(t.sub) + '</p><ul class="tool-list">' +
      t.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" +
      (used ? '<p class="tool-used">Used in: ' + used + ".</p>" : ""));
    tg.appendChild(d);
  });
  tg.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-open]");
    if (a && a.getAttribute("data-open") !== "thesis" && a.getAttribute("data-open") !== "paper") openProject(a.getAttribute("data-open"));
  });

  /* Courses -------------------------------------------------------------- */
  var cs = $("#courses");
  S.courses.forEach(function (c) {
    var d = h("details", null, "<summary>" + esc(c.group) + "<span>" + c.list.length + " course" + (c.list.length > 1 ? "s" : "") + "</span></summary><ul>" +
      c.list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>");
    cs.appendChild(d);
  });

  /* Contact -------------------------------------------------------------- */
  var cl = $("#contactLinks"), cfg = S.config;
  var html = '<a class="btn btn-solid" href="mailto:' + esc(cfg.email) + '">Email ' + esc(cfg.email) + "</a>";
  [["github", "GitHub"], ["linkedin", "LinkedIn"], ["scholar", "Google Scholar"]].forEach(function (p) {
    if (cfg[p[0]]) html += '<a class="btn" target="_blank" rel="noopener" href="' + esc(cfg[p[0]]) + '">' + p[1] + "</a>";
  });
  cl.innerHTML = html;

  /* CV link appears only if the file is present --------------------------- */
  if (window.fetch && location.protocol.indexOf("http") === 0) {
    fetch("assets/cv.pdf", { method: "HEAD" }).then(function (r) {
      if (r.ok) { var c = $("#cvLink"); c.hidden = false; }
    }).catch(function () {});
  }

  /* Current section in the top bar --------------------------------------- */
  if ("IntersectionObserver" in window) {
    var links = {};
    $$(".bar-nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
        var a = links[en.target.id]; if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(links).forEach(function (k) { var s = document.getElementById(k); if (s) io.observe(s); });
  }
})();
