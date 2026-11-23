/* Site interactions. Vanilla JS, no dependencies. Content is visible without JS. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Focus trap: Tab cycles inside the open panel instead of wandering into
     the page behind it. Roots are in document order (toggle, then menu). */
  function trapTab(e, roots) {
    if (e.key !== "Tab") return;
    var els = [];
    roots.forEach(function (root) {
      if (!root) return;
      if (root.matches("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")) els.push(root);
      Array.prototype.slice.call(root.querySelectorAll(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )).forEach(function (el) { els.push(el); });
    });
    if (!els.length) return;
    var first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* Footer year */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Header shadow on scroll */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    var top = document.querySelector(".to-top");
    if (top) top.classList.toggle("show", window.scrollY > 1200);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu: a right-side drawer. The header stays above it, so the
     round toggle (morphing to an X) is the one close control; the dimmed
     backdrop also closes it. Focus goes to the first link on open. */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  var backdrop = document.getElementById("menu-backdrop");
  var lastFocus = null;
  if (menu) { menu.setAttribute("role", "dialog"); menu.setAttribute("aria-modal", "true"); }
  function openMenu() {
    lastFocus = document.activeElement;
    if (header) header.classList.add("menu-open");
    /* The drawer starts exactly below the header, wherever the header
       sits right now: at the top of the page the announcement bar sits
       above it, scrolled it sits at the viewport top. A fixed padding
       cannot know that, so the top is measured live on every open. */
    if (header) menu.style.top = Math.round(header.getBoundingClientRect().bottom) + "px";
    menu.classList.add("open");
    if (backdrop) backdrop.classList.add("show");
    toggle.setAttribute("aria-expanded", "true");
    /* Scroll-lock on <html>, NOT <body>: overflow:hidden on <body> makes
       the body the scroll container, which un-sticks the sticky header —
       after scrolling, opening the drawer sent the header (and school
       name) to top ≈ -scrollY, i.e. off-screen (v31 W-A, measured
       390/768/834: header top -755px at scrollY 800). Locking <html>
       freezes background scroll and the header stays stuck at top 0. */
    document.documentElement.style.overflow = "hidden";
    var firstLink = menu.querySelector("nav a");
    if (firstLink) firstLink.focus();
  }
  function closeMenu() {
    if (header) header.classList.remove("menu-open");
    menu.classList.remove("open");
    menu.style.top = "";
    if (backdrop) backdrop.classList.remove("show");
    toggle.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (menu.classList.contains("open")) closeMenu();
      else openMenu();
    });
    if (backdrop) backdrop.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
      if (menu.classList.contains("open")) trapTab(e, [toggle, menu]);
    });
  }

  /* Auto-reveal: rows and cards that ship static in the HTML get the same
     entrance as everything else — staggered inside their own list, so a
     long list ripples instead of flashing in as one block. Runs before the
     stagger / reveal setup below, so the observer and the sweep pick them
     up like any other reveal. */
  var autoReveal = [
    ".dates-strip .date-item",
    ".meaning-grid .meaning",
    ".steps li",
    ".rule-list li",
    ".results-board .result-row",
    ".contact-lines li",
    ".news-list .news-item"
  ];
  autoReveal.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      if (el.classList.contains("reveal")) return;
      el.classList.add("reveal");
      el.style.setProperty("--d", Math.min(i * 55, 440) + "ms");
    });
  });

  /* Staggered entrances: children of [data-stagger] reveal one after
     another. Runs before the reveal setup below, so the observer and
     the sweep pick the children up like any other reveal. */
  document.querySelectorAll("[data-stagger]").forEach(function (grid) {
    var kids = grid.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].classList.add("reveal");
      kids[i].style.setProperty("--d", Math.min(i * 55, 440) + "ms");
    }
  });

  /* Reveals: observer plus a sweep, so a fast scroll cannot leave a section hidden. */
  var revealEls = document.querySelectorAll(".reveal");
  /* Strip helper: once a reveal has finished, drop the reveal classes so
     hover transforms on cards are not overridden by the reveal end-state.
     transitionend (below) is the primary trigger, but it never fires for
     elements that gain .in before first paint — the browser renders them
     straight in their final state, so there is no transition to end — and
     it never fires under reduced motion, where transitions are off. The
     timer covers both: delay + 750ms lands just after the 0.7s transition
     ends. Harmless if transitionend already stripped the classes. */
  function scheduleStrip(el) {
    var d = parseInt(el.style.getPropertyValue("--d") || "0", 10) || 0;
    setTimeout(function () {
      /* Unconditional: the sweep below can no longer re-add .in to a
         stripped element, but if it ever did, this still cleans it up. */
      el.classList.remove("reveal");
      el.classList.remove("in");
      el.style.removeProperty("--d");
    }, d + 750);
  }
  function revealSweep() {
    var vh = window.innerHeight || 800;
    revealEls.forEach(function (el) {
      if (!el.classList.contains("reveal")) return; /* stripped already = revealed */
      if (el.classList.contains("in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) { el.classList.add("in"); scheduleStrip(el); }
    });
  }
  if (revealEls.length && !reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          scheduleStrip(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    var ticking = false;
    function onScrollReveal() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { revealSweep(); ticking = false; });
    }
    window.addEventListener("scroll", onScrollReveal, { passive: true });
    window.addEventListener("resize", onScrollReveal);
    window.addEventListener("load", revealSweep);
    setTimeout(revealSweep, 2500);
    revealSweep();
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); scheduleStrip(el); });
  }

  /* Once a reveal finishes, drop the reveal classes so hover transforms
     on cards and photos are not overridden by the reveal end-state. */
  document.addEventListener("transitionend", function (e) {
    var el = e.target;
    if (el.classList && el.classList.contains("reveal") && el.classList.contains("in")) {
      el.classList.remove("reveal");
      el.classList.remove("in");
      el.style.removeProperty("--d");
    }
  });

  /* Counters. Final values are in the HTML. */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || !("requestAnimationFrame" in window)) {
      el.textContent = target.toLocaleString("en-IN") + suffix;
      return;
    }
    var start = null, dur = 400;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* Stream switcher (Academics page) */
  var tabs = document.querySelectorAll(".switcher-tab");
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.setAttribute("aria-selected", "false");
          t.tabIndex = -1;
        });
        tab.setAttribute("aria-selected", "true");
        tab.tabIndex = 0;
        document.querySelectorAll(".switcher-panel").forEach(function (panel) {
          panel.classList.toggle("active", panel.id === tab.getAttribute("aria-controls"));
        });
      });
      tab.addEventListener("keydown", function (e) {
        var list = Array.prototype.slice.call(tabs);
        var i = list.indexOf(tab);
        if (e.key === "ArrowRight") { var n = list[(i + 1) % list.length]; n.focus(); n.click(); }
        if (e.key === "ArrowLeft") { var p = list[(i - 1 + list.length) % list.length]; p.focus(); p.click(); }
      });
    });
  }

  /* Gallery lightbox */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    lightbox.setAttribute("aria-modal", "true");
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item button"));
    var current = 0;
    var lbLastFocus = null;
    function show(i) {
      current = (i + items.length) % items.length;
      var btn = items[current];
      lbImg.src = btn.getAttribute("data-full");
      lbImg.alt = btn.getAttribute("data-alt") || "";
    }
    var lbTimer = null;
    function openLb(i) {
      clearTimeout(lbTimer);
      lightbox.classList.remove("closing");
      lbLastFocus = document.activeElement;
      show(i);
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lightbox.querySelector(".lightbox-close").focus();
    }
    /* Close fades out (CSS .closing, 180ms) instead of vanishing — the
       open animation has a matching exit. Reduced motion skips the wait
       and closes at once, so the overlay never lingers. */
    function closeLb() {
      if (lightbox.classList.contains("closing")) return;
      if (reduceMotion) { finishLbClose(); return; }
      lightbox.classList.add("closing");
      lbTimer = setTimeout(finishLbClose, 180);
    }
    function finishLbClose() {
      clearTimeout(lbTimer);
      lightbox.classList.remove("open", "closing");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus();
    }
    items.forEach(function (btn) {
      /* The tapped button opens its own photo: the index is resolved
         from the live DOM node at tap time, never captured at bind time,
         so the control that was tapped always opens its own content. */
      btn.addEventListener("click", function () { openLb(items.indexOf(btn)); });
    });
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLb);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
    lightbox.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
      trapTab(e, [lightbox]);
    });
    /* Swipe: a horizontal drag moves to the next/previous photo. The
       prev/next buttons stay the primary control; vertical panning is
       left to the browser (see .lightbox figure touch-action). */
    var lbTouchX = null;
    lightbox.addEventListener("touchstart", function (e) {
      if (e.touches.length === 1) lbTouchX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (lbTouchX === null) return;
      var dx = e.changedTouches[0].clientX - lbTouchX;
      lbTouchX = null;
      if (Math.abs(dx) > 48) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* Gallery sliders (v31): on phones each event is a scroll-snap slider.
     Prev/next move one photo; the counter follows the scroll position.
     Keyboard: ArrowLeft/ArrowRight work from any photo button in the event
     (the event bubbles to the grid); the buttons themselves are native
     <button>s, so Tab reaches them. No autoplay, no auto-advance. */
  document.querySelectorAll(".event").forEach(function (section) {
    var grid = section.querySelector(".gallery-grid");
    var prev = section.querySelector(".event-prev");
    var next = section.querySelector(".event-next");
    var count = section.querySelector(".event-count");
    if (!grid || !prev || !next) return;
    var items = grid.querySelectorAll(".gallery-item");
    if (!items.length) return;
    function step() {
      var w = items[0].getBoundingClientRect().width;
      return w + 12; /* flex gap, var(--space-3) */
    }
    function update() {
      var i = Math.round(grid.scrollLeft / step());
      i = Math.max(0, Math.min(items.length - 1, i));
      if (count) count.textContent = (i + 1) + " / " + items.length;
      prev.disabled = i === 0;
      next.disabled = i === items.length - 1;
    }
    function move(dir) {
      grid.scrollBy({ left: dir * step(), behavior: reduceMotion ? "auto" : "smooth" });
    }
    prev.addEventListener("click", function () { move(-1); });
    next.addEventListener("click", function () { move(1); });
    grid.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    grid.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    });
    update();
  });

  /* Enquiry form: validate, then hand off to the visitor's email app. Nothing is sent from this page. */
  var form = document.getElementById("enquiry-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var err = document.getElementById(field.getAttribute("aria-describedby"));
        var bad = !field.value.trim() || (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        field.setAttribute("aria-invalid", bad ? "true" : "false");
        if (err) err.textContent = bad ? "Fill this in to continue." : "";
        if (bad) valid = false;
      });
      if (!valid) {
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }
      var data = new FormData(form);
      var subject = "Admission enquiry: " + (data.get("child-class") || "general");
      var body = [
        "Name: " + data.get("name"),
        "Phone: " + (data.get("phone") || "not given"),
        "Email: " + data.get("email"),
        "Class applying for: " + data.get("child-class"),
        "",
        (data.get("message") || "")
      ].join("\n");
      window.location.href =
        "mailto:dbsoodlabari@gmail.com?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      var note = document.getElementById("form-note");
      if (note) {
        note.textContent = "Your email app opens with the enquiry addressed to the school. Nothing sent until you press send.";
        note.focus();
      }
    });
  }

  /* Tiles (v24): a club tile just highlights — no detail bar below the
     grid any more. A house tile opens the house modal instead. */
  document.querySelectorAll(".tile-grid").forEach(function (grid) {
    var tiles = Array.prototype.slice.call(grid.querySelectorAll("button[data-club]"));
    tiles.forEach(function (tile) {
      tile.addEventListener("click", function () {
        var wasPressed = tile.getAttribute("aria-pressed") === "true";
        tiles.forEach(function (t) { t.setAttribute("aria-pressed", "false"); });
        if (!wasPressed) tile.setAttribute("aria-pressed", "true");
      });
    });
  });

  /* House modal (v24): tap a house and it opens — colour band, name, one
     verified line, link onward. Esc, backdrop or the X closes it. */
  var houseModal = document.getElementById("house-modal");
  if (houseModal) {
    var hmBand = document.getElementById("house-modal-band");
    var hmName = document.getElementById("house-modal-name");
    houseModal.setAttribute("aria-modal", "true");
    var hmLastFocus = null;
    var hmTimer = null;
    function openHouse(name) {
      clearTimeout(hmTimer);
      houseModal.classList.remove("closing");
      hmLastFocus = document.activeElement;
      hmName.textContent = name + " House";
      hmBand.className = "house-modal-band house-modal-band-" + name.toLowerCase();
      houseModal.classList.add("open");
      houseModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      houseModal.querySelector(".house-modal-close").focus();
    }
    /* Same closing fade as the lightbox (CSS .closing, 180ms). */
    function closeHouse() {
      if (houseModal.classList.contains("closing")) return;
      if (reduceMotion) { finishHouseClose(); return; }
      houseModal.classList.add("closing");
      hmTimer = setTimeout(finishHouseClose, 180);
    }
    function finishHouseClose() {
      clearTimeout(hmTimer);
      houseModal.classList.remove("open", "closing");
      houseModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (hmLastFocus && hmLastFocus.focus) hmLastFocus.focus();
    }
    document.querySelectorAll(".house-tile").forEach(function (tile) {
      tile.addEventListener("click", function () {
        document.querySelectorAll(".house-tile").forEach(function (t) { t.setAttribute("aria-pressed", "false"); });
        tile.setAttribute("aria-pressed", "true");
        openHouse(tile.getAttribute("data-house"));
      });
    });
    houseModal.querySelector(".house-modal-close").addEventListener("click", closeHouse);
    houseModal.addEventListener("click", function (e) { if (e.target === houseModal) closeHouse(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && houseModal.classList.contains("open")) closeHouse();
      if (houseModal.classList.contains("open")) trapTab(e, [houseModal]);
    });
  }

  /* Viewer (v24): one modal for home photo cards and staff/leader cards.
     Full-size image, name/caption, one precise line below it. */
  var viewer = document.getElementById("viewer");
  if (viewer) {
    var vImg = viewer.querySelector("img");
    var vCap = document.getElementById("viewer-caption");
    viewer.setAttribute("aria-modal", "true");
    var vDet = document.getElementById("viewer-detail");
    var vLastFocus = null;
    var vTimer = null;
    function openViewer(el) {
      clearTimeout(vTimer);
      viewer.classList.remove("closing");
      vLastFocus = document.activeElement;
      vImg.src = el.getAttribute("data-full");
      vImg.alt = el.getAttribute("data-caption") || "";
      vCap.textContent = el.getAttribute("data-caption") || "";
      vDet.textContent = el.getAttribute("data-detail") || "";
      vDet.style.display = vDet.textContent ? "" : "none";
      viewer.classList.add("open");
      viewer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      viewer.querySelector(".lightbox-close").focus();
    }
    /* Same closing fade as the lightbox (CSS .closing, 180ms). */
    function closeViewer() {
      if (viewer.classList.contains("closing")) return;
      if (reduceMotion) { finishViewerClose(); return; }
      viewer.classList.add("closing");
      vTimer = setTimeout(finishViewerClose, 180);
    }
    function finishViewerClose() {
      clearTimeout(vTimer);
      viewer.classList.remove("open", "closing");
      viewer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (vLastFocus && vLastFocus.focus) vLastFocus.focus();
    }
    document.querySelectorAll(".js-viewer").forEach(function (el) {
      el.addEventListener("click", function () { openViewer(el); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(el); }
      });
    });
    viewer.querySelector(".lightbox-close").addEventListener("click", closeViewer);
    viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && viewer.classList.contains("open")) closeViewer();
      if (viewer.classList.contains("open")) trapTab(e, [viewer]);
    });
  }

  /* Pillars slider (v22, phones only): arrows, dots and a counter. On
     desktop the nav is hidden and the cards stack, so this only matters
     where the slider layout is active. */
  var slider = document.querySelector(".pillars-slider");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".pillar"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".pillar-dot"));
    var countEl = document.getElementById("pillar-count");
    if (countEl) countEl.setAttribute("aria-live", "polite");
    var prevBtn = document.getElementById("pillar-prev");
    var nextBtn = document.getElementById("pillar-next");
    var current = 0;
    function sync(i) {
      current = i;
      dots.forEach(function (d, j) { d.classList.toggle("is-active", j === i); });
      if (countEl) countEl.textContent = (i + 1) + " of " + slides.length;
    }
    function goTo(i) {
      var n = (i + slides.length) % slides.length;
      var target = slides[n];
      /* v24: centre the slide in the track — the track has 7% side padding
         and the active card is 86% wide, so centring shows both neighbours
         peeking by the same amount. */
      var left = target.getBoundingClientRect().left - slider.getBoundingClientRect().left + slider.scrollLeft - (slider.clientWidth - target.offsetWidth) / 2;
      slider.scrollTo({ left: left, behavior: reduceMotion ? "auto" : "smooth" });
      sync(n);
    }
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); });
    });
    var slideTicking = false;
    slider.addEventListener("scroll", function () {
      if (slideTicking) return;
      slideTicking = true;
      requestAnimationFrame(function () {
        var sRect = slider.getBoundingClientRect();
        var best = 0, bestDist = Infinity;
        slides.forEach(function (slide, i) {
          /* v24: the slide whose CENTRE is nearest the track's centre. */
          var d = Math.abs((slide.getBoundingClientRect().left + slide.offsetWidth / 2) - (sRect.left + sRect.width / 2));
          if (d < bestDist) { bestDist = d; best = i; }
        });
        sync(best);
        slideTicking = false;
      });
    }, { passive: true });
  }

  /* Back to top */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
